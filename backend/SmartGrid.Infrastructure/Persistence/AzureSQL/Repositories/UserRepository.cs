using Microsoft.EntityFrameworkCore;
using SmartGrid.Application.Interfaces.Repositories;
using SmartGrid.Domain.Models;
using SmartGrid.Domain.ValueObjects;
using SmartGrid.Infrastructure.Persistence.AzureSQL.Context;
using SmartGrid.Infrastructure.Persistence.AzureSQL.Mappers;

namespace SmartGrid.Infrastructure.Persistence.AzureSQL.Repositories
{
    public class UserRepository : IUserRepository
    {
        private readonly SmartMeteringDbContext _dbContext;
        private readonly UserEntityMapper _mapper;

        public UserRepository(SmartMeteringDbContext dbContext, UserEntityMapper mapper)
        {
            _dbContext = dbContext;
            _mapper = mapper;
        }

        public Task AddAsync(User user)
        {
            var userEntity = _mapper.ToEntity(user);

            _dbContext.Users.Add(userEntity);

            return _dbContext.SaveChangesAsync();
        }

        public Task DeleteAsync(EntityId id)
        {
            
            var userEntity = _dbContext.Users.Find(id.Value);
            if (userEntity != null)
            {
                _dbContext.Users.Remove(userEntity);
                return _dbContext.SaveChangesAsync();
            }
            return Task.CompletedTask;

        }

        public Task<IEnumerable<User?>> GetAllAsync()
        {
            return _dbContext.Users.Select(userEntity => _mapper.ToDomain(userEntity)).ToListAsync().ContinueWith(task => task.Result.AsEnumerable());
        }

        public Task<User> GetByIdAsync(EntityId id)
        {
            var userEntity = _dbContext.Users.Find(id.Value);

            if(userEntity == null)
            {
                return Task.FromResult<User>(null);
            }

            var user = _mapper.ToDomain(userEntity);

            if(user == null)
            {
                return Task.FromResult<User>(null);
            }

            return Task.FromResult(user);
        }


        public Task<User> GetByEmailAsync(string email)
        {
            var userEntity = _dbContext.Users.FirstOrDefault(u => u.Email == email);
            if (userEntity == null)
            {
                return Task.FromResult<User>(null);
            }
            var user = _mapper.ToDomain(userEntity);
            if (user == null)
            {
                return Task.FromResult<User>(null);
            }
            return Task.FromResult(user);
        }

        public Task UpdateAsync(User user)
        {
         
            var userEntity = _mapper.ToEntity(user);

            _dbContext.Users.Update(userEntity);

            return _dbContext.SaveChangesAsync();

        }
    }
}
