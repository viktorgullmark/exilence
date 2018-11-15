using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ExileParty.Models.Ladder
{
    [Serializable]
    public class LadderStatusModel
    {
        public bool Running { get; set; }
        public DateTime LastRun { get; set; }   
    }
}
