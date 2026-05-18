using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Options;
using SendGrid;
using SendGrid.Helpers.Mail;
using SmartGrid.Application.Interfaces;
using SmartGrid.Infrastructure.Common.Options;

namespace SmartGrid.Infrastructure.Services
{
    public class SendGridEmailService(IOptions<EmailOptions> options) : IEmailService
    {
        public async Task SendResetPasswordEmailAsync(string email, string jwtToken)
        {
            var client = new SendGridClient(options.Value.SendGridApiKey);

            var link = $"{options.Value.AppBaseUrl}/reset-password?token={jwtToken}";

            var message = new SendGridMessage
            {
                From = new EmailAddress(options.Value.FromEmail, options.Value.FromName),
                Subject = "Postavite novu lozinku",
                HtmlContent = $@"
                <h3>Zdravo,</h3>
                <p>Zaboravili ste lozinku. Postavite novu lozinku klikom na dugme:</p>
                <a href='{link}'>Postavi novu lozinku</a>
                <p>Link važi 24 sata.</p>"
            };

            message.AddTo(new EmailAddress(email));

            await client.SendEmailAsync(message);
        }

        public async Task SendUserCreatedEmailAsync(string email, string fullname, string jwtToken)
        {
            var client = new SendGridClient(options.Value.SendGridApiKey);

            var link = $"{options.Value.AppBaseUrl}/set-password?token={jwtToken}";

            var message = new SendGridMessage
            {
                From = new EmailAddress(options.Value.FromEmail, options.Value.FromName),
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

        public async Task SendWarningAsync(string email, string subject, string body)
        {
            var client = new SendGridClient(options.Value.SendGridApiKey);


            var message = new SendGridMessage
            {
                From = new EmailAddress(options.Value.FromEmail, options.Value.FromName),
                Subject = subject,
                HtmlContent = body
            };

            message.AddTo(new EmailAddress(email));

            await client.SendEmailAsync(message);
        }
    }
}
