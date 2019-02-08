using Shared.Helper;
using Shared.Interfaces;
using Shared.Models;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Caching.Distributed;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Shared.Models.Statistics;
using Exilence.Interfaces;
using Exilence.Helper;

namespace Exilence.Hubs
{
    [EnableCors("AllowAll")]
    public class PartyHub : Hub
    {
        private IDistributedCache _cache;
        private IRedisRepository _redisRepository;
        private ILadderService _ladderService;
        private IConfiguration _configuration;

        private string _key;
        private string ConnectionId => Context.ConnectionId;

        public PartyHub(
            IDistributedCache cache,
            IRedisRepository redisRepository,
            ILadderService ladderService,
            IConfiguration configuration
            )
        {
            _cache = cache;
            _redisRepository = redisRepository;
            _ladderService = ladderService;
            _configuration = configuration;

            _key = _configuration.GetValue<string>("Spectator:Key");
        }

        public async Task<bool> PartyExists(string spectatorCode)
        {
            var partyName = SpectatorHelper.ToPartyName(spectatorCode, _key);
            var party = await _cache.GetAsync<PartyModel>($"party:{partyName}");

            return party != null;
        }

        public async Task<string> GetLaddderForLeague(string league)
        {
            var ladder = await _ladderService.GetLadderForLeague(league);
            return CompressionHelper.Compress(ladder);
        }

        public async Task JoinParty(string partyName, string spectatorCode, string playerObj)
        {
            // if spectatorCode is empty, fetch it
            if(String.IsNullOrEmpty(spectatorCode))
            {
                spectatorCode = SpectatorHelper.ToSpectatorCode(partyName, _key);
            }
            // if partyname is empty, fetch it
            else if (String.IsNullOrEmpty(partyName)) {
                partyName = SpectatorHelper.ToPartyName(spectatorCode, _key);
            }

            var player = CompressionHelper.Decompress<PlayerModel>(playerObj);

            // set initial id of player
            player.ConnectionID = Context.ConnectionId;

            //update ConnectionId:Partyname index
            await AddToIndex(partyName);

            // look for party
            var party = await _cache.GetAsync<PartyModel>($"party:{partyName}");
            if (party == null)
            {
                if (player.IsSpectator)
                {
                    await Clients.Caller.SendAsync("GroupNotFoundOrEmpty");
                }
                else
                {
                    // set player to leader, since its a new party
                    player.IsLeader = true;

        
                    party = new PartyModel() { Name = partyName, Players = new List<PlayerModel> { player }, SpectatorCode = spectatorCode };
                    await _cache.SetAsync<PartyModel>($"party:{partyName}", party);

                    // dont expose name to clients
                    party.Name = "";
                    await Clients.Caller.SendAsync("EnteredParty", CompressionHelper.Compress(party), CompressionHelper.Compress(player));
                }
            }
            else
            {
                if (!party.Players.Any())
                {
                    await Clients.Caller.SendAsync("GroupNotFoundOrEmpty");
                }
                else
                {
                    var oldPlayer = party.Players.FirstOrDefault(x => (x.Character != null && player.Character != null && x.Character.Name == player.Character.Name) || x.ConnectionID == player.ConnectionID);

                    // if the party were joining doesnt have a leader, make the player leader
                    if (!party.Players.Any(x => x.IsLeader))
                    {
                        player.IsLeader = true;
                    }

                    if (oldPlayer == null)
                    {
                        party.Players.Insert(0, player);
                    }
                    else
                    {
                        var index = party.Players.IndexOf(oldPlayer);
                        party.Players[index] = player;
                    }

                    await _cache.SetAsync<PartyModel>($"party:{partyName}", party);

                    // dont expose name to clients
                    party.Name = "";
                    await Clients.Caller.SendAsync("EnteredParty", CompressionHelper.Compress(party), CompressionHelper.Compress(player));
                }
            }

            await Groups.AddToGroupAsync(Context.ConnectionId, partyName);
            await Clients.OthersInGroup(partyName).SendAsync("PlayerJoined", CompressionHelper.Compress(player));

            if (!player.IsSpectator)
            {
                await Clients.Group(partyName).SendAsync("PlayerUpdated", CompressionHelper.Compress(player));
            }
        }

        public async Task LeaveParty(string partyName, string spectatorCode, string playerObj)
        {
            var player = CompressionHelper.Decompress<PlayerModel>(playerObj);

            // if spectatorCode is empty, fetch it
            if (String.IsNullOrEmpty(spectatorCode))
            {
                spectatorCode = SpectatorHelper.ToSpectatorCode(partyName, _key);
            }
            // if partyname is empty, fetch it
            else if (String.IsNullOrEmpty(partyName))
            {
                partyName = SpectatorHelper.ToPartyName(spectatorCode, _key);
            }

            var party = await _cache.GetAsync<PartyModel>($"party:{partyName}");
            if (party != null)
            {
                var foundPlayer = party.Players.FirstOrDefault(x => x.ConnectionID == player.ConnectionID);
                party.Players.Remove(foundPlayer);

                if (player.IsLeader && party.Players.Any(x => !x.IsSpectator)) // if there is any player left in party, assign leader to first one
                {
                    party.Players[0].IsLeader = true;
                    await Clients.Group(partyName).SendAsync("LeaderChanged", CompressionHelper.Compress(new { oldLeader = player, newLeader = party.Players[0] }));
                }

                var success = RemoveFromIndex();

                if (party.Players.Count != 0)
                {
                    await _cache.SetAsync<PartyModel>($"party:{partyName}", party);
                }
                else
                {
                    await _cache.RemoveAsync($"party:{partyName}");
                }
            }

            await Groups.RemoveFromGroupAsync(player.ConnectionID, partyName);
            await Clients.Group(partyName).SendAsync("PlayerLeft", CompressionHelper.Compress(player));
        }

        public async Task AssignLeader(string partyName, string playerToAssign)
        {
            var party = await _cache.GetAsync<PartyModel>($"party:{partyName}");
            var playerObjToAssign = party.Players.FirstOrDefault(x => x.Character.Name == playerToAssign);
            var currentLeader = party.Players.FirstOrDefault(x => x.IsLeader);

            if (playerObjToAssign != null && !playerObjToAssign.IsSpectator && currentLeader != null)
            {
                if (currentLeader != null)
                {
                    currentLeader.IsLeader = false;
                    var indexOfPlayer = party.Players.IndexOf(party.Players.FirstOrDefault(x => x.ConnectionID == currentLeader.ConnectionID));
                    party.Players[indexOfPlayer] = currentLeader;
                }

                playerObjToAssign.IsLeader = true;
                var indexOfPlayerToAssign = party.Players.IndexOf(party.Players.FirstOrDefault(x => x.ConnectionID == playerObjToAssign.ConnectionID));
                party.Players[indexOfPlayerToAssign] = playerObjToAssign;

                await _cache.SetAsync<PartyModel>($"party:{partyName}", party);
                await Clients.Group(partyName).SendAsync("LeaderChanged", CompressionHelper.Compress(new { oldLeader = currentLeader, newLeader = playerObjToAssign }));
            }
        }

        public async Task KickFromParty(string partyName, string playerToKick)
        {
            var party = await _cache.GetAsync<PartyModel>($"party:{partyName}");
            var playerObjToKick = party.Players.FirstOrDefault(x => x.Character.Name == playerToKick);
            var compressedPlayerToKick = CompressionHelper.Compress(playerObjToKick);

            await LeaveParty(partyName, null, compressedPlayerToKick);
            await Clients.Client(playerObjToKick.ConnectionID).SendAsync("KickedFromParty");
        }

        public async Task UpdatePlayer(string partyName, string playerObj)
        {
            var player = CompressionHelper.Decompress<PlayerModel>(playerObj);
            var party = await _cache.GetAsync<PartyModel>($"party:{partyName}");

            if (party != null)
            {
                var index = party.Players.IndexOf(party.Players.FirstOrDefault(x => x.ConnectionID == player.ConnectionID));
                if (index != -1)
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
                        await LeaveParty(partyName, "", CompressionHelper.Compress(foundPlayer));
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