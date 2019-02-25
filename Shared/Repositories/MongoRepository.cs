using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using MongoDB.Driver;
using Shared.Interfaces;
using Shared.Models;
using Shared.Models.Ladder;
using Shared.Models.SignalR;

namespace Shared.Repositories
{
    public class MongoRepository: IMongoRepository
    {
        private MongoClient _client;
        private readonly IMongoDatabase _database;
        private readonly IMongoCollection<PartyModel> _parties;
        private readonly IMongoCollection<PlayerModel> _players;
        private readonly IMongoCollection<LadderModel> _ladders;
        private readonly IMongoCollection<ConnectionModel> _connections;

        private IConfiguration _configuration;

        public MongoRepository(IConfiguration configuration)
        {
            _configuration = configuration;
            _client = new MongoClient(_configuration.GetConnectionString("Mongo"));
            _database = _client.GetDatabase("exilence");
            _parties = _database.GetCollection<PartyModel>("parties");
            _ladders = _database.GetCollection<LadderModel>("ladders");
            _connections = _database.GetCollection<ConnectionModel>("connections");
        }

        public async Task<PartyModel> GetPartyByCaracterName(string characterName)
        {
            var result = await _parties.FindAsync(p => p.Players.Any(c => c.Character.Name == characterName));
            return await result.FirstOrDefaultAsync();
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
            var result = await _parties.UpdateOneAsync(p => p.Name == partyName && p.Players.Any(c => c.ConnectionID == player.ConnectionID), update);
        }

        public async Task RemovePlayerFromParty(string partyName, string connectionId)
        {
            var update = Builders<PartyModel>.Update.PullFilter(p => p.Players, c => c.ConnectionID == connectionId);
            await _parties.FindOneAndUpdateAsync(p => p.Name == partyName, update);
        }

        public async Task SetSpecificPlayerAsLeader(string partyName, string characterName)
        {
            var update = Builders<PartyModel>.Update.Set(p => p.Players[-1].IsLeader, true);
            var result = await _parties.UpdateOneAsync(p => p.Name == partyName && p.Players.Any(c => c.Character.Name == characterName), update);
        }

        public async Task RemoveSpecificPlayerAsLeader(string partyName, string characterName)
        {
            var update = Builders<PartyModel>.Update.Set(p => p.Players[-1].IsLeader, false);
            var result = await _parties.UpdateOneAsync(p => p.Name == partyName && p.Players.Any(c => c.Character.Name == characterName), update);
        }

        #region Ladder

        public async Task RemoveLadder(string leagueName)
        {
            await _ladders.DeleteOneAsync(p => p.Name == leagueName);
        }

        public async Task<LadderModel> GetLadder(string leagueName)
        {
            var ladder = await _ladders.FindAsync(p => p.Name == leagueName);
            return await ladder.FirstOrDefaultAsync();
        }

        public async Task<List<LadderModel>> GetAllLadders()
        {
            return await _ladders.Find(l => true).ToListAsync();
        }

        public async Task<LadderModel> GetPendingLadder()
        {

            var filter = (Builders<LadderModel>.Filter.Eq(l => l.Running, false) 
                & Builders<LadderModel>.Filter.Lt(l => l.Finished, DateTime.UtcNow.AddMinutes(-1)));
            var fields = Builders<LadderModel>.Projection
                .Include(l => l.Finished)
                .Include(l => l.Running);
            var results = await _ladders.Find(filter).Project<LadderModel>(fields).ToListAsync();
            return results.OrderByDescending(l => l.Finished).LastOrDefault();
        }

        public async Task<bool> AnyLadderRunning()
        {
            var condition = Builders<LadderModel>.Filter.Eq(l => l.Running, true);
            var fields = Builders<LadderModel>.Projection
                .Include(l => l.Running);
            return await _ladders.Find(condition).Project<LadderModel>(fields).ToListAsync() != null; // todo: maybe have to check if list = empty
        }

        public async Task<bool> LadderExists(string leagueName)
        {
            var ladder = await _ladders.FindAsync(p => p.Name == leagueName);
            return ladder.Current != null;
        }

        public async Task SetLadderRunning(string leagueName)
        {
            var update = Builders<LadderModel>.Update
                .Set(l => l.Running, true)
                .Set(l => l.Started, DateTime.UtcNow);
            var result = await _ladders.UpdateOneAsync(p => p.Name == leagueName, update);
        }

        public async Task SetLadderPending(string leagueName)
        {
            var exists = await LadderExists(leagueName);

            if(!exists)
            {
                var ladder = new LadderModel()
                {
                    Name = leagueName,
                    Started = DateTime.MinValue,
                    Finished = DateTime.MinValue,
                    Ladder = new List<LadderPlayerModel>(),
                    Running = false
                };

                await _ladders.InsertOneAsync(ladder);
            }
        }

        public async Task UpdateLadder(string leagueName, List<LadderPlayerModel> players)
        {
            var update = Builders<LadderModel>.Update
                .Set(l => l.Running, false)
                .Set(l => l.Finished, DateTime.UtcNow)
                .Set(l => l.Ladder, players);
            var result = await _ladders.UpdateOneAsync(p => p.Name == leagueName, update);
        }

        #endregion

        #region Connections

        public async Task AddToConnectionIndex(string connectionId, string partyName)
        {
            var connectionModel = new ConnectionModel()
            {
                ConnectedDate = DateTime.UtcNow,
                ConnectionId = connectionId,
                PartyName = partyName
            };
            await _connections.InsertOneAsync(connectionModel);
        }


        public async Task<ConnectionModel> UpdatePartyNameInConnectionIndex(string connectionId, string partyName)
        {
            var update = Builders<ConnectionModel>.Update.Set(c => c.PartyName, partyName);
            var result = await _connections.FindOneAndUpdateAsync(c => c.ConnectionId == connectionId, update);
            return result;
        }


        public async Task RemoveConnectionFromIndex(string connectionId)
        {
            await _connections.DeleteOneAsync(c => c.ConnectionId == connectionId);
        }

        public async Task<ConnectionModel> GetPartyNameFromConnectionIndex(string connectionId)
        {
            var result = await _connections.FindAsync(c => c.ConnectionId == connectionId);
            return await result.FirstOrDefaultAsync();
        }
        #endregion
    }
}
