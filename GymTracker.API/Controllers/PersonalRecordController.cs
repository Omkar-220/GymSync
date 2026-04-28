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
    public class PersonalRecordController : BaseApiController
    {
        private readonly ApplicationDbContext _context;
        
        public PersonalRecordController(ApplicationDbContext context)
        {
            _context = context;
        }
        
        // GET: api/personalrecord/user/{userId}
        [HttpGet("user/{userId}")]
        public async Task<ActionResult<IEnumerable<PersonalRecordResponse>>> GetUserPRs(int userId)
        {
            var prs = await _context.PersonalRecords
                .Include(pr => pr.Exercise)
                .Include(pr => pr.WorkoutSet)
                    .ThenInclude(ws => ws.Workout)
                .Where(pr => pr.UserId == userId)
                .OrderByDescending(pr => pr.AchievedAt)
                .Select(pr => new PersonalRecordResponse
                {
                    Id = pr.Id,
                    UserId = pr.UserId,
                    Username = pr.User.Username,
                    ExerciseId = pr.ExerciseId,
                    ExerciseName = pr.Exercise.Name,
                    MuscleGroup = pr.Exercise.MuscleGroup,
                    Type = pr.Type,
                    TypeDisplayName = pr.Type.GetDisplayName(),
                    Value = pr.Value,
                    Reps = pr.Reps,
                    AchievedAt = pr.AchievedAt,
                    WorkoutId = pr.WorkoutSet.WorkoutId,
                    WorkoutDate = pr.WorkoutSet.Workout.WorkoutDate,
                    PreviousRecord = pr.PreviousRecord,
                    Improvement = pr.PreviousRecord.HasValue ? pr.Value - pr.PreviousRecord.Value : null
                })
                .ToListAsync();
            
            return Ok(prs);
        }
        
        // GET: api/personalrecord/user/{userId}/exercise/{exerciseId}
        [HttpGet("user/{userId}/exercise/{exerciseId}")]
        public async Task<ActionResult<IEnumerable<PersonalRecordResponse>>> GetExercisePRs(int userId, int exerciseId)
        {
            var prs = await _context.PersonalRecords
                .Include(pr => pr.Exercise)
                .Include(pr => pr.WorkoutSet)
                    .ThenInclude(ws => ws.Workout)
                .Where(pr => pr.UserId == userId && pr.ExerciseId == exerciseId)
                .OrderByDescending(pr => pr.AchievedAt)
                .Select(pr => new PersonalRecordResponse
                {
                    Id = pr.Id,
                    UserId = pr.UserId,
                    Username = pr.User.Username,
                    ExerciseId = pr.ExerciseId,
                    ExerciseName = pr.Exercise.Name,
                    MuscleGroup = pr.Exercise.MuscleGroup,
                    Type = pr.Type,
                    TypeDisplayName = pr.Type.GetDisplayName(),
                    Value = pr.Value,
                    Reps = pr.Reps,
                    AchievedAt = pr.AchievedAt,
                    WorkoutId = pr.WorkoutSet.WorkoutId,
                    WorkoutDate = pr.WorkoutSet.Workout.WorkoutDate,
                    PreviousRecord = pr.PreviousRecord,
                    Improvement = pr.PreviousRecord.HasValue ? pr.Value - pr.PreviousRecord.Value : null
                })
                .ToListAsync();
            
            return Ok(prs);
        }
        
        // GET: api/personalrecord/user/{userId}/latest
        [HttpGet("user/{userId}/latest")]
        public async Task<ActionResult<IEnumerable<PersonalRecordResponse>>> GetLatestPRs(int userId, [FromQuery] int limit = 5)
        {
            var prs = await _context.PersonalRecords
                .Include(pr => pr.Exercise)
                .Include(pr => pr.WorkoutSet)
                    .ThenInclude(ws => ws.Workout)
                .Where(pr => pr.UserId == userId)
                .OrderByDescending(pr => pr.AchievedAt)
                .Take(limit)
                .Select(pr => new PersonalRecordResponse
                {
                    Id = pr.Id,
                    UserId = pr.UserId,
                    Username = pr.User.Username,
                    ExerciseId = pr.ExerciseId,
                    ExerciseName = pr.Exercise.Name,
                    MuscleGroup = pr.Exercise.MuscleGroup,
                    Type = pr.Type,
                    TypeDisplayName = pr.Type.GetDisplayName(),
                    Value = pr.Value,
                    Reps = pr.Reps,
                    AchievedAt = pr.AchievedAt,
                    WorkoutId = pr.WorkoutSet.WorkoutId,
                    WorkoutDate = pr.WorkoutSet.Workout.WorkoutDate,
                    PreviousRecord = pr.PreviousRecord,
                    Improvement = pr.PreviousRecord.HasValue ? pr.Value - pr.PreviousRecord.Value : null
                })
                .ToListAsync();
            
            return Ok(prs);
        }
        
        // GET: api/personalrecord/user/{userId}/summary
        [HttpGet("user/{userId}/summary")]
        public async Task<IActionResult> GetPRSummary(int userId)
        {
            var prs = await _context.PersonalRecords
                .Include(pr => pr.Exercise)
                .Where(pr => pr.UserId == userId)
                .ToListAsync();
            
            var summary = new
            {
                TotalPRs = prs.Count,
                UniqueExercises = prs.Select(p => p.ExerciseId).Distinct().Count(),
                LastPRDate = prs.Max(p => (DateTime?)p.AchievedAt),
                MostImprovedExercise = prs
                    .Where(p => p.PreviousRecord.HasValue)
                    .OrderByDescending(p => p.Value - p.PreviousRecord.Value)
                    .Select(p => p.Exercise.Name)
                    .FirstOrDefault(),
                PRsByType = prs.GroupBy(p => p.Type)
                    .Select(g => new { Type = g.Key.GetDisplayName(), Count = g.Count() })
                    .ToList(),
                PRsByMonth = prs.GroupBy(p => new { p.AchievedAt.Year, p.AchievedAt.Month })
                    .OrderByDescending(g => g.Key.Year).ThenByDescending(g => g.Key.Month)
                    .Take(6)
                    .Select(g => new { Month = $"{g.Key.Year}-{g.Key.Month}", Count = g.Count() })
                    .ToList()
            };
            
            return Ok(summary);
        }
    }
}