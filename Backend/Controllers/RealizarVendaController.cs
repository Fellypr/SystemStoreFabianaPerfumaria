using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using StoreSystemFabianaPerfumaria.Services;
using Backend.Services;

namespace Backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class RealizarVendaController : Controller
    {
        private readonly IConfiguration _config;

        public RealizarVendaController(IConfiguration config)
        {
            _config = config ?? throw new ArgumentNullException(nameof(config));
        }


        [HttpPost("BuscarProduto")]

        public async Task<ActionResult> RealizarVendaDoProduto ([FromBody] BuscarProduto RealizarVenda)
        {
            try
            {
                var connectString = _config.GetConnectionString("DefaultConnection");
                using (var connection = new SqlConnection(connectString))
                {
                    var query = "SELECT * FROM AdicionarProduto WHERE CodigoDeBarra = @CodigoDeBarra";
                    var command = new SqlCommand(query, connection);

                    command.Parameters.Add(new SqlParameter("@CodigoDeBarra", RealizarVenda.CodigoDeBarra));
                    Console.WriteLine($"Código recebido: {RealizarVenda.CodigoDeBarra}");

                    await connection.OpenAsync();
                    using (var reader = await command.ExecuteReaderAsync())
                    {
                        if (await reader.ReadAsync())
                        {
                            var produtos = new
                            {
                                NomeDoProduto = reader["NomeDoProduto"].ToString(),
                                Preco = Convert.ToDecimal(reader["Preco"]),
                                UrlImagem = reader["UrlImagem"].ToString(),
                            };
                            Console.WriteLine($"Produto encontrado: {produtos}");

                            return Ok(produtos);

                        }
                        else
                        {
                            Console.WriteLine("Produto não encontrado");
                            return NotFound("Produto não encontrado");
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }

        }

    }
}