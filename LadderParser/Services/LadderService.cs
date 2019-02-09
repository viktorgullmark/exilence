using LadderParser.Interfaces;
using Newtonsoft.Json;
using Shared.Helper;
using Shared.Interfaces;
using Shared.Models;
using Shared.Models.Ladder;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Web;

namespace LadderParser.Services
{
    public class LadderService : ILadderService
    {
        private IRedisRepository _redisRepository;
        private readonly IExternalService _externalService;

        private const string LadderUrl = "http://www.pathofexile.com/api/ladders";

        public LadderService(
            IExternalService externalService,
            IRedisRepository redisRepository
            )
        {
            _externalService = externalService;
            _redisRepository = redisRepository;
        }


        public async Task UpdateLadders()
        {
            var leagues = await _redisRepository.GetAllLeaguesLadders();
            if (leagues != null & !leagues.Any(t => t.Running))
            {
                var pendingLeague = leagues.Where(t => !t.Running && t.Finished < DateTime.UtcNow.AddMinutes(-1)).OrderByDescending(t => t.Finished).LastOrDefault();

                if (pendingLeague != null)
                {
                    await UpdateLadder(pendingLeague.Name);
                }
            }
        }

        private async Task UpdateLadder(string leagueName)
        {
            Log($"Starting to fetch {leagueName} ladder");
            await _redisRepository.SetLeagueLadderRunning(leagueName);

            var league = await _redisRepository.GetLeagueLadder(leagueName);
            var oldLadder = league.Ladder;
            var newLadder = new List<LadderPlayerModel>();
            var sortModes = new List<string>() { null, "depth", "depthsolo" };
            var pages = Enumerable.Range(0, 75);

            using (var rateGate = new RateGate(4, TimeSpan.FromMilliseconds(5000)))
            {
                foreach (var sortMode in sortModes)
                {
                    var sortNiceName = sortMode ?? "exp";
                    Log($"Using mode: {sortNiceName}");

                    foreach (int page in pages)
                    {
                        await rateGate.WaitToProceed();
                        LadderApiResponse result = await FetchLadderApiPage(leagueName, page, sortMode);
                        if (result != null)
                        {
                            var LadderPlayerList = result.Entries.
                                Where(t => !newLadder.Any(x => x.Name == t.Character.Name))
                                .Select(t => new LadderPlayerModel(t)).ToList();

                            newLadder.AddRange(LadderPlayerList);
                            if (newLadder.Count == result.Total || result.Entries.Count == 0)
                            {
                                break;
                            }
                        }
                        else
                        {
                            await _redisRepository.RemoveLeagueLadder(leagueName);
                            break;
                        }
                    }
                }
            }

            if (newLadder.Count > 0)
            {
                newLadder = CalculateStatistics(oldLadder, newLadder);
                await _redisRepository.UpdateLeagueLadder(leagueName, newLadder);
            }
            Log($"Finished fetching {leagueName} ladder.");
            Log($"--------------------------------------");
        }

        private List<LadderPlayerModel> CalculateStatistics(List<LadderPlayerModel> oldLadder, List<LadderPlayerModel> newLadder)
        {
            Log($"Started calculating statistics.");
            Parallel.ForEach(newLadder, newEntry =>
            {
                newEntry.Depth.GroupRank = newLadder.Count(t => t.Depth.Group > newEntry.Depth.Group) + 1;
                newEntry.Depth.SoloRank = newLadder.Count(t => t.Depth.Solo > newEntry.Depth.Solo) + 1;
                newEntry.Rank.Class = newLadder.Where(t => t.Class == newEntry.Class).Where(x => x.Rank.Overall < newEntry.Rank.Overall).Count() + 1;

                if (oldLadder != null)
                {
                    var oldLadderEntry = oldLadder.FirstOrDefault(t => t.Name == newEntry.Name);
                    if (oldLadderEntry != null && oldLadderEntry.Updated != DateTime.MinValue)
                    {
                        var expGain = newEntry.Experience - oldLadderEntry.Experience;
                        var oneHour = (1 * 60 * 60);
                        var timeBetweenUpdates = newEntry.Updated.ToUnixTimeStamp() - oldLadderEntry.Updated.ToUnixTimeStamp();
                        var gainOverTime = (oneHour / timeBetweenUpdates) * expGain;
                        newEntry.ExperiencePerHour = (long)gainOverTime;
                    }
                }
            });
            Log($"Finished calculating statistics.");
            return newLadder;
        }

        public async Task<LadderApiResponse> FetchLadderApiPage(string league, int page, string sort = null)
        {
            var sortNiceName = sort ?? "exp";
            Log($"Fetching {league} ladder, sort: {sortNiceName}, page: {page}");
            var offset = page * 200;
            league = HttpUtility.UrlEncode(league);
            var urlParams = $"offset={offset}&limit=200&id={league}&type=league";
            if (sort != null)
            {
                urlParams += $"&sort={sort}";
            }
            var url = $"{LadderUrl}?{urlParams}";
            var apiResponse = await HandleLadderRequest(url);
            return apiResponse;
        }

        private async Task<LadderApiResponse> HandleLadderRequest(string url)
        {
            string json = await _externalService.ExecuteGetAsync(url);
            if (json != null)
            {
                return JsonConvert.DeserializeObject<LadderApiResponse>(json);
            }
            return null;
        }

        private void Log(string message)
        {
            Console.WriteLine($"{DateTime.Now.ToShortTimeString()}: {message}");
        }


    }
}
