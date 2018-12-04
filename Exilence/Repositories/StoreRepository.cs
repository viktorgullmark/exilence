using Exilence.Contexts;
using Exilence.Interfaces;
using Exilence.Models;
using Exilence.Models.Connection;
using Exilence.Models.Ladder;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Exilence.Repositories
{
    public class StoreRepository : IStoreRepository
    {
        private StoreContext _store;

        public StoreRepository(StoreContext context)
        {
            _store = context;
        }

        public async Task<List<LadderStoreModel>> GetAllLeagues()
        {
            var leagues = await _store.Ladders.ToListAsync();
            return leagues;
        }

        public async Task<LadderStoreModel> GetLeagueLadder(string League)
        {
            var storeModel = await _store.Ladders.FirstOrDefaultAsync(t => t.Name == League);
            return storeModel;
        }

        public async Task UpdateLeagueLadder(string league, List<LadderPlayerModel> ladder)
        {
            try
            {
                var leagueLadder = await _store.Ladders.FirstOrDefaultAsync(t => t.Name == league);
                leagueLadder.Finished = DateTime.Now;
                leagueLadder.Running = false;
                leagueLadder.Ladder = ladder;
                await _store.SaveChangesAsync();
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        public async Task RemoveLeagueLadder(string league)
        {
            var leagueLadder = await _store.Ladders.FirstOrDefaultAsync(t => t.Name == league);
            _store.Ladders.Remove(leagueLadder);
            await _store.SaveChangesAsync();
        }

        public async Task SetLeagueLadderRunning(string league)
        {
            var ladder = await _store.Ladders.FirstOrDefaultAsync(t => t.Name == league);
            if (ladder != null)
            {
                ladder.Running = true;
                ladder.Started = DateTime.Now;
                await _store.SaveChangesAsync();
            }
        }

        public async Task SetLeagueLadderPending(string league)
        {
            var exists = await LeagueLadderExists(league);
            if (!exists)
            {
                var storeModel = new LadderStoreModel()
                {
                    Name = league,
                    Started = DateTime.MinValue,
                    Finished = DateTime.MinValue,
                    Ladder = new List<LadderPlayerModel>(),
                    Running = false
                };

                await _store.AddAsync(storeModel);
                await _store.SaveChangesAsync();
            }
        }

        public async Task<string> GetLadderPendingUpdate()
        {
            var ladder = await _store.Ladders.OrderByDescending(t => t.Finished).LastOrDefaultAsync();
            if (ladder != null)
            {
                return ladder.Name;
            }
            return null;
        }

        public async Task<bool> AnyLeageLadderRunning()
        {
            var anyRunning = await _store.Ladders.AnyAsync(t => t.Running);
            return anyRunning;
        }

        public async Task<bool> LeagueLadderExists(string league)
        {
            var exists = await _store.Ladders.AnyAsync(t => t.Name == league);
            return exists;
        }

        public async Task<List<ConnectionModel>> GetAllConnections()
        {
            var connections = await _store.Connections.ToListAsync();
            return connections;
        }

        public async Task<string> GetPartyNameFromConnection(string connectionId)
        {
            var connection = await _store.Connections.FirstOrDefaultAsync(t => t.ConnectionId == connectionId);
            return connection.PartyName;
        }

        public async Task<bool> RemoveConnection(string connectionId)
        {
            var connection = await _store.Connections.FirstOrDefaultAsync(t => t.ConnectionId == connectionId);
            if (connection != null)
            {
                _store.Connections.Remove(connection);
                await _store.SaveChangesAsync();
                return true;
            }
            return false;
        }

        public async Task AddConnection(string connectionId, string partyName)
        {
            var connectionModel = new ConnectionModel()
            {
                PartyName = partyName,
                ConnectionId = connectionId,
                ConnectedDate = DateTime.Now
            };
            await _store.Connections.AddAsync(connectionModel);
            await _store.SaveChangesAsync();
        }
    }
}
