using System;
using System.Linq;

namespace Exilence.Helper
{
    public static class SpectatorHelper
    {
        private static int Mod(int a, int b)
        {
            return (a % b + b) % b;
        }

        private static string Encrypt(string input, string key, bool encipher)
        {
            string output = string.Empty;

            for (int i = 0; i < key.Length; ++i)
                if (!char.IsLetter(key[i]))
                    return null; // Error

            int nonAlphaCharCount = 0;

            for (int i = 0; i < input.Length; ++i)
            {
                if (char.IsLetter(input[i]))
                {
                    bool cIsUpper = char.IsUpper(input[i]);
                    char offset = cIsUpper ? 'A' : 'a';
                    int keyIndex = (i - nonAlphaCharCount) % key.Length;
                    int k = (cIsUpper ? char.ToUpper(key[keyIndex]) : char.ToLower(key[keyIndex])) - offset;
                    k = encipher ? k : -k;
                    char ch = (char)((Mod(((input[i] + k) - offset), 26)) + offset);
                    output += ch;
                }
                else
                {
                    output += input[i];
                    ++nonAlphaCharCount;
                }
            }

            return output;
        }

        public static string ToSpectatorCode(string partyName, string key)
        {
            return Encrypt(partyName, key, true);
        }

        public static string ToPartyName(string spectatorCode, string key)
        {
            return Encrypt(spectatorCode, key, false);
        }
    }
}
