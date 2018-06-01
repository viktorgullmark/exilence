using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ExileParty.Models
{
    public class LadderCharacter
    {
        public string Name { get; set; }
        public int Level { get; set; }
        public string @Class { get; set; }
        public string Id { get; set; }
        public object Experience { get; set; }
    }

    public class LadderGuild
    {
        public string Id { get; set; }
        public string Name { get; set; }
        public string Tag { get; set; }
        public DateTime CreatedAt { get; set; }
        public string StatusMessage { get; set; }
    }

    public class LadderChallenges
    {
        public int Total { get; set; }
    }

    public class LadderTwitch
    {
        public string Name { get; set; }
    }

    public class LadderAccount
    {
        public string Name { get; set; }
        public LadderGuild Guild { get; set; }
        public LadderChallenges Challenges { get; set; }
        public LadderTwitch Twitch { get; set; }
    }

    public class LadderEntry
    {
        public int Rank { get; set; }
        public bool Dead { get; set; }
        public bool Online { get; set; }
        public LadderCharacter Character { get; set; }
        public LadderAccount Account { get; set; }
    }

    public class LadderRootObject
    {
        public int Total { get; set; }
        public DateTime Cached_since { get; set; }
        public List<LadderEntry> Entries { get; set; }
    }

}
