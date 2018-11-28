using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Exilence.Models
{
    [Serializable]
    public class SocketModel
    {
        public int Group { get; set; }
        public string Attr { get; set; }
        public string SColour { get; set; }
    }
}
