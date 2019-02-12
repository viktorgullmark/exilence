using System.Threading.Tasks;
using Shared.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace Exilence
{
    [Route("api/[controller]")]
    public class HealthController : Controller
    {
        public HealthController()
        {
        }

        // Used for HAProxy healthchecking
        [Route("")]
        public IActionResult Index()
        {
            return Ok();
        }
    }
}
