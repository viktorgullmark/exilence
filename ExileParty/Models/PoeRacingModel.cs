using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ExileParty.Models
{
    [Serializable]
    public class LadderPlayer
    {
        public string Name { get; set; }
        public int Level { get; set; }
        public bool Online { get; set; }
        public bool Dead { get; set; }
        public string Account { get; set; }
        public long Experience { get; set; }
        public long Experience_per_hour { get; set; }
        public int Rank { get; set; }
        public string Twitch { get; set; }
        public string Class { get; set; }
        public int Class_rank { get; set; }
    }
}