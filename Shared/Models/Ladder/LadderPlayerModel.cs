using Shared.Models.Ladder;
using System;

namespace Shared.Models
{
    [Serializable]
    public class LadderPlayerModel
    {
        public string Name { get; set; }
        public int Level { get; set; }
        public bool Online { get; set; }
        public bool Dead { get; set; }
        public int Challenges { get; set; }
        public string Account { get; set; }
        public long Experience { get; set; }
        public long ExperiencePerHour { get; set; }
        public LadderPlayerRankModel Rank { get; set; }
        public LadderPlayerDepthModel Depth { get; set; }
        public string Twitch { get; set; }
        public string Class { get; set; }
        public DateTime Updated { get; set; }

        public LadderPlayerModel()
        {

        }

        public LadderPlayerModel(LadderApiEntry entry, string sortmode)
        {
            Name = entry.Character.Name;
            Level = entry.Character.Level;
            Online = entry.Online;
            Dead = entry.Dead;
            Challenges = entry.Account.Challenges.Total;
            Account = entry.Account.Name;
            Experience = entry.Character.Experience;
            ExperiencePerHour = 0;
            Rank = new LadderPlayerRankModel();
            Depth = new LadderPlayerDepthModel()
            {
                Solo = entry.Character.Depth != null ? entry.Character.Depth.Solo : 0,
                Group = entry.Character.Depth != null ? entry.Character.Depth.@default : 0
            };
            Twitch = entry.Account.Twitch?.Name;
            Class = entry.Character.Class;
            Updated = DateTime.Now;


            switch (sortmode)
            {
                case null:
                    Rank.Overall = entry.Rank;
                    break;
                case "depth":
                    Depth.GroupRank = entry.Rank;
                    break;
                case "depthsolo":
                    Depth.SoloRank = entry.Rank;
                    break;
            }
        }
    }

    [Serializable]
    public class LadderPlayerDepthModel
    {
        public int Solo { get; set; }
        public int SoloRank { get; set; }
        public int Group { get; set; }
        public int GroupRank { get; set; }
    }

    [Serializable]
    public class LadderPlayerRankModel
    {
        public int Overall { get; set; }
        public int Class { get; set; }
    }




}