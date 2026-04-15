using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using GymTracker.Infrastructure.Data;
using GymTracker.Core.Entities;
using GymTracker.Core.DTOs;

namespace GymTracker.API.Controllers
{
    public class UserController : BaseApiController
    {
        private readonly ApplicationDbContext _context;
        
        public UserController(ApplicationDbContext context)
        {
            _context = context;
        }

        
        [HttpPost("change-password")]
        public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordRequest request)
        {
            var userId = GetCurrentUserId();  // Clean and simple!
            
            var user = await _context.Users.FindAsync(userId);
            if (user == null) return NotFound();
            
            if (!BCrypt.Net.BCrypt.Verify(request.CurrentPassword, user.PasswordHash))
                return BadRequest("Current password is incorrect");
            
            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
            await _context.SaveChangesAsync();
            
            return Ok(new { Message = "Password changed successfully" });
        }
        
        // GET: api/user
        [HttpGet]
        public async Task<ActionResult<IEnumerable<UserListResponse>>> GetUsers()
        {
            var users = await _context.Users
                .Select(u => new UserListResponse
                {
                    Id = u.Id,
                    Username = u.Username,
                    Email = u.Email,
                    FullName = u.FirstName + " " + u.LastName,
                    IsActive = u.IsActive,
                    TotalWorkouts = u.Workouts.Count
                })
                .ToListAsync();
            
            return Ok(users);
        }

        
        // GET: api/user/5
        [HttpGet("{id}")]
        public async Task<ActionResult<UserResponse>> GetUser(int id)
        {
            var user = await _context.Users
                .Include(u => u.Workouts)
                .Include(u => u.PersonalRecords)
                .Include(u => u.WorkoutSets)
                .FirstOrDefaultAsync(u => u.Id == id);
            
            if (user == null)
                return NotFound();

            // Calculate streak — consecutive completed non-skipped days going back from today
            var completedDates = user.Workouts
                .Where(w => w.IsCompleted && !w.IsSkipped)
                .Select(w => w.WorkoutDate.Date)
                .Distinct()
                .OrderByDescending(d => d)
                .ToList();

            int streak = 0;
            var checkDate = DateTime.UtcNow.Date;
            // Allow today or yesterday as the streak start
            if (completedDates.Contains(checkDate)) { /* today counts */ }
            else checkDate = checkDate.AddDays(-1);

            foreach (var date in completedDates.OrderByDescending(d => d))
            {
                if (date == checkDate) { streak++; checkDate = checkDate.AddDays(-1); }
                else if (date < checkDate) break;
            }

            var totalVolume = user.WorkoutSets.Sum(ws => ws.Weight * ws.Reps);
            var totalWorkouts = user.Workouts.Count(w => w.IsCompleted && !w.IsSkipped);
            
            return Ok(new UserResponse
            {
                Id = user.Id,
                Username = user.Username,
                Email = user.Email,
                FirstName = user.FirstName,
                LastName = user.LastName,
                FullName = $"{user.FirstName} {user.LastName}".Trim(),
                CreatedAt = user.CreatedAt,
                IsActive = user.IsActive,
                Weight = user.Weight,
                Height = user.Height,
                BMI = user.Weight.HasValue && user.Height.HasValue 
                    ? Math.Round(user.Weight.Value / ((user.Height.Value / 100) * (user.Height.Value / 100)), 2) 
                    : null,
                Statistics = new UserStatistics
                {
                    TotalWorkouts = totalWorkouts,
                    TotalWorkoutSets = user.WorkoutSets.Count,
                    TotalVolume = totalVolume,
                    PersonalRecordsCount = user.PersonalRecords.Count,
                    CurrentStreak = streak,
                    LastWorkoutDate = user.Workouts.Max(w => (DateTime?)w.WorkoutDate)
                }
            });
        }
        
        // POST: api/user
        [HttpPost]
        public async Task<ActionResult<UserResponse>> CreateUser(CreateUserRequest request)
        {
            var user = new User
            {
                Username = request.Username,
                Email = request.Email,
                FirstName = request.FirstName ?? string.Empty,
                LastName = request.LastName ?? string.Empty,
                Weight = request.Weight,
                Height = request.Height,
                CreatedAt = DateTime.UtcNow,
                IsActive = true
            };
            
            _context.Users.Add(user);
            await _context.SaveChangesAsync();
            
            return CreatedAtAction(nameof(GetUser), new { id = user.Id }, new UserResponse
            {
                Id = user.Id,
                Username = user.Username,
                Email = user.Email,
                FirstName = user.FirstName,
                LastName = user.LastName,
                FullName = $"{user.FirstName} {user.LastName}".Trim(),
                CreatedAt = user.CreatedAt,
                IsActive = user.IsActive,
                Weight = user.Weight,
                Height = user.Height
            });
        }
        
        // PUT: api/user/5
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateUser(int id, UpdateUserRequest request)
        {
            var user = await _context.Users.FindAsync(id);
            
            if (user == null)
                return NotFound();
            
            if (!string.IsNullOrEmpty(request.Username))
                user.Username = request.Username;
            
            if (!string.IsNullOrEmpty(request.Email))
                user.Email = request.Email;
            
            if (!string.IsNullOrEmpty(request.FirstName))
                user.FirstName = request.FirstName;
            
            if (!string.IsNullOrEmpty(request.LastName))
                user.LastName = request.LastName;
            
            if (request.Weight.HasValue)
                user.Weight = request.Weight;
            
            if (request.Height.HasValue)
                user.Height = request.Height;
            
            if (request.IsActive.HasValue)
                user.IsActive = request.IsActive.Value;
            
            await _context.SaveChangesAsync();
            
            return NoContent();
        }
        
        // DELETE: api/user/5 (soft delete)
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteUser(int id)
        {
            var user = await _context.Users.FindAsync(id);
            
            if (user == null)
                return NotFound();
            
            user.IsActive = false;
            await _context.SaveChangesAsync();
            
            return NoContent();
        }
    }
}