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
        private IRedisRepository _redisRepository;

        public StatsController(IDistributedCache cache, ILogger<StatsController> log, IRedisRepository redisRepository)
        {
            _log = log;
            _cache = cache;
            _redisRepository = redisRepository;
        }

        // GET: /<controller>/
        [Route("")]
        public async Task<IActionResult> Index()
        {
            var statistics = await _redisRepository.GetStatistics();
            var statuses = await _redisRepository.GetAllLeaguesLadders();
            
            var response = new
            {
                statistics,
                leagues = statuses?.Select(t => new { t.Name, t.Running, t.Finished, t.Started }).OrderByDescending(t => t.Finished).Select(x => new {
                    Name = x.Name,
                    Running = x.Running,
                    Started = x.Started.ToString("yyyy-MM-dd HH:mm:ss"),
                    Finished = x.Finished.ToString("yyyy-MM-dd HH:mm:ss")
                })
            };

            return Ok(response);
        }


    }
}
