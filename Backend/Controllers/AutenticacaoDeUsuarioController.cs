using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc; 
using Backend.Services;

namespace Backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AutenticacaoDeUsuarioController : ControllerBase
    {
        private readonly IConfiguration _config;
        public AutenticacaoDeUsuarioController(IConfiguration config)
        {
            _config = config ?? throw new ArgumentNullException(nameof(config));
        }
        [HttpPost("Login")]
        public ActionResult Login ([FromBody] Login AutenticacaoDeUsuario){
            if(AutenticacaoDeUsuario.Email == "galemiliano" && AutenticacaoDeUsuario.Senha == "101490"){
                return  Ok("Logado com sucesso");
            }
            return Unauthorized();
        }   
    }
}