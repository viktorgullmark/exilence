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
        public DbSet<LadderStoreModel> Ladders { get; set; }
        public DbSet<ConnectionModel> Connections { get; set; }

        public StoreContext(DbContextOptions<StoreContext> options)
            : base(options)
        {
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {

            base.OnModelCreating(modelBuilder);

        }
    }
}
