using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SmartGrid.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class TariffAndResidentalChanges : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "AccessToken",
                table: "SmartMeters",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "DeviceGuid",
                table: "SmartMeters",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Description",
                table: "ResidentalObjects",
                type: "nvarchar(max)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AccessToken",
                table: "SmartMeters");

            migrationBuilder.DropColumn(
                name: "DeviceGuid",
                table: "SmartMeters");

            migrationBuilder.DropColumn(
                name: "Description",
                table: "ResidentalObjects");
        }
    }
}
