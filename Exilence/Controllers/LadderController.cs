using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Exilence.Interfaces;
using Exilence.Store;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;

namespace Exilence.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class LadderController : ControllerBase
    {
        private ILogger<LadderController> _log;
        private readonly ILadderService _ladderService;

        public LadderController( ILadderService ladderService, ILogger<LadderController> log)
        {
            _log = log;
            _ladderService = ladderService;
        }

        [Route("")]
        public IActionResult Index(string league, string character)
        {
            var list = _ladderService.GetLadderForPlayer(league, character);
            return Ok(new { List = list });
        }

        [Route("status")]
        public IActionResult Status()
        {
            var statuses = LadderStore.GeAllLadderStatuses();
            return Ok(new { leagues = statuses.OrderByDescending(t => t.Value.Started) });
        }

        [Route("reset")]
        public IActionResult Reset()
        {
            var statuses = LadderStore.GeAllLadderStatuses();
            foreach (var status in statuses)
            {
                LadderStore.SetLadderFinished(status.Key);
            }
            statuses = LadderStore.GeAllLadderStatuses();
            return Ok(new { leagues = statuses.OrderByDescending(t => t.Value.Started) });
        }
    }
}