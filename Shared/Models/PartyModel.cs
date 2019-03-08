using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using System;
using System.Collections.Generic;

namespace Shared.Models
{
    [Serializable]
    public class PartyModel
    {
        public string Name { get; set; }
        public string SpectatorCode { get; set; }
        public List<PlayerModel> Players { get; set; }
    }

    public class PartyStorageModel
    {
        [BsonId]
        public string Name { get; set; }
        public string SpectatorCode { get; set; }
        public List<PlayerStorageModel> Players { get; set; }
    }
}
