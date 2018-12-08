using Exilence.Contexts;
using Exilence.Hubs;
using Exilence.Interfaces;
using Exilence.Repositories;
using Exilence.Services;
using Hangfire;
using Hangfire.MemoryStorage;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using System;

namespace Exilence
{
    public class Startup
    {
        public Startup(IConfiguration configuration)
        {
            Configuration = configuration;
        }

        public IConfiguration Configuration { get; }

        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices(IServiceCollection services)
        {
            //services.AddDbContext<StoreContext>(options => options.UseSqlite("Data Source=store.db"));

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

            services.AddSingleton<ILadderService, LadderService>();
            services.AddHttpClient<IExternalService, ExternalService>();
            //services.AddSingleton<IStoreRepository, StoreRepository>();
            services.AddSingleton<IRedisRepository, RedisRepository>();
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IHostingEnvironment env, ILoggerFactory loggerFactory, IServiceProvider serviceProvider)
        {
            app.UseForwardedHeaders(new ForwardedHeadersOptions
            {
                ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto
            });

            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
            }

            app.UseMvc();
            app.UseCors("AllowAll");

            GlobalConfiguration.Configuration.UseActivator(new HangfireActivator(serviceProvider));

            var hangfireOpts = new BackgroundJobServerOptions
            {
                SchedulePollingInterval = TimeSpan.FromMilliseconds(1000)
            };

            app.UseHangfireServer(hangfireOpts);
            app.UseHangfireDashboard();

            BackgroundJob.Schedule<ILadderService>(ls => ls.UpdateLadders(), TimeSpan.FromMilliseconds(5000));

            app.UseSignalR(routes =>
            {
                routes.MapHub<PartyHub>("/hubs/party", options =>
                {
                    // 30Kb message buffer
                    options.ApplicationMaxBufferSize = 30 * 1024 * 1024;
                });
            });


        }

    }
}
