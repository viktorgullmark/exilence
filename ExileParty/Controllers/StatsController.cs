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

namespace ExileParty
{
    [Route("api/[controller]")]
    public class StatsController : Controller
    {
        private IDistributedCache _cache;
        private ILogger<StatsController> _log;
        private readonly ICharacterService _characterService;

        public StatsController(IDistributedCache cache, ICharacterService characterService, ILogger<StatsController> log)
        {
            _log = log;
            _cache = cache;
            _characterService = characterService;
        }

        // GET: /<controller>/
        public async Task<IActionResult> Index()
        {
            var partyList = new List<PartyStatistics>();

            var parties = await _cache.GetAsync<Dictionary<string, string>>("ConnectionIndex") ?? new Dictionary<string, string>();

            StatisticsModel stats = await _cache.GetAsync<StatisticsModel>("Statistics");

            foreach (var partyName in parties.Select(t => t.Value).Distinct().ToList())
            {

                var party = await _cache.GetAsync<PartyModel>($"party:{partyName}");
                if (party != null)
                {
                    stats.TotalParties++;
                    stats.TotalPlayers += party.Players.Count;

                    PartyStatistics partyStats = new PartyStatistics { };
                    partyStats.Players = party.Players.Select(t => t.Character.Name).ToList();
                    partyList.Add(partyStats);
                }

            }


            var response = new
            {
                Statistics = stats,
                Parties = partyList
            };

            return Ok(response);
        }
    }
}
