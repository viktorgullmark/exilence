using Exilence.Contexts;
using Exilence.Interfaces;
using Exilence.Models;
using Exilence.Models.Connection;
using Exilence.Models.Ladder;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Distributed;
using Exilence.Helper;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Exilence.Repositories
{
    public class RedisRepository : IRedisRepository
    {
        private readonly IDistributedCache _cache;

        public RedisRepository(IDistributedCache context)
        {
            _cache = context;
        }

        public async Task<List<LadderStoreModel>> GetAllLeaguesLadders()
        {
            var leagues = new List<LadderStoreModel>();
            var ladders = await _cache.GetAsync<List<string>>($"ladder:index");
            if (ladders != null)
            {
                foreach (var ladder in ladders)
                {
                    var compressedLeague = await _cache.GetAsync<string>($"ladder:{ladder}");
                    var league = CompressionHelper.Decompress<LadderStoreModel>(compressedLeague);
                    leagues.Add(league);
                }
            }

            return leagues;
        }

        public async Task<LadderStoreModel> GetLeagueLadder(string leagueName)
        {
            var compressedLeague = await _cache.GetAsync<string>($"ladder:{leagueName}");
            if (compressedLeague != null)
            {
                var league = CompressionHelper.Decompress<LadderStoreModel>(compressedLeague);
                return league;
            }
            return null;
        }

        public async Task UpdateLeagueLadder(string league, List<LadderPlayerModel> ladder)
        {
            try
            {
                var oldCompressedLeague = await _cache.GetAsync<string>($"ladder:{league}");
                var leagueLadder = CompressionHelper.Decompress<LadderStoreModel>(oldCompressedLeague);
                leagueLadder.Finished = DateTime.Now;
                leagueLadder.Running = false;
                leagueLadder.Ladder = ladder;
                var newCompressedLeague = CompressionHelper.Compress<LadderStoreModel>(leagueLadder);
                await _cache.SetAsync<string>($"ladder:{league}", newCompressedLeague);
            }
            catch (Exception e)
            {
                throw e;
            }
        }

        public async Task RemoveLeagueLadder(string league)
        {
            var ladders = await _cache.GetAsync<List<string>>($"ladder:index");
            ladders.Remove(league);
            await _cache.SetAsync<List<string>>($"ladder:index", ladders);
            await _cache.RemoveAsync($"ladder:{league}");
            
        }

        public async Task SetLeagueLadderRunning(string leagueName)
        {
            var compressedLeague = await _cache.GetAsync<string>($"ladder:{leagueName}");
            var league = CompressionHelper.Decompress<LadderStoreModel>(compressedLeague);
            if (league != null)
            {
                league.Running = true;
                league.Started = DateTime.Now;
                var newCompressedLeague = CompressionHelper.Compress<LadderStoreModel>(league);
                await _cache.SetAsync<string>($"ladder:{leagueName}", newCompressedLeague);
            }
        }

        public async Task SetLeagueLadderPending(string leagueName)
        {
            var exists = await LeagueLadderExists(leagueName);
            if (!exists)
            {
                var league = new LadderStoreModel()
                {
                    Name = leagueName,
                    Started = DateTime.MinValue,
                    Finished = DateTime.MinValue,
                    Ladder = new List<LadderPlayerModel>(),
                    Running = false
                };

                var compressedLeague = CompressionHelper.Compress<LadderStoreModel>(league);
                await _cache.SetAsync<string>($"ladder:{leagueName}", compressedLeague);

                //Add to index
                var ladders = await _cache.GetAsync<List<string>>($"ladder:index");
                ladders = ladders ?? new List<string>();
                ladders.Add(leagueName);
                await _cache.SetAsync<List<string>>($"ladder:index", ladders);
            }
        }

        public async Task<string> GetLadderPendingUpdate()
        {
            var ladders = await GetAllLeaguesLadders();
            var ladder = ladders.OrderByDescending(t => t.Finished).LastOrDefault();
            if (ladder != null)
            {
                return ladder.Name;
            }
            return null;
        }

        public async Task<bool> AnyLeageLadderRunning()
        {
            var ladders = await GetAllLeaguesLadders();
            var anyRunning = ladders.Any(t => t.Running);
            return anyRunning;
        }

        public async Task<bool> LeagueLadderExists(string league)
        {
            var exists = await _cache.GetAsync<string>($"ladder:{league}");
            return exists != null;
        }

        public async Task<List<ConnectionModel>> GetAllConnections()
        {
            var connections = await _cache.GetAsync<List<ConnectionModel>>($"connections");
            return connections;
        }

        public async Task<string> GetPartyNameFromConnection(string connectionId)
        {
            var connections = await GetAllConnections();
            var connection = connections.FirstOrDefault(t => t.ConnectionId == connectionId);
            return connection.PartyName;
        }

        public async Task<bool> RemoveConnection(string connectionId)
        {
            var connections = await GetAllConnections();
            var connection = connections.FirstOrDefault(t => t.ConnectionId == connectionId);
            if (connection != null)
            {
                connections.Remove(connection);
                await _cache.SetAsync<List<ConnectionModel>>($"connections", connections);
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
            var connections = await GetAllConnections();
            connections.Add(connectionModel);
            await _cache.SetAsync<List<ConnectionModel>>($"connections", connections);
        }
    }
}
