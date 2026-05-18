
namespace SmartGrid.Infrastructure.Common.Options
{
    public class EmailOptions
    {
        public string SendGridApiKey { get;init; } = string.Empty;
        public string FromEmail { get;init; } = string.Empty;
        public string FromName { get;init; } = string.Empty;
        public string AppBaseUrl { get;init; } = string.Empty;

    }
}
