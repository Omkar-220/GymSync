// using Microsoft.AspNetCore.Mvc;

// namespace GymTracker.API.Controllers
// {
//     [ApiController]
//     [Route("api/[controller]")]
//     public abstract class BaseApiController : ControllerBase
//     {
//     }
// }

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace GymTracker.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]  // ✅ Add this - now ALL inheriting controllers require authentication
    public abstract class BaseApiController : ControllerBase
    {
        // Helper method to get current user ID from JWT token
        protected int GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim))
                throw new UnauthorizedAccessException("User ID not found in token");
            return int.Parse(userIdClaim);
        }
    }
}