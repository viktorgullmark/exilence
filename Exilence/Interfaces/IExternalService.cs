using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Exilence.Interfaces
{
    public interface IExternalService
    {
        Task<string> ExecuteGetAsync(string url);
    }
}
