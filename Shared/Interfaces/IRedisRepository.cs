using Shared.Models;
using Shared.Models.SignalR;
using Shared.Models.Ladder;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Shared.Interfaces
{
    public interface IRedisRepository
    {
        Task<List<LadderStoreModel>> GetAllLeaguesLadders();
        Task<LadderStoreModel> GetLeagueLadder(string leagueName);
        Task UpdateLeagueLadder(string leagueName, List<LadderPlayerModel> ladder);
        Task RemoveLeagueLadder(string league);
        Task SetLeagueLadderRunning(string leagueName);
        Task SetLeagueLadderPending(string leagueName);
        Task<string> GetLadderPendingUpdate();
        Task<bool> AnyLeageLadderRunning();
        Task<bool> LeagueLadderExists(string leagueName);

        Task<List<ConnectionModel>> GetAllConnections();
        Task<string> GetPartyNameFromConnection(string connectionId);
        Task AddConnection(string connectionId, string partyName);
        Task<bool> RemoveConnection(string connectionId);

        Task<PartyModel> GetParty(string partyName);
    }
}
