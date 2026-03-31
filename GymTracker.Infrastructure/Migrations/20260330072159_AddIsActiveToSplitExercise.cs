using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GymTracker.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddIsActiveToSplitExercise : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsActive",
                table: "SplitExercises",
                type: "bit",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsActive",
                table: "SplitExercises");
        }
    }
}
