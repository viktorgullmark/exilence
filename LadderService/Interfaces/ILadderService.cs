using Shared.Models;
using Shared.Models.Ladder;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace LadderService.Interfaces
{
    public interface ILadderService
    {
        Task UpdateLadders();
    }
}
