using System;
using System.Collections.Generic;

namespace Shared.Models
{
    [Serializable]
    public class RequirementModel
    {
        public string Name { get; set; }
        public List<List<string>> Values { get; set; }
        public int DisplayMode { get; set; }

        public RequirementModel()
        {
            Values = new List<List<string>>();
        }
    }
}
