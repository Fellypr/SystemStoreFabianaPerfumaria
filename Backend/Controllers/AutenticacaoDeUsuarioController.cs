using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc; 
using Backend.Dtos.Auth;
using Backend.Services.Interfaces;

namespace Backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AutenticacaoDeUsuarioController : ControllerBase
    {
        private readonly IAuthService _authService;

        public AutenticacaoDeUsuarioController(IAuthService authService)
        {
            _authService = authService ?? throw new ArgumentNullException(nameof(authService));
        }
        [HttpPost("Login")]
        public ActionResult Login ([FromBody] LoginDto AutenticacaoDeUsuario){
            if(_authService.LoginValido(AutenticacaoDeUsuario)){
                return  Ok("Logado com sucesso");
            }
            return Unauthorized();
        }   
    }
}