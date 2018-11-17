using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Web;
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

        private const string LadderUrl = "http://www.pathofexile.com/api/ladders";
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

        public async Task<List<LadderPlayer>> GetLadderForPlayer(string league, string character)
        {
            TryUpdateLadder(league); //Not awaited with purpose

            var leagueLadder = await RetriveLadder(league);

            var returnList = new List<LadderPlayer>();

            var exists = leagueLadder.FirstOrDefault(t => t.Name == character);
            if (exists != null)
            {
                var index = leagueLadder.IndexOf(exists);

                var before = leagueLadder.Where(t => t.Rank < exists.Rank && t.Rank >= (exists.Rank - 5));
                var after = leagueLadder.Where(t => t.Rank > exists.Rank && t.Rank <= (exists.Rank + 5));

                returnList.AddRange(before);
                returnList.AddRange(after);
                returnList.Add(exists);

                return returnList.OrderBy(t => t.Rank).ToList();
            }

            return null;
        }

        public async Task TryUpdateLadder(string league)
        {
            var statuses = await _cache.GetAsync<Dictionary<string, LadderStatusModel>>($"status:ladder:{league}");
            if (statuses == null)
            {
                statuses = new Dictionary<string, LadderStatusModel>();
            }

            var leagueStatus = new LadderStatusModel() { Running = false, LastRun = DateTime.MinValue };

            if (statuses.ContainsKey(league))
            {
                leagueStatus = statuses[league];
            }
            else
            {
                statuses.Add(league, leagueStatus);
                await _cache.SetAsync($"status:ladder:{league}", statuses, new DistributedCacheEntryOptions { });
            }
            var anyRunning = statuses.Any(t => t.Value.Running);

            if (!anyRunning && leagueStatus.LastRun < DateTime.Now.AddMinutes(-5))
            {
                // Set league status to running for the current league
                statuses = await _cache.GetAsync<Dictionary<string, LadderStatusModel>>($"status:ladder:{league}");
                statuses[league].Running = true;
                await _cache.SetAsync($"status:ladder:{league}", statuses, new DistributedCacheEntryOptions { });

                var oldLadder = await RetriveLadder(league);

                var newLadder = new List<LadderPlayer>();
                var pages = Enumerable.Range(0, 75);
                using (var rateGate = new RateGate(2, TimeSpan.FromSeconds(1)))
                {
                    foreach (int page in pages)
                    {
                        await rateGate.WaitToProceed();
                        LadderApiResponse result = await FetchLadderApiPage(league, page);
                        var LadderPlayerList = result.Entries.Select(t => new LadderPlayer()
                        {
                            Name = t.Character.Name,
                            Level = t.Character.Level,
                            Online = t.Online,
                            Dead = t.Dead,
                            Account = t.Account.Name,
                            Experience = t.Character.Experience,
                            Experience_per_hour = 0,
                            Rank = t.Rank,
                            Twitch = t.Account.Twitch?.Name,
                            Class = t.Character.Class,
                            Class_rank = 0,
                            Updated = DateTime.Now
                        }).ToList();
                        // Convert result to LadderPlayer model here
                        newLadder.AddRange(LadderPlayerList);
                        if (newLadder.Count == result.Total || result.Entries.Count == 0)
                        {
                            break;
                        }
                    }
                }

                newLadder = CalculateStatistics(oldLadder, newLadder);

                await SaveLadder(league, newLadder);
                statuses = await _cache.GetAsync<Dictionary<string, LadderStatusModel>>($"status:ladder:{league}");
                statuses[league].Running = false;
                statuses[league].LastRun = DateTime.Now;
                await _cache.SetAsync($"status:ladder:{league}", statuses, new DistributedCacheEntryOptions { });
            }
        }

        private List<LadderPlayer> CalculateStatistics(List<LadderPlayer> oldLadder, List<LadderPlayer> newLadder)
        {
            foreach (var newEntry in newLadder)
            {
                var oldLadderEntry = oldLadder.FirstOrDefault(t => t.Name == newEntry.Name);
                if (oldLadderEntry != null && oldLadderEntry.Updated != DateTime.MinValue)
                {
                    var expGain = newEntry.Experience - oldLadderEntry.Experience;
                    if (expGain > 0)
                    {
                        var debug = true;
                    }
                    var oneHour = (1 * 60 * 60);
                    var timeBetweenUpdates = newEntry.Updated.ToUnixTimeStamp() - oldLadderEntry.Updated.ToUnixTimeStamp(); // Seconds 
                    var gainOverTime = (oneHour / timeBetweenUpdates) * expGain;
                    newEntry.Experience_per_hour = (long)gainOverTime;
                    if (newLadder.Any(t => t.Name == newEntry.Name))
                    {
                        newEntry.Class_rank = newLadder.Where(t => t.Class == newEntry.Class).ToList().FindIndex(t => t.Name == newEntry.Name) + 1;
                    }
                }
            }
            return newLadder;
        }

        public async Task<LadderApiResponse> FetchLadderApiPage(string league, int page)
        {
            var offset = page * 200;
            league = HttpUtility.UrlEncode(league);
            var urlParams = $"offset={offset}&limit=200&id={league}&type=league";
            var url = $"{LadderUrl}?{urlParams}";
            var apiResponse = await HandleLadderRequest(url);
            return apiResponse;
        }

        private async Task<LadderApiResponse> HandleLadderRequest(string url)
        {
            string json = await _externalService.ExecuteGetAsync(url);
            return JsonConvert.DeserializeObject<LadderApiResponse>(json);
        }

        private async Task SaveLadder(string league, List<LadderPlayer> ladder)
        {
            var chunks = ladder.Split(1000);
            var counter = 0;
            foreach (var chunk in chunks)
            {
                await _cache.SetAsync($"ladder:{league}:{counter}", chunk, new DistributedCacheEntryOptions { });
                counter++;
            }
        }
        private async Task<List<LadderPlayer>> RetriveLadder(string league)
        {
            var ladder = new List<LadderPlayer>();
            bool fetch = true;
            var counter = 0;
            while (fetch)
            {
                var chunk = await _cache.GetAsync<List<LadderPlayer>>($"ladder:{league}:{counter}");
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
