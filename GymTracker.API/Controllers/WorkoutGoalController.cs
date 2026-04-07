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
    public class WorkoutGoalController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        
        public WorkoutGoalController(ApplicationDbContext context)
        {
            _context = context;
        }
        
        // GET: api/workoutgoal/user/{userId}
        [HttpGet("user/{userId}")]
        public async Task<ActionResult<IEnumerable<WorkoutGoalResponse>>> GetUserGoals(int userId)
        {
            var goals = await _context.WorkoutGoals
                .Include(g => g.TargetExercise)
                .Include(g => g.AchievedInWorkout)
                .Where(g => g.UserId == userId)
                .OrderByDescending(g => g.TargetDate)
                .Select(g => new WorkoutGoalResponse
                {
                    Id = g.Id,
                    UserId = g.UserId,
                    Username = g.User.Username,
                    TargetExerciseId = g.TargetExerciseId,
                    ExerciseName = g.TargetExercise.Name,
                    Type = g.Type,
                    TypeDisplayName = g.Type.GetDisplayName(),
                    TargetValue = g.TargetValue,
                    TargetReps = g.TargetReps,
                    TargetDate = g.TargetDate,
                    IsAchieved = g.IsAchieved,
                    AchievedAt = g.AchievedAt,
                    AchievedInWorkoutId = g.AchievedInWorkoutId,
                    AchievedValue = g.AchievedValue,
                    AchievedReps = g.AchievedReps,
                    Notes = g.Notes,
                    CreatedAt = g.CreatedAt
                })
                .ToListAsync();
            
            // Calculate progress after retrieving from database
            foreach (var goal in goals)
            {
                goal.ProgressPercentage = await CalculateProgressAsync(goal, userId);
            }
            
            return Ok(goals);
        }
        
        // GET: api/workoutgoal/user/{userId}/active
        [HttpGet("user/{userId}/active")]
        public async Task<ActionResult<IEnumerable<WorkoutGoalResponse>>> GetActiveGoals(int userId)
        {
            var goals = await _context.WorkoutGoals
                .Include(g => g.TargetExercise)
                .Where(g => g.UserId == userId && !g.IsAchieved && g.TargetDate >= DateTime.UtcNow)
                .OrderBy(g => g.TargetDate)
                .Select(g => new WorkoutGoalResponse
                {
                    Id = g.Id,
                    UserId = g.UserId,
                    Username = g.User.Username,
                    TargetExerciseId = g.TargetExerciseId,
                    ExerciseName = g.TargetExercise.Name,
                    Type = g.Type,
                    TypeDisplayName = g.Type.GetDisplayName(),
                    TargetValue = g.TargetValue,
                    TargetReps = g.TargetReps,
                    TargetDate = g.TargetDate,
                    IsAchieved = g.IsAchieved,
                    AchievedAt = g.AchievedAt,
                    AchievedInWorkoutId = g.AchievedInWorkoutId,
                    AchievedValue = g.AchievedValue,
                    AchievedReps = g.AchievedReps,
                    Notes = g.Notes,
                    CreatedAt = g.CreatedAt
                })
                .ToListAsync();
            
            foreach (var goal in goals)
            {
                goal.ProgressPercentage = await CalculateProgressAsync(goal, userId);
            }
            
            return Ok(goals);
        }
        
        // GET: api/workoutgoal/user/{userId}/achieved
        [HttpGet("user/{userId}/achieved")]
        public async Task<ActionResult<IEnumerable<WorkoutGoalResponse>>> GetAchievedGoals(int userId)
        {
            var goals = await _context.WorkoutGoals
                .Include(g => g.TargetExercise)
                .Include(g => g.AchievedInWorkout)
                .Where(g => g.UserId == userId && g.IsAchieved)
                .OrderByDescending(g => g.AchievedAt)
                .Select(g => new WorkoutGoalResponse
                {
                    Id = g.Id,
                    UserId = g.UserId,
                    Username = g.User.Username,
                    TargetExerciseId = g.TargetExerciseId,
                    ExerciseName = g.TargetExercise.Name,
                    Type = g.Type,
                    TypeDisplayName = g.Type.GetDisplayName(),
                    TargetValue = g.TargetValue,
                    TargetReps = g.TargetReps,
                    TargetDate = g.TargetDate,
                    IsAchieved = g.IsAchieved,
                    AchievedAt = g.AchievedAt,
                    AchievedInWorkoutId = g.AchievedInWorkoutId,
                    AchievedValue = g.AchievedValue,
                    AchievedReps = g.AchievedReps,
                    Notes = g.Notes,
                    CreatedAt = g.CreatedAt,
                    ProgressPercentage = 100
                })
                .ToListAsync();
            
            return Ok(goals);
        }
        
        // POST: api/workoutgoal
        [HttpPost]
        public async Task<ActionResult<WorkoutGoalResponse>> CreateGoal([FromBody] CreateWorkoutGoalRequest request)
        {
            var user = await _context.Users.FindAsync(request.UserId);
            if (user == null)
                return NotFound($"User with ID {request.UserId} not found");
            
            var exercise = await _context.Exercises.FindAsync(request.TargetExerciseId);
            if (exercise == null)
                return NotFound($"Exercise with ID {request.TargetExerciseId} not found");
            
            var goal = new WorkoutGoal
            {
                UserId = request.UserId,
                TargetExerciseId = request.TargetExerciseId,
                Type = request.Type,
                TargetValue = request.TargetValue,
                TargetReps = request.TargetReps,
                TargetDate = request.TargetDate,
                Notes = request.Notes,
                CreatedAt = DateTime.UtcNow,
                IsAchieved = false
            };
            
            _context.WorkoutGoals.Add(goal);
            await _context.SaveChangesAsync();
            
            var response = new WorkoutGoalResponse
            {
                Id = goal.Id,
                UserId = goal.UserId,
                Username = user.Username,
                TargetExerciseId = goal.TargetExerciseId,
                ExerciseName = exercise.Name,
                Type = goal.Type,
                TypeDisplayName = goal.Type.GetDisplayName(),
                TargetValue = goal.TargetValue,
                TargetReps = goal.TargetReps,
                TargetDate = goal.TargetDate,
                IsAchieved = goal.IsAchieved,
                CreatedAt = goal.CreatedAt,
                ProgressPercentage = 0
            };
            
            return CreatedAtAction(nameof(GetUserGoals), new { userId = goal.UserId }, response);
        }
        
        // PUT: api/workoutgoal/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateGoal(int id, [FromBody] UpdateWorkoutGoalRequest request)
        {
            var goal = await _context.WorkoutGoals.FindAsync(id);
            
            if (goal == null)
                return NotFound($"Goal with ID {id} not found");
            
            if (request.TargetValue.HasValue)
                goal.TargetValue = request.TargetValue.Value;
            
            if (request.TargetReps.HasValue)
                goal.TargetReps = request.TargetReps.Value;
            
            if (request.TargetDate.HasValue)
                goal.TargetDate = request.TargetDate.Value;
            
            if (request.Notes != null)
                goal.Notes = request.Notes;
            
            await _context.SaveChangesAsync();
            
            return NoContent();
        }
        
        // DELETE: api/workoutgoal/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteGoal(int id)
        {
            var goal = await _context.WorkoutGoals.FindAsync(id);
            
            if (goal == null)
                return NotFound($"Goal with ID {id} not found");
            
            _context.WorkoutGoals.Remove(goal);
            await _context.SaveChangesAsync();
            
            return NoContent();
        }
        
        // POST: api/workoutgoal/check-achievements/{userId}
        [HttpPost("check-achievements/{userId}")]
        public async Task<IActionResult> CheckAndUpdateAchievements(int userId)
        {
            var activeGoals = await _context.WorkoutGoals
                .Include(g => g.TargetExercise)
                .Where(g => g.UserId == userId && !g.IsAchieved && g.TargetDate >= DateTime.UtcNow)
                .ToListAsync();
            
            var achievements = new List<object>();
            
            foreach (var goal in activeGoals)
            {
                var bestSet = await GetBestSetForGoal(goal, userId);
                
                if (bestSet != null && IsGoalAchieved(goal, bestSet))
                {
                    goal.IsAchieved = true;
                    goal.AchievedAt = DateTime.UtcNow;
                    goal.AchievedInWorkoutId = bestSet.WorkoutId;
                    goal.AchievedValue = bestSet.Weight;
                    goal.AchievedReps = bestSet.Reps;
                    
                    achievements.Add(new
                    {
                        goal.Id,
                        ExerciseName = goal.TargetExercise.Name,
                        goal.TargetValue,
                        goal.TargetReps,
                        AchievedValue = bestSet.Weight,
                        AchievedReps = bestSet.Reps
                    });
                }
            }
            
            await _context.SaveChangesAsync();
            
            return Ok(new { Achievements = achievements, Count = achievements.Count });
        }
        
        // ========== PRIVATE HELPER METHODS ==========
        
        private async Task<WorkoutSet?> GetBestSetForGoal(WorkoutGoal goal, int userId)
        {
            if (goal.TargetReps.HasValue)
            {
                return await _context.WorkoutSets
                    .Where(ws => ws.UserId == userId && 
                                 ws.ExerciseId == goal.TargetExerciseId && 
                                 ws.Reps >= goal.TargetReps.Value &&
                                 ws.IsCompleted)
                    .OrderByDescending(ws => ws.Weight)
                    .FirstOrDefaultAsync();
            }
            else
            {
                return await _context.WorkoutSets
                    .Where(ws => ws.UserId == userId && 
                                 ws.ExerciseId == goal.TargetExerciseId && 
                                 ws.IsCompleted)
                    .OrderByDescending(ws => ws.Weight)
                    .FirstOrDefaultAsync();
            }
        }
        
        private bool IsGoalAchieved(WorkoutGoal goal, WorkoutSet bestSet)
        {
            if (goal.TargetReps.HasValue)
            {
                return bestSet.Weight >= goal.TargetValue && bestSet.Reps >= goal.TargetReps.Value;
            }
            else
            {
                return bestSet.Weight >= goal.TargetValue;
            }
        }
        
        private async Task<decimal> CalculateProgressAsync(WorkoutGoalResponse goal, int userId)
        {
            if (goal.IsAchieved) return 100;
            
            var bestSet = await _context.WorkoutSets
                .Where(ws => ws.UserId == userId && 
                             ws.ExerciseId == goal.TargetExerciseId && 
                             ws.IsCompleted)
                .OrderByDescending(ws => ws.Weight)
                .FirstOrDefaultAsync();
            
            if (bestSet == null) return 0;
            
            if (goal.TargetReps.HasValue)
            {
                var bestSetAtReps = await _context.WorkoutSets
                    .Where(ws => ws.UserId == userId && 
                                 ws.ExerciseId == goal.TargetExerciseId && 
                                 ws.Reps >= goal.TargetReps.Value &&
                                 ws.IsCompleted)
                    .OrderByDescending(ws => ws.Weight)
                    .FirstOrDefaultAsync();
                
                if (bestSetAtReps == null) return 0;
                return Math.Min(100, (bestSetAtReps.Weight / goal.TargetValue) * 100);
            }
            else
            {
                return Math.Min(100, (bestSet.Weight / goal.TargetValue) * 100);
            }
        }
    }
}