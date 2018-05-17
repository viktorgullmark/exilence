using ExileParty.Hubs;
using ExileParty.Interfaces;
using ExileParty.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using System;

namespace SignalRHub.Controllers
{
    [Route("api/[controller]")]
    public class MessageController : Controller
    {
        private IHubContext<MainHub, ITypedHubClient> _hubContext;

        public MessageController(IHubContext<MainHub, ITypedHubClient> hubContext)
        {
            _hubContext = hubContext;
        }

        [HttpPost]
        public string Post([FromBody]MessageModel msg)
        {
            string retMessage = string.Empty;

            try
            {
                _hubContext.Clients.All.BroadcastMessage(msg.Type, msg.Payload);
                retMessage = "Success";
            }
            catch (Exception e)
            {
                retMessage = e.ToString();
            }

            return retMessage;
        }
    }
}