namespace SmartGrid.Application.Common.Extensions
{
    public static class ManualReadingPathExtensions
    {
        public static string GetManualReadingBlobPath(ImageMetadata metadata, string smartMeterId)
        {
            var timestamp = DateTime.UtcNow.ToString("yyyy-MM-dd_HH-mm-ss");
            return $"{smartMeterId}/reading_{timestamp}.jpg";
        }
    }
}
