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
using Exilence.Models.Connection;

namespace Exilence
{
    [Route("api/[controller]")]
    public class StatsController : Controller
    {
        private IDistributedCache _cache;
        private ILogger<StatsController> _log;
        private IStoreRepository _storeRepository;
        private IRedisRepository _redisRepository;

        public StatsController(IDistributedCache cache, ILogger<StatsController> log, IStoreRepository storeRepository, IRedisRepository redisRepository)
        {
            _log = log;
            _cache = cache;
            _storeRepository = storeRepository;
            _redisRepository = redisRepository;
        }

        // GET: /<controller>/
        [Route("")]
        public async Task<IActionResult> Index()
        {
            var partyList = new List<PartyStatistics>();
            var connectionsWithoutParty = new List<string>();

            int players = 0;

            var connections = await _redisRepository.GetAllConnections();
            if (connections != null)
            {
                foreach (var connection in connections.Distinct().ToList())
                {
                    if (connection.PartyName != null)
                    {
                        var party = await _redisRepository.GetParty(connection.PartyName);
                        if (party != null)
                        {
                            PartyStatistics partyStats = new PartyStatistics { };
                            partyStats.Players = party.Players.Select(t => t.Character.Name).ToList();
                            partyList.Add(partyStats);
                            players += partyStats.Players.Count;
                        }
                        else
                        {
                            connectionsWithoutParty.Add(connection.ConnectionId);
                            //await _redisRepository.RemoveConnection(connection.ConnectionId);
                        }
                    }
                }
            }

            var statuses = await _redisRepository.GetAllLeaguesLadders();

            if (statuses == null)
            {
                statuses = new List<LadderStoreModel>();
            }

            var response = new
            {
                totalParties = partyList.Count(),
                totalPlayers = players,
                leagues = statuses.Select(t => new { t.Name, t.Running, t.Finished, t.Started }).OrderByDescending(t => t.Finished).Select(x => new {
                    Name = x.Name,
                    Running = x.Running,
                    Started = x.Started.ToString("yyyy-MM-dd HH:mm:ss"),
                    Finished = x.Finished.ToString("yyyy-MM-dd HH:mm:ss")
                }),
                connectionsWithoutParty,
                parties = partyList,

            };

            return Ok(response);
        }


    }
}
