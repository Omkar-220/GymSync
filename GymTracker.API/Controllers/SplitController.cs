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
    public class SplitController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        
        public SplitController(ApplicationDbContext context)
        {
            _context = context;
        }
        
        
        
        // GET: api/split
        [HttpGet]
        public async Task<ActionResult<IEnumerable<SplitResponse>>> GetAllSplits()
        {
            var splits = await _context.Splits
                .Include(s => s.SplitExercises)
                    .ThenInclude(se => se.Exercise)
                .Where(s => s.IsActive)
                .Select(s => new SplitResponse
                {
                    Id = s.Id,
                    DayOfWeek = s.DayOfWeek,
                    Tag = s.Tag,
                    TrainingStyle = s.TrainingStyle,
                    IsActive = s.IsActive,
                    Exercises = s.SplitExercises
                        .OrderBy(se => se.Order)
                        .Select(se => new SplitExerciseResponse
                        {
                            Id = se.Id,
                            ExerciseId = se.ExerciseId,
                            ExerciseName = se.Exercise.Name,
                            MuscleGroup = se.Exercise.MuscleGroup,
                            Order = se.Order,
                            DefaultSets = se.DefaultSets
                        }).ToList()
                })
                .ToListAsync();
            
            return Ok(splits);
        }
        
        // GET: api/split/user/{userId}
        [HttpGet("user/{userId}")]
        public async Task<ActionResult<IEnumerable<SplitResponse>>> GetUserSplits(int userId)
        {
            var userExists = await _context.Users.AnyAsync(u => u.Id == userId);
            if (!userExists)
                return NotFound($"User with ID {userId} not found");
            
            var splits = await _context.Splits
                .Include(s => s.SplitExercises)
                    .ThenInclude(se => se.Exercise)
                .Where(s => s.UserId == userId && s.IsActive)
                .Select(s => new SplitResponse
                {
                    Id = s.Id,
                    DayOfWeek = s.DayOfWeek,
                    Tag = s.Tag,
                    TrainingStyle = s.TrainingStyle,
                    IsActive = s.IsActive,
                    Exercises = s.SplitExercises
                        .OrderBy(se => se.Order)
                        .Select(se => new SplitExerciseResponse
                        {
                            Id = se.Id,
                            ExerciseId = se.ExerciseId,
                            ExerciseName = se.Exercise.Name,
                            MuscleGroup = se.Exercise.MuscleGroup,
                            Order = se.Order,
                            DefaultSets = se.DefaultSets
                        }).ToList()
                })
                .ToListAsync();
            
            return Ok(splits);
        }
        
        // GET: api/split/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<SplitResponse>> GetSplitById(int id)
        {
            var split = await _context.Splits
                .Include(s => s.SplitExercises)
                    .ThenInclude(se => se.Exercise)
                .FirstOrDefaultAsync(s => s.Id == id);
            
            if (split == null)
                return NotFound($"Split with ID {id} not found");
            
            var response = new SplitResponse
            {
                Id = split.Id,
                DayOfWeek = split.DayOfWeek,
                Tag = split.Tag,
                TrainingStyle = split.TrainingStyle,
                IsActive = split.IsActive,
                Exercises = split.SplitExercises
                    .OrderBy(se => se.Order)
                    .Select(se => new SplitExerciseResponse
                    {
                        Id = se.Id,
                        ExerciseId = se.ExerciseId,
                        ExerciseName = se.Exercise.Name,
                        MuscleGroup = se.Exercise.MuscleGroup,
                        Order = se.Order,
                        DefaultSets = se.DefaultSets
                    }).ToList()
            };
            
            return Ok(response);
        }
        
        // POST: api/split
        [HttpPost]

        public async Task<ActionResult<SplitResponse>> CreateSplit([FromBody] CreateSplitRequest request)
        {
            // Check if user exists
            var userExists = await _context.Users.AnyAsync(u => u.Id == request.UserId);
            if (!userExists)
                return BadRequest($"User with ID {request.UserId} not found");
            
            // Check if split already exists for this day
            var existingSplit = await _context.Splits
                .FirstOrDefaultAsync(s => s.UserId == request.UserId && s.DayOfWeek == request.DayOfWeek && s.IsActive);
            
            if (existingSplit != null)
                return BadRequest($"A split already exists for {request.DayOfWeek}. Please update the existing split instead.");
            
            var split = new Split
            {
                UserId = request.UserId,
                DayOfWeek = request.DayOfWeek,
                Tag = request.Tag,
                TrainingStyle = request.TrainingStyle,
                IsActive = true
            };
            
            _context.Splits.Add(split);
            await _context.SaveChangesAsync();
            
            var response = new SplitResponse
            {
                Id = split.Id,
                DayOfWeek = split.DayOfWeek,
                Tag = split.Tag,
                TrainingStyle = split.TrainingStyle,
                IsActive = split.IsActive,
                Exercises = new List<SplitExerciseResponse>()
            };
            
            return CreatedAtAction(nameof(GetSplitById), new { id = split.Id }, response);
        }
        
        // PUT: api/split/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateSplit(int id, [FromBody] UpdateSplitRequest request)
        {
            var split = await _context.Splits.FindAsync(id);
            
            if (split == null)
                return NotFound($"Split with ID {id} not found");
            
            if (!string.IsNullOrEmpty(request.Tag))
                split.Tag = request.Tag;
            
            if (request.TrainingStyle.HasValue)
                split.TrainingStyle = request.TrainingStyle.Value;
            
            if (request.IsActive.HasValue)
                split.IsActive = request.IsActive.Value;
            
            await _context.SaveChangesAsync();
            
            return NoContent();
        }
        
        // DELETE: api/split/{id} (soft delete)
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteSplit(int id)
        {
            var split = await _context.Splits.FindAsync(id);
            
            if (split == null)
                return NotFound($"Split with ID {id} not found");
            
            split.IsActive = false;
            await _context.SaveChangesAsync();
            
            return NoContent();
        }
        
        // ========== SPLIT EXERCISE MANAGEMENT ==========
        
        // POST: api/split/{splitId}/exercises
        [HttpPost("{splitId}/exercises")]
        public async Task<ActionResult<SplitExerciseResponse>> AddExerciseToSplit(
            int splitId, 
            [FromBody] AddExerciseToSplitRequest request)
        {
            // Check if split exists
            var split = await _context.Splits
                .Include(s => s.SplitExercises)
                .FirstOrDefaultAsync(s => s.Id == splitId && s.IsActive);
            
            if (split == null)
                return NotFound($"Split with ID {splitId} not found");
            
            // Check if exercise exists
            var exercise = await _context.Exercises
                .FirstOrDefaultAsync(e => e.Id == request.ExerciseId && e.IsActive);
            
            if (exercise == null)
                return NotFound($"Exercise with ID {request.ExerciseId} not found");
            
            // Check if exercise already exists in this split
            var existing = await _context.SplitExercises
                .FirstOrDefaultAsync(se => se.SplitId == splitId && se.ExerciseId == request.ExerciseId);
            
            if (existing != null)
                return BadRequest($"Exercise '{exercise.Name}' already exists in this split");
            
            // Check if order is valid
            var maxOrder = split.SplitExercises.Any() ? split.SplitExercises.Max(se => se.Order) : 0;
            if (request.Order > maxOrder + 1)
                return BadRequest($"Order should be between 1 and {maxOrder + 1}");
            
            var splitExercise = new SplitExercise
            {
                SplitId = splitId,
                ExerciseId = request.ExerciseId,
                Order = request.Order,
                DefaultSets = request.DefaultSets ?? 3 // Default to 3 sets if not specified
            };
            
            _context.SplitExercises.Add(splitExercise);
            await _context.SaveChangesAsync();
            
            var response = new SplitExerciseResponse
            {
                Id = splitExercise.Id,
                ExerciseId = splitExercise.ExerciseId,
                ExerciseName = exercise.Name,
                MuscleGroup = exercise.MuscleGroup,
                Order = splitExercise.Order,
                DefaultSets = splitExercise.DefaultSets
            };
            
            return CreatedAtAction(nameof(GetSplitById), new { id = splitId }, response);
        }
        
        // PUT: api/split/{splitId}/exercises/{splitExerciseId}
        [HttpPut("{splitId}/exercises/{splitExerciseId}")]
        public async Task<IActionResult> UpdateSplitExercise(
            int splitId, 
            int splitExerciseId, 
            [FromBody] UpdateSplitExerciseRequest request)
        {
            var splitExercise = await _context.SplitExercises
                .Include(se => se.Split)
                .FirstOrDefaultAsync(se => se.Id == splitExerciseId && se.SplitId == splitId);
            
            if (splitExercise == null)
                return NotFound($"Split exercise with ID {splitExerciseId} not found");
            
            if (request.Order.HasValue)
                splitExercise.Order = request.Order.Value;
            
            if (request.DefaultSets.HasValue)
                splitExercise.DefaultSets = request.DefaultSets.Value;
            
            if (request.IsActive.HasValue)
                splitExercise.IsActive = request.IsActive.Value;
            
            await _context.SaveChangesAsync();
            
            return NoContent();
        }
        
        // DELETE: api/split/{splitId}/exercises/{splitExerciseId}
        [HttpDelete("{splitId}/exercises/{splitExerciseId}")]
        public async Task<IActionResult> RemoveExerciseFromSplit(int splitId, int splitExerciseId)
        {
            var splitExercise = await _context.SplitExercises
                .FirstOrDefaultAsync(se => se.Id == splitExerciseId && se.SplitId == splitId);
            
            if (splitExercise == null)
                return NotFound($"Split exercise with ID {splitExerciseId} not found");
            
            _context.SplitExercises.Remove(splitExercise);
            await _context.SaveChangesAsync();
            
            return NoContent();
        }
        
        // PUT: api/split/{splitId}/exercises/reorder
        [HttpPut("{splitId}/exercises/reorder")]
        public async Task<IActionResult> ReorderExercises(
            int splitId, 
            [FromBody] ReorderSplitExercisesRequest request)
        {
            var split = await _context.Splits
                .Include(s => s.SplitExercises)
                .FirstOrDefaultAsync(s => s.Id == splitId);
            
            if (split == null)
                return NotFound($"Split with ID {splitId} not found");
            
            foreach (var update in request.ExerciseOrders)
            {
                var splitExercise = split.SplitExercises
                    .FirstOrDefault(se => se.Id == update.SplitExerciseId);
                
                if (splitExercise != null)
                {
                    splitExercise.Order = update.NewOrder;
                }
            }
            
            await _context.SaveChangesAsync();
            
            return NoContent();
        }
        
        // POST: api/split/{splitId}/exercises/bulk
        [HttpPost("{splitId}/exercises/bulk")]
        public async Task<IActionResult> BulkAddExercises(
            int splitId, 
            [FromBody] BulkAddExercisesToSplitRequest request)
        {
            var split = await _context.Splits
                .FirstOrDefaultAsync(s => s.Id == splitId && s.IsActive);
            
            if (split == null)
                return NotFound($"Split with ID {splitId} not found");
            
            var addedExercises = new List<SplitExerciseResponse>();
            
            foreach (var exerciseRequest in request.Exercises)
            {
                var exercise = await _context.Exercises
                    .FirstOrDefaultAsync(e => e.Id == exerciseRequest.ExerciseId && e.IsActive);
                
                if (exercise == null)
                    continue;
                
                var splitExercise = new SplitExercise
                {
                    SplitId = splitId,
                    ExerciseId = exerciseRequest.ExerciseId,
                    Order = exerciseRequest.Order,
                    DefaultSets = exerciseRequest.DefaultSets ?? 3
                };
                
                _context.SplitExercises.Add(splitExercise);
                
                addedExercises.Add(new SplitExerciseResponse
                {
                    ExerciseId = exercise.Id,
                    ExerciseName = exercise.Name,
                    MuscleGroup = exercise.MuscleGroup,
                    Order = exerciseRequest.Order,
                    DefaultSets = exerciseRequest.DefaultSets
                });
            }
            
            await _context.SaveChangesAsync();
            
            return Ok(new { Added = addedExercises.Count, Exercises = addedExercises });
        }
        
        // GET: api/split/{splitId}/exercises/{exerciseId}/recommendations
        [HttpGet("{splitId}/exercises/{exerciseId}/recommendations")]
        public async Task<IActionResult> GetExerciseRecommendations(int splitId, int exerciseId)
        {
            var split = await _context.Splits
                .Include(s => s.SplitExercises)
                .FirstOrDefaultAsync(s => s.Id == splitId);
            
            if (split == null)
                return NotFound($"Split with ID {splitId} not found");
            
            var exercise = await _context.Exercises.FindAsync(exerciseId);
            if (exercise == null)
                return NotFound($"Exercise with ID {exerciseId} not found");
            
            var recommendedReps = split.TrainingStyle switch
            {
                TrainingStyle.PowerLifting => 5,
                TrainingStyle.Hypertrophy => 8,
                TrainingStyle.Endurance => 12,
                _ => 8
            };
            
            var recommendation = new
            {
                ExerciseName = exercise.Name,
                TrainingStyle = split.TrainingStyle.ToString(),
                RecommendedReps = recommendedReps,
                RecommendedRepRange = split.TrainingStyle switch
                {
                    TrainingStyle.PowerLifting => "1-5 reps",
                    TrainingStyle.Hypertrophy => "6-12 reps",
                    TrainingStyle.Endurance => "12-20 reps",
                    _ => "8-12 reps"
                },
                RecommendedRestTime = split.TrainingStyle switch
                {
                    TrainingStyle.PowerLifting => "2-3 minutes",
                    TrainingStyle.Hypertrophy => "60-90 seconds",
                    TrainingStyle.Endurance => "30-60 seconds",
                    _ => "60-90 seconds"
                },
                Notes = "These are general recommendations. Adjust based on your individual recovery and goals."
            };
            
            return Ok(recommendation);
        }
    }
}