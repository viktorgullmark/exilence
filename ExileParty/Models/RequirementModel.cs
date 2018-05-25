using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ExileParty.Models
{
    [Serializable]
    public class RequirementModel
    {
        public string Name { get; set; }
        public List<KeyValuePair<string, int>> Values { get; set; }
        public int DisplayMode { get; set; }
    }
}
