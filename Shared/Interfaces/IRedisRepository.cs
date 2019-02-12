using Shared.Models;
using Shared.Models.SignalR;
using Shared.Models.Ladder;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Shared.Interfaces
{
    public interface IRedisRepository
    {
        Task<List<ConnectionModel>> GetAllConnections();
        Task<string> GetPartyNameFromConnection(string connectionId);
        Task AddConnection(string connectionId, string partyName);
        Task<bool> RemoveConnection(string connectionId);
    }
}
