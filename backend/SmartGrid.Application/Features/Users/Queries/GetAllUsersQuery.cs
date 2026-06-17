using MediatR;
using Microsoft.Extensions.Logging;
using SmartGrid.Application.Interfaces.Repositories;
using SmartGrid.Domain.Common;
using SmartGrid.Domain.Enums;
using UserService.DTOs;

namespace SmartGrid.Application.Features.Users.Queries
{
    //QUERY
    public record GetAllUsersQuery : IRequest<Result<IEnumerable<UserDto>>>;

    // HANDLER
    internal class GetAllUsersHandler(
        IUserRepository userRepository,
        ILogger<GetAllUsersHandler> logger) : IRequestHandler<GetAllUsersQuery, Result<IEnumerable<UserDto>>>
    {
        public async Task<Result<IEnumerable<UserDto>>> Handle(GetAllUsersQuery request, CancellationToken ct)
        {
            try
            {
                logger.LogInformation("Fetching all users from the repository.");

                // Pretpostavka je da tvoj IUserRepository ima metodu GetAllAsync ili slično
                var users = await userRepository.GetAllAsync();

                // Mapiranje domenskih modela u DTOs (isto kao što si radio u Create)
                var userDtos = users.Select(user => new UserDto
                {
                    Id = user.Id.ToString(),
                    Name = user.GetFullName(),
                    Email = user.Email,
                    Role = user.Role.ToString()
                }).ToList();

                return Result<IEnumerable<UserDto>>.Success(userDtos);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Error while fetching all users.");
                return Result<IEnumerable<UserDto>>.Failure("Failed to fetch users.", ErrorType.Failure);
            }
        }
    }
}
