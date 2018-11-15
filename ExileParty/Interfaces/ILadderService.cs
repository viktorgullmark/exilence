using ExileParty.Models;
using ExileParty.Models.Ladder;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ExileParty.Interfaces
{
    public interface ILadderService
    {
        Task<List<LadderApiEntry>> GetLadderForPlayer(string league, string player);
    }
}
