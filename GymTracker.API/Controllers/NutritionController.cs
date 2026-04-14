using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using GymTracker.Infrastructure.Data;
using GymTracker.Core.Entities;
using GymTracker.Core.DTOs;
using Amazon.BedrockRuntime;
using Amazon.BedrockRuntime.Model;
using System.Text;
using System.Text.Json;
using Amazon;

namespace GymTracker.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class NutritionController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        
        public NutritionController(ApplicationDbContext context)
        {
            _context = context;
        }
        
        // POST: api/nutrition/log
        [HttpPost("log")]
        public async Task<ActionResult<NutritionLogResponse>> LogNutrition([FromBody] LogNutritionRequest request)
        {
            var calories = request.Calories ?? (request.Protein * 4 + request.Carbs * 4 + request.Fats * 9);
            
            var nutritionLog = new NutritionLog
            {
                UserId = request.UserId,
                LogDate = request.LogDate,
                Protein = request.Protein,
                Carbs = request.Carbs,
                Fats = request.Fats,
                Fiber = request.Fiber ?? 0,
                Zinc = request.Zinc ?? 0,
                Magnesium = request.Magnesium ?? 0,
                Iron = request.Iron ?? 0,
                Creatine = request.Creatine ?? 0,
                Omega3 = request.Omega3 ?? 0,
                Calories = calories,
                Notes = request.Notes
            };
            
            var workout = await _context.Workouts
                .FirstOrDefaultAsync(w => w.UserId == request.UserId && 
                                          w.WorkoutDate.Date == request.LogDate.Date &&
                                          w.IsCompleted); // checking for completed workout on the same day
            
            if (workout != null)
            {
                nutritionLog.WorkoutId = workout.Id;
            }
            
            _context.NutritionLogs.Add(nutritionLog);
            await _context.SaveChangesAsync();
            
            // Get users body weight 
            var user = await _context.Users.FindAsync(request.UserId);
            var proteinGoal = user?.Weight.HasValue == true ? user.Weight.Value * 1.6m : 120m; // 1.6g per kg bodyweight
            
            var response = new NutritionLogResponse
            {
                Id = nutritionLog.Id,
                LogDate = nutritionLog.LogDate,
                Protein = nutritionLog.Protein,
                Carbs = nutritionLog.Carbs,
                Fats = nutritionLog.Fats,
                Fiber = nutritionLog.Fiber,
                Zinc = nutritionLog.Zinc,
                Magnesium = nutritionLog.Magnesium,
                Iron = nutritionLog.Iron,
                Creatine = nutritionLog.Creatine,
                Omega3 = nutritionLog.Omega3,
                Calories = nutritionLog.Calories,
                Notes = nutritionLog.Notes,
                WorkoutId = nutritionLog.WorkoutId,
                MeetsProteinGoal = nutritionLog.Protein >= proteinGoal,
                MeetsFiberGoal = nutritionLog.Fiber >= 25m,
                Recommendation = GetRecommendation(nutritionLog, proteinGoal)
            };
            
            return Ok(response);
        }
        
        // GET: api/nutrition/user/{userId}
        [HttpGet("user/{userId}")]
        public async Task<ActionResult<IEnumerable<NutritionLogResponse>>> GetUserNutrition(int userId, [FromQuery] DateTime? fromDate = null, [FromQuery] DateTime? toDate = null)
        {
            var query = _context.NutritionLogs.Where(n => n.UserId == userId);
            
            if (fromDate.HasValue)
                query = query.Where(n => n.LogDate >= fromDate.Value);
            if (toDate.HasValue)
                query = query.Where(n => n.LogDate <= toDate.Value);
            
            var logs = await query
                .OrderByDescending(n => n.LogDate)
                .ToListAsync();
            
            var user = await _context.Users.FindAsync(userId);
            var proteinGoal = user?.Weight.HasValue == true ? user.Weight.Value * 1.6m : 120m;
            
            var responses = logs.Select(n => new NutritionLogResponse
            {
                Id = n.Id,
                LogDate = n.LogDate,
                Protein = n.Protein,
                Carbs = n.Carbs,
                Fats = n.Fats,
                Fiber = n.Fiber,
                Zinc = n.Zinc,
                Magnesium = n.Magnesium,
                Iron = n.Iron,
                Creatine = n.Creatine,
                Omega3 = n.Omega3,
                Calories = n.Calories,
                Notes = n.Notes,
                WorkoutId = n.WorkoutId,
                MeetsProteinGoal = n.Protein >= proteinGoal,
                MeetsFiberGoal = n.Fiber >= 25m,
                Recommendation = GetRecommendation(n, proteinGoal)
            }).ToList();
            
            return Ok(responses);
        }
        
        // GET: api/nutrition/user/{userId}/summary
        [HttpGet("user/{userId}/summary")]
        public async Task<ActionResult<NutritionSummaryResponse>> GetNutritionSummary(int userId, [FromQuery] int days = 30)
        {
            var startDate = DateTime.UtcNow.AddDays(-days);
            var endDate = DateTime.UtcNow;
            
            var logs = await _context.NutritionLogs
                .Where(n => n.UserId == userId && n.LogDate >= startDate && n.LogDate <= endDate)
                .ToListAsync();
            
            var user = await _context.Users.FindAsync(userId);
            var proteinGoal = user?.Weight.HasValue == true ? user.Weight.Value * 1.6m : 120m;
            
            var summary = new NutritionSummaryResponse
            {
                StartDate = startDate,
                EndDate = endDate,
                AvgProtein = logs.Any() ? logs.Average(l => l.Protein) : 0,
                AvgCarbs = logs.Any() ? logs.Average(l => l.Carbs) : 0,
                AvgFats = logs.Any() ? logs.Average(l => l.Fats) : 0,
                AvgFiber = logs.Any() ? logs.Average(l => l.Fiber) : 0,
                AvgCalories = logs.Any() ? logs.Average(l => l.Calories) : 0,
                AvgZinc = logs.Any() ? logs.Average(l => l.Zinc) : 0,
                AvgMagnesium = logs.Any() ? logs.Average(l => l.Magnesium) : 0,
                AvgIron = logs.Any() ? logs.Average(l => l.Iron) : 0,
                TotalProtein = logs.Sum(l => l.Protein),
                TotalCalories = logs.Sum(l => l.Calories),
                DaysLogged = logs.Count,
                DaysMetProteinGoal = logs.Count(l => l.Protein >= proteinGoal),
                DaysMetFiberGoal = logs.Count(l => l.Fiber >= 25m),
                Recommendations = GenerateRecommendations(logs, user),
                OverallRating = GetOverallRating(logs, proteinGoal)
            };
            
            return Ok(summary);
        }
        
        // GET: api/nutrition/user/{userId}/date/{date}
        [HttpGet("user/{userId}/date/{date}")]
        public async Task<ActionResult<NutritionLogResponse>> GetNutritionByDate(int userId, DateTime date)
        {
            var log = await _context.NutritionLogs
                .FirstOrDefaultAsync(n => n.UserId == userId && n.LogDate.Date == date.Date);
            
            if (log == null)
                return NotFound($"No nutrition log found for {date:yyyy-MM-dd}");
            
            var user = await _context.Users.FindAsync(userId);
            var proteinGoal = user?.Weight.HasValue == true ? user.Weight.Value * 1.6m : 120m;
            
            var response = new NutritionLogResponse
            {
                Id = log.Id,
                LogDate = log.LogDate,
                Protein = log.Protein,
                Carbs = log.Carbs,
                Fats = log.Fats,
                Fiber = log.Fiber,
                Zinc = log.Zinc,
                Magnesium = log.Magnesium,
            
                Iron = log.Iron,
               
               
                Creatine = log.Creatine,
                Omega3 = log.Omega3,
                Calories = log.Calories,
                Notes = log.Notes,
                WorkoutId = log.WorkoutId,
                MeetsProteinGoal = log.Protein >= proteinGoal,
                MeetsFiberGoal = log.Fiber >= 25m,
                Recommendation = GetRecommendation(log, proteinGoal)
            };
            
            return Ok(response);
        }
        
        // ========== AI NUTRITION LOGGING ==========

        // POST: api/nutrition/ai-log
        [HttpPost("ai-log")]
        public async Task<ActionResult<NutritionLogResponse>> AiLogNutrition([FromBody] AiNutritionRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.FoodDescription))
                return BadRequest("Food description cannot be empty");

            var user = await _context.Users.FindAsync(request.UserId);
            if (user == null)
                return NotFound($"User with ID {request.UserId} not found");

            // Build strict prompt — Claude must return only JSON, no prose
            var prompt = $"""
                You are a nutrition analysis assistant. Analyze the following food description and return ONLY a valid JSON object with approximate nutritional values. No explanation, no markdown, just raw JSON.

                Food consumed today: {request.FoodDescription}

                Return this exact JSON structure with decimal numbers:
                {{"protein":0,"carbs":0,"fats":0,"fiber":0,"zinc":0,"magnesium":0,"iron":0,"creatine":0,"omega3":0,"calories":0}}

                Rules:
                - All values in grams except zinc/magnesium/iron which are in milligrams
                - Calories in kcal
                - Use realistic average estimates
                - Return ONLY the JSON object, nothing else
                """;

            // Call Bedrock
            var region = _config["Bedrock:Region"] ?? "us-east-1";
            var modelId = _config["Bedrock:ModelId"] ?? "anthropic.claude-haiku-4-5";

            var bedrockClient = new AmazonBedrockRuntimeClient(RegionEndpoint.GetBySystemName(region));

            var requestBody = JsonSerializer.Serialize(new
            {
                anthropic_version = "bedrock-2023-05-31",
                max_tokens = 300,
                messages = new[]
                {
                    new { role = "user", content = prompt }
                }
            });

            var invokeRequest = new InvokeModelRequest
            {
                ModelId = modelId,
                ContentType = "application/json",
                Accept = "application/json",
                Body = new MemoryStream(Encoding.UTF8.GetBytes(requestBody))
            };

            InvokeModelResponse invokeResponse;
            try
            {
                invokeResponse = await bedrockClient.InvokeModelAsync(invokeRequest);
            }
            catch (Exception ex)
            {
                return StatusCode(502, $"AI service error: {ex.Message}");
            }

            // Parse Bedrock response
            using var responseDoc = await JsonDocument.ParseAsync(invokeResponse.Body);
            var rawText = responseDoc.RootElement
                .GetProperty("content")[0]
                .GetProperty("text")
                .GetString() ?? "{}";

            // Parse the nutrition JSON Claude returned
            JsonElement nutrition;
            try
            {
                nutrition = JsonDocument.Parse(rawText).RootElement;
            }
            catch
            {
                return StatusCode(502, "AI returned invalid JSON. Try rephrasing your food description.");
            }

            decimal Get(string key) =>
                nutrition.TryGetProperty(key, out var el) ? el.GetDecimal() : 0m;

            var calories = Get("calories") > 0
                ? Get("calories")
                : Get("protein") * 4 + Get("carbs") * 4 + Get("fats") * 9;

            // Link to workout if one exists today
            var workout = await _context.Workouts
                .FirstOrDefaultAsync(w => w.UserId == request.UserId &&
                                          w.WorkoutDate.Date == request.LogDate.Date &&
                                          w.IsCompleted);

            var nutritionLog = new NutritionLog
            {
                UserId    = request.UserId,
                LogDate   = request.LogDate,
                Protein   = Get("protein"),
                Carbs     = Get("carbs"),
                Fats      = Get("fats"),
                Fiber     = Get("fiber"),
                Zinc      = Get("zinc"),
                Magnesium = Get("magnesium"),
                Iron      = Get("iron"),
                Creatine  = Get("creatine"),
                Omega3    = Get("omega3"),
                Calories  = calories,
                Notes     = request.FoodDescription,
                WorkoutId = workout?.Id
            };

            _context.NutritionLogs.Add(nutritionLog);
            await _context.SaveChangesAsync();

            var proteinGoal = user.Weight.HasValue ? user.Weight.Value * 1.6m : 120m;

            return Ok(new NutritionLogResponse
            {
                Id              = nutritionLog.Id,
                LogDate         = nutritionLog.LogDate,
                Protein         = nutritionLog.Protein,
                Carbs           = nutritionLog.Carbs,
                Fats            = nutritionLog.Fats,
                Fiber           = nutritionLog.Fiber,
                Zinc            = nutritionLog.Zinc,
                Magnesium       = nutritionLog.Magnesium,
                Iron            = nutritionLog.Iron,
                Creatine        = nutritionLog.Creatine,
                Omega3          = nutritionLog.Omega3,
                Calories        = nutritionLog.Calories,
                Notes           = nutritionLog.Notes,
                WorkoutId       = nutritionLog.WorkoutId,
                MeetsProteinGoal = nutritionLog.Protein >= proteinGoal,
                MeetsFiberGoal  = nutritionLog.Fiber >= 25m,
                Recommendation  = GetRecommendation(nutritionLog, proteinGoal)
            });
        }

        // ========== PRIVATE HELPER METHODS ==========
        
        private string GetRecommendation(NutritionLog log, decimal proteinGoal)
        {
            if (log.Protein < proteinGoal)
                return $"Increase protein intake to {proteinGoal}g (currently {log.Protein}g) for muscle recovery";
            
            if (log.Fiber < 25m)
                return "Increase fiber intake to 25g+ for better digestion and satiety";
            
            if (log.Zinc < 11m)
                return "Zinc is low. Add nuts, seeds, or lean meats for immune and hormone health";
            
            if (log.Magnesium < 400m)
                return "Magnesium is important for muscle function and sleep. Consider leafy greens or supplements";
            
            if (log.Omega3 < 2m)
                return "Omega-3 fatty acids support joint health. Consider fatty fish or fish oil";
            
            return "Great job! Your nutrition is well-balanced for training goals";
        }
        
        private List<string> GenerateRecommendations(List<NutritionLog> logs, User? user)
        {
            var recommendations = new List<string>();
            var avgProtein = logs.Any() ? logs.Average(l => l.Protein) : 0;
            var avgFiber = logs.Any() ? logs.Average(l => l.Fiber) : 0;
            var avgZinc = logs.Any() ? logs.Average(l => l.Zinc) : 0;
            var avgMagnesium = logs.Any() ? logs.Average(l => l.Magnesium) : 0;
            
            var proteinGoal = user?.Weight.HasValue == true ? user.Weight.Value * 1.6m : 120m;
            
            if (avgProtein < proteinGoal)
                recommendations.Add($"Average protein is {avgProtein:F0}g/day. Aim for {proteinGoal:F0}g (1.6g per kg bodyweight)");
            
            if (avgFiber < 25m)
                recommendations.Add($"Fiber intake is {avgFiber:F0}g/day. Target 25-30g for optimal health");
            
            if (avgZinc < 11m)
                recommendations.Add($"Zinc is {avgZinc:F1}mg/day. Recommended: 11mg for men, 8mg for women");
            
            if (avgMagnesium < 400m)
                recommendations.Add($"Magnesium is {avgMagnesium:F0}mg/day. Aim for 400-420mg for muscle function");
            
            if (!recommendations.Any())
                recommendations.Add("Excellent nutrition habits! Your consistency is paying off.");
            
            return recommendations;
        }
        
        private string GetOverallRating(List<NutritionLog> logs, decimal proteinGoal)
        {
            if (!logs.Any()) return "No data logged";
            
            var proteinCompliance = logs.Count(l => l.Protein >= proteinGoal) / (decimal)logs.Count;
            var fiberCompliance = logs.Count(l => l.Fiber >= 25m) / (decimal)logs.Count;
            
            if (proteinCompliance >= 0.8m && fiberCompliance >= 0.7m)
                return "Excellent - Your nutrition is supporting your fitness goals!";
            if (proteinCompliance >= 0.6m && fiberCompliance >= 0.5m)
                return "Good - Consistent, with room for improvement";
            
            return "Needs attention - Focus on protein and fiber intake";
        }
    }
}