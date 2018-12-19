using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Exilence.Models
{
    [Serializable]
    public class NetWorthItem
    {
        public string Icon { get; set; }
        public decimal Value { get; set; }
        public decimal ValuePerUnit { get; set; }
        public string Name { get; set; }
        public int Stacksize { get; set; }
        public int? Links { get; set; }
        public int? Quality { get; set; }
    }

    [Serializable]
    public class NetWorthSnapshot
    {
        public long Timestamp { get; set; }
        public double Value { get; set; }
        public List<NetWorthItem> Items { get; set; }
    }
}
