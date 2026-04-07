using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using GymTracker.Infrastructure.Data;
using GymTracker.Core.Entities;
using GymTracker.Core.DTOs;
using GymTracker.API.Services;

namespace GymTracker.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController :ControllerBase 
    {
        private readonly ApplicationDbContext _context;
        private readonly IJwtService _jwtService;

        public AuthController(ApplicationDbContext context, IJwtService jwtService)
        {
            _context = context;
            _jwtService = jwtService;
        }

        // POST: api/auth/register
        [HttpPost("register")]
        public async Task<ActionResult<AuthResponse>> Register([FromBody] RegisterRequest request)
        {
            // Check if user exists
            if (await _context.Users.AnyAsync(u => u.Email == request.Email))
                return BadRequest("User with this email already exists");

            if (await _context.Users.AnyAsync(u => u.Username == request.Username))
                return BadRequest("Username already taken");

            // Create user
            var user = new User
            {
                Username = request.Username,
                Email = request.Email,
                FirstName = request.FirstName,
                LastName = request.LastName,
                Weight = request.Weight,
                Height = request.Height,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
                CreatedAt = DateTime.UtcNow,
                IsActive = true
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            // Generate token
            var token = _jwtService.GenerateToken(user);
            var expiry = DateTime.UtcNow.AddMinutes(60);

            var response = new AuthResponse
            {
                Id = user.Id,
                Username = user.Username,
                Email = user.Email,
                Token = token,
                TokenExpiry = expiry
            };

            return Ok(response);
        }

        // POST: api/auth/login
        [HttpPost("login")]
        public async Task<ActionResult<AuthResponse>> Login([FromBody] LoginRequest request)
        {
            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Email == request.Email);

            if (user == null)
                return Unauthorized("Invalid email or password");

            if (!BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
                return Unauthorized("Invalid email or password");

            if (!user.IsActive)
                return Unauthorized("Account is deactivated");

            var token = _jwtService.GenerateToken(user);
            var expiry = DateTime.UtcNow.AddMinutes(60);

            var response = new AuthResponse
            {
                Id = user.Id,
                Username = user.Username,
                Email = user.Email,
                Token = token,
                TokenExpiry = expiry
            };

            return Ok(response);
        }

        
      

    

    }
}