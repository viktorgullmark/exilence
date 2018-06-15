using ExileParty.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ExileParty.Interfaces
{
    public interface ICharacterService
    {
        Task IndexCharactersFromLadder(string league);
        Task StartTradeIndexing();
        Task<string> GetAccountFromCharacterAsync(string character);
    }
}
