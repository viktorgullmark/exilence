using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Exilence.Models
{
    [Serializable]
    public class PartyModel
    {
        public string Name { get; set; }
        public List<PlayerModel> Players { get; set; }
    }
}
