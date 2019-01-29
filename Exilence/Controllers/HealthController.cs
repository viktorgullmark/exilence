using System.Threading.Tasks;
using Shared.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace Shared
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
