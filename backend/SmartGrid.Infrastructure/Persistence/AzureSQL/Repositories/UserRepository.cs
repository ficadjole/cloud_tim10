using Microsoft.EntityFrameworkCore;
using SmartGrid.Application.Interfaces.Repositories;
using SmartGrid.Domain.Models;
using SmartGrid.Domain.ValueObjects;
using SmartGrid.Infrastructure.Persistence.AzureSQL.Common;
using SmartGrid.Infrastructure.Persistence.AzureSQL.Context;
using SmartGrid.Infrastructure.Persistence.AzureSQL.Entities;

namespace SmartGrid.Infrastructure.Persistence.AzureSQL.Repositories
{
    internal class UserRepository : IUserRepository
    {
        private readonly SmartMeteringDbContext _dbContext;
        private readonly ISQLTableMapper<User, UserEntity> _mapper;

        public UserRepository(SmartMeteringDbContext dbContext, ISQLTableMapper<User, UserEntity> mapper)
        {
            _dbContext = dbContext;
            _mapper = mapper;
        }

        public async Task AddAsync(User user, CancellationToken ct = default)
        {
            var userEntity = _mapper.MapToEntity(user);

            await _dbContext.Users.AddAsync(userEntity, ct);

            await _dbContext.SaveChangesAsync();
        }

        public async Task DeleteAsync(EntityId id, CancellationToken ct = default)
        {

            var userEntity = _dbContext.Users.Find(Guid.Parse(id.Value));
            if (userEntity != null)
            {
                _dbContext.Users.Remove(userEntity);
                await _dbContext.SaveChangesAsync(ct);
            }

        }

        public async Task<IEnumerable<User?>> GetAllAsync()
        {
            return await _dbContext.Users.Select(userEntity => _mapper.MapToDomain(userEntity)).ToListAsync().ContinueWith(task => task.Result.AsEnumerable());
        }

        public async Task<User> GetByIdAsync(EntityId id, CancellationToken ct = default)
        {
            var userEntity = await _dbContext.Users.AsNoTracking().FirstOrDefaultAsync(u => u.Id == Guid.Parse(id.Value), ct);

            if (userEntity == null)
            {
                return null;
            }

            var user = _mapper.MapToDomain(userEntity);

            if (user == null)
            {
                return null;
            }

            return user;
        }


        public async Task<User> GetByEmailAsync(string email, CancellationToken ct = default)
        {
            var userEntity = await _dbContext.Users.FirstOrDefaultAsync(u => u.Email == email, ct);
            if (userEntity == null)
            {
                return null;
            }
            var user = _mapper.MapToDomain(userEntity);
            if (user == null)
            {
                return null;
            }
            return user;
        }

        public async Task UpdateAsync(User user, CancellationToken ct = default)
        {

            var userEntity = _mapper.MapToEntity(user);

            _dbContext.Users.Update(userEntity);

            await _dbContext.SaveChangesAsync(ct);

        }
    }
}
