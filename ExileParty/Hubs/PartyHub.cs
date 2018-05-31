using System;
using System.Threading.Tasks;
using ExileParty.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Caching.Distributed;
using System.Collections.Generic;
using System.Text;
using System.Runtime.Serialization.Formatters.Binary;
using System.IO;
using ExileParty.Helper;
using System.Linq;

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
            // set initial id of player
            player.ConnectionID = Context.ConnectionId;

            // look for party
            var party = await _cache.GetAsync<PartyModel>(partyName);
            if (party == null)
            {
                party = new PartyModel() { Name = partyName, Players = new List<PlayerModel> { player } };
                await _cache.SetAsync<PartyModel>(partyName, party);
                await Clients.Caller.SendAsync("EnteredParty", party, player);
            } else {
                if (party.Players.FirstOrDefault(x => x.ConnectionID == player.ConnectionID) == null) { 
                    party.Players.Insert(0, player);
                }
                await _cache.SetAsync<PartyModel>(partyName, party);
                await Clients.Caller.SendAsync("EnteredParty", party, player);
            }

            await Groups.AddToGroupAsync(Context.ConnectionId, partyName);
            await Clients.OthersInGroup(partyName).SendAsync("PlayerJoined", player);
            await Clients.Group(partyName).SendAsync("PlayerUpdated", player);
        }

        public async Task LeaveParty(string partyName, PlayerModel player)
        {
            var foundParty = await _cache.GetAsync<PartyModel>(partyName);
            if (foundParty != null)
            {
                var foundPlayer = foundParty.Players.FirstOrDefault(x => x.ConnectionID == player.ConnectionID);
                foundParty.Players.Remove(foundPlayer);
                await _cache.SetAsync<PartyModel>(partyName, foundParty);
            }

            await Clients.OthersInGroup(partyName).SendAsync("PlayerLeft", player);
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, partyName);
        }

        public async Task UpdatePlayer(PlayerModel player, string partyName)
        {
            var party = await _cache.GetAsync<PartyModel>(partyName);
            if(party != null) {
                var index = party.Players.IndexOf(party.Players.FirstOrDefault(x => x.ConnectionID == player.ConnectionID));
                party.Players[index] = player;
                await _cache.SetAsync<PartyModel>(partyName, party);
                await Clients.Group(partyName).SendAsync("PlayerUpdated", player);
            }
        }
        public async Task GenericUpdatePlayer(PlayerModel player, string partyName)
        {
            var party = await _cache.GetAsync<PartyModel>(partyName);
            if (party != null)
            {
                var index = party.Players.IndexOf(party.Players.FirstOrDefault(x => x.Character.Name == player.Character.Name));

                if (index == -1)
                {
                    party.Players.Insert(0, player);
                }
                else
                {
                    party.Players[index] = player;
                }

                await _cache.SetAsync<PartyModel>(partyName, party);
                await Clients.Group(partyName).SendAsync("PlayerUpdated", player);
            }
        }

    }
}