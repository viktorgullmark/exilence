using Microsoft.Extensions.Caching.Distributed;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Runtime.Serialization.Formatters.Binary;
using System.Threading.Tasks;

namespace ExileParty.Helper
{
    public static class DistributedCacheExtensions
    {
        public static bool IsSerializable(this object obj)
        {
            if (obj == null)
                return false;

            Type t = obj.GetType();
            return t.IsSerializable;
        }

        public static Task SetAsync<T>(this IDistributedCache cache, string key, T value)
        {
            return SetAsync(cache, key, value, new DistributedCacheEntryOptions() { SlidingExpiration = TimeSpan.FromMinutes(15) });
        }

        public static Task SetAsync<T>(this IDistributedCache cache, string key, T value, DistributedCacheEntryOptions options)
        {
            byte[] bytes;
            using (var memoryStream = new MemoryStream())
            {
                var binaryFormatter = new BinaryFormatter();
                binaryFormatter.Serialize(memoryStream, value);
                bytes = memoryStream.ToArray();
            }

            return cache.SetAsync(key, bytes, options);
        }

        public static void Set<T>(this IDistributedCache cache, string key, T value, DistributedCacheEntryOptions options)
        {
            byte[] bytes;
            using (var memoryStream = new MemoryStream())
            {
                var binaryFormatter = new BinaryFormatter();
                binaryFormatter.Serialize(memoryStream, value);
                bytes = memoryStream.ToArray();
            }

            cache.Set(key, bytes, options);
        }

        public static void Set<T>(this IDistributedCache cache, string key, T value)
        {
            Set(cache, key, value, new DistributedCacheEntryOptions() { SlidingExpiration = TimeSpan.FromMinutes(15) });
        }


        public static async Task<T> GetAsync<T>(this IDistributedCache cache, string key)
        {
            var val = await cache.GetAsync(key);
            var result = default(T);

            if (val == null) return result;

            using (var memoryStream = new MemoryStream(val))
            {
                var binaryFormatter = new BinaryFormatter();
                result = (T)binaryFormatter.Deserialize(memoryStream);
            }

            return result;
        }


        public static T Get<T>(this IDistributedCache cache, string key)
        {
            var val = cache.Get(key);
            var result = default(T);

            if (val == null) return result;

            using (var memoryStream = new MemoryStream(val))
            {
                var binaryFormatter = new BinaryFormatter();
                result = (T)binaryFormatter.Deserialize(memoryStream);
            }

            return result;
        }

        public static bool TryGet<T>(this IDistributedCache cache, string key, out T value)
        {
            var val = cache.Get(key);
            value = default(T);

            if (val == null) return false;

            using (var memoryStream = new MemoryStream(val))
            {
                var binaryFormatter = new BinaryFormatter();
                value = (T)binaryFormatter.Deserialize(memoryStream);
            }

            return true;
        }
    }
}
