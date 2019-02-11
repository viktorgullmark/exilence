using Shared.Models;
using System.Threading.Tasks;

namespace Shared.Interfaces
{
    public interface IMongoRepository
    {
        Task CreateParty(PartyModel party);
        Task RemoveParty(string partyName);
        Task<PartyModel> GetParty(string partyName);
        Task AddPlayerToParty(string partyName, PlayerModel player);
        Task RemovePlayerFromParty(string partyName, string connectionId);
        Task UpdatePlayerInParty(string partyName, PlayerModel player);
        Task SetFirstPlayerAsLeader(string partyName);
        Task SetSpecificPlayerAsLeader(string partyName, string characterName);
        Task RemoveSpecificPlayerAsLeader(string partyName, string characterName);
        Task<PlayerModel> GetPlayerByCharacterName(string partyName, string characterName);
    }
}
