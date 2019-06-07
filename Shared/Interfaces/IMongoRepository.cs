using Shared.Models;
using Shared.Models.Ladder;
using Shared.Models.Log;
using Shared.Models.SignalR;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Shared.Interfaces
{
    public interface IMongoRepository
    {
        #region Parties
        Task CreateParty(PartyStorageModel party);
        Task RemoveParty(string partyName);
        Task<PartyStorageModel> GetParty(string partyName);
        Task AddPlayerToParty(string partyName, PlayerStorageModel player);
        Task RemovePlayerFromParty(string partyName, string connectionId);
        Task UpdatePlayerInParty(string partyName, PlayerStorageModel player);
        Task SetSpecificPlayerAsLeader(string partyName, string characterName);
        Task RemoveSpecificPlayerAsLeader(string partyName, string characterName);
        Task<PlayerStorageModel> GetPlayerByCharacterName(string partyName, string characterName);
        Task<PartyStorageModel> GetPartyByCharacterName(string characterName);
        Task<List<PartyStorageModel>> GetCharactersByLeague(string league);
        #endregion

        #region Ladders
        Task RemoveLadder(string leagueName);
        Task<LadderModel> GetLadder(string leagueName);
        Task<List<LadderModel>> GetAllLadders();
        Task<LadderModel> GetPendingLadder();
        Task<bool> AnyLadderRunning();
        Task<bool> LadderExists(string leagueName);
        Task SetLadderRunning(string leagueName);
        Task SetLadderPending(string leagueName);
        Task UpdateLadder(string leagueName, List<LadderPlayerModel> players);
        #endregion

        #region Connections
        Task AddToConnectionIndex(string connectionId, string partyName, string backend);
        Task RemoveConnectionFromIndex(string connectionId);
        Task<ConnectionModel> GetPartyNameFromConnectionIndex(string connectionId);
        Task<ConnectionModel> UpdatePartyNameInConnectionIndex(string connectionId, string partyName);
        Task<List<ConnectionModel>> GetAllConnectionForBackend(string backend);
        #endregion

        #region Other
        Task LogPriceFluctuations(List<PriceFluctuationModel> fluctuations);
        #endregion
    }
}
