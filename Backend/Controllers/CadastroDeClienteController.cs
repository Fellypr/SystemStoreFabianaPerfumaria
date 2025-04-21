using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Routing.Tree;
using Backend.Services;
using Microsoft.Data.SqlClient;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CadastroDeClienteController : ControllerBase
    {
        private readonly IConfiguration _config;
        public CadastroDeClienteController(IConfiguration config)
        {
            _config = config ?? throw new ArgumentNullException(nameof(config));
        }

        [HttpPost("CadastroDeCliente")]

        public async Task<ActionResult> CadastroDeCliente([FromBody] CadastroDeClienteProp Cadastro)
        {
            try
            {
                var connectionString = _config.GetConnectionString("DefaultConnection");
                using (var connection = new SqlConnection(connectionString))
                {
                    var query = "INSERT INTO CadastroDeCliente (NomeDoCliente,Cpf,Telefone,Endereco,Bairro,Numero,PontodeReferencia) VALUES (@NomeDoCliente,@Cpf,@Telefone,@Endereco,@Bairro,@Numero,@PontodeReferencia);";
                    var command = new SqlCommand(query, connection);

                    command.Parameters.Add(new SqlParameter("@NomeDoCliente", Cadastro.NomeDoCliente));
                    command.Parameters.Add(new SqlParameter("@Cpf", Cadastro.Cpf));
                    command.Parameters.Add(new SqlParameter("@Telefone", Cadastro.Telefone));
                    command.Parameters.Add(new SqlParameter("@Endereco", Cadastro.Endereco));
                    command.Parameters.Add(new SqlParameter("@Bairro", Cadastro.Bairro));
                    command.Parameters.Add(new SqlParameter("@Numero", Cadastro.Numero));
                    command.Parameters.Add(new SqlParameter("@PontodeReferencia", Cadastro.PontoDeReferencia));

                    await connection.OpenAsync();

                    return Ok(await command.ExecuteNonQueryAsync());
                }

            }
            catch(Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
    }
}