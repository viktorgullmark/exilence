using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Exilence.Models
{

    public class Property
    {
        public string name { get; set; }
        public List<List<object>> values { get; set; }
        public int displayMode { get; set; }
        public int type { get; set; }
    }

    public class Category
    {
        public List<object> maps { get; set; }
    }

    public class Item
    {
        public bool verified { get; set; }
        public int w { get; set; }
        public int h { get; set; }
        public int ilvl { get; set; }
        public string icon { get; set; }
        public string league { get; set; }
        public string id { get; set; }
        public string name { get; set; }
        public string typeLine { get; set; }
        public bool identified { get; set; }
        public List<Property> properties { get; set; }
        public string descrText { get; set; }
        public int frameType { get; set; }
        public Category category { get; set; }
        public int x { get; set; }
        public int y { get; set; }
        public string inventoryId { get; set; }
    }

    public class Stash
    {
        public string id { get; set; }
        public bool @public { get; set; }
        public string accountName { get; set; }
        public string lastCharacterName { get; set; }
        public string stash { get; set; }
        public string stashType { get; set; }
        public List<Item> items { get; set; }
    }

    public class TradeApiModel
    {
        public string next_change_id { get; set; }
        public List<Stash> stashes { get; set; }
    }
}
