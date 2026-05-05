using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SmartGrid.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "TariffModels",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    GHT = table.Column<float>(type: "real", nullable: false),
                    GLT = table.Column<float>(type: "real", nullable: false),
                    BHT = table.Column<float>(type: "real", nullable: false),
                    BLT = table.Column<float>(type: "real", nullable: false),
                    RHT = table.Column<float>(type: "real", nullable: false),
                    RLT = table.Column<float>(type: "real", nullable: false),
                    BillingPowerPrice = table.Column<float>(type: "real", nullable: false),
                    SupplierCost = table.Column<float>(type: "real", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TariffModels", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Users",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false, defaultValueSql: "newid()"),
                    FirstName = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    LastName = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Email = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    PhoneNumber = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    PasswordHash = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Role = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    AccountStatus = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Users", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "ResidentalObjects",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Type = table.Column<int>(type: "int", nullable: false),
                    Street = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Number = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    City = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    OwnerId = table.Column<Guid>(type: "uniqueidentifier", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ResidentalObjects", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ResidentalObjects_Users_OwnerId",
                        column: x => x.OwnerId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "SmartMeters",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    SerialNumber = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ConnectionType = table.Column<int>(type: "int", nullable: false),
                    MaxPower = table.Column<double>(type: "float", nullable: false),
                    Note = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Status = table.Column<int>(type: "int", nullable: false),
                    RegisteredAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UserLimitValue = table.Column<double>(type: "float", nullable: true),
                    UserLimitType = table.Column<int>(type: "int", nullable: true),
                    ResidentalObjectId = table.Column<Guid>(type: "uniqueidentifier", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SmartMeters", x => x.Id);
                    table.ForeignKey(
                        name: "FK_SmartMeters_ResidentalObjects_ResidentalObjectId",
                        column: x => x.ResidentalObjectId,
                        principalTable: "ResidentalObjects",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateIndex(
                name: "IX_ResidentalObjects_OwnerId",
                table: "ResidentalObjects",
                column: "OwnerId");

            migrationBuilder.CreateIndex(
                name: "IX_SmartMeters_ResidentalObjectId",
                table: "SmartMeters",
                column: "ResidentalObjectId",
                unique: true,
                filter: "[ResidentalObjectId] IS NOT NULL");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "SmartMeters");

            migrationBuilder.DropTable(
                name: "TariffModels");

            migrationBuilder.DropTable(
                name: "ResidentalObjects");

            migrationBuilder.DropTable(
                name: "Users");
        }
    }
}
