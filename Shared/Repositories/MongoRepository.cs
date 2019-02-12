using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using MongoDB.Driver;
using Shared.Interfaces;
using Shared.Models;

namespace Shared.Repositories
{
    public class MongoRepository: IMongoRepository
    {
        private MongoClient _client;
        private readonly IMongoDatabase _database;
        private readonly IMongoCollection<PartyModel> _parties;
        private readonly IMongoCollection<PlayerModel> _players;

        public MongoRepository(IConfiguration config)
        {
            _client = new MongoClient(config.GetConnectionString("Mongo"));
            _database = _client.GetDatabase("exilence");
            _parties = _database.GetCollection<PartyModel>("parties");
            _players = _database.GetCollection<PlayerModel>("players");
        }
        
        public async Task PartyExists(string partyName)
        {
            await _parties.FindAsync(p => p.Name == partyName);
        }

        public async Task<PartyModel> GetParty(string partyName)
        {
            var party = await _parties.FindAsync(p => p.Name == partyName);
            return await party.FirstOrDefaultAsync();
        }

        public async Task<PlayerModel> GetPlayerByCharacterName(string partyName, string characterName)
        {
            var result = await _parties.FindAsync(p => p.Name == partyName);
            var party = await result.FirstAsync();
            return party.Players.First(t => t.Character.Name == characterName);
        }

        public async Task RemoveParty(string partyName)
        {
            await _parties.DeleteOneAsync(p => p.Name == partyName);
        }

        public async Task CreateParty(PartyModel party)
        {
            await _parties.InsertOneAsync(party);
        }

        public async Task AddPlayerToParty(string partyName, PlayerModel player)
        {
            var update = Builders<PartyModel>.Update.AddToSet(p => p.Players, player);
            var result = await _parties.FindOneAndUpdateAsync(p => p.Name == partyName, update);
        }

        public async Task UpdatePlayerInParty(string partyName, PlayerModel player)
        {
            var update = Builders<PartyModel>.Update.Set(p => p.Players[-1], player);
            var result = await _parties.UpdateOneAsync(p => p.Name == partyName && p.Players.Any(c => c.Character.Name == player.Character.Name), update);
        }

        public async Task RemovePlayerFromParty(string partyName, string connectionId)
        {
            var update = Builders<PartyModel>.Update.PullFilter(p => p.Players, c => c.ConnectionID == connectionId);
            await _parties.FindOneAndUpdateAsync(p => p.Name == partyName, update);
        }

        public async Task SetFirstPlayerAsLeader(string partyName)
        {
            var update = Builders<PartyModel>.Update.Set(p => p.Players[-1].IsLeader, true);
            var result = await _parties.UpdateOneAsync(p => p.Name == partyName && p.Players.Any(c => !c.IsSpectator), update);
        }

        public async Task SetSpecificPlayerAsLeader(string partyName, string characterName)
        {
            var update = Builders<PartyModel>.Update.Set(p => p.Players.Find(c => c.Character.Name == characterName).IsLeader, true);
            var result = await _parties.FindOneAndUpdateAsync(p => p.Name == partyName, update);
        }

        public async Task RemoveSpecificPlayerAsLeader(string partyName, string characterName)
        {
            var update = Builders<PartyModel>.Update.Set(p => p.Players.Find(c => c.Character.Name == characterName).IsLeader, false);
            var result = await _parties.FindOneAndUpdateAsync(p => p.Name == partyName, update);
        }
    }
}
