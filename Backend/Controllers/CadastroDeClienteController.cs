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
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpGet("HistoricoDeClientes")]
        public async Task<ActionResult> HistoricoDeClientes()
        {
            try
            {
                var connectionString = _config.GetConnectionString("DefaultConnection");
                using (var connection = new SqlConnection(connectionString))
                {
                    var query = "SELECT * FROM CadastroDeCliente ORDER BY Id_Cliente DESC";
                    var command = new SqlCommand(query, connection);
                    await connection.OpenAsync();
                    using (var reader = await command.ExecuteReaderAsync())
                    {
                        var clientes = new List<CadastroDeClienteProp>();
                        while (await reader.ReadAsync())
                        {
                            var cliente = new CadastroDeClienteProp
                            {
                                NomeDoCliente = reader["NomeDoCliente"].ToString(),
                                Cpf = reader["Cpf"].ToString(),
                                Telefone = reader["Telefone"].ToString(),
                                Endereco = reader["Endereco"].ToString(),
                                Bairro = reader["Bairro"].ToString(),
                                Numero = Convert.ToInt32(reader["Numero"]),
                                PontoDeReferencia = reader["PontoDeReferencia"].ToString(),
                                Id_Cliente = Convert.ToInt32(reader["Id_Cliente"]),
                            };
                            clientes.Add(cliente);
                        }
                        return Ok(clientes);
                    }
                }
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }

        }
        [HttpPost("BuscarCliente")]

        public async Task<ActionResult> BuscarCliente([FromBody] BuscarCliente Buscar)
        {
            try
            {
                var connectionString= _config.GetConnectionString("DefaultConnection");
                using (var connection = new SqlConnection(connectionString))
                {
                    var query = "SELECT * FROM CadastroDeCliente WHERE NomeDoCliente LIKE @NomeDoCliente OR Cpf LIKE @Cpf;";
                    var command = new SqlCommand(query, connection);

                    command.Parameters.Add(new SqlParameter("@NomeDoCliente", "%" + Buscar.NomeDoCliente + "%"));
                    command.Parameters.Add(new SqlParameter("@Cpf", "%" + Buscar.Cpf + "%"));

                    await connection.OpenAsync();

                    using (var reader = await command.ExecuteReaderAsync())
                    {
                        var listaDeClientes = new List<object>();

                        while(await reader.ReadAsync())
                        {
                            listaDeClientes.Add(new
                            {   
                                Id_Cliente = Convert.ToInt32(reader["Id_Cliente"]),
                                NomeDoCliente = reader["NomeDoCliente"].ToString(),
                                Cpf = reader["Cpf"].ToString(),
                                Telefone = reader["Telefone"].ToString(),
                                Endereco = reader["Endereco"].ToString(),
                                Bairro = reader["Bairro"].ToString(),
                                Numero = Convert.ToInt32(reader["Numero"]),
                                PontoDeReferencia = reader["PontoDeReferencia"].ToString(),

                            });
                        }

                        if(listaDeClientes.Count == 0)
                        {
                            return NotFound();
                        }
                        else
                        {
                            return Ok(listaDeClientes);
                        }

                    }

                }

            }catch(Exception ex)
            {
                return BadRequest(ex.Message);
            }


        }
        [HttpPut("AtualizarCliente/{id_Cliente}")]

        public async Task <ActionResult> AtualizarCliente( [FromBody] CadastroDeClienteProp ClienteAtualizado)
        {
            var connectionString = _config.GetConnectionString("DefaultConnection");

            using (var connection = new SqlConnection(connectionString))
            {
                await connection.OpenAsync();

                var query = @"
                UPDATE CadastroDeCliente
                SET NomeDoCliente = @NomeDoCliente, Cpf = @Cpf, Telefone = @Telefone, Endereco = @Endereco, Bairro = @Bairro, Numero = @Numero, PontoDeReferencia = @PontoDeReferencia
                WHERE Id_Cliente = @Id_Cliente";

                var cmd = new SqlCommand(query, connection);
                cmd.Parameters.AddWithValue("@NomeDoCliente", ClienteAtualizado.NomeDoCliente);
                cmd.Parameters.AddWithValue("@Cpf", ClienteAtualizado.Cpf);
                cmd.Parameters.AddWithValue("@Telefone", ClienteAtualizado.Telefone);
                cmd.Parameters.AddWithValue("@Endereco", ClienteAtualizado.Endereco);
                cmd.Parameters.AddWithValue("@Bairro", ClienteAtualizado.Bairro);
                cmd.Parameters.AddWithValue("@Numero", ClienteAtualizado.Numero);
                cmd.Parameters.AddWithValue("@PontoDeReferencia", ClienteAtualizado.PontoDeReferencia);
                cmd.Parameters.AddWithValue("@Id_Cliente", ClienteAtualizado.Id_Cliente);

                var linhasAfetadas = await cmd.ExecuteNonQueryAsync();

                if (linhasAfetadas == 0)
                    return NotFound("Cliente nao encontrado.");

                return Ok("Cliente atualizado com sucesso!");
            }
        }
        [HttpDelete("ExcluirCadastro/{id}")]

        public async Task <ActionResult> ExcluirCliente(int id)
        {
            try
            {
                var connectionString = _config.GetConnectionString("DefaultConnection");

                using (var connection = new SqlConnection(connectionString))
                {
                    var query = "DELETE FROM CadastroDeCliente WHERE Id_Cliente = @Id_Cliente";
                    var command = new SqlCommand(query, connection);
                    command.Parameters.AddWithValue("@Id_Cliente", id);

                    await connection.OpenAsync();
                    int rowsAffected = await command.ExecuteNonQueryAsync();

                    if (rowsAffected > 0)
                    {
                        return Ok("Cliente excluido com sucesso.");
                    }
                    else
                    {
                        return NotFound("Cliente nao encontrado.");
                    }
                }
            }
            catch (Exception ex)
            {
                return BadRequest($"Erro ao excluir o cliente: {ex.Message}");
            }
        }
        
    }
}