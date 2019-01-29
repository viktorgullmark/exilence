using System.Threading.Tasks;
using Shared.Hubs;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Configuration;

namespace Shared.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class MessageController : ControllerBase
    {

        private readonly IHubContext<PartyHub> _partyHub;
        private IConfiguration _configuration;

        public MessageController(IHubContext<PartyHub> partyHub, IConfiguration configuration)
        {
            _partyHub = partyHub;
            _configuration = configuration;
        }


        [Route("")]
        public async Task<IActionResult> Index(string title, string body, string password)
        {
            if(password == _configuration["Messaging:Password"]) { 
                var messageObject = new { title, body };
                await _partyHub.Clients.All.SendAsync("ServerMessageReceived", messageObject);
                return Ok( new { result = true } );
            } else
            {
                return BadRequest(new { error = "Wrong password" });
            }
        }
    }
}   