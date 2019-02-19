using LadderParser.Interfaces;
using Newtonsoft.Json;
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
        private IMongoRepository _repository;
        private readonly IExternalService _externalService;

        private const string LadderUrl = "http://www.pathofexile.com/api/ladders";
        private bool isRunning;

        public LadderService(
            IExternalService externalService,
            IMongoRepository repository
            )
        {
            _externalService = externalService;
            _repository = repository;
            isRunning = false;
        }

        public async Task UpdateLadders()
        {
            if (!isRunning)
            {
                var pendingLeague = await _repository.GetPendingLadder();
                if (pendingLeague != null)
                {
                    isRunning = true;
                    await UpdateLadder(pendingLeague.Name);
                    isRunning = false;
                }
            }
        }

        private async Task UpdateLadder(string leagueName)
        {
            Log($"Starting to fetch {leagueName} ladder");
            await _repository.SetLadderRunning(leagueName);

            var ladder = new List<LadderPlayerModel>();
            var sortModes = new List<string>() { null, "depth", "depthsolo" };
            var pages = Enumerable.Range(0, 75);

            foreach (var sortMode in sortModes)
            {
                var sortNiceName = sortMode ?? "overall";
                Log($"Using mode: {sortNiceName}");

                foreach (int page in pages)
                {
                    var interval = 1250;
                    var elapsed = 0;

                    using (var stopwatch = new DisposableStopwatch())
                    {
                        LadderApiResponse result = await FetchLadderApiPage(leagueName, page, sortMode);

                        if (result != null)
                        {
                            var LadderPlayerList = result.Entries.
                                Where(t => !ladder.Any(x => x.Name == t.Character.Name))
                                .Select(t => new LadderPlayerModel(t)).ToList();

                            ladder.AddRange(LadderPlayerList);
                            if (ladder.Count == result.Total || result.Entries.Count == 0)
                            {
                                break;
                            }
                        }
                        else
                        {
                            await _repository.RemoveLadder(leagueName);
                            break;
                        }

                        elapsed = (int)stopwatch.sw.ElapsedMilliseconds;

                        if (interval > elapsed)
                        {
                            Task.Delay(interval - elapsed).Wait();
                        }
                    }
                }
            }

            if (ladder.Count > 0)
            {
                ladder = await CalculateStatistics(ladder);
                await _repository.UpdateLadder(leagueName, ladder);
            }
            Log($"Finished fetching {leagueName} ladder.");
            Log($"--------------------------------------");
        }

        private async Task<List<LadderPlayerModel>> CalculateStatistics(List<LadderPlayerModel> ladder)
        {
            Log($"Started calculating ranks for ladder entries");
            foreach (var newEntry in ladder)
            {
                var task = Task.Run(() =>
                {
                    //newEntry.Depth.GroupRank = ladder.Count(t => t.Depth.Group > newEntry.Depth.Group) + 1;
                    //newEntry.Depth.SoloRank = ladder.Count(t => t.Depth.Solo > newEntry.Depth.Solo) + 1;
                    newEntry.Rank.Class = ladder.Where(t => t.Class == newEntry.Class).Where(x => x.Rank.Overall < newEntry.Rank.Overall).Count() + 1;

                });
                await Task.WhenAll(task, Task.Delay(5));
            }

            Log($"Finished calculating ranks.");
            return ladder;
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
