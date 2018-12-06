using Exilence.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Exilence.Services
{
    public class ConnectionService : IConnectionService
    {
        private IRedisRepository _redisRepository;
        
        public ConnectionService(IRedisRepository redisRepository)
        {
            _redisRepository = redisRepository;
        }

        public async Task CleanConnections()
        {
            var connections = await _redisRepository.GetAllConnections();
            if (connections != null)
            {
                foreach (var connection in connections)
                {
                    await _redisRepository.RemoveConnection(connection.ConnectionId);
                }
            }
        }
    }
}
