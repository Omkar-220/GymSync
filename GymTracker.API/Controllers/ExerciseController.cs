using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using GymTracker.Infrastructure.Data;
using GymTracker.Core.Entities;
using GymTracker.Core.DTOs;

namespace GymTracker.API.Controllers
{
    public class ExerciseController : BaseApiController
    {
        private readonly ApplicationDbContext _context;
        
        public ExerciseController(ApplicationDbContext context) 
        {
            _context = context;
        }
        
        // api/exercise
        [HttpGet]
        public async Task<ActionResult<IEnumerable<ExerciseResponse>>> GetExercises()
        {
            var exercises = await _context.Exercises
                .Where(e => e.IsActive)
                .Select(e => new ExerciseResponse
                {
                    Id = e.Id,
                    Name = e.Name,
                    MuscleGroup = e.MuscleGroup,
                    Equipment = e.Equipment,
                    IsActive = e.IsActive,
                    CreatedAt = e.CreatedAt,
                    DifficultyLevel = e.DifficultyLevel,
                    EstimatedCaloriesPerSet = e.EstimatedCaloriesPerSet,
                    MeasurementType = e.MeasurementType
                })
                .ToListAsync();
            
            return Ok(exercises);
        }
        
        //api/exercise/5
        [HttpGet("{id}")]
        public async Task<ActionResult<ExerciseResponse>> GetExercise(int id)
        {
            var exercise = await _context.Exercises.FindAsync(id);
            
            if (exercise == null)
                return NotFound();
            
            return Ok(new ExerciseResponse
            {
                Id = exercise.Id,
                Name = exercise.Name,
                MuscleGroup = exercise.MuscleGroup,
                Equipment = exercise.Equipment,
                IsActive = exercise.IsActive,
                CreatedAt = exercise.CreatedAt,
                DifficultyLevel = exercise.DifficultyLevel,
                EstimatedCaloriesPerSet = exercise.EstimatedCaloriesPerSet,
                MeasurementType = exercise.MeasurementType
            });
        }
        
        // api/exercise
        [HttpPost]
        public async Task<ActionResult<ExerciseResponse>> CreateExercise(CreateExerciseRequest request)
        {
            var exercise = new Exercise
            {
                Name = request.Name,
                MuscleGroup = request.MuscleGroup,
                Equipment = request.Equipment,
                DifficultyLevel = request.DifficultyLevel,
                EstimatedCaloriesPerSet = request.EstimatedCaloriesPerSet,
                MeasurementType = request.MeasurementType,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };
            
            _context.Exercises.Add(exercise);
            await _context.SaveChangesAsync();
            
            return CreatedAtAction(nameof(GetExercise), new { id = exercise.Id }, new ExerciseResponse
            {
                Id = exercise.Id,
                Name = exercise.Name,
                MuscleGroup = exercise.MuscleGroup,
                Equipment = exercise.Equipment,
                IsActive = exercise.IsActive,
                CreatedAt = exercise.CreatedAt,
                DifficultyLevel = exercise.DifficultyLevel,
                EstimatedCaloriesPerSet = exercise.EstimatedCaloriesPerSet,
                MeasurementType = exercise.MeasurementType
            });
        }
        
        //api/exercise/5
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateExercise(int id, UpdateExerciseRequest request)
        {
            var exercise = await _context.Exercises.FindAsync(id);
            
            if (exercise == null)
                return NotFound();
            
            if (!string.IsNullOrEmpty(request.Name))
                exercise.Name = request.Name;
            
            if (!string.IsNullOrEmpty(request.MuscleGroup))
                exercise.MuscleGroup = request.MuscleGroup;
            
            if (!string.IsNullOrEmpty(request.Equipment))
                exercise.Equipment = request.Equipment;
            
            if (request.IsActive.HasValue)
                exercise.IsActive = request.IsActive.Value;
            
            if (request.DifficultyLevel.HasValue)
                exercise.DifficultyLevel = request.DifficultyLevel.Value;
            
            await _context.SaveChangesAsync();
            
            return NoContent();
        }
        
        // DELETE: api/exercise/5 (soft delete)
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteExercise(int id)
        {
            var exercise = await _context.Exercises.FindAsync(id);
            
            if (exercise == null)
                return NotFound();
            
            exercise.IsActive = false;
            await _context.SaveChangesAsync();
            
            return NoContent();
        }
    }
}