using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Exilence.Interfaces;
using Shared.Interfaces;

namespace Exilence.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class LadderController : ControllerBase
    {
        private ILogger<LadderController> _log;
        private ILadderService _ladderService;
        private IRedisRepository _redisRepository;

        public LadderController( ILadderService ladderService, ILogger<LadderController> log, IRedisRepository redisRepository)
        {
            _log = log;
            _ladderService = ladderService;
            _redisRepository = redisRepository;
        }

        [Route("")]
        public async Task<IActionResult> All(string league, bool full = false)
        {
            var list = await _ladderService.GetLadderForLeague(league, full);
            return Ok(new { Ladder = list });
        }

        [Route("character")]
        public async Task<IActionResult> Index(string league, string character)
        {
            var list = await _ladderService.GetLadderForPlayer(league, character);
            return Ok(new { Ladder = list });
        }

        [Route("status")]
        public async Task<IActionResult> Status()
        {
            var statuses = await _redisRepository.GetAllLeaguesLadders();
            return Ok(new { leagues = statuses.Select(t => new { t.Name, t.Running, t.Finished, t.Started }).OrderByDescending(t => t.Started) });
        }
    }
}