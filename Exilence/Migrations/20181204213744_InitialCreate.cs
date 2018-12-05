using System;
using Microsoft.EntityFrameworkCore.Migrations;

namespace Exilence.Migrations
{
    public partial class InitialCreate : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Connections",
                columns: table => new
                {
                    ConnectionId = table.Column<string>(nullable: false),
                    PartyName = table.Column<string>(nullable: true),
                    ConnectedDate = table.Column<DateTime>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Connections", x => x.ConnectionId);
                });

            migrationBuilder.CreateTable(
                name: "LadderPlayerDepthModel",
                columns: table => new
                {
                    Id = table.Column<int>(nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Solo = table.Column<int>(nullable: false),
                    Group = table.Column<int>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LadderPlayerDepthModel", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "LadderPlayerRankModel",
                columns: table => new
                {
                    Id = table.Column<int>(nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Overall = table.Column<int>(nullable: false),
                    Class = table.Column<int>(nullable: false),
                    Depth = table.Column<int>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LadderPlayerRankModel", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Ladders",
                columns: table => new
                {
                    Id = table.Column<int>(nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Name = table.Column<string>(nullable: true),
                    Running = table.Column<bool>(nullable: false),
                    Started = table.Column<DateTime>(nullable: false),
                    Finished = table.Column<DateTime>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Ladders", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "LadderPlayerModel",
                columns: table => new
                {
                    Id = table.Column<int>(nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Name = table.Column<string>(nullable: true),
                    Level = table.Column<int>(nullable: false),
                    Online = table.Column<bool>(nullable: false),
                    Dead = table.Column<bool>(nullable: false),
                    Account = table.Column<string>(nullable: true),
                    Experience = table.Column<long>(nullable: false),
                    ExperiencePerHour = table.Column<long>(nullable: false),
                    RankId = table.Column<int>(nullable: true),
                    DepthId = table.Column<int>(nullable: true),
                    Twitch = table.Column<string>(nullable: true),
                    Class = table.Column<string>(nullable: true),
                    Updated = table.Column<DateTime>(nullable: false),
                    LadderStoreModelId = table.Column<int>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LadderPlayerModel", x => x.Id);
                    table.ForeignKey(
                        name: "FK_LadderPlayerModel_LadderPlayerDepthModel_DepthId",
                        column: x => x.DepthId,
                        principalTable: "LadderPlayerDepthModel",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_LadderPlayerModel_Ladders_LadderStoreModelId",
                        column: x => x.LadderStoreModelId,
                        principalTable: "Ladders",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_LadderPlayerModel_LadderPlayerRankModel_RankId",
                        column: x => x.RankId,
                        principalTable: "LadderPlayerRankModel",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_LadderPlayerModel_DepthId",
                table: "LadderPlayerModel",
                column: "DepthId");

            migrationBuilder.CreateIndex(
                name: "IX_LadderPlayerModel_LadderStoreModelId",
                table: "LadderPlayerModel",
                column: "LadderStoreModelId");

            migrationBuilder.CreateIndex(
                name: "IX_LadderPlayerModel_RankId",
                table: "LadderPlayerModel",
                column: "RankId");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Connections");

            migrationBuilder.DropTable(
                name: "LadderPlayerModel");

            migrationBuilder.DropTable(
                name: "LadderPlayerDepthModel");

            migrationBuilder.DropTable(
                name: "Ladders");

            migrationBuilder.DropTable(
                name: "LadderPlayerRankModel");
        }
    }
}
