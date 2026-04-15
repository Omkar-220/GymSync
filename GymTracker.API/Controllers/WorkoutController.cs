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
    public class WorkoutController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        
        public WorkoutController(ApplicationDbContext context)
        {
            _context = context;
        }
        
        
        
        
        [HttpPost("start")]
        public async Task<ActionResult<WorkoutResponse>> StartWorkout([FromBody] StartWorkoutRequest request)
        {
            
            var user = await _context.Users.FindAsync(request.UserId);
            if (user == null)
                return NotFound($"User with ID {request.UserId} not found");
            
            // Check if there's an active workout already for today
            var existingWorkout = await _context.Workouts
                .FirstOrDefaultAsync(w => w.UserId == request.UserId && w.WorkoutDate.Date == DateTime.UtcNow.Date && !w.IsCompleted);
            
            if (existingWorkout != null && !request.AllowDuplicate)
                return BadRequest($"You already have an active workout today. Workout ID: {existingWorkout.Id}");
            
            // Get the split for the requested day
            var split = await _context.Splits
                .Include(s => s.SplitExercises)
                    .ThenInclude(se => se.Exercise)
                .FirstOrDefaultAsync(s => s.UserId == request.UserId && s.DayOfWeek == request.Day && s.IsActive);
            
            if (split == null)
                return BadRequest($"No active split found for {request.Day}. Please create a split for this day first.");
            
            // Create new workout
            var workout = new Workout
            {
                UserId = request.UserId,
                WorkoutDate = DateTime.UtcNow,
                SplitId = split.Id,
                CreatedAt = DateTime.UtcNow,
                IsCompleted = false
            };
            
            _context.Workouts.Add(workout);
             await _context.SaveChangesAsync();
            
            // Prepare response
            var response = new WorkoutResponse
            {
                Id = workout.Id,
                WorkoutDate = workout.WorkoutDate,
                UserId = workout.UserId,
                Username = user.Username,
                SplitId = workout.SplitId,
                SplitTag = split.Tag,
                TrainingStyle = split.TrainingStyle,
                TotalSets = 0,
                TotalVolume = 0,
                PersonalRecordsCount = 0,
                DurationMinutes = 0,
                IsCompleted = false,
                Sets = new List<WorkoutSetResponse>()
            };
            
            return Ok(response);
        }
        
        // POST: api/workout/{workoutId}/log-set
        [HttpPost("{workoutId}/log-set")]
        public async Task<ActionResult<WorkoutSetResponse>> LogSet(int workoutId, [FromBody] LogSetRequest request)
        {
            // Check if workout exists and is not completed
            var workout = await _context.Workouts
                .Include(w => w.WorkoutSets)
                .Include(w => w.Split)
                .FirstOrDefaultAsync(w => w.Id == workoutId);
            
            if (workout == null)
                return NotFound($"Workout with ID {workoutId} not found");
            
            if (workout.IsCompleted)
                return BadRequest("Cannot log sets to a completed workout");
            
            // Check if exercise exists
            var exercise = await _context.Exercises.FindAsync(request.ExerciseId);
            if (exercise == null)
                return NotFound($"Exercise with ID {request.ExerciseId} not found");
            
            // Check if set number already exists
            var existingSet = await _context.WorkoutSets
                .FirstOrDefaultAsync(ws => ws.WorkoutId == workoutId && ws.ExerciseId == request.ExerciseId && ws.SetNumber == request.SetNumber);
            
            if (existingSet != null)
                return BadRequest($"Set {request.SetNumber} for this exercise already logged. Use update endpoint to modify.");
            
            // Create workout set
            var workoutSet = new WorkoutSet
            {
                WorkoutId = workoutId,
                ExerciseId = request.ExerciseId,
                UserId = workout.UserId,
                SetNumber = request.SetNumber,
                Weight = request.Weight,
                Reps = request.Reps,
                FormQuality = request.FormQuality,
                RepsInReserve = request.RepsInReserve,
                PerceivedExertion = request.PerceivedExertion,
                CompletedAt = DateTime.UtcNow,
                IsCompleted = true
            };
            
            _context.WorkoutSets.Add(workoutSet);
            await _context.SaveChangesAsync();
            
            // Calculate estimated 1RM (Epley formula)
            var estimatedOneRepMax = request.Weight * (1 + (decimal)request.Reps / 30);
            
            // Check if this is a personal record
            bool isPersonalRecord = await CheckAndCreatePersonalRecord(workout.UserId, request.ExerciseId, request.Weight, request.Reps, workoutSet.Id);
            
            var response = new WorkoutSetResponse
            {
                Id = workoutSet.Id,
                SetNumber = workoutSet.SetNumber,
                Weight = workoutSet.Weight,
                Reps = workoutSet.Reps,
                ExerciseId = workoutSet.ExerciseId,
                ExerciseName = exercise.Name,
                MuscleGroup = exercise.MuscleGroup,
                FormQuality = workoutSet.FormQuality,
                PerceivedExertion = workoutSet.PerceivedExertion,
                EstimatedOneRepMax = estimatedOneRepMax,
                IsPersonalRecord = isPersonalRecord
            };
            
            return Ok(response);
        }
        
        // PUT: api/workout/set/{setId}
        [HttpPut("set/{setId}")]
        public async Task<IActionResult> UpdateSet(int setId, [FromBody] UpdateWorkoutSetRequest request)
        {
            var workoutSet = await _context.WorkoutSets
                .Include(ws => ws.Workout)
                .FirstOrDefaultAsync(ws => ws.Id == setId);
            
            if (workoutSet == null)
                return NotFound($"Workout set with ID {setId} not found");
            
            if (workoutSet.Workout.IsCompleted)
                return BadRequest("Cannot update sets in a completed workout");
            
            if (request.Weight.HasValue)
                workoutSet.Weight = request.Weight.Value;
            
            if (request.Reps.HasValue)
                workoutSet.Reps = request.Reps.Value;
            
            if (request.FormQuality.HasValue)
                workoutSet.FormQuality = request.FormQuality.Value;
            
            if (request.RepsInReserve.HasValue)
                workoutSet.RepsInReserve = request.RepsInReserve.Value;
            
            if (request.PerceivedExertion.HasValue)
                workoutSet.PerceivedExertion = request.PerceivedExertion.Value;
            
            if (request.IsCompleted.HasValue)
                workoutSet.IsCompleted = request.IsCompleted.Value;
            
            await _context.SaveChangesAsync();
            
            return NoContent();
        }
        
        // POST: api/workout/{workoutId}/complete
        [HttpPost("{workoutId}/complete")]
        public async Task<ActionResult<WorkoutResponse>> CompleteWorkout(int workoutId, [FromBody] CompleteWorkoutRequest request)
        {
            var workout = await _context.Workouts
                .Include(w => w.WorkoutSets)
                .ThenInclude(ws => ws.Exercise)
                .Include(w => w.Split)
                .Include(w => w.User)
                .FirstOrDefaultAsync(w => w.Id == workoutId);
            
            if (workout == null)
                return NotFound($"Workout with ID {workoutId} not found");
            
            if (workout.IsCompleted)
                return BadRequest("Workout already completed");
            
            // Update workout details
            workout.DurationMinutes = request.DurationMinutes;
            workout.Rating = request.Rating;
            workout.Notes = request.Notes;
            workout.IsCompleted = true;
            workout.IsSkipped = request.IsSkipped;
            workout.CompletedAt = DateTime.UtcNow;
            
            await _context.SaveChangesAsync();
            
            // Calculate workout statistics
            var totalSets = workout.WorkoutSets.Count;
            var totalReps = workout.WorkoutSets.Sum(ws => ws.Reps);
            var totalVolume = workout.WorkoutSets.Sum(ws => ws.Weight * ws.Reps);
            var personalRecordsCount = await _context.PersonalRecords
                .CountAsync(pr => pr.WorkoutSetId != null && pr.WorkoutSet!.WorkoutId == workoutId);
            
            var response = new WorkoutResponse
            {
                Id = workout.Id,
                WorkoutDate = workout.WorkoutDate,
                UserId = workout.UserId,
                Username = workout.User.Username,
                SplitId = workout.SplitId,
                SplitTag = workout.Split?.Tag ?? "No Split",
                TrainingStyle = workout.Split?.TrainingStyle ?? TrainingStyle.Hypertrophy,
                TotalSets = totalSets,
                TotalVolume = totalVolume,
                PersonalRecordsCount = personalRecordsCount,
                DurationMinutes = workout.DurationMinutes ?? 0,
                Rating = workout.Rating,
                Notes = workout.Notes,
                IsCompleted = workout.IsCompleted,
                Sets = workout.WorkoutSets.OrderBy(ws => ws.ExerciseId).ThenBy(ws => ws.SetNumber)
                    .Select(ws => new WorkoutSetResponse
                    {
                        Id = ws.Id,
                        SetNumber = ws.SetNumber,
                        Weight = ws.Weight,
                        Reps = ws.Reps,
                        ExerciseId = ws.ExerciseId,
                        ExerciseName = ws.Exercise.Name,
                        MuscleGroup = ws.Exercise.MuscleGroup,
                        FormQuality = ws.FormQuality,
                        PerceivedExertion = ws.PerceivedExertion,
                        EstimatedOneRepMax = ws.Weight * (1 + (decimal)ws.Reps / 30),
                        IsPersonalRecord = false
                    }).ToList()
            };
            
            return Ok(response);
        }
        
        // ========== GET WORKOUTS ==========
        
        // GET: api/workout/user/{userId}
        [HttpGet("user/{userId}")]
        public async Task<ActionResult<IEnumerable<WorkoutListResponse>>> GetUserWorkouts(int userId)
        {
            var workouts = await _context.Workouts
                .Include(w => w.WorkoutSets)
                .Include(w => w.Split)
                .Where(w => w.UserId == userId)
                .OrderByDescending(w => w.WorkoutDate)
                .Select(w => new WorkoutListResponse
                {
                    Id = w.Id,
                    WorkoutDate = w.WorkoutDate,
                    SplitTag = w.Split != null ? w.Split.Tag : "No Split",
                    TotalSets = w.WorkoutSets.Count,
                    TotalVolume = w.WorkoutSets.Sum(ws => (decimal?)ws.Weight * ws.Reps) ?? 0,
                    PersonalRecordsCount = _context.PersonalRecords.Count(pr => pr.WorkoutSetId != null && pr.WorkoutSet!.WorkoutId == w.Id),
                    DurationMinutes = w.DurationMinutes ?? 0,
                    IsCompleted = w.IsCompleted,
                    IsSkipped = w.IsSkipped
                })
                .ToListAsync();
            
            return Ok(workouts);
        }
        
        // GET: api/workout/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<WorkoutResponse>> GetWorkout(int id)
        {
            var workout = await _context.Workouts
                .Include(w => w.WorkoutSets)
                    .ThenInclude(ws => ws.Exercise)
                .Include(w => w.Split)
                .Include(w => w.User)
                .FirstOrDefaultAsync(w => w.Id == id);
            
            if (workout == null)
                return NotFound($"Workout with ID {id} not found");
            
            var totalVolume = workout.WorkoutSets.Sum(ws => ws.Weight * ws.Reps);
            var personalRecordsCount = await _context.PersonalRecords
                .CountAsync(pr => pr.WorkoutSetId != null && pr.WorkoutSet!.WorkoutId == id);
            
            var response = new WorkoutResponse
            {
                Id = workout.Id,
                WorkoutDate = workout.WorkoutDate,
                UserId = workout.UserId,
                Username = workout.User.Username,
                SplitId = workout.SplitId,
                SplitTag = workout.Split?.Tag ?? "No Split",
                TrainingStyle = workout.Split?.TrainingStyle ?? TrainingStyle.Hypertrophy,
                TotalSets = workout.WorkoutSets.Count,
                TotalVolume = totalVolume,
                PersonalRecordsCount = personalRecordsCount,
                DurationMinutes = workout.DurationMinutes ?? 0,
                Rating = workout.Rating,
                Notes = workout.Notes,
                IsCompleted = workout.IsCompleted,
                Sets = workout.WorkoutSets.OrderBy(ws => ws.ExerciseId).ThenBy(ws => ws.SetNumber)
                    .Select(ws => new WorkoutSetResponse
                    {
                        Id = ws.Id,
                        SetNumber = ws.SetNumber,
                        Weight = ws.Weight,
                        Reps = ws.Reps,
                        ExerciseId = ws.ExerciseId,
                        ExerciseName = ws.Exercise.Name,
                        MuscleGroup = ws.Exercise.MuscleGroup,
                        FormQuality = ws.FormQuality,
                        PerceivedExertion = ws.PerceivedExertion,
                        EstimatedOneRepMax = ws.Weight * (1 + (decimal)ws.Reps / 30),
                        IsPersonalRecord = false
                    }).ToList()
            };
            
            return Ok(response);
        }
        
        // GET: api/workout/progress/{userId}/{exerciseId}
        [HttpGet("progress/{userId}/{exerciseId}")]
        public async Task<ActionResult<WorkoutProgressResponse>> GetProgress(int userId, int exerciseId, [FromQuery] DateTime? fromDate = null)
        {
            var exercise = await _context.Exercises.FindAsync(exerciseId);
            if (exercise == null)
                return NotFound($"Exercise with ID {exerciseId} not found");
            
            var query = _context.WorkoutSets
                .Include(ws => ws.Workout)
                .Where(ws => ws.Workout.UserId == userId && ws.ExerciseId == exerciseId && ws.IsCompleted);
            
            if (fromDate.HasValue)
                query = query.Where(ws => ws.Workout.WorkoutDate >= fromDate.Value);
            
            var progressData = await query
                .OrderBy(ws => ws.Workout.WorkoutDate)
                .GroupBy(ws => ws.Workout.WorkoutDate.Date)
                .Select(g => new DailyProgressResponse
                {
                    Date = g.Key,
                    MaxWeight = g.Max(ws => ws.Weight),
                    TotalVolume = g.Sum(ws => ws.Weight * ws.Reps),
                    SetsCompleted = g.Count(),
                    BestSet = g.OrderByDescending(ws => ws.Weight).FirstOrDefault() != null
                        ? new WorkoutSetSummaryDto
                        {
                            Id = g.OrderByDescending(ws => ws.Weight).First().Id,
                            SetNumber = g.OrderByDescending(ws => ws.Weight).First().SetNumber,
                            Weight = g.OrderByDescending(ws => ws.Weight).First().Weight,
                            Reps = g.OrderByDescending(ws => ws.Weight).First().Reps,
                            FormQuality = g.OrderByDescending(ws => ws.Weight).First().FormQuality
                        }
                        : null
                })
                .ToListAsync();
            
            var response = new WorkoutProgressResponse
            {
                ExerciseId = exerciseId,
                ExerciseName = exercise.Name,
                ProgressData = progressData
            };
            
            return Ok(response);
        }
        
        // GET: api/workout/latest/{userId}
        [HttpGet("latest/{userId}")]
        public async Task<ActionResult<WorkoutResponse>> GetLatestWorkout(int userId)
        {
            var workout = await _context.Workouts
                .Include(w => w.WorkoutSets)
                    .ThenInclude(ws => ws.Exercise)
                .Include(w => w.Split)
                .Include(w => w.User)
                .Where(w => w.UserId == userId)
                .OrderByDescending(w => w.WorkoutDate)
                .FirstOrDefaultAsync();
            
            if (workout == null)
                return NotFound($"No workouts found for user {userId}");
            
            return await GetWorkout(workout.Id);
        }
        
        // GET: api/workout/current/{userId}
        [HttpGet("current/{userId}")]
        public async Task<ActionResult<WorkoutResponse>> GetCurrentWorkout(int userId)
        {
            var workout = await _context.Workouts
                .Include(w => w.WorkoutSets)
                    .ThenInclude(ws => ws.Exercise)
                .Include(w => w.Split)
                .Include(w => w.User)
                .FirstOrDefaultAsync(w => w.UserId == userId && !w.IsCompleted);
            
            if (workout == null)
                return NotFound($"No active workout for user {userId}");
            
            return await GetWorkout(workout.Id);
        }
        
        // ========== PRIVATE HELPER METHODS ==========
        
        private async Task<bool> CheckAndCreatePersonalRecord(int userId, int exerciseId, decimal weight, int reps, int workoutSetId)
        {
            var estimatedOneRepMax = weight * (1 + (decimal)reps / 30);
            bool isRecord = false;
            
            // Check for 1RM record
            var existingOneRepMax = await _context.PersonalRecords
                .FirstOrDefaultAsync(pr => pr.UserId == userId && pr.ExerciseId == exerciseId && pr.Type == PRType.OneRepMax);
            
            if (existingOneRepMax == null || estimatedOneRepMax > existingOneRepMax.Value)
            {
                var previousValue = existingOneRepMax?.Value;
                _context.PersonalRecords.Add(new PersonalRecord
                {
                    UserId = userId,
                    ExerciseId = exerciseId,
                    Type = PRType.OneRepMax,
                    Value = estimatedOneRepMax,
                    Reps = 1,
                    AchievedAt = DateTime.UtcNow,
                    WorkoutSetId = workoutSetId,
                    PreviousRecord = previousValue
                });
                isRecord = true;
            }
            
            if (reps == 5)
            {
                var existingFiveRepMax = await _context.PersonalRecords
                    .FirstOrDefaultAsync(pr => pr.UserId == userId && pr.ExerciseId == exerciseId && pr.Type == PRType.FiveRepMax);
                
                if (existingFiveRepMax == null || weight > existingFiveRepMax.Value)
                {
                    var previousValue = existingFiveRepMax?.Value;
                    _context.PersonalRecords.Add(new PersonalRecord
                    {
                        UserId = userId,
                        ExerciseId = exerciseId,
                        Type = PRType.FiveRepMax,
                        Value = weight,
                        Reps = 5,
                        AchievedAt = DateTime.UtcNow,
                        WorkoutSetId = workoutSetId,
                        PreviousRecord = previousValue
                    });
                    isRecord = true;
                }
            }
            else if (reps == 10)
            {
                var existingTenRepMax = await _context.PersonalRecords
                    .FirstOrDefaultAsync(pr => pr.UserId == userId && pr.ExerciseId == exerciseId && pr.Type == PRType.TenRepMax);
                
                if (existingTenRepMax == null || weight > existingTenRepMax.Value)
                {
                    var previousValue = existingTenRepMax?.Value;
                    _context.PersonalRecords.Add(new PersonalRecord
                    {
                        UserId = userId,
                        ExerciseId = exerciseId,
                        Type = PRType.TenRepMax,
                        Value = weight,
                        Reps = 10,
                        AchievedAt = DateTime.UtcNow,
                        WorkoutSetId = workoutSetId,
                        PreviousRecord = previousValue
                    });
                    isRecord = true;
                }
            }
            
            await _context.SaveChangesAsync();
            return isRecord;
        }
    }
}