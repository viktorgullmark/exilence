using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ExileParty.Helper
{
    public static class RateGateHelpers
    {
        public static IEnumerable<T> LimitRate<T>(this IEnumerable<T> sequence, int items, TimeSpan timePeriod)
        {
            using (var rateGate = new RateGate(items, timePeriod))
            {
                foreach (var item in sequence)
                {
                    rateGate.WaitToProceed();
                    yield return item;
                }
            }
        }
    }
}
