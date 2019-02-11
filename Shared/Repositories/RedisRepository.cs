using Microsoft.Extensions.Caching.Distributed;
using Shared.Helper;
using Shared.Interfaces;
using Shared.Models;
using Shared.Models.SignalR;
using Shared.Models.Ladder;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Shared.Repositories
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
                leagueLadder.Finished = DateTime.UtcNow;
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
            //var ladders = await _cache.GetAsync<List<string>>($"ladder:index");
            //ladders.Remove(league);
            //await _cache.SetAsync<List<string>>($"ladder:index", ladders);
            await _cache.RemoveAsync($"ladder:{league}");
        }

        public async Task SetLeagueLadderRunning(string leagueName)
        {
            var compressedLeague = await _cache.GetAsync<string>($"ladder:{leagueName}");
            var league = CompressionHelper.Decompress<LadderStoreModel>(compressedLeague);
            if (league != null)
            {
                league.Running = true;
                league.Started = DateTime.UtcNow;
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

        #region Connections

        public async Task<string> GetPartyNameFromConnection(string connectionId)
        {
            var connectionModel = await _cache.GetAsync<ConnectionModel>($"connections:{connectionId}");
            if (connectionModel != null)
            {
                return connectionModel.PartyName;
            }
            return null;
        }

        public async Task<bool> RemoveConnection(string connectionId)
        {
            await _cache.RemoveAsync($"connections:{connectionId}");
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
            await _cache.SetAsync<ConnectionModel>($"connections:{connectionId}", connectionModel, new DistributedCacheEntryOptions());
        }

        #endregion

        #region Parties 
        public async Task<PartyModel> GetParty(string partyName)
        {
            var party = await _cache.GetAsync<PartyModel>($"party:{partyName}");
            return party;
        }
        #endregion


    }
}
