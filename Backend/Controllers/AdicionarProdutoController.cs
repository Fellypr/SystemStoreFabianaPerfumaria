using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;
using StoreSystemFabianaPerfumaria.Services;
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
                    await connection.OpenAsync();

                    var checkProdutoQuery = "SELECT COUNT(*) FROM AdicionarProduto WHERE NomeDoProduto = @NomeDoProduto";
                    using (var checkCommand = new SqlCommand(checkProdutoQuery, connection))
                    {
                        checkCommand.Parameters.Add(new SqlParameter("@NomeDoProduto", AdicionarProdutos.NomeDoProduto));

                        var count = (int)await checkCommand.ExecuteScalarAsync();
                        if (count > 0)
                        {
                            return Conflict($"O Nome do produto Já Existe");
                        }
                    }

                    var queryCheck = "SELECT COUNT(*) FROM AdicionarProduto WHERE CodigoDeBarra = @CodigoDeBarra";
                    using (var checkCommand2 = new SqlCommand(queryCheck, connection))
                    {
                        checkCommand2.Parameters.Add(new SqlParameter("@CodigoDeBarra", AdicionarProdutos.CodigoDeBarra));
                        var count2 = (int)await checkCommand2.ExecuteScalarAsync();
                        if (count2 > 0)
                        {
                            return Conflict("O Codigo de Barra Já Existe");
                        }
                    }

                    var query = "INSERT INTO AdicionarProduto (NomeDoProduto, Marca, Preco, Quantidade, CodigoDeBarra, UrlImagem, PrecoAdquirido, Preco_Da_Ficha, Preco_a_vista) VALUES (@NomeDoProduto, @Marca, @Preco, @Quantidade, @CodigoDeBarra, @UrlImagem, @PrecoAdquirido, @Preco_Da_Ficha, @Preco_a_vista)";
                    using (var command = new SqlCommand(query, connection))
                    {
                        command.Parameters.Add(new SqlParameter("@NomeDoProduto", AdicionarProdutos.NomeDoProduto));
                        command.Parameters.Add(new SqlParameter("@Marca", AdicionarProdutos.Marca));
                        command.Parameters.Add(new SqlParameter("@Preco", AdicionarProdutos.Preco));
                        command.Parameters.Add(new SqlParameter("@Quantidade", AdicionarProdutos.Quantidade));
                        command.Parameters.Add(new SqlParameter("@CodigoDeBarra", AdicionarProdutos.CodigoDeBarra));
                        command.Parameters.Add(new SqlParameter("@UrlImagem", AdicionarProdutos.UrlImagem));
                        command.Parameters.Add(new SqlParameter("@PrecoAdquirido", AdicionarProdutos.PrecoAdquirido));
                        command.Parameters.Add(new SqlParameter("@Preco_Da_Ficha", AdicionarProdutos.PrecoEmFicha));
                        command.Parameters.Add(new SqlParameter("@Preco_a_vista", AdicionarProdutos.PrecoAvista));

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
                    using (var command = new SqlCommand(query, connection))
                    {
                        await connection.OpenAsync();

                        using (var reader = await command.ExecuteReaderAsync())
                        {
                            var produtos = new List<Produtos>();
                            while (await reader.ReadAsync())
                            {
                                var produto = new Produtos
                                {
                                    Id_Produto = Convert.ToInt32(reader["Id_Produto"]),
                                    NomeDoProduto = reader["NomeDoProduto"].ToString(),
                                    Marca = reader["Marca"].ToString(),
                                    Preco = Convert.ToDecimal(reader["Preco"]),
                                    PrecoAdquirido = Convert.IsDBNull(reader["PrecoAdquirido"]) ? 0 : Convert.ToDecimal(reader["PrecoAdquirido"]),
                                    Quantidade = Convert.ToInt32(reader["Quantidade"]),
                                    CodigoDeBarra = reader["CodigoDeBarra"].ToString(),
                                    UrlImagem = reader["UrlImagem"]?.ToString(),
                                    PrecoEmFicha = Convert.IsDBNull(reader["Preco_Da_Ficha"]) ? 0 : Convert.ToDecimal(reader["Preco_Da_Ficha"]),
                                    PrecoAvista = Convert.IsDBNull(reader["Preco_a_vista"]) ? 0 : Convert.ToDecimal(reader["Preco_a_vista"]),
                                };
                                produtos.Add(produto);
                            }
                            return Ok(produtos);
                        }
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
            try
            {
                var connectionString = _config.GetConnectionString("DefaultConnection");

                using (var connection = new SqlConnection(connectionString))
                {
                    await connection.OpenAsync();

                    var query = @"
                UPDATE AdicionarProduto
                SET NomeDoProduto = @Nome, Marca = @Marca, Quantidade = @Quantidade, Preco = @Preco, PrecoAdquirido = @PrecoAdquirido, CodigoDeBarra = @CodigoDeBarra, Preco_Da_Ficha = @Preco_Da_Ficha, Preco_a_vista = @Preco_a_vista, UrlImagem = @UrlImagem
                WHERE Id_Produto = @Id";

                    using (var cmd = new SqlCommand(query, connection))
                    {
                        cmd.Parameters.AddWithValue("@Nome", produtoAtualizado.NomeDoProduto);
                        cmd.Parameters.AddWithValue("@Marca", produtoAtualizado.Marca);
                        cmd.Parameters.AddWithValue("@Quantidade", produtoAtualizado.Quantidade);
                        cmd.Parameters.AddWithValue("@Preco", produtoAtualizado.Preco);
                        cmd.Parameters.AddWithValue("@Id", produtoAtualizado.Id_Produto);
                        cmd.Parameters.AddWithValue("@PrecoAdquirido", produtoAtualizado.PrecoAdquirido);
                        cmd.Parameters.AddWithValue("@CodigoDeBarra", produtoAtualizado.CodigoDeBarra);
                        cmd.Parameters.AddWithValue("@Preco_Da_Ficha", produtoAtualizado.PrecoEmFicha);
                        cmd.Parameters.AddWithValue("@Preco_a_vista", produtoAtualizado.PrecoAvista);
                        cmd.Parameters.AddWithValue("@UrlImagem", produtoAtualizado.UrlImagem ?? (object)DBNull.Value);

                        var linhasAfetadas = await cmd.ExecuteNonQueryAsync();

                        if (linhasAfetadas == 0)
                            return NotFound("Produto não encontrado.");

                        return Ok("Produto atualizado com sucesso!");
                    }
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Erro interno ao atualizar o produto: {ex.Message}");
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
                    using (var command = new SqlCommand(query, connection))
                    {
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
                    (@Codigo IS NULL OR CodigoDeBarra = @Codigo)";

                    using (var command = new SqlCommand(query, connection))
                    {
                        command.Parameters.AddWithValue("@Nome", string.IsNullOrEmpty(search.NomeDoProduto) ? (object)DBNull.Value : "%" + search.NomeDoProduto + "%");
                        command.Parameters.AddWithValue("@Marca", string.IsNullOrEmpty(search.Marca) ? (object)DBNull.Value : "%" + search.Marca + "%");
                        command.Parameters.AddWithValue("@Codigo", string.IsNullOrEmpty(search.CodigoDeBarra) ? (object)DBNull.Value : search.CodigoDeBarra);

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
                                    PrecoEmFicha = Convert.IsDBNull(reader["Preco_Da_Ficha"]) ? 0 : Convert.ToDecimal(reader["Preco_Da_Ficha"]),
                                    PrecoAvista = Convert.IsDBNull(reader["Preco_a_vista"]) ? 0 : Convert.ToDecimal(reader["Preco_a_vista"]),
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
                string termo = searchvenda.CodigoDeBarra;

                if (string.IsNullOrWhiteSpace(termo))
                    termo = searchvenda.NomeDoProduto;

                if (string.IsNullOrWhiteSpace(termo))
                    return BadRequest("Digite o nome ou escaneie o produto.");

                termo = termo.Trim();

                bool ehCodigoDeBarra = termo.All(char.IsDigit);

                var connectionString = _config.GetConnectionString("DefaultConnection");

                using (var connection = new SqlConnection(connectionString))
                {
                    string query;

                    if (ehCodigoDeBarra)
                    {
                        query = @"SELECT TOP 1 *
                              FROM AdicionarProduto
                              WHERE CodigoDeBarra = @Termo";
                    }
                    else
                    {
                        query = @"SELECT *
                              FROM AdicionarProduto
                              WHERE NomeDoProduto LIKE @Termo";
                    }

                    using (var command = new SqlCommand(query, connection))
                    {
                        command.Parameters.AddWithValue(
                            "@Termo",
                            ehCodigoDeBarra ? termo : $"%{termo}%"
                        );

                        await connection.OpenAsync();

                        using (var reader = await command.ExecuteReaderAsync())
                        {
                            var lista = new List<object>();

                            while (await reader.ReadAsync())
                            {
                                lista.Add(new
                                {
                                    Id_Produto = Convert.ToInt32(reader["Id_Produto"]),
                                    NomeDoProduto = reader["NomeDoProduto"].ToString(),
                                    Marca = reader["Marca"].ToString(),
                                    Preco = Convert.ToDecimal(reader["Preco"]),
                                    PrecoAdquirido = reader["PrecoAdquirido"] == DBNull.Value ? 0 : Convert.ToDecimal(reader["PrecoAdquirido"]),
                                    PrecoEmFicha = reader["Preco_Da_Ficha"] == DBNull.Value ? 0 : Convert.ToDecimal(reader["Preco_Da_Ficha"]),
                                    PrecoAvista = reader["Preco_a_vista"] == DBNull.Value ? 0 : Convert.ToDecimal(reader["Preco_a_vista"]),
                                    Quantidade = Convert.ToInt32(reader["Quantidade"]),
                                    CodigoDeBarra = reader["CodigoDeBarra"].ToString(),
                                    UrlImagem = reader["UrlImagem"].ToString()
                                });
                            }

                            if (!lista.Any())
                                return NotFound("Nenhum produto encontrado.");

                            return Ok(lista);
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Erro ao buscar produto para venda: {ex.Message}");
            }
        }

        
    }
}
