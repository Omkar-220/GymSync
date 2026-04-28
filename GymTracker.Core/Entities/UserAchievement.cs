using GymTracker.Core.Enums;

namespace GymTracker.Core.Entities
{
    public class UserAchievement
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public AchievementKey Key { get; set; }
        public DateTime AchievedAt { get; set; } = DateTime.UtcNow;

        public User User { get; set; } = null!;
    }
}
