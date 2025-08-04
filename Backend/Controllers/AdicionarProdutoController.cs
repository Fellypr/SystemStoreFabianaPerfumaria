using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using StoreSystemFabianaPerfumaria.Services;
using Microsoft.Extensions.Configuration;
using Microsoft.Data.SqlClient;
using Backend.Services;

namespace StoreSystemFabianaPerfumaria.Controllers

{
    [Route("api/[Controller]")]
    [ApiController]
    public class AdicionarProduto : Controller
    {
        private readonly IConfiguration _config;
        public AdicionarProduto(IConfiguration config)
        {
            _config = config ?? throw new ArgumentNullException(nameof(config));
        }

        [HttpPost("CadastroDeProdutos")]
        public async Task<ActionResult> Produtos([FromBody] Produtos AdicionarProdutos)
        {
            try
            {
                var connectionString = _config.GetConnectionString("DefaultConnection");
                using (var connection = new SqlConnection(connectionString))
                {


                    var query = "INSERT INTO AdicionarProduto (NomeDoProduto,Marca,Preco,Quantidade,CodigoDeBarra,UrlImagem,PrecoAdquirido) VALUES (@NomeDoProduto,@Marca,@Preco,@Quantidade,@CodigoDeBarra,@UrlImagem,@PrecoAdquirido)";
                    var command = new SqlCommand(query, connection);

                    command.Parameters.Add(new SqlParameter("@NomeDoProduto", AdicionarProdutos.NomeDoProduto));
                    command.Parameters.Add(new SqlParameter("@Marca", AdicionarProdutos.Marca));
                    command.Parameters.Add(new SqlParameter("@Preco", AdicionarProdutos.Preco));
                    command.Parameters.Add(new SqlParameter("@Quantidade", AdicionarProdutos.Quantidade));
                    command.Parameters.Add(new SqlParameter("@CodigoDeBarra", AdicionarProdutos.CodigoDeBarra));
                    command.Parameters.Add(new SqlParameter("@UrlImagem", AdicionarProdutos.UrlImagem));
                    command.Parameters.Add(new SqlParameter("@PrecoAdquirido", AdicionarProdutos.PrecoAdquirido));

                    await connection.OpenAsync();
                    var result = await command.ExecuteNonQueryAsync();

                    if (result > 0)
                    {
                        return Ok("Produto Adicionado com sucesso");
                    }
                    else
                    {
                        return BadRequest("Erro ao adicionar produto");
                    }

                }

            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Erro ao adicionar produto: {ex.Message}");

            }
        }

        [HttpGet("HistoricoDeProdutos")]

        public async Task<ActionResult> HistoricoDeProdutos()
        {
            try
            {
                var connectionString = _config.GetConnectionString("DefaultConnection");
                using (var connection = new SqlConnection(connectionString))
                {
                    var query = "SELECT * FROM AdicionarProduto";
                    var command = new SqlCommand(query, connection);
                    await connection.OpenAsync();
                    using (var reader = await command.ExecuteReaderAsync())
                    {
                        var produtos = new List<Produtos>();
                        while (await reader.ReadAsync())
                        {
                            var produto = new Produtos
                            {
                                NomeDoProduto = reader["NomeDoProduto"].ToString(),
                                Marca = reader["Marca"].ToString(),
                                Preco = Convert.ToDecimal(reader["Preco"]),
                                PrecoAdquirido = Convert.ToDecimal(reader["PrecoAdquirido"]),
                                Quantidade = Convert.ToInt32(reader["Quantidade"]),
                                CodigoDeBarra = reader["CodigoDeBarra"].ToString(),
                            };
                            produtos.Add(produto);
                        }
                        return Ok(produtos);
                    }
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Erro ao obter histórico de produtos: {ex.Message}");
            }
        }
        [HttpPut("AtualizarProduto/{id_Produto}")]
        public async Task<IActionResult> AtualizarProduto(int id, [FromBody] Produtos produtoAtualizado)
        {
            var connectionString = _config.GetConnectionString("DefaultConnection");

            using (var connection = new SqlConnection(connectionString))
            {
                await connection.OpenAsync();

                var query = @"
                UPDATE AdicionarProduto
                SET NomeDoProduto = @Nome, Marca = @Marca, Quantidade = @Quantidade, Preco = @Preco,PrecoAdquirido = @PrecoAdquirido
                WHERE Id_Produto = @Id";

                var cmd = new SqlCommand(query, connection);
                cmd.Parameters.AddWithValue("@Nome", produtoAtualizado.NomeDoProduto);
                cmd.Parameters.AddWithValue("@Marca", produtoAtualizado.Marca);
                cmd.Parameters.AddWithValue("@Quantidade", produtoAtualizado.Quantidade);
                cmd.Parameters.AddWithValue("@Preco", produtoAtualizado.Preco);
                cmd.Parameters.AddWithValue("@Id", produtoAtualizado.Id_Produto);
                cmd.Parameters.AddWithValue("@PrecoAdquirido", produtoAtualizado.PrecoAdquirido);

                var linhasAfetadas = await cmd.ExecuteNonQueryAsync();

                if (linhasAfetadas == 0)
                    return NotFound("Produto não encontrado.");

                return Ok("Produto atualizado com sucesso!");
            }
        }
        [HttpDelete("ExcluirProduto/{Id}")]
        public async Task<IActionResult> ExcluirProduto(int id)
        {
            try
            {
                var connectionString = _config.GetConnectionString("DefaultConnection");

                using (var connection = new SqlConnection(connectionString))
                {
                    var query = "DELETE FROM AdicionarProduto WHERE Id_Produto = @Id";
                    var command = new SqlCommand(query, connection);
                    command.Parameters.AddWithValue("@Id", id);

                    await connection.OpenAsync();
                    int rowsAffected = await command.ExecuteNonQueryAsync();

                    if (rowsAffected > 0)
                    {
                        return Ok("Produto excluído com sucesso.");
                    }
                    else
                    {
                        return NotFound("Produto não encontrado.");
                    }
                }
            }
            catch (Exception ex)
            {
                return BadRequest($"Erro ao excluir o produto: {ex.Message}");
            }
        }
        [HttpPost("BuscarProdutoEstoque")]
        public async Task<IActionResult> Buscar([FromBody] BuscarPorEstoque search)
        {
            try
            {
                var connectionString = _config.GetConnectionString("DefaultConnection");
                using (var connection = new SqlConnection(connectionString))
                {
                    var query = @"
                SELECT * FROM AdicionarProduto 
                WHERE 
                    (@Nome IS NULL OR NomeDoProduto LIKE @Nome) AND
                    (@Marca IS NULL OR Marca LIKE @Marca) AND
                    (@Codigo IS NULL OR CodigoDeBarra LIKE @Codigo)";

                    var command = new SqlCommand(query, connection);

                    command.Parameters.AddWithValue("@Nome", string.IsNullOrEmpty(search.NomeDoProduto) ? (object)DBNull.Value : "%" + search.NomeDoProduto + "%");
                    command.Parameters.AddWithValue("@Marca", string.IsNullOrEmpty(search.Marca) ? (object)DBNull.Value : "%" + search.Marca + "%");
                    command.Parameters.AddWithValue("@Codigo", string.IsNullOrEmpty(search.CodigoDeBarra) ? (object)DBNull.Value : "%" + search.CodigoDeBarra + "%");

                    await connection.OpenAsync();

                    using (var reader = await command.ExecuteReaderAsync())
                    {
                        var listaDeProduto = new List<object>();

                        while (await reader.ReadAsync())
                        {
                            listaDeProduto.Add(new
                            {
                                Id_Produto = Convert.ToInt32(reader["Id_Produto"]),
                                NomeDoProduto = reader["NomeDoProduto"].ToString(),
                                Marca = reader["Marca"].ToString(),
                                Preco = Convert.ToDecimal(reader["Preco"]),
                                PrecoAdquirido = Convert.IsDBNull(reader["PrecoAdquirido"]) ? 0 : Convert.ToDecimal(reader["PrecoAdquirido"]),
                                Quantidade = Convert.ToInt32(reader["Quantidade"]),
                                CodigoDeBarra = reader["CodigoDeBarra"].ToString(),
                                UrlImagem = reader["UrlImagem"].ToString(),
                            });
                        }

                        if (listaDeProduto.Count == 0)
                        {
                            return NotFound("Nenhum produto encontrado.");
                        }

                        return Ok(listaDeProduto);
                    }
                }
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
        [HttpPost("BuscarProdutoParaRealizarVenda")]
        public async Task<IActionResult> BuscarParaRealizarVenda([FromBody] BuscarPorEstoque searchvenda)
        {
            try
            {
                var connectionString = _config.GetConnectionString("DefaultConnection");
                using (var connection = new SqlConnection(connectionString))
                {
                    var query = "SELECT * FROM AdicionarProduto WHERE CodigoDeBarra LIKE @CodigoDeBarra OR NomeDoProduto LIKE @NomeDoProduto";
                    var command = new SqlCommand(query, connection);

                    command.Parameters.Add(new SqlParameter("@CodigoDeBarra", "%" + searchvenda.CodigoDeBarra + "%"));
                    command.Parameters.Add(new SqlParameter("@NomeDoProduto", "%" + searchvenda.NomeDoProduto + "%"));

                    await connection.OpenAsync();

                    using (var reader = await command.ExecuteReaderAsync())
                    {
                        var listaDeProduto = new List<object>();

                        while (await reader.ReadAsync())
                        {
                            listaDeProduto.Add(new
                            {
                                Id_Produto = Convert.ToInt32(reader["Id_Produto"]),
                                NomeDoProduto = reader["NomeDoProduto"].ToString(),
                                Marca = reader["Marca"].ToString(),
                                Preco = Convert.ToDecimal(reader["Preco"]),
                                PrecoAdquirido = Convert.IsDBNull(reader["PrecoAdquirido"]) ? 0 : Convert.ToDecimal(reader["PrecoAdquirido"]),
                                Quantidade = Convert.ToInt32(reader["Quantidade"]),
                                CodigoDeBarra = reader["CodigoDeBarra"].ToString(),
                                UrlImagem = reader["UrlImagem"].ToString(),
                            });
                        }

                        if (listaDeProduto.Count == 0)
                        {
                            return NotFound("Nenhum produto encontrado.");
                        }

                        return Ok(listaDeProduto);
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
