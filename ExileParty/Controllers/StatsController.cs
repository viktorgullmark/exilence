using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using ExileParty.Interfaces;
using ExileParty.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Caching.Distributed;
using ExileParty.Helper;
using Microsoft.Extensions.Logging;
using ExileParty.Models.Ladder;
using ExileParty.Store;

namespace ExileParty
{
    [Route("api/[controller]")]
    public class StatsController : Controller
    {
        private IDistributedCache _cache;
        private ILogger<StatsController> _log;
        private readonly ILadderService _ladderService;

        public StatsController(IDistributedCache cache, ILadderService ladderService, ILogger<StatsController> log)
        {
            _log = log;
            _cache = cache;
            _ladderService = ladderService;
        }

        // GET: /<controller>/
        [Route("")]
        public async Task<IActionResult> Index()
        {
            var partyList = new List<PartyStatistics>();
            int players = 0;

            var parties = await _cache.GetAsync<Dictionary<string, string>>("ConnectionIndex") ?? new Dictionary<string, string>();

            foreach (var partyName in parties.Select(t => t.Value).Distinct().ToList())
            {

                var party = await _cache.GetAsync<PartyModel>($"party:{partyName}");
                if (party != null)
                {
                    PartyStatistics partyStats = new PartyStatistics { };
                    partyStats.Players = party.Players.Select(t => t.Character.Name).ToList();
                    partyList.Add(partyStats);
                    players += partyStats.Players.Count;
                }

            }

            var statuses = LadderStore.GeAllLadderStatuses();

            var response = new
            {
                totalParties = partyList.Count(),
                totalPlayers = players,
                Parties = partyList,
                LeagueStatus = statuses.OrderByDescending(t => t.Value.Finished).Select(x => new {
                    Name = x.Key,
                    Running = x.Value.Running,
                    Started = x.Value.Started.ToString("yyyy-MM-dd HH:mm:ss"),
                    Finished = x.Value.Finished?.ToString("yyyy-MM-dd HH:mm:ss")
                })
            };

            return Ok(response);
        }

        [Route("Ladder")]
        public async Task<IActionResult> Ladder(string league, string character)
        {
            var list = await _ladderService.GetLadderForPlayer(league, character);

            return Ok(new { List = list });
        }


        [Route("Ladder/Reset")]
        public async Task<IActionResult> LadderReset()
        {
            var statuses = LadderStore.GeAllLadderStatuses();
            foreach (var status in statuses)
            {
                LadderStore.SetLadderFinished(status.Key);
            }
            statuses = LadderStore.GeAllLadderStatuses();

            return Ok(new { LeagueStatus = statuses.OrderByDescending(t => t.Value.Started) });
        }
    }
}
