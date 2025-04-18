using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using StoreSystemFabianaPerfumaria.Services;
using Backend.Services;
using System.Text.Json;

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

        public async Task<ActionResult> RealizarVendaDoProduto([FromBody] BuscarProduto RealizarVenda)
        {
            try
            {
                var connectString = _config.GetConnectionString("DefaultConnection");
                using (var connection = new SqlConnection(connectString))
                {
                    var query = "SELECT * FROM AdicionarProduto WHERE CodigoDeBarra = @CodigoDeBarra";
                    var command = new SqlCommand(query, connection);

                    command.Parameters.Add(new SqlParameter("@CodigoDeBarra", RealizarVenda.CodigoDeBarra));


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


                            return Ok(produtos);

                        }
                        else
                        {

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
        [HttpPost("RealizarVenda")]
        public async Task<ActionResult> RealizarVenda([FromBody] List<VendaRealizadaProp> vendas)
        {
            Console.WriteLine("Vendas recebidas: " + JsonSerializer.Serialize(vendas));

            if (vendas == null || !vendas.Any())
            {
                return BadRequest("Nenhuma venda recebida.");
            }


            var connectString = _config.GetConnectionString("DefaultConnection");

            using (var connection = new SqlConnection(connectString))
            {
                await connection.OpenAsync();

                foreach (var venda in vendas)
                {
                    var query = "INSERT INTO RealizarVendas (NomeDoProduto,PrecoTotal,QuantidadeTotal,DataDaVenda,FormaDePagamento) VALUES (@NomeDoProduto,@Preco,@Quantidade,@DataDaVenda,@FormaDePagamento)";
                    var command = new SqlCommand(query, connection);
                    command.Parameters.AddWithValue("@NomeDoProduto", venda.NomeDoProduto);
                    command.Parameters.AddWithValue("@Preco", venda.PrecoTotal);
                    command.Parameters.AddWithValue("@Quantidade", venda.QuantidadeTotal);
                    command.Parameters.AddWithValue("@DataDaVenda", venda.DataDaVenda);
                    command.Parameters.AddWithValue("@FormaDePagamento", venda.FormaDePagamento);

                    await command.ExecuteNonQueryAsync();

                    var queryUpdate = "UPDATE AdicionarProduto SET Quantidade = Quantidade - @Quantidade WHERE NomeDoProduto = @nomeDoProduto";
                    var command2 = new SqlCommand(queryUpdate, connection);
                    command2.Parameters.AddWithValue("@Quantidade", venda.QuantidadeTotal);
                    command2.Parameters.AddWithValue("@nomeDoProduto", venda.NomeDoProduto);

                    await command2.ExecuteNonQueryAsync();
                }

                return Ok("Todas as vendas foram realizadas com sucesso");
            }
        }

        [HttpGet("VendasRealizadas")]
        public async Task<ActionResult> HistoricoDeVendasRealizadas()
        {
            try
            {
                var connectString = _config.GetConnectionString("DefaultConnection");
                using (var connection = new SqlConnection(connectString))
                {
                    var query = "SELECT * FROM RealizarVendas";
                    var command = new SqlCommand(query, connection);
                    await connection.OpenAsync();
                    using (var reader = await command.ExecuteReaderAsync())
                    {
                        var vendas = new List<VendaRealizadaProp>();
                        while (await reader.ReadAsync())
                        {
                            var venda = new VendaRealizadaProp
                            {  
                                NomeDoProduto = reader["NomeDoProduto"].ToString(),
                                PrecoTotal = Convert.ToDecimal(reader["PrecoTotal"]),
                                QuantidadeTotal = Convert.ToInt32(reader["QuantidadeTotal"]),
                                DataDaVenda = Convert.ToDateTime(reader["DataDaVenda"]),
                                FormaDePagamento = reader["FormaDePagamento"].ToString(),
                            };
                            vendas.Add(venda);
                        }
                        return Ok(vendas);
                    }
                }
            }
            catch(Exception ex)
            {
                return BadRequest(ex.Message);
            }

        }


    }

}