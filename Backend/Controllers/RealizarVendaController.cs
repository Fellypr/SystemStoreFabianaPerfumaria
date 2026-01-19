using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using StoreSystemFabianaPerfumaria.Services;
using Backend.Services;
using System.Text.Json;
using System.Data;
using System.Globalization;

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


                using (var transaction = connection.BeginTransaction())
                {
                    try
                    {
                        var primeiraVenda = vendas.First();


                        var queryCliente = "SELECT Id_Cliente FROM CadastroDeCliente WHERE NomeDoCliente = @NomeDoCliente";
                        var cmdCliente = new SqlCommand(queryCliente, connection, transaction);
                        cmdCliente.Parameters.Add("@NomeDoCliente", SqlDbType.NVarChar).Value = primeiraVenda.Comprador;

                        int? idCliente = (int?)await cmdCliente.ExecuteScalarAsync();

                        if (idCliente == null)
                        {
                            var queryInserirCliente = @"
        INSERT INTO CadastroDeCliente (NomeDoCliente, Cpf, Telefone, Endereco, Bairro, Numero, PontodeReferencia)
        OUTPUT INSERTED.Id_Cliente
        VALUES (@NomeDoCliente, @Cpf, @Telefone, @Endereco, @Bairro, @Numero, @Ponto);";

                            using (var cmdInserirCliente = new SqlCommand(queryInserirCliente, connection, transaction))
                            {
                                cmdInserirCliente.Parameters.Add("@NomeDoCliente", SqlDbType.NVarChar).Value = primeiraVenda.Comprador;

                                cmdInserirCliente.Parameters.Add("@Cpf", SqlDbType.NVarChar).Value = "000.000.000-00";
                                cmdInserirCliente.Parameters.Add("@Telefone", SqlDbType.NVarChar).Value = "(00)0000-0000";
                                cmdInserirCliente.Parameters.Add("@Endereco", SqlDbType.NVarChar).Value = "Não informado";
                                cmdInserirCliente.Parameters.Add("@Bairro", SqlDbType.NVarChar).Value = "Não informado";
                                cmdInserirCliente.Parameters.Add("@Numero", SqlDbType.Int).Value = 0;
                                cmdInserirCliente.Parameters.Add("@Ponto", SqlDbType.NVarChar).Value = "Não informado";

                                idCliente = (int)await cmdInserirCliente.ExecuteScalarAsync();
                            }
                        }


                        var queryVenda = @"
                    INSERT INTO Venda 
                    (Produtos_Vendidos, DataDaVenda, FormaDePagamento, PrecoTotal, QuantidadeTotal, ValorNaFicha, NomeDoComprado, IdVendaDeCliente)
                    OUTPUT INSERTED.IdVenda
                    VALUES (@Produtos, @Data, @FormaPagamento, @Total, @QuantidadeTotal, @ValorNaFicha, @NomeComprador, @IdCliente);";

                        var cmdVenda = new SqlCommand(queryVenda, connection, transaction);

                        cmdVenda.Parameters.Add("@Produtos", SqlDbType.NVarChar).Value =
                            string.Join(" - ", vendas.Select(v => v.NomeDoProduto));

                        cmdVenda.Parameters.Add("@Data", SqlDbType.DateTime).Value = primeiraVenda.DataDaVenda;
                        cmdVenda.Parameters.Add("@FormaPagamento", SqlDbType.NVarChar).Value = primeiraVenda.FormaDePagamento;
                        cmdVenda.Parameters.Add("@Total", SqlDbType.Decimal).Value = primeiraVenda.PrecoTotal;
                        cmdVenda.Parameters.Add("@QuantidadeTotal", SqlDbType.Int).Value = primeiraVenda.quantidadeTotal;
                        cmdVenda.Parameters.Add("@ValorNaFicha", SqlDbType.Decimal).Value = primeiraVenda.ValorNaFicha;
                        cmdVenda.Parameters.Add("@NomeComprador", SqlDbType.NVarChar).Value = primeiraVenda.Comprador;
                        cmdVenda.Parameters.Add("@IdCliente", SqlDbType.Int).Value = idCliente;

                        var idVendaCriada = (int)await cmdVenda.ExecuteScalarAsync();


                        foreach (var venda in vendas)
                        {
                            var insertProduto = @"
                        INSERT INTO RealizarVendas 
                        (NomeDoProduto, PrecoTotal, QuantidadeTotal, DataDaVenda, FormaDePagamento, IdVenda)
                        VALUES (@NomeProduto, @Preco, @Quantidade, @Data, @FormaPagamento, @IdVenda);";

                            var cmdItem = new SqlCommand(insertProduto, connection, transaction);

                            cmdItem.Parameters.Add("@NomeProduto", SqlDbType.NVarChar).Value = venda.NomeDoProduto;
                            cmdItem.Parameters.Add("@Preco", SqlDbType.Decimal).Value = venda.PrecoUnitario;
                            cmdItem.Parameters.Add("@Quantidade", SqlDbType.Int).Value = venda.QuantidadeTotal;
                            cmdItem.Parameters.Add("@Data", SqlDbType.DateTime).Value = venda.DataDaVenda;
                            cmdItem.Parameters.Add("@FormaPagamento", SqlDbType.NVarChar).Value = venda.FormaDePagamento;
                            cmdItem.Parameters.Add("@IdVenda", SqlDbType.Int).Value = idVendaCriada;

                            await cmdItem.ExecuteNonQueryAsync();

                            var updateEstoque = @"
                        UPDATE AdicionarProduto 
                        SET Quantidade = Quantidade - @Quantidade 
                        WHERE NomeDoProduto = @NomeProduto";

                            var cmdEstoque = new SqlCommand(updateEstoque, connection, transaction);
                            cmdEstoque.Parameters.Add("@Quantidade", SqlDbType.Int).Value = venda.QuantidadeTotal;
                            cmdEstoque.Parameters.Add("@NomeProduto", SqlDbType.NVarChar).Value = venda.NomeDoProduto;

                            await cmdEstoque.ExecuteNonQueryAsync();
                        }


                        transaction.Commit();
                        return Ok("Venda realizada com sucesso.");
                    }
                    catch (Exception ex)
                    {
                        transaction.Rollback();
                        return StatusCode(500, $"Erro ao realizar venda: {ex.Message}");
                    }
                }
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
                    var query = @"SELECT * FROM Venda 
WHERE CAST(DataDaVenda AS DATE) = CAST(GETDATE() AS DATE)
ORDER BY DataDaVenda DESC;";
                    var command = new SqlCommand(query, connection);
                    await connection.OpenAsync();
                    using (var reader = await command.ExecuteReaderAsync())
                    {
                        var vendas = new List<VendaRealizadaProp>();
                        while (await reader.ReadAsync())
                        {
                            var venda = new VendaRealizadaProp
                            {
                                NomeDoProduto = reader["Produtos_Vendidos"].ToString(),
                                Comprador = reader["NomeDoComprado"].ToString(),
                                PrecoTotal = Convert.ToDecimal(reader["PrecoTotal"]),
                                quantidadeTotal = Convert.ToInt32(reader["QuantidadeTotal"]),
                                DataDaVenda = Convert.ToDateTime(reader["DataDaVenda"]),
                                FormaDePagamento = reader["FormaDePagamento"].ToString(),
                                ValorNaFicha = Convert.ToDecimal(reader["ValorNaFicha"]),
                                IdVenda = Convert.ToInt32(reader["IdVenda"]),
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
        [HttpGet("HistoricoCrediario")]
        public async Task<ActionResult> HistoricoDeVendasRealizadasPelaSemana([FromQuery] string? cliente, [FromQuery] DateTime? data)
        {
            try
            {
                var connectString = _config.GetConnectionString("DefaultConnection");
                using (var connection = new SqlConnection(connectString))
                {
                    var query = @"
SELECT 
    RV.QuantidadeTotal,
    RV.NomeDoProduto,
    CD.Telefone,
    RV.PrecoTotal,
    V.DataDaVenda,
    CD.NomeDoCliente,
    V.ValorNaFicha,
    V.FormaDePagamento,
    V.Produtos_Vendidos,
    V.IdVenda
FROM Venda V
INNER JOIN RealizarVendas RV
    ON RV.IdVenda = V.IdVenda
INNER JOIN CadastroDeCliente CD
    ON CD.Id_Cliente = V.IdVendaDeCliente
WHERE V.FormaDePagamento = 'Crediario'
  AND (@cliente IS NULL OR CD.NomeDoCliente LIKE @cliente)
  AND (@data IS NULL OR CAST(V.DataDaVenda AS DATE) = @data)
ORDER BY V.DataDaVenda;";



                    var command = new SqlCommand(query, connection);
                    command.Parameters.AddWithValue("@cliente", string.IsNullOrWhiteSpace(cliente) ? (object)DBNull.Value : "%" + cliente + "%");
                    command.Parameters.AddWithValue("@data", SqlDbType.Date).Value = data.HasValue ? data.Value.Date : (object)DBNull.Value;

                    await connection.OpenAsync();

                    using (var reader = await command.ExecuteReaderAsync())
                    {
                        var vendas = new List<VendaRealizadaProp>();
                        while (await reader.ReadAsync())
                        {
                            var venda = new VendaRealizadaProp
                            {
                                IdVenda = Convert.ToInt32(reader["IdVenda"]),
                                NomeDoProduto = reader["NomeDoProduto"].ToString(),
                                Comprador = reader["NomeDoCliente"].ToString(),
                                PrecoUnitario = Convert.ToDecimal(reader["PrecoTotal"].ToString(), CultureInfo.InvariantCulture),
                                QuantidadeTotal = Convert.ToInt32(reader["QuantidadeTotal"]),
                                DataDaVenda = Convert.ToDateTime(reader["DataDaVenda"]),
                                FormaDePagamento = reader["FormaDePagamento"].ToString(),
                                ValorNaFicha = Convert.ToDecimal(reader["ValorNaFicha"]),
                                Produtos_Vendidos = reader["Produtos_Vendidos"].ToString(),
                                NumeroDeTelefone = reader["Telefone"].ToString(),
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
        [HttpPost("FiltrarVendas")]
        public async Task<ActionResult> FiltrarVendas([FromBody] FiltrarVendas Filtrar)
        {
            try
            {
                var connectString = _config.GetConnectionString("DefaultConnection");
                using (var connection = new SqlConnection(connectString))
                {
                    var query = @"
                                SELECT *
                                FROM Venda
                                WHERE (@comprado IS NULL OR NomeDoComprado LIKE '%' + @comprado + '%')
                                  AND (@formaDePagamento IS NULL OR FormaDePagamento = @formaDePagamento)
                                ORDER BY NomeDoComprado";

                    var command = new SqlCommand(query, connection);

                    command.Parameters.AddWithValue("@comprado", string.IsNullOrWhiteSpace(Filtrar.NomeDoComprado) ? (object)DBNull.Value : Filtrar.NomeDoComprado);
                    command.Parameters.AddWithValue("@formaDePagamento", string.IsNullOrWhiteSpace(Filtrar.FormaDePagamento) ? (object)DBNull.Value : Filtrar.FormaDePagamento);



                    await connection.OpenAsync();
                    using (var reader = await command.ExecuteReaderAsync())
                    {
                        var vendas = new List<object>();
                        while (await reader.ReadAsync())
                        {
                            vendas.Add(new
                            {
                                Id_Venda = Convert.ToInt32(reader["IdVenda"]),
                                Comprador = reader["NomeDoComprado"].ToString(),
                                PrecoTotal = Convert.ToDecimal(reader["PrecoTotal"]),
                                quantidadeTotal = Convert.ToInt32(reader["quantidadeTotal"]),
                                NomeDoProduto = reader["Produtos_Vendidos"].ToString(),
                                DataDaVenda = Convert.ToDateTime(reader["DataDaVenda"]),
                                FormaDePagamento = reader["FormaDePagamento"].ToString(),
                                ValorNaFicha = Convert.ToDecimal(reader["ValorNaFicha"]),
                            });
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

        [HttpPost("FiltrarVendasPelaData")]
        public async Task<ActionResult> FiltrarVendasPelaData([FromBody] FiltrarVendasPelaData FiltrarData)
        {
            try
            {
                var connectString = _config.GetConnectionString("DefaultConnection");
                using (var connection = new SqlConnection(connectString))
                {
                    var query = "SELECT * FROM VENDA WHERE CAST(DataDaVenda AS DATE) BETWEEN @dataInicial AND @dataFinal ORDER BY DataDaVenda DESC";
                    var command = new SqlCommand(query, connection);
                    command.Parameters.AddWithValue("@dataInicial", FiltrarData.DataInicio);
                    command.Parameters.AddWithValue("@dataFinal", FiltrarData.DataFim);
                    await connection.OpenAsync();
                    using (var reader = await command.ExecuteReaderAsync())
                    {
                        var vendas = new List<object>();
                        while (await reader.ReadAsync())
                        {
                            vendas.Add(new
                            {
                                Id_Venda = Convert.ToInt32(reader["IdVenda"]),
                                Comprador = reader["NomeDoComprado"].ToString(),
                                PrecoTotal = Convert.ToDecimal(reader["PrecoTotal"]),
                                quantidadeTotal = Convert.ToInt32(reader["quantidadeTotal"]),
                                NomeDoProduto = reader["Produtos_Vendidos"].ToString(),
                                DataDaVenda = Convert.ToDateTime(reader["DataDaVenda"]),
                                FormaDePagamento = reader["FormaDePagamento"].ToString(),
                                ValorNaFicha = Convert.ToDecimal(reader["ValorNaFicha"]),
                            });
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
        [HttpPost("AbaterValor/{idVenda}")]
        public async Task<ActionResult> AbaterValorNaFicha(
    int idVenda,
    [FromBody] VendaRealizadaProp atualizar)
        {
            try
            {
                var connectString = _config.GetConnectionString("DefaultConnection");

                using (var connection = new SqlConnection(connectString))
                {
                    await connection.OpenAsync();

                    using (var transaction = connection.BeginTransaction())
                    {
                        try
                        {
                            var updateQuery = @"
                        UPDATE Venda 
                        SET ValorNaFicha = ValorNaFicha - @Valor
                        WHERE IdVenda = @IdVenda";

                            using (var cmdUpdate = new SqlCommand(updateQuery, connection, transaction))
                            {
                                cmdUpdate.Parameters.Add("@IdVenda", SqlDbType.Int).Value = idVenda;
                                cmdUpdate.Parameters.Add("@Valor", SqlDbType.Decimal).Value = atualizar.ValorNaFicha;

                                var rows = await cmdUpdate.ExecuteNonQueryAsync();
                                if (rows == 0)
                                {
                                    transaction.Rollback();
                                    return NotFound("Venda não encontrada");
                                }
                            }

                            var deleteItens = @"
                        DELETE FROM RealizarVendas
                        WHERE IdVenda = @IdVenda
                        AND EXISTS (
                            SELECT 1 FROM Venda 
                            WHERE IdVenda = @IdVenda AND ValorNaFicha <= 0
                        )";

                            using (var cmdItens = new SqlCommand(deleteItens, connection, transaction))
                            {
                                cmdItens.Parameters.Add("@IdVenda", SqlDbType.Int).Value = idVenda;
                                await cmdItens.ExecuteNonQueryAsync();
                            }

                            var deleteVenda = @"
                        DELETE FROM Venda
                        WHERE IdVenda = @IdVenda AND ValorNaFicha <= 0";

                            using (var cmdVenda = new SqlCommand(deleteVenda, connection, transaction))
                            {
                                cmdVenda.Parameters.Add("@IdVenda", SqlDbType.Int).Value = idVenda;
                                await cmdVenda.ExecuteNonQueryAsync();
                            }

                            transaction.Commit();
                            return Ok("Valor abatido com sucesso");
                        }
                        catch
                        {
                            transaction.Rollback();
                            throw;
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                return BadRequest($"Erro ao abater valor: {ex.Message}");
            }
        }



        [HttpPost("ClientesComFichaEmAberto")]

        public async Task<ActionResult> ClienteComValorDaFichaEmAberto([FromBody] FiltrarVendasPelaFicha FiltrarData)
        {
            try
            {
                var connectString = _config.GetConnectionString("DefaultConnection");
                using (var connection = new SqlConnection(connectString))
                {
                    await connection.OpenAsync();

                    var query = "SELECT * FROM Venda WHERE ValorNaFicha > 0 AND NomeDoComprado = @NomeDoComprado";

                    using (var command = new SqlCommand(query, connection))
                    {
                        command.Parameters.AddWithValue("@NomeDoComprado", FiltrarData.FichaEmAberto);
                        using (var reader = await command.ExecuteReaderAsync())
                        {
                            var vendas = new List<object>();
                            while (await reader.ReadAsync())
                            {
                                vendas.Add(new
                                {
                                    Id_Venda = Convert.ToInt32(reader["IdVenda"]),
                                    Comprador = reader["NomeDoComprado"].ToString(),
                                    PrecoTotal = Convert.ToDecimal(reader["PrecoTotal"]),
                                    quantidadeTotal = Convert.ToInt32(reader["quantidadeTotal"]),
                                    NomeDoProduto = reader["Produtos_Vendidos"].ToString(),
                                    DataDaVenda = Convert.ToDateTime(reader["DataDaVenda"]),
                                    FormaDePagamento = reader["FormaDePagamento"].ToString(),
                                    ValorNaFicha = Convert.ToDecimal(reader["ValorNaFicha"]),
                                });
                            }
                            return Ok(vendas);
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpGet("VendasDaSemana")]
        public async Task<ActionResult> HistoricoDeVendasRealizadasPelaSemana()
        {
            try
            {
                var connectString = _config.GetConnectionString("DefaultConnection");
                using (var connection = new SqlConnection(connectString))
                {
                    var query = @"SET DATEFIRST 1; SELECT DATENAME(WEEKDAY, DataDaVenda) AS DiaDaSemana, COUNT(*) AS Quantidade FROM Venda WHERE CAST(DataDaVenda AS DATE) >= DATEADD(DAY, 1 - DATEPART(WEEKDAY, GETDATE()), CAST(GETDATE() AS DATE)) AND CAST(DataDaVenda AS DATE) <= DATEADD(DAY, 6 - DATEPART(WEEKDAY, GETDATE()), CAST(GETDATE() AS DATE)) GROUP BY DATENAME(WEEKDAY, DataDaVenda) ORDER BY MIN(DATEPART(WEEKDAY, DataDaVenda));";
                    var command = new SqlCommand(query, connection);
                    await connection.OpenAsync();
                    using (var reader = await command.ExecuteReaderAsync())
                    {
                        var vendas = new List<VendaRealizadaProp>();
                        while (await reader.ReadAsync())
                        {
                            var venda = new VendaRealizadaProp
                            {
                                QuantidadeDoDia = Convert.ToInt32(reader["Quantidade"]),
                                DiaDaSemana = reader["DiaDaSemana"].ToString(),
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