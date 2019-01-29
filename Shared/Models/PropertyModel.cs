using System;
using System.Collections.Generic;

namespace Shared.Models
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