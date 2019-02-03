using Shared.Helper;
using Shared.Interfaces;
using Shared.Models;
using Shared.Models.Ladder;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Web;
using LadderService.Interfaces;

namespace LadderService.Services
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

        #region Ladder
        
        public async Task UpdateLadders()
        {
            var leagues = await _redisRepository.GetAllLeaguesLadders();
            if (leagues != null)
            {
                var anyRunning = leagues.Any(t => t.Running);
                var pendingLeague = leagues.OrderByDescending(t => t.Finished).LastOrDefault();

                if (!anyRunning)
                {
                    if (pendingLeague != null)
                    {
                        if (pendingLeague.Finished < DateTime.Now.AddMinutes(-5))
                        {
                            await UpdateLadder(pendingLeague.Name);
                        }
                    }
                }
            }
        }

        private async Task UpdateLadder(string leagueName)
        {
            await _redisRepository.SetLeagueLadderRunning(leagueName);

            var league = await _redisRepository.GetLeagueLadder(leagueName);
            var oldLadder = league.Ladder;
            var newLadder = new List<LadderPlayerModel>();

            var pages = Enumerable.Range(0, 25);
            using (var rateGate = new RateGate(2, TimeSpan.FromSeconds(1)))
            {
                foreach (int page in pages)
                {
                    await rateGate.WaitToProceed();
                    LadderApiResponse result = await FetchLadderApiPage(leagueName, page);
                    if (result != null)
                    {
                        var LadderPlayerList = result.Entries.Select(t => new LadderPlayerModel()
                        {
                            Name = t.Character.Name,
                            Level = t.Character.Level,
                            Online = t.Online,
                            Dead = t.Dead,
                            Account = t.Account.Name,
                            Experience = t.Character.Experience,
                            ExperiencePerHour = 0,
                            Rank = new LadderPlayerRankModel()
                            {
                                Overall = t.Rank
                            },
                            Depth = new LadderPlayerDepthModel()
                            {
                                Solo = t.Character.Depth != null ? t.Character.Depth.Solo : 0,
                                Group = t.Character.Depth != null ? t.Character.Depth.@default : 0
                            },
                            Twitch = t.Account.Twitch?.Name,
                            Class = t.Character.Class,
                            Updated = DateTime.Now
                        }).ToList();
                        // Convert result to LadderPlayer model here
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

            if (newLadder.Count > 0)
            {
                newLadder = CalculateStatistics(oldLadder, newLadder);
                await _redisRepository.UpdateLeagueLadder(leagueName, newLadder);
            }
        }

        private List<LadderPlayerModel> CalculateStatistics(List<LadderPlayerModel> oldLadder, List<LadderPlayerModel> newLadder)
        {
            foreach (var newEntry in newLadder)
            {
                newEntry.Depth.Group = newLadder.Count(t => t.Depth.Group > newEntry.Depth.Group) + 1;
                newEntry.Depth.Solo = newLadder.Count(t => t.Depth.Solo > newEntry.Depth.Solo) + 1;
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
            if (json != null)
            {
                return JsonConvert.DeserializeObject<LadderApiResponse>(json);
            }
            return null;
        }


        #endregion

    }
}
