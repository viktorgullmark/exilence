using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Exilence.Models
{
    [Serializable]
    public class LadderPlayerModel
    {
        public string Name { get; set; }
        public int Level { get; set; }
        public bool Online { get; set; }
        public bool Dead { get; set; }
        public string Account { get; set; }
        public long Experience { get; set; }
        public long ExperiencePerHour { get; set; }
        public LadderPlayerRankModel Rank { get; set; }
        public LadderPlayerDepthModel Depth { get; set; }
        public string Twitch { get; set; }
        public string Class { get; set; }
        public DateTime Updated { get; set; }
    }

    [Serializable]
    public class LadderPlayerDepthModel
    {
        public int Solo { get; set; }
        public int Group { get; set; }
    }
    
    [Serializable]
    public class LadderPlayerRankModel
    {
        public int Overall { get; set; }
        public int Class { get; set; }
        public int Depth { get; set; }
    }




}