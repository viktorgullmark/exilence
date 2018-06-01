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

namespace ExileParty.Handlers
{
    public class CharacterService : ICharacterService
    {
        private readonly string _ladderUrl = "http://api.pathofexile.com/ladders/Standard?offset=0&limit=10";

        private IDistributedCache _cache;
        private HttpClientHandler _handler;

        public CharacterService(IDistributedCache cache)
        {
            _cache = cache;
            _handler = new HttpClientHandler() { AutomaticDecompression = DecompressionMethods.GZip | DecompressionMethods.Deflate };
        }

        public async Task FetchLadderAsync()
        {
            using (var client = new HttpClient(_handler))
            {
                using (HttpResponseMessage res = await client.GetAsync(_ladderUrl))
                using (HttpContent content = res.Content)
                {
                    string json = await content.ReadAsStringAsync();
                    if (json != null)
                    {
                        var response = JsonConvert.DeserializeObject<LadderRootObject>(json);
                        await UpdateCharacterDictionaryAsync(response, "standard");
                    }
                }
            }
        }

        public async Task UpdateCharacterDictionaryAsync(LadderRootObject ladderData, string league)
        {
            var ladder = await _cache.GetAsync<Dictionary<string, string>>(league);
            if (ladder == null)
            {
                ladder = new Dictionary<string, string>();
            }
            foreach (var entry in ladderData.Entries)
            {
                ladder[entry.Character.Name] = entry.Account.Name;
            }
            await _cache.SetAsync<Dictionary<string, string>>(league, ladder);
        }

    }
}
