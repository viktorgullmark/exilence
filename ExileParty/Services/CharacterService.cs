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
        private readonly string _poeNinjaStatsUrl = "http://poe.ninja/api/Data/GetStats";

        private IDistributedCache _cache;

        public CharacterService(IDistributedCache cache)
        {
            _cache = cache;
        }






        #region Trade
        public async Task IndexCharactersFromTradeRiver()
        {
            var nextChangeId = await _cache.GetAsync<string>("next_change_id");

        }
        public async Task GetNextChangeId()
        {
            var json = await ExecuteGetAsync(_poeNinjaStatsUrl);
            var stats = JsonConvert.DeserializeObject<PoeNinjaModel>(json);
            await _cache.SetAsync<string>("next_change_id", stats.next_change_id);
        }

        #endregion

        #region Leagues
        private async Task<List<LeagueApiModel>> FetchLeaguesAsync()
        {
            var json = await ExecuteGetAsync(_leagesUrl);
            return JsonConvert.DeserializeObject<List<LeagueApiModel>>(json);
        }

        #endregion

        #region Ladder
        public void IndexCharactersFromLadder(string league)
        {
            var entryList = new List<LadderApiEntry>();

            var pages = Enumerable.Range(0, 75);
            foreach (int page in pages.LimitRate(2, TimeSpan.FromSeconds(4)))
            {
                FetchLadderApiPage(league, page);
            }
        }

        public async void FetchLadderApiPage(string league, int page)
        {
            //var offset = page * 200;
            //var url = $"{_ladderUrl}{league}?offset={offset}&limit=200";
            //var apiResponse = await HandleLadderRequest(url);
            //UpdateCharacterDictionaryAsync(league, apiResponse.Entries);
        }

        private async Task<LadderApiResponse> HandleLadderRequest(string url)
        {
            string json = await ExecuteGetAsync(url);
            return JsonConvert.DeserializeObject<LadderApiResponse>(json);
        }

        #endregion

        #region External

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

        private async void UpdateCharacterDictionaryAsync(string league, List<LadderApiEntry> entries)
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
        #endregion



    }
}
