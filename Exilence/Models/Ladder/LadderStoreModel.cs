using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;

namespace Exilence.Models.Ladder
{
    public class LadderStoreModel
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }
        public string Name { get; set; }
        public bool Running { get; set; }
        public DateTime Started { get; set; }
        public DateTime Finished { get; set; }
        public List<LadderPlayerModel> Ladder { get; set; }

        internal void UpdateLadder(List<LadderPlayerModel> ladder)
        {
            Ladder = ladder;
        }
    }
}
