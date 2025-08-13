using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace Bookings.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddRoomsAndSeats : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Room",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Name = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Room", x => x.Id);
                });

            // Insertar datos por defecto para las salas
            migrationBuilder.InsertData(
                table: "Room",
                columns: new[] { "Id", "Name" },
                values: new object[,]
                {
                    { 1, "Sala 1" },
                    { 2, "Sala 2" },
                    { 3, "Sala 3" }
                });

            migrationBuilder.RenameColumn(
                name: "ShowtimeId",
                table: "Seats",
                newName: "RoomId");

            migrationBuilder.RenameColumn(
                name: "IsReserved",
                table: "Seats",
                newName: "IsDisabled");

            migrationBuilder.RenameIndex(
                name: "IX_Seats_ShowtimeId_Row_Number",
                table: "Seats",
                newName: "IX_Seats_RoomId_Row_Number");

            migrationBuilder.AddForeignKey(
                name: "FK_Seats_Room_RoomId",
                table: "Seats",
                column: "RoomId",
                principalTable: "Room",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Seats_Room_RoomId",
                table: "Seats");

            migrationBuilder.DropTable(
                name: "Room");

            migrationBuilder.RenameColumn(
                name: "RoomId",
                table: "Seats",
                newName: "ShowtimeId");

            migrationBuilder.RenameColumn(
                name: "IsDisabled",
                table: "Seats",
                newName: "IsReserved");

            migrationBuilder.RenameIndex(
                name: "IX_Seats_RoomId_Row_Number",
                table: "Seats",
                newName: "IX_Seats_ShowtimeId_Row_Number");
        }
    }
}
