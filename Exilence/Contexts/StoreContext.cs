using Exilence.Models;
using Exilence.Models.Connection;
using Exilence.Models.Ladder;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Exilence.Contexts
{
    public class StoreContext : DbContext
    {
        public StoreContext(DbContextOptions<StoreContext> options)
            : base(options)
        {
        }

        public DbSet<Dictionary<string, LadderStatusModel>> LadderStatus { get; set; }

        public DbSet<Dictionary<string, List<LadderPlayerModel>>> Ladders { get; set; }

        public DbSet<Dictionary<string, ConnectionModel>> ConnectionIndex { get;set; } 
    }
}
