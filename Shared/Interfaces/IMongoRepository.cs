using Shared.Models;
using Shared.Models.Ladder;
using Shared.Models.SignalR;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Shared.Interfaces
{
    public interface IMongoRepository
    {
        #region Parties
        Task CreateParty(PartyModel party);
        Task RemoveParty(string partyName);
        Task<PartyModel> GetParty(string partyName);
        Task AddPlayerToParty(string partyName, PlayerModel player);
        Task RemovePlayerFromParty(string partyName, string connectionId);
        Task UpdatePlayerInParty(string partyName, PlayerModel player);
        Task SetSpecificPlayerAsLeader(string partyName, string characterName);
        Task RemoveSpecificPlayerAsLeader(string partyName, string characterName);
        Task<PlayerModel> GetPlayerByCharacterName(string partyName, string characterName);
        Task<PartyModel> FindPlayerParty(string characterName);
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
        Task AddToConnectionIndex(string connectionId, string partyName);
        Task RemoveConnectionFromIndex(string connectionId);
        Task<ConnectionModel> GetPartyNameFromConnectionIndex(string connectionId);
        Task<ConnectionModel> UpdatePartyNameInConnectionIndex(string connectionId, string partyName);
        #endregion
    }
}
