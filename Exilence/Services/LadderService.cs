using Shared.Helper;
using Shared.Interfaces;
using Shared.Models;
using Shared.Models.Ladder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Web;
using Exilence.Interfaces;

namespace Exilence.Services
{
    public class LadderService : ILadderService
    {
        private IRedisRepository _redisRepository;
        private readonly IHostingEnvironment _env;
        private readonly ILogger<LadderService> _log;

        public LadderService(
            IHostingEnvironment env,
            ILogger<LadderService> log,
            IRedisRepository redisRepository
            )
        {
            _log = log;
            _env = env;
            _redisRepository = redisRepository;
        }



        public async Task<List<LadderPlayerModel>> GetLadderForLeague(string leagueName)
        {
            var league = await _redisRepository.GetLeagueLadder(leagueName);
            if (league == null)
            {
                await _redisRepository.SetLeagueLadderPending(leagueName);
            }
            else
            {
                if (league.Ladder != null)
                {
                    return league.Ladder.OrderByDescending(t => t.Experience).ToList();
                }
            }

            return null;
        }

    }
}
