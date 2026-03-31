using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GymTracker.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddUserProperties : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Exercises",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    MuscleGroup = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Equipment = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    DifficultyLevel = table.Column<int>(type: "int", nullable: false),
                    EstimatedCaloriesPerSet = table.Column<int>(type: "int", nullable: false),
                    DefaultWeightIncrement = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    TotalUsersPerformed = table.Column<int>(type: "int", nullable: false),
                    IsMeasurable = table.Column<bool>(type: "bit", nullable: false),
                    MeasurementType = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Exercises", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Users",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Username = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Email = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    FirstName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    LastName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Weight = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: true),
                    Height = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Users", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Splits",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserId = table.Column<int>(type: "int", nullable: false),
                    DayOfWeek = table.Column<int>(type: "int", nullable: false),
                    Tag = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    TrainingStyle = table.Column<int>(type: "int", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Splits", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Splits_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "SplitExercises",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    SplitId = table.Column<int>(type: "int", nullable: false),
                    ExerciseId = table.Column<int>(type: "int", nullable: false),
                    Order = table.Column<int>(type: "int", nullable: false),
                    DefaultSets = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SplitExercises", x => x.Id);
                    table.ForeignKey(
                        name: "FK_SplitExercises_Exercises_ExerciseId",
                        column: x => x.ExerciseId,
                        principalTable: "Exercises",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_SplitExercises_Splits_SplitId",
                        column: x => x.SplitId,
                        principalTable: "Splits",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Workouts",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserId = table.Column<int>(type: "int", nullable: false),
                    WorkoutDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    SplitId = table.Column<int>(type: "int", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Workouts", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Workouts_Splits_SplitId",
                        column: x => x.SplitId,
                        principalTable: "Splits",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_Workouts_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "NutritionLogs",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserId = table.Column<int>(type: "int", nullable: false),
                    LogDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Protein = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    Carbs = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    Fats = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    Zinc = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    Calories = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    Notes = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    WorkoutId = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_NutritionLogs", x => x.Id);
                    table.ForeignKey(
                        name: "FK_NutritionLogs_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_NutritionLogs_Workouts_WorkoutId",
                        column: x => x.WorkoutId,
                        principalTable: "Workouts",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "WorkoutGoals",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserId = table.Column<int>(type: "int", nullable: false),
                    Type = table.Column<int>(type: "int", nullable: false),
                    TargetExerciseId = table.Column<int>(type: "int", nullable: false),
                    TargetWeight = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    TargetReps = table.Column<int>(type: "int", nullable: true),
                    TargetDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    IsAchieved = table.Column<bool>(type: "bit", nullable: false),
                    AchievedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Notes = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    AchievedInWorkoutId = table.Column<int>(type: "int", nullable: true),
                    WorkoutGoalId = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_WorkoutGoals", x => x.Id);
                    table.ForeignKey(
                        name: "FK_WorkoutGoals_Exercises_TargetExerciseId",
                        column: x => x.TargetExerciseId,
                        principalTable: "Exercises",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_WorkoutGoals_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_WorkoutGoals_WorkoutGoals_WorkoutGoalId",
                        column: x => x.WorkoutGoalId,
                        principalTable: "WorkoutGoals",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_WorkoutGoals_Workouts_AchievedInWorkoutId",
                        column: x => x.AchievedInWorkoutId,
                        principalTable: "Workouts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "WorkoutSets",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    WorkoutId = table.Column<int>(type: "int", nullable: false),
                    ExerciseId = table.Column<int>(type: "int", nullable: false),
                    UserId = table.Column<int>(type: "int", nullable: false),
                    SetNumber = table.Column<int>(type: "int", nullable: false),
                    Weight = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    Reps = table.Column<int>(type: "int", nullable: false),
                    IsCompleted = table.Column<bool>(type: "bit", nullable: false),
                    FormQuality = table.Column<int>(type: "int", nullable: false),
                    FatigueLevel = table.Column<int>(type: "int", nullable: true),
                    Quality = table.Column<int>(type: "int", nullable: false),
                    RepsInReserve = table.Column<int>(type: "int", nullable: true),
                    CompletedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    PerceivedExertion = table.Column<int>(type: "int", nullable: true),
                    PersonalRecordId = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_WorkoutSets", x => x.Id);
                    table.ForeignKey(
                        name: "FK_WorkoutSets_Exercises_ExerciseId",
                        column: x => x.ExerciseId,
                        principalTable: "Exercises",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_WorkoutSets_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_WorkoutSets_Workouts_WorkoutId",
                        column: x => x.WorkoutId,
                        principalTable: "Workouts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "PersonalRecords",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserId = table.Column<int>(type: "int", nullable: false),
                    ExerciseId = table.Column<int>(type: "int", nullable: false),
                    Type = table.Column<int>(type: "int", nullable: false),
                    Value = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    Reps = table.Column<int>(type: "int", nullable: false),
                    AchievedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    WorkoutSetId = table.Column<int>(type: "int", nullable: false),
                    PreviousRecord = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PersonalRecords", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PersonalRecords_Exercises_ExerciseId",
                        column: x => x.ExerciseId,
                        principalTable: "Exercises",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_PersonalRecords_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_PersonalRecords_WorkoutSets_WorkoutSetId",
                        column: x => x.WorkoutSetId,
                        principalTable: "WorkoutSets",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Exercises_Name",
                table: "Exercises",
                column: "Name",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_NutritionLogs_UserId",
                table: "NutritionLogs",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_NutritionLogs_WorkoutId",
                table: "NutritionLogs",
                column: "WorkoutId");

            migrationBuilder.CreateIndex(
                name: "IX_PersonalRecords_ExerciseId",
                table: "PersonalRecords",
                column: "ExerciseId");

            migrationBuilder.CreateIndex(
                name: "IX_PersonalRecords_UserId",
                table: "PersonalRecords",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_PersonalRecords_WorkoutSetId",
                table: "PersonalRecords",
                column: "WorkoutSetId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_SplitExercises_ExerciseId",
                table: "SplitExercises",
                column: "ExerciseId");

            migrationBuilder.CreateIndex(
                name: "IX_SplitExercises_SplitId",
                table: "SplitExercises",
                column: "SplitId");

            migrationBuilder.CreateIndex(
                name: "IX_Splits_UserId",
                table: "Splits",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_Users_Email",
                table: "Users",
                column: "Email",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_WorkoutGoals_AchievedInWorkoutId",
                table: "WorkoutGoals",
                column: "AchievedInWorkoutId");

            migrationBuilder.CreateIndex(
                name: "IX_WorkoutGoals_TargetExerciseId",
                table: "WorkoutGoals",
                column: "TargetExerciseId");

            migrationBuilder.CreateIndex(
                name: "IX_WorkoutGoals_UserId_TargetExerciseId_Type",
                table: "WorkoutGoals",
                columns: new[] { "UserId", "TargetExerciseId", "Type" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_WorkoutGoals_WorkoutGoalId",
                table: "WorkoutGoals",
                column: "WorkoutGoalId");

            migrationBuilder.CreateIndex(
                name: "IX_Workouts_SplitId",
                table: "Workouts",
                column: "SplitId");

            migrationBuilder.CreateIndex(
                name: "IX_Workouts_UserId",
                table: "Workouts",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_WorkoutSets_ExerciseId",
                table: "WorkoutSets",
                column: "ExerciseId");

            migrationBuilder.CreateIndex(
                name: "IX_WorkoutSets_UserId",
                table: "WorkoutSets",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_WorkoutSets_WorkoutId_ExerciseId_SetNumber",
                table: "WorkoutSets",
                columns: new[] { "WorkoutId", "ExerciseId", "SetNumber" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "NutritionLogs");

            migrationBuilder.DropTable(
                name: "PersonalRecords");

            migrationBuilder.DropTable(
                name: "SplitExercises");

            migrationBuilder.DropTable(
                name: "WorkoutGoals");

            migrationBuilder.DropTable(
                name: "WorkoutSets");

            migrationBuilder.DropTable(
                name: "Exercises");

            migrationBuilder.DropTable(
                name: "Workouts");

            migrationBuilder.DropTable(
                name: "Splits");

            migrationBuilder.DropTable(
                name: "Users");
        }
    }
}
