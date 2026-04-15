using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GymTracker.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class FixPersonalRecordRelationship : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_PersonalRecords_WorkoutSets_WorkoutSetId",
                table: "PersonalRecords");

            migrationBuilder.DropIndex(
                name: "IX_PersonalRecords_WorkoutSetId",
                table: "PersonalRecords");

            migrationBuilder.DropColumn(
                name: "PersonalRecordId",
                table: "WorkoutSets");

            migrationBuilder.AlterColumn<int>(
                name: "WorkoutSetId",
                table: "PersonalRecords",
                type: "int",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "int");

            migrationBuilder.AddColumn<int>(
                name: "WorkoutSetId1",
                table: "PersonalRecords",
                type: "int",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_PersonalRecords_WorkoutSetId",
                table: "PersonalRecords",
                column: "WorkoutSetId");

            migrationBuilder.CreateIndex(
                name: "IX_PersonalRecords_WorkoutSetId1",
                table: "PersonalRecords",
                column: "WorkoutSetId1");

            migrationBuilder.AddForeignKey(
                name: "FK_PersonalRecords_WorkoutSets_WorkoutSetId",
                table: "PersonalRecords",
                column: "WorkoutSetId",
                principalTable: "WorkoutSets",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_PersonalRecords_WorkoutSets_WorkoutSetId1",
                table: "PersonalRecords",
                column: "WorkoutSetId1",
                principalTable: "WorkoutSets",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_PersonalRecords_WorkoutSets_WorkoutSetId",
                table: "PersonalRecords");

            migrationBuilder.DropForeignKey(
                name: "FK_PersonalRecords_WorkoutSets_WorkoutSetId1",
                table: "PersonalRecords");

            migrationBuilder.DropIndex(
                name: "IX_PersonalRecords_WorkoutSetId",
                table: "PersonalRecords");

            migrationBuilder.DropIndex(
                name: "IX_PersonalRecords_WorkoutSetId1",
                table: "PersonalRecords");

            migrationBuilder.DropColumn(
                name: "WorkoutSetId1",
                table: "PersonalRecords");

            migrationBuilder.AddColumn<int>(
                name: "PersonalRecordId",
                table: "WorkoutSets",
                type: "int",
                nullable: true);

            migrationBuilder.AlterColumn<int>(
                name: "WorkoutSetId",
                table: "PersonalRecords",
                type: "int",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "int",
                oldNullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_PersonalRecords_WorkoutSetId",
                table: "PersonalRecords",
                column: "WorkoutSetId",
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_PersonalRecords_WorkoutSets_WorkoutSetId",
                table: "PersonalRecords",
                column: "WorkoutSetId",
                principalTable: "WorkoutSets",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
