using System;
using System.Collections.Generic;
using System.Dynamic;
using System.Linq;
using System.Threading.Tasks;

namespace Exilence.Models
{
    [Serializable]
    public class PropertyModel
    {
        public string Name { get; set; }
        public List<List<string>> Values { get; set; }
        public int DisplayMode { get; set; }
        public int Type { get; set; }
    }
}