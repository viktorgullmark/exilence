using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ExileParty.Models
{
    [Serializable]
    public class SocketedItemModel
    {
        public bool Verified { get; set; }
        public int W { get; set; }
        public int H { get; set; }
        public int Ilvl { get; set; }
        public string Icon { get; set; }
        public string Id { get; set; }
        public string Colour { get; set; }
        public string TypeLine { get; set; }
        public int Socket { get; set; }
        public string Name { get; set; }
        public bool Corrupted { get; set; }
        public bool Support { get; set; }
        public bool LockedToCharacter { get; set; }
        public CategoryModel Category { get; set; }
        public List<RequirementModel> Requirements { get; set; }
        public List<RequirementModel> NextLevelRequirements { get; set; }
        public List<string> ExplicitMods { get; set; }
        public int FrameType { get; set; }
        public int X { get; set; }
        public int Y { get; set; }
        public List<PropertyModel> Properties { get; set; }
        public List<PropertyModel> AdditionalProperties { get; set; }
        public string DescrText { get; set; }
        public string SecDescrText { get; set; }
    }
}
