using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ExileParty.Models
{
    [Serializable]
    public class PlayerModel
    {
        public string ConnectionID { get; set; }
        public string Account { get; set; }
        public CharacterModel Character { get; set; }
        public string Area { get; set; }
        public string Guild { get; set; }
        public List<string> InArea { get; set; }
        public bool Generic { get; set; }
        public bool SessionIdProvided { get; set; }
        public string GenericHost { get; set; }
        public List<NetWorthSnapshot> NetWorthSnapshots { get; set; }

        public ExtenedAreaInfoModel AreaInfo { get; set; }
        public List<ExtenedAreaInfoModel> PastAreas { get; set; }

        public List<LadderPlayer> LadderInfo { get; set; }
    }
}
