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
    public class HealthController : Controller
    {
        IRedisRepository _redisRepository;

        public HealthController(IRedisRepository redisRepository)
        {
            _redisRepository = redisRepository;
        }

        // Used for HAProxy healthchecking
        [Route("")]
        public async Task<IActionResult> Index()
        {
            var connections = await _redisRepository.GetStatistics();
            return Ok(connections);
        }
    }
}
