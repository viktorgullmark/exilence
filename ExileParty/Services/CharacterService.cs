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
        private readonly string _tradeUrl = "http://api.pathofexile.com/public-stash-tabs";

        private IDistributedCache _cache;

        public CharacterService(IDistributedCache cache)
        {
            _cache = cache;
        }


        #region Trade
        public async Task IndexCharactersFromTradeRiver(string nextChangeId)
        {
            using (var rateGate = new RateGate(2, TimeSpan.FromSeconds(8)))
            {
                // Run loop one time per x seconds declared above
                while (true)
                {
                    try
                    {
                        var tradeUrl = $"{_tradeUrl}/?id={nextChangeId}";
                        var response = await ExecuteGetAsync(tradeUrl);
                        var trade = JsonConvert.DeserializeObject<TradeApiModel>(response);

                        // If change id's differ we got a new batch that we haven't processed.
                        if (nextChangeId != trade.next_change_id)
                        {
                            //Update change id
                            nextChangeId = trade.next_change_id;

                            //Save characters for all stashes
                            foreach (var stash in trade.stashes)
                            {
                                await UpdateCharacterAsync(stash.lastCharacterName, stash.accountName);
                            }
                        }

                        await rateGate.WaitToProceed();
                    }
                    catch (Exception e)
                    {
                        await rateGate.WaitToProceed(TimeSpan.FromMinutes(10));                        
                    }
                }
            }            
        }

        public async Task GetNextChangeId()
        {
            var json = await ExecuteGetAsync(_poeNinjaStatsUrl);
            var stats = JsonConvert.DeserializeObject<PoeNinjaModel>(json);
            IndexCharactersFromTradeRiver(stats.next_change_id);
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
            foreach (int page in pages.LimitRate(2, TimeSpan.FromSeconds(5)))
            {
                FetchLadderApiPage(league, page);
            }
        }

        public async void FetchLadderApiPage(string league, int page)
        {
            var offset = page * 200;
            var url = $"{_ladderUrl}{league}?offset={offset}&limit=200";
            var apiResponse = await HandleLadderRequest(url);

            foreach (var entry in apiResponse.Entries)
            {
                await UpdateCharacterAsync(entry.Character.Name, entry.Account.Name);
            }
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
                    if (res.Content != null)
                    {
                        await res.Content.LoadIntoBufferAsync();
                        var bodylength = res.Content.Headers.ContentLength;
                        var headerlength = res.Headers.ToString().Length;
                    }

                    return await content.ReadAsStringAsync();
                }
            }
        }

        private async Task UpdateCharacterAsync(string character, string account)
        {
            if (!String.IsNullOrEmpty(character) && !String.IsNullOrEmpty(account))
            {
                var key = $"character:{character}";
                await _cache.SetAsync(key, account, new DistributedCacheEntryOptions {});
            }
        }

        public async Task<string> GetCharacterAsync(string character)
        {
            var key = $"character:{character}";
            var account = await _cache.GetAsync<string>(key);
            return account;
        }

        #endregion



    }
}
