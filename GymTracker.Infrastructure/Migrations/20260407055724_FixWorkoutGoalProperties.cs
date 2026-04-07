using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GymTracker.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class FixWorkoutGoalProperties : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AchievedWeight",
                table: "WorkoutGoals");

            migrationBuilder.RenameColumn(
                name: "TargetWeight",
                table: "WorkoutGoals",
                newName: "TargetValue");

            migrationBuilder.AddColumn<decimal>(
                name: "AchievedValue",
                table: "WorkoutGoals",
                type: "decimal(18,2)",
                precision: 18,
                scale: 2,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AchievedValue",
                table: "WorkoutGoals");

            migrationBuilder.RenameColumn(
                name: "TargetValue",
                table: "WorkoutGoals",
                newName: "TargetWeight");

            migrationBuilder.AddColumn<decimal>(
                name: "AchievedWeight",
                table: "WorkoutGoals",
                type: "decimal(18,2)",
                nullable: true);
        }
    }
}
