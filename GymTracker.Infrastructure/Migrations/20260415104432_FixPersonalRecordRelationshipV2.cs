using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GymTracker.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class FixPersonalRecordRelationshipV2 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_PersonalRecords_WorkoutSets_WorkoutSetId1",
                table: "PersonalRecords");

            migrationBuilder.DropIndex(
                name: "IX_PersonalRecords_WorkoutSetId1",
                table: "PersonalRecords");

            migrationBuilder.DropColumn(
                name: "WorkoutSetId1",
                table: "PersonalRecords");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "WorkoutSetId1",
                table: "PersonalRecords",
                type: "int",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_PersonalRecords_WorkoutSetId1",
                table: "PersonalRecords",
                column: "WorkoutSetId1");

            migrationBuilder.AddForeignKey(
                name: "FK_PersonalRecords_WorkoutSets_WorkoutSetId1",
                table: "PersonalRecords",
                column: "WorkoutSetId1",
                principalTable: "WorkoutSets",
                principalColumn: "Id");
        }
    }
}
