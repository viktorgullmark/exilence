using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ExileParty.Models
{
    public class PropertyModel
    {
        public string Name { get; set; }
        public List<object> Values { get; set; }
        public int DisplayMode { get; set; }
        public int Type { get; set; }
    }
}
