using Microsoft.AspNetCore.Mvc;

namespace GymTracker.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public abstract class BaseApiController : ControllerBase
    {
    }
}