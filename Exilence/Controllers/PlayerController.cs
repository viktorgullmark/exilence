using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Shared.Interfaces;
using System.Threading.Tasks;

namespace Exilence.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PlayerController : ControllerBase
    {
        private IMongoRepository _repository;
        private IConfiguration _configuration;

        public PlayerController(IMongoRepository repository, IConfiguration configuration)
        {
            _configuration = configuration;
            _repository = repository;
        }

        [Route("Find/{character}")]
        public async Task<IActionResult> Find(string character, string key)
        {
            var apiKey = _configuration["api:key"];
            if (apiKey == key)
            {                var party = await _repository.FindPlayerParty(character);
                if (party != null)
                {
                    return Ok(new { spectatorCode = party.SpectatorCode });
                }
                return NotFound();
            }
            return Unauthorized();
        }
    }
}