using System;
using System.Collections.Generic;

namespace Shared.Models
{
    [Serializable]
    public class ExtenedAreaInfoModel
    {
        public EventArea EventArea { get; set; }
        public AreaEventType Type { get; set; }
        public string InstanceServer { get; set; }
        public long Timestamp { get; set; }
        public int Duration { get; set; }
        public List<NetWorthItem> Difference { get; set; }
        public List<NetWorthItem> Inventory { get; set; }
        public List<ExtenedAreaInfoModel> SubAreas { get; set; }
        public List<string> Events { get; set; }
    }

    [Serializable]
    public class EventArea
    {
        public string Name { get; set; }
        public string Type { get; set; }
        public string Timestamp { get; set; }
        public List<AreaInfo> Info { get; set; }
    }

    [Serializable]
    public class AreaInfo
    {
        public int? Act { get; set; }
        public int? Level { get; set; }
        public int? Tier { get; set; }
        public bool Town { get; set; }
        public bool Trial { get; set; }
        public bool Waypoint { get; set; }
        public List<AreaBoss> Bosses { get; set; }
    }

    [Serializable]
    public class AreaBoss
    {
        public string Name { get; set; }
    }

    [Serializable]
    public enum AreaType
    {
        Area = 0,
        Vaal = 1,
        Map = 2,
        Master = 3,
        Labyrinth = 4,
        Unknown = 5
    }

    [Serializable]
    public enum AreaEventType
    {
        Join = 0,
        Leave= 1
    }
}
