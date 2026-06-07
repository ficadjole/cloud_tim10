using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace SmartGrid.ITSimulator.Models
{
    public class ActivationResponse
    {
        public string AccessToken { get; set; } = string.Empty;
        public string SmartMeterId { get; set; } = string.Empty;
    }
}
