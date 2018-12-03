using Exilence.Models.Connection;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Exilence.Store
{
    public static class ConnectionStore
    {
        public static Dictionary<string, ConnectionModel> ConnectionIndex;

        public static void Initialize()
        {
            ConnectionIndex = new Dictionary<string, ConnectionModel>();
        }
    }
}
