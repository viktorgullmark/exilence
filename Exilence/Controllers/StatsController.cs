using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Exilence.Interfaces;
using Exilence.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Caching.Distributed;
using Exilence.Helper;
using Microsoft.Extensions.Logging;
using Exilence.Models.Ladder;
using Exilence.Store;

namespace Exilence
{
    [Route("api/[controller]")]
    public class StatsController : Controller
    {
        private IDistributedCache _cache;
        private ILogger<StatsController> _log;

        public StatsController(IDistributedCache cache, ILogger<StatsController> log)
        {
            _log = log;
            _cache = cache;
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
                parties = partyList,
                leagues = statuses.OrderByDescending(t => t.Value.Finished).Select(x => new {
                    Name = x.Key,
                    Running = x.Value.Running,
                    Started = x.Value.Started.ToString("yyyy-MM-dd HH:mm:ss"),
                    Finished = x.Value.Finished.ToString("yyyy-MM-dd HH:mm:ss")
                })
            };

            return Ok(response);
        }


    }
}
