using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Exilence.Interfaces;
using Shared.Interfaces;
using Shared.Helper;

namespace Exilence.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class LadderController : ControllerBase
    {
        private ILogger<LadderController> _log;
        private ILadderService _ladderService;
        private IMongoRepository _repository;

        public LadderController( ILadderService ladderService, ILogger<LadderController> log, IMongoRepository repository)
        {
            _log = log;
            _ladderService = ladderService;
            _repository = repository;
        }

        [Route("")]
        public async Task<IActionResult> All(string league, bool full = false)
        {
            var list = await _ladderService.GetLadderForLeague(league);
            return Ok(new { Ladder = list });
        }

        [Route("status")]
        public async Task<IActionResult> Status()
        {
            var statuses = await _repository.GetAllLadders();
            return Ok(new { leagues = statuses.Select(t => new { t.Name, t.Running, t.Finished, t.Started }).OrderByDescending(t => t.Started) });
        }

        [Route("getLadderForLeague/{league}")]
        public async Task<IActionResult> GetLadderForLeague(string league)
        {
            var ladder = await _ladderService.GetLadderForLeague(league);
            return Ok(new { Ladder = CompressionHelper.Compress(ladder) });
        }
    }
}