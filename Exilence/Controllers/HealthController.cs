using System.Threading.Tasks;
using Shared.Interfaces;
using Microsoft.AspNetCore.Mvc;

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
        public IActionResult Index()
        {
            return Ok();
        }
    }
}
