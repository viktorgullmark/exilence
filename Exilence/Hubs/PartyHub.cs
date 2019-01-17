using System;
using System.Threading.Tasks;
using Exilence.Models;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Caching.Distributed;
using System.Collections.Generic;
using Exilence.Helper;
using System.Linq;
using Exilence.Interfaces;
using Newtonsoft.Json;
using Exilence.Models.Connection;
using Exilence.Models.Statistics;
using Microsoft.ApplicationInsights;
using System.Diagnostics;

namespace Exilence.Hubs
{
    [EnableCors("AllowAll")]
    public class PartyHub : Hub
    {
        private IDistributedCache _cache;
        private IRedisRepository _redisRepository;
        private ILadderService _ladderService;
        private TelemetryClient _telemetry;

        private string ConnectionId => Context.ConnectionId;
        
        public PartyHub(IDistributedCache cache, IRedisRepository redisRepository, ILadderService ladderService, TelemetryClient telemetry)
        {
            _cache = cache;
            _redisRepository = redisRepository;
            _ladderService = ladderService;
            _telemetry = telemetry;
        }
                
        public async Task JoinParty(string partyName, string playerObj)
        {
            var sw = new Stopwatch();
            sw.Start();

            var player = CompressionHelper.Decompress<PlayerModel>(playerObj);

            var ladder = await _ladderService.GetLadderForPlayer(player.Character.League, player.Character.Name);
            if (ladder == null)
            {
                ladder = await _ladderService.GetLadderForLeague(player.Character.League);
            }
            player.LadderInfo = ladder;

            // set initial id of player
            player.ConnectionID = Context.ConnectionId;

            //update ConnectionId:Partyname index
            await AddToIndex(partyName);

            // look for party
            var party = await _cache.GetAsync<PartyModel>($"party:{partyName}");
            if (party == null)
            {
                party = new PartyModel() { Name = partyName, Players = new List<PlayerModel> { player } };
                await _cache.SetAsync<PartyModel>($"party:{partyName}", party);
                await Clients.Caller.SendAsync("EnteredParty", CompressionHelper.Compress(party), CompressionHelper.Compress(player));
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
                await Clients.Caller.SendAsync("EnteredParty", CompressionHelper.Compress(party), CompressionHelper.Compress(player));
            }

            await Groups.AddToGroupAsync(Context.ConnectionId, partyName);
            await Clients.OthersInGroup(partyName).SendAsync("PlayerJoined", CompressionHelper.Compress(player));
            await Clients.Group(partyName).SendAsync("PlayerUpdated", CompressionHelper.Compress(player));

            var elapsed = sw.ElapsedMilliseconds / 1000;
            _telemetry.GetMetric("PartyHub.JoinParty").TrackValue(elapsed);
        }

        public async Task LeaveParty(string partyName, string playerObj)
        {
            var player = CompressionHelper.Decompress<PlayerModel>(playerObj);

            var foundParty = await _cache.GetAsync<PartyModel>($"party:{partyName}");
            if (foundParty != null)
            {
                //Handle generic players if "host" left
                var genericPlayers = foundParty.Players.Where(t => t.GenericHost == player.Character.Name).ToList();
                foreach (var genericPlayer in genericPlayers)
                {
                    foundParty.Players.Remove(genericPlayer);
                    await Clients.Group(partyName).SendAsync("PlayerLeft", genericPlayer);
                }

                var foundPlayer = foundParty.Players.FirstOrDefault(x => x.ConnectionID == player.ConnectionID);

                foundParty.Players.Remove(foundPlayer);                
                var success = RemoveFromIndex();

                if (foundParty.Players.Count != 0)
                {
                    await _cache.SetAsync<PartyModel>($"party:{partyName}", foundParty);
                }
                else
                {                    
                    await _cache.RemoveAsync($"party:{partyName}");
                }

            }

            await Clients.OthersInGroup(partyName).SendAsync("PlayerLeft", CompressionHelper.Compress(player));
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, partyName);
        }

        public async Task UpdatePlayer(string partyName, string playerObj)
        {
            var sw = new Stopwatch();
            sw.Start();

            var player = CompressionHelper.Decompress<PlayerModel>(playerObj);
            var party = await _cache.GetAsync<PartyModel>($"party:{partyName}");

            if (party != null)
            {
                var ladder = await _ladderService.GetLadderForPlayer(player.Character.League, player.Character.Name);
                if (ladder == null)
                {
                    ladder = await _ladderService.GetLadderForLeague(player.Character.League);
                }
                player.LadderInfo = ladder;

                var index = party.Players.IndexOf(party.Players.FirstOrDefault(x => x.ConnectionID == player.ConnectionID));
                if(index != -1)
                {
                    party.Players[index] = player;
                    await _cache.SetAsync<PartyModel>($"party:{partyName}", party);
                    await Clients.Group(partyName).SendAsync("PlayerUpdated", CompressionHelper.Compress(player));

                }
            }
            else
            {
                await Clients.Group(partyName).SendAsync("ForceDisconnect");
            }

            var elapsed = sw.ElapsedMilliseconds / 1000;
            _telemetry.GetMetric("PartyHub.UpdatePlayer").TrackValue(elapsed);
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
                    await Clients.Group(partyName).SendAsync("PlayerJoined", player);
                }
                else
                {
                    party.Players[index] = player;
                }

                await _cache.SetAsync<PartyModel>($"party:{partyName}", party);
                await Clients.Group(partyName).SendAsync("GenericPlayerUpdated", player);
            }
        }

        public override async Task OnConnectedAsync()
        {
            await _redisRepository.UpdateStatistics(StatisticsActionEnum.IncrementConnection);

            await base.OnConnectedAsync(); 
        }

        public override async Task OnDisconnectedAsync(Exception exception)
        {
            var partyName = await GetPartynameFromIndex();

            if (partyName != null)
            {
                var foundParty = await _cache.GetAsync<PartyModel>($"party:{partyName}");
                if (foundParty != null)
                {
                    var foundPlayer = foundParty.Players.FirstOrDefault(x => x.ConnectionID == Context.ConnectionId);
                    if (foundPlayer != null)
                    {   //This compression and then uncompression is ugly
                        await LeaveParty(partyName, CompressionHelper.Compress(foundPlayer));
                        var success = RemoveFromIndex();
                    }
                }
            }

            await _redisRepository.UpdateStatistics(StatisticsActionEnum.DecrementConnection);
            await base.OnDisconnectedAsync(exception);
        }

        private async Task<string> GetPartynameFromIndex()
        {
            var result = await _redisRepository.GetPartyNameFromConnection(ConnectionId);
            return result;
        }

        private async Task<bool> RemoveFromIndex()
        {
            var success = await _redisRepository.RemoveConnection(ConnectionId);
            return success;
        }

        private async Task AddToIndex(string partyName)
        {
            if (partyName != "")
            {
                await _redisRepository.AddConnection(ConnectionId, partyName);
            }
        }
    }
}