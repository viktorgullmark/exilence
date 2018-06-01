using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace ExileParty
{    public class Throttle
    {
        private readonly TimeSpan _maxPeriod;
        private readonly SemaphoreSlim _throttleActions;
        private readonly SemaphoreSlim _throttlePeriods;

        public Throttle(int maxActions, TimeSpan maxPeriod)
        {
            _throttleActions = new SemaphoreSlim(maxActions, maxActions);
            _throttlePeriods = new SemaphoreSlim(maxActions, maxActions);
            _maxPeriod = maxPeriod;
        }

        public Task<T> Enqueue<T>(Func<string, string, T> action, string arg1, string arg2)
        {
            return _throttleActions.WaitAsync().ContinueWith<T>(t =>
            {
                try
                {
                    _throttlePeriods.Wait();

                    // Release after period
                    // - Allow bursts up to maxActions requests at once
                    // - Do not allow more than maxActions requests per period
                    Task.Delay(_maxPeriod).ContinueWith((tt) =>
                    {
                        _throttlePeriods.Release(1);
                    });

                    return action(arg1, arg2);
                }
                finally
                {
                    _throttleActions.Release(1);
                }
            });
        }

    }
}
