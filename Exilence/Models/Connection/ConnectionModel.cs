using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace Exilence.Models.Connection
{
    [Serializable]
    public class ConnectionModel
    {   
        [Key]
        public string ConnectionId { get; set; }
        public string PartyName { get; set; }
        public DateTime ConnectedDate { get; set; }
    }
}
