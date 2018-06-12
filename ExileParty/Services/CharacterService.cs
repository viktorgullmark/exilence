using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using ExileParty.Helper;
using ExileParty.Interfaces;
using ExileParty.Models;
using Microsoft.Extensions.Caching.Distributed;
using Newtonsoft.Json;

namespace ExileParty.Services
{
    public class CharacterService : ICharacterService
    {
        private const string LadderUrl = "http://api.pathofexile.com/ladders/";
        private const string LeagesUrl = "http://api.pathofexile.com/leagues?type=main&compact=1";
        private const string PoeNinjaStatsUrl = "http://poe.ninja/api/Data/GetStats";
        private const string TradeUrl = "http://api.pathofexile.com/public-stash-tabs";

        private readonly IDistributedCache _cache;

        private bool _rateLimited;
        private string _nextChangeId;
        private int _pendingRequests;
        private readonly List<long> _updateTimes;
        private readonly List<long> _requestTimes;
        private readonly List<long> _deseralizeTimes;

        public CharacterService(IDistributedCache cache)
        {
            _cache = cache;
            _pendingRequests = 0;
            _rateLimited = false;
            _updateTimes = new List<long>();
            _requestTimes = new List<long>();
            _deseralizeTimes = new List<long>();
        }

        #region Trade
        public async void IndexCharactersFromTradeApi()
        {
            using (var rateGate = new RateGate(1, TimeSpan.FromSeconds(3)))
            {
                // Run loop one time per x seconds declared above.
                while (true)
                {
                    if (_rateLimited) // Wait for one minute if we are rate limited or if the API is down.
                    {
                        Console.WriteLine("Ratelimited or other error, waiting one minute.");
                        var task = Task.Delay(60000);
                        task.Wait();
                        _rateLimited = false;
                    }

                    if (_pendingRequests < 6)
                    {
                        var tradeUrl = $"{TradeUrl}/?id={_nextChangeId}";
                        //Don't make this one async, we want to send multiple requests and handle the response when we get it. 
                        GetAndIndexTradeRequest(tradeUrl);
                    }
                    else
                    {
                        Console.WriteLine("We already have 5 pending requests. Skipping this one.");
                    }
                    await rateGate.WaitToProceed();
                }
            }
        }

        public async Task GetAndIndexTradeRequest(string tradeUrl)
        {
            var performanceWatch = Stopwatch.StartNew();

            _pendingRequests++;
            var response = await ExecuteGetAsync(tradeUrl);
            _pendingRequests--;

            var requestTime = performanceWatch.ElapsedMilliseconds;

            if (response != null)
            {
                performanceWatch.Restart();

                var trade = JsonConvert.DeserializeObject<TradeApiModel>(response);
                var deserializeTime = performanceWatch.ElapsedMilliseconds;

                // If change id's differ we got a new batch that we haven't processed.
                if (_nextChangeId != null && _nextChangeId != trade.next_change_id)
                {
                    //Update change id
                    _nextChangeId = trade.next_change_id;
                    performanceWatch.Restart();
                    //Save characters for all stashes
                    foreach (var stash in trade.stashes)
                    {
                        //Don't await this one, we don't get any success response from redis anyway.
                        UpdateCharacterAsync(stash.lastCharacterName, stash.accountName);
                    }

                    var updateTime = performanceWatch.ElapsedMilliseconds;
                    UpdateAndLogTime(requestTime, deserializeTime, updateTime, trade.stashes.Count);
                }
            }
        }

        private void UpdateAndLogTime(long requestTime, long deserializeTime, long updateTime, int posts)
        {
            _updateTimes.Add(updateTime);
            _requestTimes.Add(requestTime);
            _deseralizeTimes.Add(deserializeTime);

            Console.WriteLine("---------------------------------------------------------------------");
            Console.WriteLine($"Pending requests: {_pendingRequests}");
            Console.WriteLine($"Average GET request time: {Math.Round(_requestTimes.Average())} ms");
            Console.WriteLine($"Average deserialize time: {Math.Round(_deseralizeTimes.Average())} ms");
            Console.WriteLine($"Average update Redis time: { Math.Round(_updateTimes.Average())} ms.");
            Console.WriteLine("---------------------------------------------------------------------");

            if (_requestTimes.Count > 100)
                _requestTimes.RemoveRange(0, 1);

            if (_updateTimes.Count > 100)
                _updateTimes.RemoveRange(0, 1);

            if (_deseralizeTimes.Count > 100)
                _deseralizeTimes.RemoveRange(0, 1);
        }


        public async Task GetNextChangeId()
        {
            var json = await ExecuteGetAsync(PoeNinjaStatsUrl);
            var stats = JsonConvert.DeserializeObject<PoeNinjaModel>(json);
            _nextChangeId = stats.next_change_id;
        }

        public async Task StartTradeIndexing()
        {
            await GetNextChangeId();
            IndexCharactersFromTradeApi();
        }        
        #endregion

        #region Leagues
        private async Task<List<LeagueApiModel>> FetchLeaguesAsync()
        {
            var json = await ExecuteGetAsync(LeagesUrl);
            return JsonConvert.DeserializeObject<List<LeagueApiModel>>(json);
        }

        #endregion

        #region Ladder
        public async Task IndexCharactersFromLadder(string league)
        {
            var entryList = new List<LadderApiEntry>();

            var pages = Enumerable.Range(0, 75);
            foreach (int page in pages.LimitRate(2, TimeSpan.FromSeconds(5)))
            {
                await FetchLadderApiPage(league, page);
            }
        }

        public async Task FetchLadderApiPage(string league, int page)
        {
            var offset = page * 200;
            var url = $"{LadderUrl}{league}?offset={offset}&limit=200";
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
            var handler = new HttpClientHandler() { AutomaticDecompression = DecompressionMethods.GZip | DecompressionMethods.Deflate, UseCookies = false, UseDefaultCredentials = false };
            using (var client = new HttpClient(handler))
            {
                using (HttpResponseMessage res = await client.GetAsync(url))
                {
                    if (res.IsSuccessStatusCode)
                    {
                        using (HttpContent content = res.Content)
                        {
                            return await content.ReadAsStringAsync();
                        }
                    }
                    else
                    {
                        _rateLimited = true;
                        return null;
                    }
                }
            }
        }

        private async Task UpdateCharacterAsync(string character, string account)
        {
            if (!String.IsNullOrEmpty(character) && !String.IsNullOrEmpty(account))
            {
                var redisKey = $"character:{character}";                
                await _cache.SetAsync(redisKey, account, new DistributedCacheEntryOptions { });
            }
        }

        public async Task<string> GetAccountFromCharacterAsync(string character)
        {
            var key = $"character:{character}";
            var account = await _cache.GetAsync<string>(key);
            return account;
        }

        #endregion



    }
}
