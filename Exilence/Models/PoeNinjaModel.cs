using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Exilence.Models
{
    public class PoeNinjaModel
    {
        public int id { get; set; }
        public string next_change_id { get; set; }
        public long api_bytes_downloaded { get; set; }
        public int stash_tabs_processed { get; set; }
        public int api_calls { get; set; }
        public long character_bytes_downloaded { get; set; }
        public int character_api_calls { get; set; }
        public long ladder_bytes_downloaded { get; set; }
        public int ladder_api_calls { get; set; }
    }
}
