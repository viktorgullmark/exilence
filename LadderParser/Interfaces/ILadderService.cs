using Shared.Models;
using Shared.Models.Ladder;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace LadderParser.Interfaces
{
    public interface ILadderService
    {
        Task UpdateLadders();
    }
}
