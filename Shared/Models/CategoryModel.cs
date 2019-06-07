using System;
using System.Collections.Generic;

namespace Shared.Models
{
    [Serializable]
    public class CategoryModel
    {
        public List<string> Gems { get; set; }
        public List<string> Jewels { get; set; }

        public CategoryModel()
        {
            Gems = new List<string>();
            Jewels = new List<string>();
        }
    }
}
