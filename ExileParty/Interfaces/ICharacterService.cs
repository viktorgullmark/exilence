using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ExileParty.Interfaces
{
    interface ICharacterService
    {
        void IndexCharactersFromLadder(string league);
        Task IndexCharactersFromTradeRiver(string nextChangeId);
        Task GetNextChangeId();
    }
}
