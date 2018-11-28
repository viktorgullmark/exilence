using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Exilence.Models
{
    [Serializable]
    public class CategoryModel
    {
        public List<string> Gems { get; set; }
        public List<string> Jewels { get; set; }
    }
}
