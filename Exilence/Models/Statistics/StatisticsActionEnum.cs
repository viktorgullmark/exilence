using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Exilence.Models.Statistics
{
    public enum StatisticsActionEnum
    {
        IncrementParty = 0,
        DecrementParty = 1,
        IncrementPlayer = 2,
        DecrementPlayer = 3,
        IncrementConnection = 4,
        DecrementConnection = 5
    }
}
