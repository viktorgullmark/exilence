using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Exilence.Models
{
    [Serializable]
    public class NetWorthItem
    {
        public string Name { get; set; }
        public decimal Value { get; set; }
        public decimal Value_min { get; set; }
        public decimal Value_max { get; set; }
        public decimal Value_mode { get; set; }
        public decimal Value_median { get; set; }
        public decimal Value_average { get; set; }
        public decimal ValuePerUnit { get; set; }
        public string Icon { get; set; }
        public int Stacksize { get; set; }
        public int Links { get; set; }
        public int GemLevel { get; set; }
        public int Quality { get; set; }
        public int Quantity { get; set; }
        public string Variation { get; set; }
        public int FrameType { get; set; }
        public int TotalStacksize { get; set; }
        public bool Corrupted { get; set; }
    }

    [Serializable]
    public class NetWorthSnapshot
    {
        public long Timestamp { get; set; }
        public double Value { get; set; }
        public List<NetWorthItem> Items { get; set; }
    }
}
