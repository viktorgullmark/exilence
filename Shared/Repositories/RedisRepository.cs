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

        #region Connections
        public async Task<List<ConnectionModel>> GetAllConnections()
        {
            var connections = await _cache.GetAsync<List<ConnectionModel>>($"connections");
            return connections;
        }

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

    }
}
