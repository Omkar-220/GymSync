using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using GymTracker.Infrastructure.Data;
using GymTracker.Core.Entities;
using GymTracker.Core.DTOs;
using GymTracker.Core.Enums;

namespace GymTracker.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AchievementController : BaseApiController
    {
        private readonly ApplicationDbContext _context;

        public AchievementController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/achievement/user/{userId}
        [HttpGet("user/{userId}")]
        public async Task<ActionResult<IEnumerable<AchievementResponse>>> GetUserAchievements(int userId)
        {
            // Gather stats needed for all checks
            var workouts = await _context.Workouts
                .Where(w => w.UserId == userId && w.IsCompleted && !w.IsSkipped)
                .Select(w => w.WorkoutDate.Date)
                .ToListAsync();

            var totalWorkouts = workouts.Count;

            var totalVolume = await _context.WorkoutSets
                .Where(ws => ws.UserId == userId)
                .SumAsync(ws => (decimal?)ws.Weight * ws.Reps) ?? 0;

            var totalPRs = await _context.PersonalRecords
                .CountAsync(pr => pr.UserId == userId);

            // Streak calculation
            var distinctDates = workouts.Distinct().OrderByDescending(d => d).ToList();
            int streak = 0;
            var checkDate = DateTime.UtcNow.Date;
            if (!distinctDates.Contains(checkDate)) checkDate = checkDate.AddDays(-1);
            foreach (var date in distinctDates)
            {
                if (date == checkDate) { streak++; checkDate = checkDate.AddDays(-1); }
                else if (date < checkDate) break;
            }

            // Nutrition streak
            var nutritionDates = await _context.NutritionLogs
                .Where(n => n.UserId == userId)
                .Select(n => n.LogDate.Date)
                .Distinct()
                .OrderByDescending(d => d)
                .ToListAsync();

            int nutritionStreak = 0;
            var nCheck = DateTime.UtcNow.Date;
            if (!nutritionDates.Contains(nCheck)) nCheck = nCheck.AddDays(-1);
            foreach (var date in nutritionDates)
            {
                if (date == nCheck) { nutritionStreak++; nCheck = nCheck.AddDays(-1); }
                else if (date < nCheck) break;
            }

            // Determine which keys are earned
            var earned = new List<AchievementKey>();
            if (totalWorkouts >= 1)   earned.Add(AchievementKey.FirstWorkout);
            if (totalWorkouts >= 10)  earned.Add(AchievementKey.Workouts10);
            if (totalWorkouts >= 50)  earned.Add(AchievementKey.Workouts50);
            if (totalWorkouts >= 100) earned.Add(AchievementKey.Workouts100);
            if (streak >= 7)          earned.Add(AchievementKey.Streak7);
            if (streak >= 30)         earned.Add(AchievementKey.Streak30);
            if (totalVolume >= 1_000)   earned.Add(AchievementKey.Volume1K);
            if (totalVolume >= 10_000)  earned.Add(AchievementKey.Volume10K);
            if (totalVolume >= 100_000) earned.Add(AchievementKey.Volume100K);
            if (totalPRs >= 1)  earned.Add(AchievementKey.FirstPR);
            if (totalPRs >= 10) earned.Add(AchievementKey.PRs10);
            if (nutritionStreak >= 7) earned.Add(AchievementKey.NutritionStreak7);

            // Upsert newly earned achievements
            var existing = await _context.UserAchievements
                .Where(a => a.UserId == userId)
                .ToListAsync();

            var existingKeys = existing.Select(a => a.Key).ToHashSet();
            var newOnes = earned.Where(k => !existingKeys.Contains(k)).ToList();

            if (newOnes.Any())
            {
                _context.UserAchievements.AddRange(newOnes.Select(k => new UserAchievement
                {
                    UserId = userId,
                    Key = k,
                    AchievedAt = DateTime.UtcNow
                }));
                await _context.SaveChangesAsync();

                // Reload
                existing = await _context.UserAchievements
                    .Where(a => a.UserId == userId)
                    .ToListAsync();
            }

            var result = existing.Select(a => MapToResponse(a)).ToList();
            return Ok(result);
        }

        private static AchievementResponse MapToResponse(UserAchievement a) => a.Key switch
        {
            AchievementKey.FirstWorkout      => Build(a, "First Step",        "Completed your first workout",          "activity"),
            AchievementKey.Workouts10        => Build(a, "Getting Serious",   "Completed 10 workouts",                 "trending-up"),
            AchievementKey.Workouts50        => Build(a, "Dedicated",         "Completed 50 workouts",                 "shield"),
            AchievementKey.Workouts100       => Build(a, "Century Club",      "Completed 100 workouts",                "medal"),
            AchievementKey.Streak7           => Build(a, "Week Warrior",      "Maintained a 7-day streak",             "flame"),
            AchievementKey.Streak30          => Build(a, "Iron Discipline",   "Maintained a 30-day streak",            "zap"),
            AchievementKey.Volume1K          => Build(a, "1K Club",           "Lifted 1,000 kg total",                 "award"),
            AchievementKey.Volume10K         => Build(a, "10K Club",          "Lifted 10,000 kg total",                "award"),
            AchievementKey.Volume100K        => Build(a, "100K Club",         "Lifted 100,000 kg total",               "star"),
            AchievementKey.FirstPR           => Build(a, "First PR",          "Set your first personal record",        "star"),
            AchievementKey.PRs10             => Build(a, "PR Machine",        "Set 10 personal records",               "trophy"),
            AchievementKey.NutritionStreak7  => Build(a, "Nutrition Streak",  "Logged nutrition 7 days in a row",      "target"),
            _                                => Build(a, a.Key.ToString(),    "",                                      "award"),
        };

        private static AchievementResponse Build(UserAchievement a, string label, string desc, string icon) =>
            new AchievementResponse
            {
                Key = a.Key.ToString(),
                Label = label,
                Description = desc,
                IconHint = icon,
                AchievedAt = a.AchievedAt
            };
    }
}
