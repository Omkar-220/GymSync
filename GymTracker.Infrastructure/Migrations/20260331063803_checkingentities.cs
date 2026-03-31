using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GymTracker.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class checkingentities : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "CompletedAt",
                table: "Workouts",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "DurationMinutes",
                table: "Workouts",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsCompleted",
                table: "Workouts",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "Notes",
                table: "Workouts",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "Rating",
                table: "Workouts",
                type: "int",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CompletedAt",
                table: "Workouts");

            migrationBuilder.DropColumn(
                name: "DurationMinutes",
                table: "Workouts");

            migrationBuilder.DropColumn(
                name: "IsCompleted",
                table: "Workouts");

            migrationBuilder.DropColumn(
                name: "Notes",
                table: "Workouts");

            migrationBuilder.DropColumn(
                name: "Rating",
                table: "Workouts");
        }
    }
}
