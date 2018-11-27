using ExileParty.Helper;
using ExileParty.Interfaces;
using ExileParty.Models;
using ExileParty.Models.Ladder;
using ExileParty.Store;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Web;

namespace ExileParty.Services
{
    public class LadderService : ILadderService
    {
        private readonly IHostingEnvironment _env;
        private readonly ILogger<LadderService> _log;
        private readonly IExternalService _externalService;

        private const string LadderUrl = "http://www.pathofexile.com/api/ladders";
        private const string LeagesUrl = "http://api.pathofexile.com/leagues?type=main&compact=1";
        private const string PoeNinjaStatsUrl = "http://poe.ninja/api/Data/GetStats";
        private const string TradeUrl = "http://api.pathofexile.com/public-stash-tabs";

        public LadderService(ILogger<LadderService> log, IExternalService externalService, IHostingEnvironment env)
        {
            _log = log;
            _env = env;
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

        public async Task<List<LadderPlayerModel>> GetLadderForPlayer(string league, string character)
        {
            TryUpdateLadder(league); //Not awaited with purpose

            var leagueLadder = LadderStore.GetLadder(league);

            var returnList = new List<LadderPlayerModel>();

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
            var ladderStatus = LadderStore.GetLadderStatus(league);
            var anyRunning = LadderStore.AnyRunning();

            if (!anyRunning && (ladderStatus == null || ladderStatus.Finished < DateTime.Now.AddMinutes(-5)))
            {
                // Set league status to running for the current league
                LadderStore.SetLadderRunning(league);

                var oldLadder = LadderStore.GetLadder(league);
                var newLadder = new List<LadderPlayerModel>();

                var pages = Enumerable.Range(0, 25);
                using (var rateGate = new RateGate(2, TimeSpan.FromSeconds(1)))
                {
                    foreach (int page in pages)
                    {
                        await rateGate.WaitToProceed();
                        LadderApiResponse result = await FetchLadderApiPage(league, page);
                        var LadderPlayerList = result.Entries.Select(t => new LadderPlayerModel()
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

                LadderStore.SetLadder(league, newLadder);
                LadderStore.SetLadderFinished(league);
            }
        }

        private List<LadderPlayerModel> CalculateStatistics(List<LadderPlayerModel> oldLadder, List<LadderPlayerModel> newLadder)
        {
            foreach (var newEntry in newLadder)
            {
                var oldLadderEntry = oldLadder.FirstOrDefault(t => t.Name == newEntry.Name);
                if (oldLadderEntry != null && oldLadderEntry.Updated != DateTime.MinValue)
                {
                    var expGain = newEntry.Experience - oldLadderEntry.Experience;
                    var oneHour = (1 * 60 * 60);
                    var timeBetweenUpdates = newEntry.Updated.ToUnixTimeStamp() - oldLadderEntry.Updated.ToUnixTimeStamp();
                    var gainOverTime = (oneHour / timeBetweenUpdates) * expGain;
                    newEntry.Experience_per_hour = (long)gainOverTime;
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


        #endregion

    }
}
