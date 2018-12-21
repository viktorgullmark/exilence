using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Exilence.Models.Statistics
{
    [Serializable]
    public class Statistics
    {
        public int Parties { get; set; }
        public int Players { get; set; }
        public int Connections { get; set; }

        public Statistics()
        {
            Parties = 0;
            Players = 0;
            Connections = 0;
        }
    }
}
