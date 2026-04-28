using Microsoft.EntityFrameworkCore;
using GymTracker.Core.Entities;

namespace GymTracker.Infrastructure.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }
        
        public DbSet<Exercise> Exercises { get; set; }
        public DbSet<User> Users { get; set; }
        public DbSet<Split> Splits { get; set; }
        public DbSet<SplitExercise> SplitExercises { get; set; }
        public DbSet<Workout> Workouts { get; set; }
        public DbSet<WorkoutSet> WorkoutSets { get; set; }
        public DbSet<NutritionLog> NutritionLogs { get; set; }
        public DbSet<PersonalRecord> PersonalRecords { get; set; }
        public DbSet<WorkoutGoal> WorkoutGoals { get; set; }
        public DbSet<UserAchievement> UserAchievements { get; set; }
        
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
            
            modelBuilder.Entity<Exercise>()
                .Property(e => e.DefaultWeightIncrement)
                .HasPrecision(18, 2);
            
            modelBuilder.Entity<NutritionLog>()
                .Property(n => n.Protein)
                .HasPrecision(18, 2);
            
            modelBuilder.Entity<NutritionLog>()
                .Property(n => n.Carbs)
                .HasPrecision(18, 2);

                
            modelBuilder.Entity<NutritionLog>()
                .Property(n => n.Magnesium)
                .HasPrecision(18, 2);
                        
        
            modelBuilder.Entity<User>(entity =>
            {
                entity.Property(e => e.Height)
                    .HasPrecision(18, 2);
        
                entity.Property(e => e.Weight)
                    .HasPrecision(18, 2);
            });




            
            modelBuilder.Entity<NutritionLog>()
                .Property(n => n.Fats)
                .HasPrecision(18, 2);
            
            modelBuilder.Entity<NutritionLog>()
                .Property(n => n.Zinc)
                .HasPrecision(18, 2);
            
            modelBuilder.Entity<NutritionLog>()
                .Property(n => n.Calories)
                .HasPrecision(18, 2);

            modelBuilder.Entity<NutritionLog>()
                .Property(n => n.Iron)
                .HasPrecision(18, 2);
                        
            modelBuilder.Entity<PersonalRecord>()
                .Property(p => p.Value)
                .HasPrecision(18, 2);
            
            modelBuilder.Entity<PersonalRecord>()
                .Property(p => p.PreviousRecord)
                .HasPrecision(18, 2);
            
            modelBuilder.Entity<WorkoutSet>()
                .Property(w => w.Weight)
                .HasPrecision(18, 2);

            modelBuilder.Entity<NutritionLog>()
                .Property(n => n.Fiber)
                .HasPrecision(18, 2);

            modelBuilder.Entity<NutritionLog>()
                .Property(n => n.Creatine)
                .HasPrecision(18, 2);

            modelBuilder.Entity<NutritionLog>()
                .Property(n => n.Omega3)
                .HasPrecision(18, 2);
            
            modelBuilder.Entity<WorkoutGoal>()
                .Property(wg => wg.TargetValue)
                .HasPrecision(18, 2);
            
            modelBuilder.Entity<WorkoutGoal>()
                .Property(wg => wg.AchievedValue)
                .HasPrecision(18, 2);

            modelBuilder.Entity<Split>()
                .HasOne(s => s.User)
                .WithMany(u => u.Splits)
                .HasForeignKey(s => s.UserId)
                .OnDelete(DeleteBehavior.Restrict);
            
            modelBuilder.Entity<SplitExercise>()
                .HasOne(se => se.Split)
                .WithMany(s => s.SplitExercises)
                .HasForeignKey(se => se.SplitId)
                .OnDelete(DeleteBehavior.Cascade);
            
            modelBuilder.Entity<SplitExercise>()
                .HasOne(se => se.Exercise)
                .WithMany(e => e.SplitExercises)
                .HasForeignKey(se => se.ExerciseId)
                .OnDelete(DeleteBehavior.Restrict);
            
            modelBuilder.Entity<Workout>()
                .HasOne(w => w.User)
                .WithMany(u => u.Workouts)
                .HasForeignKey(w => w.UserId)
                .OnDelete(DeleteBehavior.Restrict);
            
            modelBuilder.Entity<Workout>()
                .HasOne(w => w.Split)
                .WithMany()
                .HasForeignKey(w => w.SplitId)
                .OnDelete(DeleteBehavior.SetNull);
            
            modelBuilder.Entity<WorkoutSet>()
                .HasOne(ws => ws.Workout)
                .WithMany(w => w.WorkoutSets)
                .HasForeignKey(ws => ws.WorkoutId)
                .OnDelete(DeleteBehavior.Cascade);
            
            modelBuilder.Entity<WorkoutSet>()
                .HasOne(ws => ws.Exercise)
                .WithMany(e => e.WorkoutSets)
                .HasForeignKey(ws => ws.ExerciseId)
                .OnDelete(DeleteBehavior.Restrict);
            
            modelBuilder.Entity<WorkoutSet>()
                .HasOne(ws => ws.User)
                .WithMany(u => u.WorkoutSets)
                .HasForeignKey(ws => ws.UserId)
                .OnDelete(DeleteBehavior.Restrict);
            
            modelBuilder.Entity<NutritionLog>()
                .HasOne(n => n.User)
                .WithMany(u => u.NutritionLogs)
                .HasForeignKey(n => n.UserId)
                .OnDelete(DeleteBehavior.Restrict);
            
            modelBuilder.Entity<PersonalRecord>()
                .HasOne(pr => pr.WorkoutSet)
                .WithMany(ws => ws.PersonalRecords)
                .HasForeignKey(pr => pr.WorkoutSetId)
                .IsRequired(false)
                .OnDelete(DeleteBehavior.Cascade);
            
            modelBuilder.Entity<PersonalRecord>()
                .HasOne(pr => pr.User)
                .WithMany(u => u.PersonalRecords)
                .HasForeignKey(pr => pr.UserId)
                .OnDelete(DeleteBehavior.Restrict);
            
            modelBuilder.Entity<PersonalRecord>()
                .HasOne(pr => pr.Exercise)
                .WithMany(e => e.PersonalRecords)
                .HasForeignKey(pr => pr.ExerciseId)
                .OnDelete(DeleteBehavior.Restrict);
            
            // WorkoutGoal configurations
            modelBuilder.Entity<WorkoutGoal>()
                .HasOne(wg => wg.User)
                .WithMany(u => u.WorkoutGoals)
                .HasForeignKey(wg => wg.UserId)
                .OnDelete(DeleteBehavior.Restrict);
            
            modelBuilder.Entity<WorkoutGoal>()
                .HasOne(wg => wg.TargetExercise)
                .WithMany(e => e.WorkoutGoals)
                .HasForeignKey(wg => wg.TargetExerciseId)
                .OnDelete(DeleteBehavior.Restrict);
            
            modelBuilder.Entity<WorkoutGoal>()
                .HasOne(wg => wg.AchievedInWorkout)
                .WithMany(w => w.AchievedGoals)
                .HasForeignKey(wg => wg.AchievedInWorkoutId)
                .OnDelete(DeleteBehavior.SetNull);
            
            modelBuilder.Entity<Exercise>()
                .HasIndex(e => e.Name)
                .IsUnique();
            
            modelBuilder.Entity<User>()
                .HasIndex(u => u.Email)
                .IsUnique();
            
            modelBuilder.Entity<WorkoutGoal>()
                .HasIndex(wg => new { wg.UserId, wg.TargetExerciseId, wg.Type })
                .IsUnique();
            
            modelBuilder.Entity<WorkoutSet>()
                .HasIndex(ws => new { ws.WorkoutId, ws.ExerciseId, ws.SetNumber })
                .IsUnique();

            modelBuilder.Entity<UserAchievement>()
                .HasOne(a => a.User)
                .WithMany(u => u.Achievements)
                .HasForeignKey(a => a.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<UserAchievement>()
                .HasIndex(a => new { a.UserId, a.Key })
                .IsUnique();
        }
    }
}