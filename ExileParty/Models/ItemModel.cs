using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ExileParty.Models
{
    [Serializable]
    public class ItemModel
    {
        public bool Verified { get; set; }
        public int W { get; set; }
        public int H { get; set; }
        public int Ilvl { get; set; }
        public string Icon { get; set; }
        public string League { get; set; }
        public string Id { get; set; }
        public List<SocketModel> Sockets { get; set; }
        public string Name { get; set; }
        public string TypeLine { get; set; }
        public bool Identified { get; set; }
        public bool Corrupted { get; set; }
        public bool LockedToCharacter { get; set; }
        public List<RequirementModel> Requirements { get; set; }
        public List<string> ImplicitMods { get; set; }
        public List<string> ExplicitMods { get; set; }
        public int FrameType { get; set; }
        public int X { get; set; }
        public int Y { get; set; }
        public string InventoryId { get; set; }
        public List<SocketedItemModel> SocketedItems { get; set; }
        public List<PropertyModel> Properties { get; set; }
        public List<string> FlavourText { get; set; }
        public List<string> CraftedMods { get; set; }
        public List<string> EnchantMods { get; set; }
        public List<string> UtilityMods { get; set; }
        public string DescrText { get; set; }
    }
}
