using SmartGrid.Domain.Enums;
using System.ComponentModel.DataAnnotations.Schema;

namespace SmartGrid.Infrastructure.Persistence.AzureSQL.Entities
{
    [Table("ResidentalObjects")]
    public class ResidentalObjectEntity
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = null!;
        public ObjectType Type { get; set; }
        public string Street { get; set; } = null!;
        public string Number { get; set; } = null!;
        public string City { get; set; } = null!;
        public string? Description { get; set; }
        public Guid OwnerId { get; set; }
        public UserEntity Owner { get; set; } = null!;
        public ICollection<SmartMeterEntity> Meters { get; set; } = new List<SmartMeterEntity>();
    }
}
