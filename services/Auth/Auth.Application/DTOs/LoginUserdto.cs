using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Auth.Application.DTOs
{
    public class LoginUserdto
    {
        public required string Email { get; set; }
        public required string Password { get; set; }
    }
}
