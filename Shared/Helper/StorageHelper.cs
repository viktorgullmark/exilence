using System;
using System.Collections.Generic;
using System.IO;
using System.IO.Compression;
using System.Linq;
using System.Text;
using Newtonsoft.Json;
using Newtonsoft.Json.Serialization;
using Shared.Models;

namespace Shared.Helper
{
    public static class StorageHelper
    {
        public static PlayerStorageModel ToStoragePlayer(PlayerModel input)
        {
            var compressedAreas = CompressionHelper.Compress(input.PastAreas);
            var compressedNetworth = CompressionHelper.Compress(input.NetWorthSnapshots);

            return new PlayerStorageModel
            {
                ConnectionID = input.ConnectionID,
                Area = input.Area,
                Generic = input.Generic,
                Guild = input.Guild,
                IsLeader = input.IsLeader,
                Account = input.Account,
                OverallRank = input.OverallRank,
                IsSpectator = input.IsSpectator,
                GenericHost = input.GenericHost,
                InArea = input.InArea,
                SessionIdProvided = input.SessionIdProvided,
                Character = input.Character,
                AreaInfo = input.AreaInfo,
                NetWorthSnapshots = compressedNetworth,
                PastAreas = compressedAreas
            };
        }

        public static PlayerModel FromStoragePlayer(PlayerStorageModel input)
        {
            var decompressedAreas = CompressionHelper.Decompress<List<ExtenedAreaInfoModel>>(input.PastAreas);
            var decompressedNetworth = CompressionHelper.Decompress<List<NetWorthSnapshot>>(input.NetWorthSnapshots);

            return new PlayerModel
            {
                ConnectionID = input.ConnectionID,
                Area = input.Area,
                Generic = input.Generic,
                Guild = input.Guild,
                IsLeader = input.IsLeader,
                Account = input.Account,
                OverallRank = input.OverallRank,
                IsSpectator = input.IsSpectator,
                GenericHost = input.GenericHost,
                InArea = input.InArea,
                SessionIdProvided = input.SessionIdProvided,
                Character = input.Character,
                AreaInfo = input.AreaInfo,
                NetWorthSnapshots = decompressedNetworth,
                PastAreas = decompressedAreas
            };
        }

        public static PartyModel FromStorageParty(PartyStorageModel input)
        {
            var players = input.Players.ConvertAll(x => FromStoragePlayer(x));

            return new PartyModel
            {
                Name = input.Name,
                SpectatorCode = input.SpectatorCode,
                Players = players
            };
        }
    }
}
