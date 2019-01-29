using Exilence.Interfaces;
using Shared.Interfaces;
using System.Threading.Tasks;

namespace Shared.Services
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
