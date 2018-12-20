using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Exilence.Models.Statistics
{
    [Serializable]
    public class Statistics
    {
        public int PartyCount { get; set; }
        public int PlayerCount { get; set; }

        public Statistics()
        {
            PartyCount = 0;
            PlayerCount = 0;
        }
    }
}
