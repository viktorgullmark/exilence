using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Exilence.Hubs;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;

namespace Exilence.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class MessageController : ControllerBase
    {

        private readonly IHubContext<PartyHub> _partyHub;

        public MessageController(IHubContext<PartyHub> partyHub)
        {
            _partyHub = partyHub;
        }


        [Route("")]
        public async Task<IActionResult> Index(string title, string body)
        {
            var messageObject = new { title, body };
            await _partyHub.Clients.All.SendAsync("ServerMessageReceived", messageObject);
            return Ok( new { result = true } );
        }
    }
}   