using Microsoft.Extensions.Configuration;
using SendGrid;
using SendGrid.Helpers.Mail;
using SmartGrid.Application.Interfaces;

namespace SmartGrid.Infrastructure.Services
{
    public class SendGridEmailService(IConfiguration configuration) : IEmailService
    {
        public async Task SendEmailAsync(string email, string fullname, string jwtToken)
        {
            var client = new SendGridClient(configuration["SendGrid:ApiKey"]);

            var link = $"{configuration["App:BaseUrl"]}/set-password?token={jwtToken}";

            var message = new SendGridMessage
            {
                From = new EmailAddress(configuration["SendGrid:FromEmail"], configuration["SendGrid:FromName"]),
                Subject = "Postavite vasu lozinku",
                HtmlContent = $@"
                <h3>Zdravo {fullname},</h3>
                <p>Vaš nalog je kreiran. Postavite lozinku klikom na dugme:</p>
                <a href='{link}'>Postavi lozinku</a>
                <p>Link važi 24 sata.</p>"
            };

            message.AddTo(new EmailAddress(email,fullname));

            await client.SendEmailAsync(message);
        }
    }
}
