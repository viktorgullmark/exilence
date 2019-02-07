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



        public async Task<List<LadderPlayerModel>> GetLadderForLeague(string leagueName, bool full = false)
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
                    if (full)
                    {
                        return league.Ladder.OrderByDescending(t => t.Experience).ToList();
                    }
                    else
                    {
                        return league.Ladder.OrderByDescending(t => t.Experience).Take(14).ToList();
                    }
                }
            }

            return null;
        }

        public async Task<List<LadderPlayerModel>> GetLadderForPlayer(string leagueName, string character)
        {
            var league = await _redisRepository.GetLeagueLadder(leagueName);
            if (league == null)
            {
                await _redisRepository.SetLeagueLadderPending(leagueName);
            }
            else
            {
                LadderPlayerModel characterOnLadder = null;
                if (league.Ladder != null)
                {
                    characterOnLadder = league.Ladder.FirstOrDefault(t => t.Name == character);
                }

                if (characterOnLadder != null)
                {
                    var index = league.Ladder.IndexOf(characterOnLadder);
                    var before = league.Ladder.Where(t => t.Rank.Overall < characterOnLadder.Rank.Overall && t.Rank.Overall >= (characterOnLadder.Rank.Overall - 6));
                    var after = league.Ladder.Where(t => t.Rank.Overall > characterOnLadder.Rank.Overall && t.Rank.Overall <= (characterOnLadder.Rank.Overall + 7));

                    var ladderList = new List<LadderPlayerModel>();
                    ladderList.AddRange(before);
                    ladderList.Add(characterOnLadder);
                    ladderList.AddRange(after);
                    return ladderList.OrderBy(t => t.Experience).ToList();
                }
            }

            return null;
        }

    }
}
