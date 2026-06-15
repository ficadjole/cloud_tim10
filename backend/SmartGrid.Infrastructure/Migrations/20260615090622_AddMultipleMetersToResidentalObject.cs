using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SmartGrid.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddMultipleMetersToResidentalObject : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_SmartMeters_ResidentalObjectId",
                table: "SmartMeters");

            migrationBuilder.CreateIndex(
                name: "IX_SmartMeters_ResidentalObjectId",
                table: "SmartMeters",
                column: "ResidentalObjectId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_SmartMeters_ResidentalObjectId",
                table: "SmartMeters");

            migrationBuilder.CreateIndex(
                name: "IX_SmartMeters_ResidentalObjectId",
                table: "SmartMeters",
                column: "ResidentalObjectId",
                unique: true,
                filter: "[ResidentalObjectId] IS NOT NULL");
        }
    }
}
