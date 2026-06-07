using SmartGrid.Domain.Enums;
using SmartGrid.Domain.Models;
using SmartGrid.Domain.ValueObjects;


namespace SmartGrid.Application.Interfaces.Repositories
{
    public interface IDeviceStatusRepository
    {
        Task<DeviceStatus?> GetByIdAsync(DeviceType type, EntityId deviceId, CancellationToken ct = default);
        Task SaveAsync(DeviceStatus status, CancellationToken ct = default);
        Task<IReadOnlyCollection<DeviceStatus>> GetOfflineSinceAsync(DateTime threshold, CancellationToken ct = default);
        Task<IReadOnlyCollection<DeviceStatus>> GetAllAsync(CancellationToken ct = default); 
    }
}
