namespace SmartGrid.Application.Interfaces.Messaging
{
    public interface IResetPasswordQueueService
    {
        Task SendResetPasswordMessageAsync(string email, string setPasswordJWTToken, CancellationToken ct = default);
    }
}
