using System;
using System.Collections.Generic;
using System.Dynamic;
using System.Linq;
using System.Threading.Tasks;

namespace ExileParty.Models
{
    [Serializable]
    public class StashTabModel
    {
        public int Index { get; set; }
        public string Name { get; set; }
        public List<ItemModel> Items { get; set; }
    }
}
