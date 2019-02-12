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
        private IMongoRepository _repository;
        private readonly IHostingEnvironment _env;
        private readonly ILogger<LadderService> _log;

        public LadderService(
            IHostingEnvironment env,
            ILogger<LadderService> log,
            IMongoRepository repository
            )
        {
            _log = log;
            _env = env;
            _repository = repository;
        }



        public async Task<List<LadderPlayerModel>> GetLadderForLeague(string leagueName)
        {
            var league = await _repository.GetLadder(leagueName);
            if (league == null)
            {
                await _repository.SetLadderPending(leagueName);
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
