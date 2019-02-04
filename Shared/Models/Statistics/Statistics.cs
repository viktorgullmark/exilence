using System;

namespace Shared.Models.Statistics
{
    [Serializable]
    public class Statistics
    {
        public int Connections { get; set; }

        public Statistics()
        {
            Connections = 0;
        }
    }
}
