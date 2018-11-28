using Exilence.Models;
using Exilence.Models.Ladder;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Exilence.Interfaces
{
    public interface ILadderService
    {
        Task<List<LadderPlayerModel>> GetLadderForPlayer(string league, string player);
    }
}
