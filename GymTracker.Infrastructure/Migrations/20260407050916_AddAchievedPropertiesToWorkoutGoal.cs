using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GymTracker.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddAchievedPropertiesToWorkoutGoal : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_WorkoutGoals_WorkoutGoals_WorkoutGoalId",
                table: "WorkoutGoals");

            migrationBuilder.DropIndex(
                name: "IX_WorkoutGoals_WorkoutGoalId",
                table: "WorkoutGoals");

            migrationBuilder.RenameColumn(
                name: "WorkoutGoalId",
                table: "WorkoutGoals",
                newName: "AchievedReps");

            migrationBuilder.AddColumn<decimal>(
                name: "AchievedWeight",
                table: "WorkoutGoals",
                type: "decimal(18,2)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AchievedWeight",
                table: "WorkoutGoals");

            migrationBuilder.RenameColumn(
                name: "AchievedReps",
                table: "WorkoutGoals",
                newName: "WorkoutGoalId");

            migrationBuilder.CreateIndex(
                name: "IX_WorkoutGoals_WorkoutGoalId",
                table: "WorkoutGoals",
                column: "WorkoutGoalId");

            migrationBuilder.AddForeignKey(
                name: "FK_WorkoutGoals_WorkoutGoals_WorkoutGoalId",
                table: "WorkoutGoals",
                column: "WorkoutGoalId",
                principalTable: "WorkoutGoals",
                principalColumn: "Id");
        }
    }
}
