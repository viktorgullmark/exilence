using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Exilence.Models
{
    public class LeagueApiModel
    {
        public string Id { get; set; }
        public string Url { get; set; }
        public DateTime StartAt { get; set; }
        public object EndAt { get; set; }
    }
}
