using ExileParty.Hubs;
using ExileParty.Interfaces;
using ExileParty.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Caching.Distributed;
using Microsoft.Extensions.Caching.Redis;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace SignalRHub.Controllers
{
    [Route("api/[controller]")]
    public class PartyController : Controller
    {
        private IHubContext<PartyHub, ITypedHubClient> _hubContext;
        private IDistributedCache _cache;

        public PartyController(IHubContext<PartyHub, ITypedHubClient> hubContext, IDistributedCache cache)
        {
            _hubContext = hubContext;
            _cache = cache;
        }

        [HttpPost]
        public async Task<string> PostAsync([FromBody]MessageModel msg)
        {

            string retMessage = "Testing session in Redis. Time of storage: " + DateTime.Now.ToString("s");
            _cache.SetString("TestValue", retMessage);
            
            try
            {
                await _hubContext.Clients.All.BroadcastMessage(msg.Type, retMessage);
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