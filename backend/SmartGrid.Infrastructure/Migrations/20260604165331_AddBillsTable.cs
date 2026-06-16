using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SmartGrid.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddBillsTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Bills",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false, defaultValueSql: "newid()"),
                    SmartMeterId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    OwnerId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    BillingPeriod = table.Column<DateTime>(type: "datetime2", nullable: false),
                    HighTariffKWh = table.Column<double>(type: "float", nullable: false),
                    LowTariffKWh = table.Column<double>(type: "float", nullable: false),
                    GreenZoneAmount = table.Column<double>(type: "float", nullable: false),
                    BlueZoneAmount = table.Column<double>(type: "float", nullable: false),
                    RedZoneAmount = table.Column<double>(type: "float", nullable: false),
                    FixedCostsAmount = table.Column<double>(type: "float", nullable: false),
                    TotalAmount = table.Column<double>(type: "float", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    StripeSessionId = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Bills", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Bills_Users_OwnerId",
                        column: x => x.OwnerId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Bills_OwnerId",
                table: "Bills",
                column: "OwnerId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Bills");
        }
    }
}
