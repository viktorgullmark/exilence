using System;
using System.Threading.Tasks;
using ExileParty.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.SignalR;

namespace ExileParty.Hubs
{
    [EnableCors("AllowAll")]
    public class PartyHub : Hub<ITypedHubClient>
    {
    }
}