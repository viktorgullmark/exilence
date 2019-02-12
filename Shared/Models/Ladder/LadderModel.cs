using MongoDB.Bson.Serialization.Attributes;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Shared.Models.Ladder
{
    public class LadderModel
    {
        [BsonId]
        public string Name { get; set; }
        public bool Running { get; set; }
        public DateTime Started { get; set; }
        public DateTime Finished { get; set; }
        public List<LadderPlayerModel> Ladder { get; set; }
    }
}
