using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SmartGrid.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class ManualStateLogMigration : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "ManualStateLogs",
                columns: table => new
                {
                    SmartMeterId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    HighTariffValue = table.Column<double>(type: "float", nullable: false),
                    LowTariffValue = table.Column<double>(type: "float", nullable: false),
                    ImageUrl = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Status = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ManualStateLogs", x => x.SmartMeterId);
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ManualStateLogs");
        }
    }
}
