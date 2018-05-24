using System;
using System.Threading.Tasks;
using ExileParty.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Caching.Distributed;

namespace ExileParty.Hubs
{
    [EnableCors("AllowAll")]
    public class PartyHub : Hub
    {
        private IDistributedCache _cache;

        public PartyHub(IDistributedCache cache)
        {
            _cache = cache;
        }

        public async Task JoinParty(string partyName, PlayerModel player)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, partyName);
            await Clients.OthersInGroup(partyName).SendAsync("PlayerJoined", player);
        }
    }
}