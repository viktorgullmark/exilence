using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Timers;
using Exilence.Contexts;
using Exilence.Hubs;
using Exilence.Interfaces;
using Exilence.Services;
using Exilence.Store;
using Hangfire;
using Hangfire.MemoryStorage;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Newtonsoft.Json.Serialization;

namespace Exilence
{
    public class Startup
    {
        private Timer leagueTimer;

        public Startup(IConfiguration configuration)
        {
            Configuration = configuration;
            leagueTimer = new Timer((1000 * 15));
            leagueTimer.Elapsed += LeagueTimer_Elapsed;
        }

        public IConfiguration Configuration { get; }

        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices(IServiceCollection services)
        {
            services.AddDbContext<StoreContext>(options => options.UseSqlite("Data Source=store.db"));
 
            services.AddHangfire(c => c.UseMemoryStorage());

            services.AddMvc().SetCompatibilityVersion(CompatibilityVersion.Version_2_1);
            //.AddJsonOptions(opts => { opts.SerializerSettings.ContractResolver = new CamelCasePropertyNamesContractResolver(); });

            //Add distributed cache service backed by Redis cache
            services.AddDistributedRedisCache(options =>
            {
                options.Configuration = Configuration.GetConnectionString("Redis");
                options.InstanceName = "Exilence:";
            });

            services.AddCors(options =>
            {
                options.AddPolicy("AllowAll",
                    builder =>
                    {
                        builder.AllowAnyHeader();
                        builder.AllowAnyOrigin();
                        builder.AllowAnyMethod();
                        builder.AllowCredentials();
                    });
            });

            services.AddSignalR();

            services.AddScoped<ILadderService, LadderService>();
            services.AddHttpClient<IExternalService, ExternalService>();
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IHostingEnvironment env, ILoggerFactory loggerFactory, IServiceProvider serviceProvider)
        {
            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
            }

            app.UseMvc();
            app.UseCors("AllowAll");

            GlobalConfiguration.Configuration.UseActivator(new HangfireActivator(serviceProvider));

            app.UseHangfireServer();
            app.UseHangfireDashboard();

            //RecurringJob.AddOrUpdate<ILadderService>(ls => ls.UpdateLadders(), Cron.MinuteInterval(1));

            app.UseSignalR(routes =>
            {
                routes.MapHub<PartyHub>("/hubs/party", options =>
                {
                    // 30Kb message buffer
                    options.ApplicationMaxBufferSize = 30 * 1024 * 1024;
                });
            });

            LadderStore.Initialize();
            ConnectionStore.Initialize();
            leagueTimer.Start();
        }

        // Using a timer to trigger the event since hangfire does not go below 1 minute intervals.
        private void LeagueTimer_Elapsed(object sender, ElapsedEventArgs e)
        {
            BackgroundJob.Enqueue<ILadderService>(ls => ls.UpdateLadders());
        }
    }
}
