using Microsoft.EntityFrameworkCore;
using Backend.Models;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<User> Users { get; set; }
    public DbSet<UserWorkTime> User_Work_Times { get; set; }
    public DbSet<Car> Cars { get; set; }
    public DbSet<UserAddress> UserAddresses { get; set; }
    public DbSet<Destination> Destinations { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
    }
}