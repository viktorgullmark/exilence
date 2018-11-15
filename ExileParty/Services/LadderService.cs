using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using ExileParty.Helper;
using ExileParty.Interfaces;
using ExileParty.Models;
using ExileParty.Models.Ladder;
using Microsoft.Extensions.Caching.Distributed;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;

namespace ExileParty.Services
{
    public class LadderService : ILadderService
    {
        private readonly IDistributedCache _cache;
        private readonly ILogger<LadderService> _log;
        private readonly IExternalService _externalService;

        private bool _rateLimited;

        private const string LadderUrl = "http://api.pathofexile.com/ladders/";
        private const string LeagesUrl = "http://api.pathofexile.com/leagues?type=main&compact=1";
        private const string PoeNinjaStatsUrl = "http://poe.ninja/api/Data/GetStats";
        private const string TradeUrl = "http://api.pathofexile.com/public-stash-tabs";

        public LadderService(IDistributedCache cache, ILogger<LadderService> log, IExternalService externalService)
        {
            _cache = cache;
            _log = log;
            _externalService = externalService;
        }

        #region Leagues
        private async Task<List<LeagueApiModel>> FetchLeaguesAsync()
        {
            var json = await _externalService.ExecuteGetAsync(LeagesUrl);
            return JsonConvert.DeserializeObject<List<LeagueApiModel>>(json);
        }

        #endregion

        #region Ladder

        public async Task<List<LadderApiEntry>> GetLadderForPlayer(string league, string character)
        {
            var leagueLadder = await RetriveLadder(league);

            var returnList = new List<LadderApiEntry>();

            var exists = leagueLadder.FirstOrDefault(t => t.Character.Name == character);
            if (exists != null)
            {
                var index = leagueLadder.IndexOf(exists);

                var before = leagueLadder.Where(t => t.Rank < exists.Rank && t.Rank >= (exists.Rank - 5));
                var after = leagueLadder.Where(t => t.Rank > exists.Rank && t.Rank <= (exists.Rank + 5));

                returnList.AddRange(before);
                returnList.AddRange(after);
                returnList.Add(exists);
            }

            TryUpdateLadder(league);

            return returnList.OrderBy(t => t.Rank).ToList();
        }

        public async Task TryUpdateLadder(string league)
        {
            var statuses = await _cache.GetAsync<Dictionary<string, LadderStatusModel>>($"status:ladder:{league}");
            if (statuses == null)
            {
                statuses = new Dictionary<string, LadderStatusModel>();
            }

            var leagueStatus = new LadderStatusModel() { Running = false, LastRun = DateTime.Now.AddMinutes(-6) }; //Add -6 so we pass the check below and can start indexing immedietly.

            if (statuses.ContainsKey(league))
            {
                leagueStatus = statuses[league];
            }
            else
            {
                statuses.Add(league, leagueStatus);
                await _cache.SetAsync($"status:ladder:{league}", statuses);
            }
            var anyRunning = statuses.Any(t => t.Value.Running);

            if (!anyRunning && leagueStatus.LastRun < DateTime.Now.AddMinutes(-5))
            {
                // Set league status to running for the current league
                statuses = await _cache.GetAsync<Dictionary<string, LadderStatusModel>>($"status:ladder:{league}");
                statuses[league].Running = true;
                await _cache.SetAsync($"status:ladder:{league}", statuses);

                var ladderEntries = new List<LadderApiEntry>();
                var pages = Enumerable.Range(0, 75);
                using (var rateGate = new RateGate(2, TimeSpan.FromSeconds(1)))
                {
                    foreach (int page in pages)
                    {
                        await rateGate.WaitToProceed();
                        var result = await FetchLadderApiPage(league, page);
                        ladderEntries.AddRange(result.Entries);
                    }
                }
                await SaveLadder(league, ladderEntries);
                statuses = await _cache.GetAsync<Dictionary<string, LadderStatusModel>>($"status:ladder:{league}");
                statuses[league].Running = false;
                await _cache.SetAsync($"status:ladder:{league}", statuses);
            }
        }

        public async Task<LadderApiResponse> FetchLadderApiPage(string league, int page)
        {
            var offset = page * 200;
            var url = $"{LadderUrl}{league}?offset={offset}&limit=200";
            var apiResponse = await HandleLadderRequest(url);
            return apiResponse;
        }

        private async Task<LadderApiResponse> HandleLadderRequest(string url)
        {
            string json = await _externalService.ExecuteGetAsync(url);
            return JsonConvert.DeserializeObject<LadderApiResponse>(json);
        }

        private async Task SaveLadder(string league, List<LadderApiEntry> ladder)
        {
            var chunks = ladder.Split(1000);
            var counter = 0;
            foreach (var chunk in chunks)
            {
                await _cache.SetAsync($"ladder:{league}:{counter}", chunk);
                counter++;
            }
        }
        private async Task<List<LadderApiEntry>> RetriveLadder(string league)
        {
            var ladder = new List<LadderApiEntry>();
            bool fetch = true;
            var counter = 0;
            while (fetch)
            {
                var chunk = await _cache.GetAsync<List<LadderApiEntry>>($"ladder:{league}:{counter}");
                if (chunk == null)
                {
                    fetch = false;
                }
                else
                {
                    ladder.AddRange(chunk);
                }
                counter++;
            }
            return ladder.OrderBy(t => t.Rank).ToList();


        }

        #endregion

    }
}
