namespace SmartGrid.Application.Interfaces
{
    public interface IEmailService
    {
        Task SendUserCreatedEmailAsync(string email,string fullname,string jwtToken);

        Task SendResetPasswordEmailAsync(string email, string jwtToken);
        Task SendWarningAsync(string email, string subject, string body);
    }
}
