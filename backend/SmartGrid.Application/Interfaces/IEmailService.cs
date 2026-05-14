using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace SmartGrid.Application.Interfaces
{
    public interface IEmailService
    {
        Task SendEmailAsync(string email,string fullname,string jwtToken);
    }
}
