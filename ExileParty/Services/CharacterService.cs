using ExileParty.Interfaces;
using ExileParty.Models;
using Newtonsoft.Json;
using System;
using Microsoft.Extensions.Caching.Distributed;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using ExileParty.Helper;
using System.Threading;

namespace ExileParty.Handlers
{
    public class CharacterService : ICharacterService
    {
        private readonly string _ladderUrl = "http://api.pathofexile.com/ladders/";
        private readonly string _leagesUrl = "http://api.pathofexile.com/leagues?type=main&compact=1";

        private IDistributedCache _cache;

        public CharacterService(IDistributedCache cache)
        {
            _cache = cache;
        }

        public string something()
        {
            return "sdf";
        }

        public async Task IndexLadderCharacters()
        {
            var LeagueApiModels = await FetchLeaguesAsync();
            var entryList = new List<LadderApiEntry>();

            var throttle = new Throttle(5, new TimeSpan(0, 0, 10));
            Func<string, string, Task> FetchLadderAsyncFunc = async (league, url) => await FetchLadderAsync(league, url);

            foreach (LeagueApiModel league in LeagueApiModels)
            {
                var urls = new List<string>();
                for (int i = 0; i < 15000; i = i + 200)
                {
                    var url = $"{_ladderUrl}{league.Id}?offset={i}&limit=200";
                    await throttle.Enqueue<Task>(FetchLadderAsyncFunc, league.Id, url);                    
                }
            }


            var Standard = await _cache.GetAsync<Dictionary<string, string>>("Standard");
            var Hardcore = await _cache.GetAsync<Dictionary<string, string>>("Hardcore");
            var SSFStandard = await _cache.GetAsync<Dictionary<string, string>>("SSF Standard");
            var SSFHardcore = await _cache.GetAsync<Dictionary<string, string>>("SSF Hardcore");

        }

        private async Task<List<LeagueApiModel>> FetchLeaguesAsync()
        {
            var json = await ExecuteGetAsync(_leagesUrl);
            return JsonConvert.DeserializeObject<List<LeagueApiModel>>(json);
        }

        private async Task FetchLadderAsync(string league, string url)
        {
            string json = await ExecuteGetAsync(url);
            var entries = JsonConvert.DeserializeObject<LadderApiRootObject>(json).Entries;
            if (entries != null)
            {
                await UpdateCharacterDictionaryAsync(entries, league);
            }
            else
            {
                throw new Exception("Going to fast");
            }
        }

        private async Task<string> ExecuteGetAsync(string url)
        {
            var handler = new HttpClientHandler() { AutomaticDecompression = DecompressionMethods.GZip | DecompressionMethods.Deflate };
            using (var client = new HttpClient(handler))
            {
                using (HttpResponseMessage res = await client.GetAsync(url))
                using (HttpContent content = res.Content)
                {
                    return await content.ReadAsStringAsync();
                }
            }
        }

        private async Task UpdateCharacterDictionaryAsync(List<LadderApiEntry> entries, string league)
        {
            var ladder = await _cache.GetAsync<Dictionary<string, string>>(league);
            if (ladder == null)
            {
                ladder = new Dictionary<string, string>();
            }
            foreach (var entry in entries)
            {
                ladder[entry.Character.Name] = entry.Account.Name;
            }
            await _cache.SetAsync(league, ladder);
        }

    }
}
