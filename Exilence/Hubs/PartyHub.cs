using Exilence.Helper;
using Exilence.Interfaces;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Configuration;
using Shared.Helper;
using Shared.Interfaces;
using Shared.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Exilence.Hubs
{
    [EnableCors("AllowAll")]
    public class PartyHub : Hub
    {
        private ILadderService _ladderService;
        private IConfiguration _configuration;
        private IMongoRepository _mongoRepository;

        private string _key;

        private string ConnectionId => Context.ConnectionId;

        public PartyHub(
            ILadderService ladderService,
            IConfiguration configuration,
            IMongoRepository mongoRepository
            )
        {
            _ladderService = ladderService;
            _configuration = configuration;
            _mongoRepository = mongoRepository;

            _key = _configuration.GetValue<string>("Spectator:Key");
        }

        public async Task<bool> PartyExists(string spectatorCode)
        {
            var partyName = SpectatorHelper.ToPartyName(spectatorCode, _key);
            var party = await _mongoRepository.GetParty(partyName);

            return party != null;
        }

        public async Task<string> GetLadderForLeague(string league)
        {
            var ladder = await _ladderService.GetLadderForLeague(league);
            return CompressionHelper.Compress(ladder);
        }

        public async Task JoinParty(string partyName, string spectatorCode, string playerObj)
        {
            // if spectatorCode is empty, fetch it
            if (string.IsNullOrEmpty(spectatorCode))
            {
                spectatorCode = SpectatorHelper.ToSpectatorCode(partyName, _key);
            }
            // if partyname is empty, fetch it
            else if (string.IsNullOrEmpty(partyName))
            {
                partyName = SpectatorHelper.ToPartyName(spectatorCode, _key);
            }

            var player = CompressionHelper.Decompress<PlayerModel>(playerObj);

            player.ConnectionID = Context.ConnectionId;

            var update = await _mongoRepository.UpdatePartyNameInConnectionIndex(ConnectionId, partyName);
            if (update == null)
            {
                await AddToIndex(partyName);
            }

            var party = await _mongoRepository.GetParty(partyName);
            if (party == null)
            {
                if (player.IsSpectator)
                {
                    await Clients.Caller.SendAsync("GroupNotFoundOrEmpty");
                }
                else
                {
                    player.IsLeader = true;
                    party = new PartyModel() { Name = partyName, Players = new List<PlayerModel> { player }, SpectatorCode = spectatorCode };
                    await _mongoRepository.CreateParty(party);

                    party.Name = "";
                    await Clients.Caller.SendAsync("EnteredParty", CompressionHelper.Compress(party), CompressionHelper.Compress(player));
                }
            }
            else
            {
                if (player.IsSpectator && !party.Players.Any(x => !x.IsSpectator))
                {
                    await Clients.Caller.SendAsync("GroupNotFoundOrEmpty");
                }
                else
                {
                    var oldPlayer = party.Players.FirstOrDefault(x =>
                        (x.Character != null && player.Character != null && x.Character.Name == player.Character.Name) ||
                        x.ConnectionID == player.ConnectionID);

                    // if the party were joining doesnt have a leader, make the player leader
                    if (!party.Players.Any(x => x.IsLeader))
                    {
                        player.IsLeader = true;
                    }

                    if (oldPlayer == null)
                    {
                        await _mongoRepository.AddPlayerToParty(partyName, player);
                    }
                    else
                    {
                        await _mongoRepository.UpdatePlayerInParty(partyName, player);
                    }

                    party = await _mongoRepository.GetParty(partyName);
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

            if (string.IsNullOrEmpty(spectatorCode))
            {
                spectatorCode = SpectatorHelper.ToSpectatorCode(partyName, _key);
            }
            else if (string.IsNullOrEmpty(partyName))
            {
                partyName = SpectatorHelper.ToPartyName(spectatorCode, _key);
            }

            var party = await _mongoRepository.GetParty(partyName);
            if (party != null)
            {
                await _mongoRepository.RemovePlayerFromParty(partyName, ConnectionId);
                party = await _mongoRepository.GetParty(partyName);
                if (!party.Players.Any(x => !x.IsSpectator))
                {
                    await _mongoRepository.RemoveParty(partyName);
                }
                else if (!party.Players.Any(x => x.IsLeader))
                {
                    var leader = party.Players.FirstOrDefault(x => !x.IsSpectator && x.ConnectionID != player.ConnectionID);
                    if (leader != null)
                    {
                        await _mongoRepository.SetSpecificPlayerAsLeader(partyName, leader.Character.Name);
                        await Clients.Group(partyName).SendAsync("LeaderChanged", CompressionHelper.Compress(new { oldLeader = player, newLeader = leader }));
                    }
                }
            }
            await Groups.RemoveFromGroupAsync(player.ConnectionID, partyName);
            await Clients.Group(partyName).SendAsync("PlayerLeft", CompressionHelper.Compress(player));
        }

        public async Task AssignLeader(string partyName, string characterName)
        {
            var party = await _mongoRepository.GetParty(partyName);
            var currentLeader = party.Players.FirstOrDefault(x => x.IsLeader);

            await _mongoRepository.RemoveSpecificPlayerAsLeader(partyName, currentLeader.Character.Name);
            await _mongoRepository.SetSpecificPlayerAsLeader(partyName, characterName);

            var newLeader = await _mongoRepository.GetPlayerByCharacterName(partyName, characterName);

            await Clients.Group(partyName).SendAsync("LeaderChanged", CompressionHelper.Compress(new { oldLeader = currentLeader, newLeader }));
        }

        public async Task KickFromParty(string partyName, string characterName)
        {
            var playerToKick = await _mongoRepository.GetPlayerByCharacterName(partyName, characterName);
            await _mongoRepository.RemovePlayerFromParty(partyName, playerToKick.ConnectionID);
            await Groups.RemoveFromGroupAsync(playerToKick.ConnectionID, partyName);
            await Clients.Client(playerToKick.ConnectionID).SendAsync("KickedFromParty");
            await Clients.Group(partyName).SendAsync("PlayerLeft", CompressionHelper.Compress(playerToKick));
        }

        public async Task UpdatePlayer(string partyName, string playerObj)
        {
            var player = CompressionHelper.Decompress<PlayerModel>(playerObj);

            var party = await _mongoRepository.GetParty(partyName);
            if (party != null)
            {
                await _mongoRepository.UpdatePlayerInParty(partyName, player);
                await Clients.Group(partyName).SendAsync("PlayerUpdated", CompressionHelper.Compress(player));
            }
            else
            {
                await Clients.Group(partyName).SendAsync("ForceDisconnect");
            }
        }

        public override async Task OnConnectedAsync()
        {
            await base.OnConnectedAsync();
        }

        public override async Task OnDisconnectedAsync(Exception exception)
        {
            var partyName = await GetPartynameFromIndex();
            if (partyName != null)
            {
                var party = await _mongoRepository.GetParty(partyName);
                if (party != null)
                {
                    var player = party.Players.FirstOrDefault(t => t.ConnectionID == ConnectionId);
                    if (player != null)
                    {
                        await LeaveParty(partyName, null, CompressionHelper.Compress(player));
                    }
                }
            }

            await RemoveFromIndex();
            await base.OnDisconnectedAsync(exception);
        }

        private async Task<string> GetPartynameFromIndex()
        {
            var connectionModel = await _mongoRepository.GetPartyNameFromConnectionIndex(ConnectionId);
            return connectionModel?.PartyName;
        }

        private async Task RemoveFromIndex()
        {
            await _mongoRepository.RemoveConnectionFromIndex(ConnectionId);
        }

        private async Task AddToIndex(string partyName)
        {
            if (!string.IsNullOrEmpty(partyName))
            {
                await _mongoRepository.AddToConnectionIndex(ConnectionId, partyName);
            }
        }
    }
}