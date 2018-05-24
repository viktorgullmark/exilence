using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ExileParty.Models
{
    public class RequirementModel
    {
        public string Name { get; set; }
        public List<List<object>> Values { get; set; }
        public int DisplayMode { get; set; }
    }
}
