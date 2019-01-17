using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Exilence.Models.Statistics
{
    [Serializable]
    public class Statistics
    {
        public int Connections { get; set; }

        public Statistics()
        {
            Connections = 0;
        }
    }
}
