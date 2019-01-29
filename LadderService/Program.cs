using PathOfSupporting.Api.Ladder;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Threading.Tasks;

using CHelpers;

namespace LadderService
{
    class Program
    {
        public static async Task Main(string[] args)
        {
            ParseLadder();
            Console.ReadKey();
        }

        public static async Task ParseLadder()
        {
            var ladder = new List<LadderEntry>();
            var list = Enumerable.Range(0, 10).ToList();
            var task = list.RateLimitedForEachAsync(500, async r =>
            {
                var offset = r * 200;
                var result = await Fetch.fetchLadder(LadderArguments.NewWithDetails(new FetchDetails("Standard", 200, offset, null, null, null, null))).ToTask();
                Console.WriteLine($"{DateTime.Now} Requsting");
                ladder.AddRange(result.Value.Entries);

            });
            await task;

        }
    }

    public static class Helpers
    {
        public static async Task RateLimitedForEachAsync<T>(this List<T> list, double minumumDelay, Func<T, Task> async_task_func)
        {
            foreach (var item in list)
            {
                Stopwatch sw = Stopwatch.StartNew();
                await async_task_func(item);
                double left = minumumDelay - sw.Elapsed.TotalMilliseconds;
                if (left > 0)
                {
                    await Task.Delay(TimeSpan.FromSeconds(left));
                }
            }
        }
    }
}
