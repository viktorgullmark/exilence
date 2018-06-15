using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ExileParty.Models
{
    [Serializable]
    public class StatisticsModel
    {
        public string ChangeId { get; set; }
        public double AvgGET { get; set; }
        public double AvgDeserialize { get; set; }
        public double AvgUpdateRedis { get; set; }
        public int PendingRequests { get; set; }
        public int StashesInLastResponse { get; set; }
        public bool RateLimitedOrDown { get; set; }
        public DateTime Timestamp { get; set; }
    }
}
