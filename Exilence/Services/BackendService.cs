using Exilence.Interfaces;
using Microsoft.Extensions.Configuration;
using Shared.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Exilence.Services
{
    public class BackendService : IBackendService
    {
        private IConfiguration _configuration;
        private IMongoRepository _mongoRepository;

        public BackendService(IConfiguration configuration, IMongoRepository mongoRepository)
        {
            _configuration = configuration;
            _mongoRepository = mongoRepository;
        }

        public async Task clearDisconnectedPlayers()
        {
            var backendName = _configuration["Backend:Name"];
            var backendConnections = await _mongoRepository.GetAllConnectionForBackend(backendName);

            foreach (var connection in backendConnections)
            {
                await _mongoRepository.RemoveConnectionFromIndex(connection.ConnectionId);
                var storageParty = await _mongoRepository.GetParty(connection.PartyName);
                if (storageParty != null)
                {
                    await _mongoRepository.RemovePlayerFromParty(connection.PartyName, connection.ConnectionId);
                    storageParty = await _mongoRepository.GetParty(connection.PartyName);
                    if (!storageParty.Players.Any(x => !x.IsSpectator))
                    {
                        await _mongoRepository.RemoveParty(connection.PartyName);
                    }
                    else if (!storageParty.Players.Any(x => x.IsLeader))
                    {
                        var leader = storageParty.Players.FirstOrDefault(x => !x.IsSpectator && x.ConnectionID != connection.ConnectionId);
                        if (leader != null)
                        {
                            await _mongoRepository.SetSpecificPlayerAsLeader(connection.PartyName, leader.Character.Name);
                        }
                    }
                }
            }

        }
    }
}
