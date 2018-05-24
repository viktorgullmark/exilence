using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ExileParty.Models
{

    public class PlayerModel
    {
        public string ConnectionID { get; set; }
        public string Channel { get; set; }
        public string Account { get; set; }
        public CharacterModel Character { get; set; }
        public string Area { get; set; }
        public string Guild { get; set; }
        public List<string> InArea { get; set; }
    }
}
