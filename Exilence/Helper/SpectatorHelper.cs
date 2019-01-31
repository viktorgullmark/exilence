using System;
using System.Linq;

namespace Exilence.Helper
{
    public static class SpectatorHelper
    {

        public static char cipher(char ch, int key)
        {
            if (!char.IsLetter(ch))
            {
                return ch;
            }

            char d = char.IsUpper(ch) ? 'A' : 'a';
            return (char)((((ch + key) - d) % 26) + d);
        }

        public static string ToSpectatorCode(string partyName, int key)
        {
            string output = string.Empty;

            foreach (char ch in partyName)
                output += cipher(ch, key);

            return output;
        }

        public static string ToPartyName(string spectatorCode, int key)
        {
            return ToSpectatorCode(spectatorCode, 26 - key);
        }
    }
}
