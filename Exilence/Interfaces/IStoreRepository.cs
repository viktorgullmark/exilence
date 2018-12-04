using Exilence.Models;
using Exilence.Models.Connection;
using Exilence.Models.Ladder;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Exilence.Interfaces
{
    public interface IStoreRepository
    {
        Task<List<LadderStoreModel>> GetAllLeagues();
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
    }
}
