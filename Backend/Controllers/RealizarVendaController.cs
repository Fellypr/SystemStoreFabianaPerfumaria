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
                    var query = "SELECT * FROM AdicionarProduto WHERE CodigoDeBarra LIKE @CodigoDeBarra OR NomeDoProduto LIKE @NomeDoProduto";
                    var command = new SqlCommand(query, connection);

                    command.Parameters.Add(new SqlParameter("@CodigoDeBarra", "%" + RealizarVenda.CodigoDeBarra + "%"));
                    command.Parameters.Add(new SqlParameter("@NomeDoProduto", "%" + RealizarVenda.NomeDoProduto + "%"));


                    await connection.OpenAsync();
                    using (var reader = await command.ExecuteReaderAsync())
                    {
                        if (await reader.ReadAsync())
                        {
                            var produtos = new
                            {
                                Id_Produto = Convert.ToInt32(reader["Id_Produto"]),
                                NomeDoProduto = reader["NomeDoProduto"].ToString(),
                                Preco = Convert.ToDecimal(reader["Preco"]),
                                Quantidade = Convert.ToInt32(reader["Quantidade"]),
                                CodigoDeBarra = reader["CodigoDeBarra"].ToString(),
                                Marca = reader["Marca"].ToString(),
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
            if (vendas == null || !vendas.Any())
                return BadRequest("Nenhuma venda recebida.");

            var connectString = _config.GetConnectionString("DefaultConnection");

            using (var connection = new SqlConnection(connectString))
            {
                await connection.OpenAsync();

                // 1. Criar uma nova venda (na tabela Venda)
                var primeiraVenda = vendas.First();
                var queryVenda = "INSERT INTO Venda (Produtos_Vendidos,DataDaVenda, FormaDePagamento, PrecoTotal,QuantidadeTotal,ValorNaFicha,NomeDoComprado) OUTPUT INSERTED.IdVenda VALUES (@produtos_vendidos,@Data, @FormaPagamento, @Total, @quantidadetotal,@ValorNaFicha,@nomeDoComprador)";
                var cmdVenda = new SqlCommand(queryVenda, connection);
                string DataFormatada = primeiraVenda.DataDaVenda.ToLocalTime().ToString("yyyy-MM-ddTHH:mm:ss");
                cmdVenda.Parameters.AddWithValue("@Data", DataFormatada);
                cmdVenda.Parameters.AddWithValue("@FormaPagamento", primeiraVenda.FormaDePagamento);
                cmdVenda.Parameters.AddWithValue("@Total", primeiraVenda.PrecoTotal);
                cmdVenda.Parameters.AddWithValue("@produtos_vendidos", string.Join(" - ", vendas.Select(v => v.NomeDoProduto)));
                cmdVenda.Parameters.AddWithValue("@quantidadetotal", primeiraVenda.quantidadeTotal);
                cmdVenda.Parameters.AddWithValue("@nomeDoComprador", primeiraVenda.Comprador);
                cmdVenda.Parameters.AddWithValue("@ValorNaFicha", primeiraVenda.ValorNaFicha);

                

                var idVendaCriada = (int)await cmdVenda.ExecuteScalarAsync();

                // 2. Inserir os produtos com o ID da venda criada
                foreach (var venda in vendas)
                {
                    var insertProduto = @"
                INSERT INTO RealizarVendas 
                (NomeDoProduto, PrecoTotal, QuantidadeTotal, DataDaVenda, FormaDePagamento, IdVenda)
                VALUES (@NomeDoProduto, @Preco, @Quantidade, @Data, @FormaPagamento, @IdVenda)";

                    var cmdItem = new SqlCommand(insertProduto, connection);
                    cmdItem.Parameters.AddWithValue("@NomeDoProduto", venda.NomeDoProduto);
                    cmdItem.Parameters.AddWithValue("@Preco", venda.PrecoTotal);
                    cmdItem.Parameters.AddWithValue("@Quantidade", venda.QuantidadeTotal);
                    cmdItem.Parameters.AddWithValue("@Data", venda.DataDaVenda);
                    cmdItem.Parameters.AddWithValue("@FormaPagamento", venda.FormaDePagamento);
                    cmdItem.Parameters.AddWithValue("@IdVenda", idVendaCriada);

                    await cmdItem.ExecuteNonQueryAsync();

                    // Atualizar o estoque
                    var updateEstoque = "UPDATE AdicionarProduto SET Quantidade = Quantidade - @Quantidade WHERE NomeDoProduto = @NomeDoProduto";
                    var cmdEstoque = new SqlCommand(updateEstoque, connection);
                    cmdEstoque.Parameters.AddWithValue("@Quantidade", venda.QuantidadeTotal);
                    cmdEstoque.Parameters.AddWithValue("@NomeDoProduto", venda.NomeDoProduto);

                    await cmdEstoque.ExecuteNonQueryAsync();
                }

                return Ok("Venda registrada com sucesso");
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
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }

        }


    }

}