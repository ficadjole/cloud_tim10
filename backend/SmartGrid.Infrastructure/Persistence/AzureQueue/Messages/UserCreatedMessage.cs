namespace SmartGrid.Domain.Events
{
    public sealed class UserCreatedMessage()
    {
        public string Email { get; init; } = string.Empty;
        public string FullName { get; init; } = string.Empty;

        public string SetPasswordJWTToken { get; init; } = string.Empty;
    }
}
