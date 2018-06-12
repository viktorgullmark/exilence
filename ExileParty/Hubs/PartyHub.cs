﻿using System;
using System.Threading.Tasks;
using ExileParty.Models;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Caching.Distributed;
using System.Collections.Generic;
using ExileParty.Helper;
using System.Linq;
using ExileParty.Interfaces;

namespace ExileParty.Hubs
{
    [EnableCors("AllowAll")]
    public class PartyHub : Hub
    {
        private IDistributedCache _cache;
        private ICharacterService _characterService;

        private string ConnectionId => Context.ConnectionId;
        
        public PartyHub(IDistributedCache cache, ICharacterService characterService)
        {
            _cache = cache;
            _characterService = characterService;
        }
                
        public async Task JoinParty(string partyName, PlayerModel player)
        {
            // set initial id of player
            player.ConnectionID = Context.ConnectionId;

            //update ConnectionId:Partyname index
            var success = await AddToIndex(partyName);

            // look for party
            var party = await _cache.GetAsync<PartyModel>($"party:{partyName}");
            if (party == null)
            {
                party = new PartyModel() { Name = partyName, Players = new List<PlayerModel> { player } };
                await _cache.SetAsync<PartyModel>($"party:{partyName}", party);
                await Clients.Caller.SendAsync("EnteredParty", party, player);
            }
            else
            {
                var oldPlayer = party.Players.FirstOrDefault(x => x.Character.Name == player.Character.Name || x.ConnectionID == player.ConnectionID);

                if (oldPlayer == null)
                {
                    party.Players.Insert(0, player);
                }
                else
                {
                    // index of old player
                    var index = party.Players.IndexOf(oldPlayer);
                    await Groups.RemoveFromGroupAsync(oldPlayer.ConnectionID, partyName);
                    party.Players[index] = player;
                }

                await _cache.SetAsync<PartyModel>($"party:{partyName}", party);
                await Clients.Caller.SendAsync("EnteredParty", party, player);
            }

            await Groups.AddToGroupAsync(Context.ConnectionId, partyName);
            await Clients.OthersInGroup(partyName).SendAsync("PlayerJoined", player);
            await Clients.Group(partyName).SendAsync("PlayerUpdated", player);
        }

        public async Task LeaveParty(string partyName, PlayerModel player)
        {
            var foundParty = await _cache.GetAsync<PartyModel>($"party:{partyName}");
            if (foundParty != null)
            {
                var foundPlayer = foundParty.Players.FirstOrDefault(x => x.ConnectionID == player.ConnectionID);
                foundParty.Players.Remove(foundPlayer);
                await _cache.SetAsync<PartyModel>($"party:{partyName}", foundParty);
            }

            await Clients.OthersInGroup(partyName).SendAsync("PlayerLeft", player);
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, partyName);
        }

        public async Task UpdatePlayer(PlayerModel player, string partyName)
        {
            var party = await _cache.GetAsync<PartyModel>($"party:{partyName}");
            if (party != null)
            {
                var index = party.Players.IndexOf(party.Players.FirstOrDefault(x => x.ConnectionID == player.ConnectionID));
                party.Players[index] = player;
                await _cache.SetAsync<PartyModel>($"party:{partyName}", party);
                await Clients.Group(partyName).SendAsync("PlayerUpdated", player);
            }
        }

        public override async Task OnDisconnectedAsync(Exception exception)
        {
            var partyName = await GetPartynameFromIndex();

            if (partyName != null)
            {
                var foundParty = await _cache.GetAsync<PartyModel>($"party:{partyName}");
                var foundPlayer = foundParty.Players.FirstOrDefault(x => x.ConnectionID == Context.ConnectionId);
                if (foundPlayer != null)
                {
                    await LeaveParty(partyName, foundPlayer);
                    var success = await RemoveFromIndex();
                }
            }
            await base.OnDisconnectedAsync(exception);
        }


        private async Task<Dictionary<string, string>> GetIndex()
        {
            return await _cache.GetAsync<Dictionary<string, string>>("Index") ?? new Dictionary<string, string>();
        }

        private async Task<string> GetPartynameFromIndex()
        {
            var index = await GetIndex();
            index.TryGetValue(ConnectionId, out var partyName);
            return partyName;
        }
        
        private async Task<bool> RemoveFromIndex()
        {
            var index = await GetIndex();
            var success = index.Remove(ConnectionId);

            if(success)
                await _cache.SetAsync("ConnectionIndex", index, new DistributedCacheEntryOptions { });

            return success;
        }

        private async Task<bool> AddToIndex(string partyName)
        {
            var index = await GetIndex();
            var success = index.TryAdd(ConnectionId, partyName);

            if (success)
                await _cache.SetAsync("ConnectionIndex", index, new DistributedCacheEntryOptions { });

            return success;
        }

        public async Task<string> GetAccountForCharacter(string character)
        {
            var account = await _characterService.GetAccountFromCharacterAsync(character);
            return account;
        }
        
        public async Task GenericUpdatePlayer(PlayerModel player, string partyName)
        {
            var party = await _cache.GetAsync<PartyModel>($"party:{partyName}");
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

                await _cache.SetAsync<PartyModel>($"party:{partyName}", party);
                await Clients.Group(partyName).SendAsync("PlayerUpdated", player);
            }
        }

    }
}