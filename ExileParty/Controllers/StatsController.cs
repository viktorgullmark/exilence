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
            var partyList = new List<PartyModel>();

            var parties = await _cache.GetAsync<Dictionary<string, string>>("ConnectionIndex") ?? new Dictionary<string, string>();

            foreach (var partyName in parties.Select(t => t.Value).Distinct().ToList())
            {
                var party = await _cache.GetAsync<PartyModel>($"party:{partyName}");
                if (party != null)
                {
                    party.Players.Select(t => { t.Character.Items = null; return t; }).ToList();
                    partyList.Add(party);
                }
            }

            StatisticsModel stats = await _cache.GetAsync<StatisticsModel>("Statistics");

            var response = new
            {
                Statistics = stats,
                Parties = partyList
            };

            return Ok(response);
        }
    }
}
