using Microsoft.EntityFrameworkCore;
using SmartGrid.Application.Interfaces.Repositories;
using SmartGrid.Domain.Models;
using SmartGrid.Domain.ValueObjects;
using SmartGrid.Infrastructure.Persistence.AzureSQL.Common;
using SmartGrid.Infrastructure.Persistence.AzureSQL.Context;
using SmartGrid.Infrastructure.Persistence.AzureSQL.Entities;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace SmartGrid.Infrastructure.Persistence.AzureSQL.Repositories
{
    internal class BillUserRepository : IBillUserRepository
    {
        private readonly SmartMeteringDbContext _dbContext;
        private readonly ISQLTableMapper<User, UserEntity> _mapper;

        public BillUserRepository(SmartMeteringDbContext dbContext, ISQLTableMapper<User, UserEntity> mapper)
        {
            _dbContext = dbContext;
            _mapper = mapper;
        }

        public async Task<User?> GetBillOwnerByIdAsync(EntityId id, CancellationToken ct = default)
        {
            if (!Guid.TryParse(id.Value, out Guid userGuid))
            {
                return null;
            }

            var entity = await _dbContext.Users.FirstOrDefaultAsync(u => u.Id == userGuid, ct);
            return entity != null ? _mapper.MapToDomain(entity) : null;
        }
    }
}