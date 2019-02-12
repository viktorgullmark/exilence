using MongoDB.Bson.Serialization.Attributes;
using System;
using System.ComponentModel.DataAnnotations;

namespace Shared.Models.SignalR
{
    [Serializable]
    public class ConnectionModel
    {   
        [BsonId]
        public string ConnectionId { get; set; }
        public string PartyName { get; set; }
        public DateTime ConnectedDate { get; set; }
    }
}
