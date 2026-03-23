using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using GymTracker.Infrastructure.Data;
using GymTracker.Core.Entities;

namespace GymTracker.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ExerciseController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        
        public ExerciseController(ApplicationDbContext context)
        {
            _context = context;
        }
        
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var exercises = await _context.Exercises.ToListAsync();
            return Ok(exercises);
        }
        
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var exercise = await _context.Exercises.FindAsync(id);
            if (exercise == null)
                return NotFound();
            return Ok(exercise);
        }
        
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] Exercise exercise)
        {
            exercise.CreatedAt = DateTime.UtcNow;
            _context.Exercises.Add(exercise);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetById), new { id = exercise.Id }, exercise);
        }
        
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] Exercise exercise)
        {
            if (id != exercise.Id)
                return BadRequest();
            
            _context.Entry(exercise).State = EntityState.Modified;
            await _context.SaveChangesAsync();
            return NoContent();
        }
        
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
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