using System.Data;
using System.Globalization;
using Backend.Dtos.Pagamentos;
using Backend.Dtos.Vendas;
using Backend.Infrastructure.Db;
using Backend.Repositories.Interfaces;
using Microsoft.Data.SqlClient;

namespace Backend.Repositories.Sql;

public sealed class SqlVendaRepository : IVendaRepository
{
    private readonly IDbConnectionFactory _db;

    public SqlVendaRepository(IDbConnectionFactory db)
    {
        _db = db ?? throw new ArgumentNullException(nameof(db));
    }

    public async Task RealizarVendaAsync(List<VendaRealizadaDto> vendas)
    {
        var connectString = _db.CreateConnection().ConnectionString;
        using var connection = new SqlConnection(connectString);
        await connection.OpenAsync();

        using var transaction = connection.BeginTransaction();
        try
        {
            var primeiraVenda = vendas.First();

            const string queryCliente = "SELECT Id_Cliente FROM CadastroDeCliente WHERE NomeDoCliente = @NomeDoCliente";
            using var cmdCliente = new SqlCommand(queryCliente, connection, transaction);
            cmdCliente.Parameters.Add("@NomeDoCliente", SqlDbType.NVarChar).Value = primeiraVenda.Comprador;
            int? idCliente = (int?)await cmdCliente.ExecuteScalarAsync();

            if (idCliente == null)
            {
                const string queryInserirCliente = @"
        INSERT INTO CadastroDeCliente (NomeDoCliente, Cpf, Telefone, Endereco, Bairro, Numero, PontodeReferencia)
        OUTPUT INSERTED.Id_Cliente
        VALUES (@NomeDoCliente, @Cpf, @Telefone, @Endereco, @Bairro, @Numero, @Ponto);";

                using var cmdInserirCliente = new SqlCommand(queryInserirCliente, connection, transaction);
                cmdInserirCliente.Parameters.Add("@NomeDoCliente", SqlDbType.NVarChar).Value = primeiraVenda.Comprador;
                cmdInserirCliente.Parameters.Add("@Cpf", SqlDbType.NVarChar).Value = "000.000.000-00";
                cmdInserirCliente.Parameters.Add("@Telefone", SqlDbType.NVarChar).Value = "(00)0000-0000";
                cmdInserirCliente.Parameters.Add("@Endereco", SqlDbType.NVarChar).Value = "Não informado";
                cmdInserirCliente.Parameters.Add("@Bairro", SqlDbType.NVarChar).Value = "Não informado";
                cmdInserirCliente.Parameters.Add("@Numero", SqlDbType.Int).Value = 0;
                cmdInserirCliente.Parameters.Add("@Ponto", SqlDbType.NVarChar).Value = "Não informado";

                idCliente = (int)await cmdInserirCliente.ExecuteScalarAsync();
            }

            const string queryVenda = @"
                    INSERT INTO Venda 
                    (Produtos_Vendidos, DataDaVenda, FormaDePagamento, PrecoTotal, QuantidadeTotal, ValorNaFicha, NomeDoComprado, IdVendaDeCliente,Funcionaria)
                    OUTPUT INSERTED.IdVenda
                    VALUES (@Produtos, @Data, @FormaPagamento, @Total, @QuantidadeTotal, @ValorNaFicha, @NomeComprador, @IdCliente,@Funcionario);";

            using var cmdVenda = new SqlCommand(queryVenda, connection, transaction);

            cmdVenda.Parameters.Add("@Produtos", SqlDbType.NVarChar).Value =
                string.Join(" - ", vendas.Select(v => v.NomeDoProduto));

            cmdVenda.Parameters.Add("@Data", SqlDbType.DateTime).Value = primeiraVenda.DataDaVenda;
            var formaPagamentoTexto = (primeiraVenda.FormaDePagamento != null && primeiraVenda.FormaDePagamento.Any())
                ? (primeiraVenda.FormaDePagamento.Count == 1
                    ? primeiraVenda.FormaDePagamento.First().FormaPagamento
                    : "Pagamento dividido")
                : "Não informado";
            cmdVenda.Parameters.Add("@FormaPagamento", SqlDbType.NVarChar).Value = formaPagamentoTexto;
            cmdVenda.Parameters.Add("@Total", SqlDbType.Decimal).Value = primeiraVenda.PrecoTotal;
            cmdVenda.Parameters.Add("@QuantidadeTotal", SqlDbType.Int).Value = primeiraVenda.quantidadeTotal;
            cmdVenda.Parameters.Add("@ValorNaFicha", SqlDbType.Decimal).Value = primeiraVenda.ValorNaFicha;
            cmdVenda.Parameters.Add("@NomeComprador", SqlDbType.NVarChar).Value = primeiraVenda.Comprador;
            cmdVenda.Parameters.Add("@IdCliente", SqlDbType.Int).Value = idCliente;
            cmdVenda.Parameters.Add("@Funcionario", SqlDbType.NVarChar).Value = primeiraVenda.Funcionario;
            var idVendaCriada = (int)await cmdVenda.ExecuteScalarAsync();

            if (primeiraVenda.FormaDePagamento != null && primeiraVenda.FormaDePagamento.Any())
            {
                const string insertPagamento = @"
INSERT INTO PagamentoVenda (IdVenda, FormaPagamento, Valor)
VALUES (@IdVenda, @FormaPagamento, @Valor);";
                foreach (var pg in primeiraVenda.FormaDePagamento)
                {
                    using var cmdPg = new SqlCommand(insertPagamento, connection, transaction);
                    cmdPg.Parameters.Add("@IdVenda", SqlDbType.Int).Value = idVendaCriada;
                    cmdPg.Parameters.Add("@FormaPagamento", SqlDbType.NVarChar).Value = pg.FormaPagamento ?? "Não informado";
                    cmdPg.Parameters.Add("@Valor", SqlDbType.Decimal).Value = pg.Valor;
                    await cmdPg.ExecuteNonQueryAsync();
                }
            }

            foreach (var venda in vendas)
            {
                const string insertProduto = @"
                        INSERT INTO RealizarVendas 
                        (NomeDoProduto, PrecoTotal, QuantidadeTotal, DataDaVenda, FormaDePagamento, IdVenda)
                        VALUES (@NomeProduto, @Preco, @Quantidade, @Data, @FormaPagamento, @IdVenda);";

                using (var cmdItem = new SqlCommand(insertProduto, connection, transaction))
                {
                    cmdItem.Parameters.Add("@NomeProduto", SqlDbType.NVarChar).Value = venda.NomeDoProduto;
                    cmdItem.Parameters.Add("@Preco", SqlDbType.Decimal).Value = venda.PrecoUnitario;
                    cmdItem.Parameters.Add("@Quantidade", SqlDbType.Int).Value = venda.QuantidadeTotal;
                    cmdItem.Parameters.Add("@Data", SqlDbType.DateTime).Value = venda.DataDaVenda;
                    cmdItem.Parameters.Add("@FormaPagamento", SqlDbType.NVarChar).Value = formaPagamentoTexto;
                    cmdItem.Parameters.Add("@IdVenda", SqlDbType.Int).Value = idVendaCriada;
                    await cmdItem.ExecuteNonQueryAsync();
                }

                const string updateEstoque = @"
                        UPDATE AdicionarProduto 
                        SET Quantidade = Quantidade - @Quantidade 
                        WHERE NomeDoProduto = @NomeProduto";

                using (var cmdEstoque = new SqlCommand(updateEstoque, connection, transaction))
                {
                    cmdEstoque.Parameters.Add("@Quantidade", SqlDbType.Int).Value = venda.QuantidadeTotal;
                    cmdEstoque.Parameters.Add("@NomeProduto", SqlDbType.NVarChar).Value = venda.NomeDoProduto;
                    await cmdEstoque.ExecuteNonQueryAsync();
                }
            }

            transaction.Commit();
        }
        catch
        {
            transaction.Rollback();
            throw;
        }
    }

    public async Task<List<VendaRealizadaDto>> VendasDoDiaAsync(string formaDepagamento)
    {
        using var connection = _db.CreateConnection();
        await connection.OpenAsync();

        const string query = @"
SELECT 
    V.IdVenda,
    V.Produtos_Vendidos,
    V.NomeDoComprado,
    V.PrecoTotal,
    V.QuantidadeTotal,
    V.DataDaVenda,
    V.FormaDePagamento,
    V.ValorNaFicha,
    SUM(ISNULL(PV.Valor,0)) AS Valor
FROM Venda V
LEFT JOIN PagamentoVenda PV ON PV.IdVenda = V.IdVenda
WHERE CAST(V.DataDaVenda AS DATE) = CAST(GETDATE() AS DATE)
  AND (@formaDepagamento IS NULL OR V.FormaDePagamento = @formaDepagamento)
GROUP BY
    V.IdVenda,
    V.Produtos_Vendidos,
    V.NomeDoComprado,
    V.PrecoTotal,
    V.QuantidadeTotal,
    V.DataDaVenda,
    V.FormaDePagamento,
    V.ValorNaFicha
ORDER BY V.DataDaVenda;";

        using var command = new SqlCommand(query, connection);
        command.Parameters.AddWithValue("@formaDepagamento", string.IsNullOrWhiteSpace(formaDepagamento) ? (object)DBNull.Value : formaDepagamento);

        var vendas = new List<VendaRealizadaDto>();
        using (var reader = await command.ExecuteReaderAsync())
        {
            while (await reader.ReadAsync())
            {
                vendas.Add(new VendaRealizadaDto
                {
                    NomeDoProduto = reader["Produtos_Vendidos"].ToString(),
                    Comprador = reader["NomeDoComprado"].ToString(),
                    PrecoTotal = Convert.ToDecimal(reader["PrecoTotal"]),
                    quantidadeTotal = Convert.ToInt32(reader["QuantidadeTotal"]),
                    DataDaVenda = Convert.ToDateTime(reader["DataDaVenda"]),
                    ValorNaFicha = reader["ValorNaFicha"] == DBNull.Value ? 0 : Convert.ToDecimal(reader["ValorNaFicha"]),
                    IdVenda = Convert.ToInt32(reader["IdVenda"])
                });
            }
        }

        foreach (var v in vendas)
        {
            var pagamentos = await GetPagamentosAsync(v.IdVenda);
            v.Pagamentos = pagamentos;
            v.FormaDePagamento = pagamentos;
        }

        return vendas;
    }

    public async Task<List<PagamentoDto>> GetPagamentosAsync(int idVenda)
    {
        using var connection = _db.CreateConnection();
        await connection.OpenAsync();

        var pagamentos = new List<PagamentoDto>();
        using var cmdPag = new SqlCommand("SELECT FormaPagamento, Valor FROM PagamentoVenda WHERE IdVenda = @Id", connection);
        cmdPag.Parameters.Add("@Id", SqlDbType.Int).Value = idVenda;

        using var reader = await cmdPag.ExecuteReaderAsync();
        while (await reader.ReadAsync())
        {
            pagamentos.Add(new PagamentoDto
            {
                FormaPagamento = reader["FormaPagamento"].ToString(),
                Valor = reader["Valor"] == DBNull.Value ? 0 : Convert.ToDecimal(reader["Valor"])
            });
        }

        return pagamentos;
    }

    public async Task<List<VendaRealizadaDto>> HistoricoCrediarioAsync(string cliente, DateTime? data)
    {
        using var connection = _db.CreateConnection();
        await connection.OpenAsync();

        const string query = @"
SELECT 
    RV.QuantidadeTotal,
    RV.NomeDoProduto,
    CD.Telefone,
    RV.PrecoTotal,
    V.DataDaVenda,
    CD.Id_Cliente,
    CD.NomeDoCliente,
    V.Funcionaria,
    V.ValorNaFicha,
    V.FormaDePagamento,
    V.Produtos_Vendidos,
    V.IdVenda,
    AF.DataAbatimento,
    AF.ValorPago,
    AFV.ValorAbatido
FROM Venda V
INNER JOIN RealizarVendas RV
    ON RV.IdVenda = V.IdVenda
INNER JOIN CadastroDeCliente CD
    ON CD.Id_Cliente = V.IdVendaDeCliente
LEFT JOIN AbatimentoFichaVenda AFV
    ON AFV.IdVenda = V.IdVenda
LEFT JOIN AbatimentoFicha AF
    ON AF.IdAbatimento = AFV.IdAbatimento
WHERE V.FormaDePagamento = 'Crediario'
  AND (@cliente IS NULL OR CD.NomeDoCliente LIKE @cliente)
  AND (@data IS NULL OR CAST(V.DataDaVenda AS DATE) = @data)
ORDER BY V.DataDaVenda;";

        using var command = new SqlCommand(query, connection);
        command.Parameters.AddWithValue("@cliente", string.IsNullOrWhiteSpace(cliente) ? (object)DBNull.Value : "%" + cliente + "%");
        command.Parameters.AddWithValue("@data", SqlDbType.Date).Value = data.HasValue ? data.Value.Date : (object)DBNull.Value;

        using var reader = await command.ExecuteReaderAsync();
        var vendas = new List<VendaRealizadaDto>();
        while (await reader.ReadAsync())
        {
            vendas.Add(new VendaRealizadaDto
            {
                IdVenda = Convert.ToInt32(reader["IdVenda"]),
                NomeDoProduto = reader["NomeDoProduto"].ToString(),
                IdCliente = Convert.ToInt32(reader["Id_Cliente"]),
                Funcionario = reader["Funcionaria"].ToString() ?? "Não informado",
                Comprador = reader["NomeDoCliente"].ToString(),
                PrecoUnitario = Convert.ToDecimal(reader["PrecoTotal"].ToString(), CultureInfo.InvariantCulture),
                QuantidadeTotal = Convert.ToInt32(reader["QuantidadeTotal"]),
                DataDaVenda = Convert.ToDateTime(reader["DataDaVenda"]),
                FormaDePagamento = new List<PagamentoDto>
                {
                    new PagamentoDto
                    {
                        FormaPagamento = reader["FormaDePagamento"].ToString() ?? "Não informado",
                        Valor = 0
                    }
                },
                ValorNaFicha = Convert.ToDecimal(reader["ValorNaFicha"]),
                Produtos_Vendidos = reader["Produtos_Vendidos"].ToString(),
                NumeroDeTelefone = reader["Telefone"].ToString(),
                DataAbatimento = reader["DataAbatimento"] == DBNull.Value ? null : Convert.ToDateTime(reader["DataAbatimento"]),
                ValorPago      = reader["ValorPago"]      == DBNull.Value ? null : Convert.ToDecimal(reader["ValorPago"]),
                ValorAbatido   = reader["ValorAbatido"]   == DBNull.Value ? null : Convert.ToDecimal(reader["ValorAbatido"]),
            });
        }

        return vendas;
    }

    public async Task<List<VendaRealizadaDto>> FiltrarAsync(string comprado, string formaDePagamento, string funcionaria, DateTime? dataFinal, DateTime? dataInicial)
    {
        using var connection = _db.CreateConnection();
        await connection.OpenAsync();

        const string query = @"
                SELECT 
                    RV.QuantidadeTotal,
                    RV.NomeDoProduto,
                    CD.Telefone,
                    RV.PrecoTotal AS PrecoUnitario,
                    V.DataDaVenda,
                    CD.NomeDoCliente,
                    V.ValorNaFicha,
                    V.FormaDePagamento,
                    V.Produtos_Vendidos,
                    V.PrecoTotal AS PrecoTotalVenda,
                    V.IdVenda,
                    V.Funcionaria
                FROM Venda V
                INNER JOIN RealizarVendas RV ON RV.IdVenda = V.IdVenda
                INNER JOIN CadastroDeCliente CD ON CD.Id_Cliente = V.IdVendaDeCliente
                WHERE (@comprado IS NULL OR CD.NomeDoCliente LIKE '%' + @comprado + '%') 
                  AND (@formaDePagamento IS NULL OR V.FormaDePagamento = @formaDePagamento)
                  AND (@funcionaria IS NULL OR V.Funcionaria = @funcionaria)
                  AND (@dataFinal IS NULL OR CAST(V.DataDaVenda AS DATE) <= @dataFinal) 
                  AND (@dataInicial IS NULL OR CAST(V.DataDaVenda AS DATE) >= @dataInicial)
                ORDER BY V.DataDaVenda;";

        using var command = new SqlCommand(query, connection);
        command.Parameters.AddWithValue("@comprado", (object)comprado ?? DBNull.Value);
        command.Parameters.AddWithValue("@formaDePagamento", (object)formaDePagamento ?? DBNull.Value);
        command.Parameters.AddWithValue("@funcionaria", (object)funcionaria ?? DBNull.Value);
        command.Parameters.AddWithValue("@dataFinal", (object)dataFinal?.Date ?? DBNull.Value);
        command.Parameters.AddWithValue("@dataInicial", (object)dataInicial?.Date ?? DBNull.Value);

        using var reader = await command.ExecuteReaderAsync();
        var vendas = new List<VendaRealizadaDto>();
        while (await reader.ReadAsync())
        {
            vendas.Add(new VendaRealizadaDto
            {
                IdVenda = reader.GetInt32(reader.GetOrdinal("IdVenda")),
                NomeDoProduto = reader["NomeDoProduto"].ToString(),
                Comprador = reader["NomeDoCliente"].ToString(),
                PrecoUnitario = Convert.ToDecimal(reader["PrecoUnitario"].ToString(), CultureInfo.InvariantCulture),
                QuantidadeTotal = reader["QuantidadeTotal"] == DBNull.Value ? 0 : Convert.ToInt32(reader["QuantidadeTotal"]),
                DataDaVenda = Convert.ToDateTime(reader["DataDaVenda"]),
                FormaDePagamento = new List<PagamentoDto>
                {
                    new PagamentoDto
                    {
                        FormaPagamento = reader["FormaDePagamento"].ToString() ?? "Não informado",
                        Valor = 0
                    }
                },
                ValorNaFicha = reader["ValorNaFicha"] == DBNull.Value ? 0 : Convert.ToDecimal(reader["ValorNaFicha"]),
                Produtos_Vendidos = reader["Produtos_Vendidos"].ToString(),
                NumeroDeTelefone = reader["Telefone"].ToString(),
                PrecoTotal = reader["PrecoTotalVenda"] == DBNull.Value ? 0 : Convert.ToDecimal(reader["PrecoTotalVenda"]),
                Funcionario = reader["Funcionaria"].ToString()
            });
        }

        return vendas;
    }

    public async Task AbaterValorNaFichaAsync(int idVenda, int idCliente, decimal valor)
    {
        using var connection = _db.CreateConnection();
        await connection.OpenAsync();

        using var transaction = connection.BeginTransaction();
        try
        {
            // 1. Busca as vendas de fiado abertas do cliente, da mais antiga para a mais nova
            const string queryVendas = @"
                SELECT IdVenda, ValorNaFicha
                FROM Venda
                WHERE IdVendaDeCliente = @IdCliente
                  AND FormaDePagamento = 'Crediario'
                  AND ValorNaFicha > 0
                ORDER BY IdVenda;";

            var vendasAberto = new List<(int Id, decimal Saldo)>();
            using (var cmd = new SqlCommand(queryVendas, connection, transaction))
            {
                cmd.Parameters.Add("@IdCliente", SqlDbType.Int).Value = idCliente;
                using var reader = await cmd.ExecuteReaderAsync();
                while (await reader.ReadAsync())
                    vendasAberto.Add((Convert.ToInt32(reader["IdVenda"]),
                                      Convert.ToDecimal(reader["ValorNaFicha"])));
            }

            // 2. Insere o cabeçalho do abatimento em AbatimentoFicha
            const string insertAbatimento = @"
                INSERT INTO AbatimentoFicha (IdCliente, ValorPago)
                OUTPUT INSERTED.IdAbatimento
                VALUES (@IdCliente, @ValorPago);";

            int idAbatimento;
            using (var cmd = new SqlCommand(insertAbatimento, connection, transaction))
            {
                cmd.Parameters.Add("@IdCliente", SqlDbType.Int).Value = idCliente;
                cmd.Parameters.Add("@ValorPago", SqlDbType.Decimal).Value = valor;
                idAbatimento = (int)await cmd.ExecuteScalarAsync();
            }

            // 3. Distribui o valor entre as vendas e grava o histórico em AbatimentoFichaVenda
            decimal restante = valor;
            foreach (var (idVendaAberta, saldo) in vendasAberto)
            {
                if (restante <= 0) break;

                decimal abater = Math.Min(restante, saldo);

                // Atualiza o saldo da venda
                const string updateVenda = @"
                    UPDATE Venda
                    SET ValorNaFicha = ValorNaFicha - @Abater
                    WHERE IdVenda = @IdVenda;";

                using (var cmd = new SqlCommand(updateVenda, connection, transaction))
                {
                    cmd.Parameters.Add("@Abater", SqlDbType.Decimal).Value = abater;
                    cmd.Parameters.Add("@IdVenda", SqlDbType.Int).Value = idVendaAberta;
                    await cmd.ExecuteNonQueryAsync();
                }

                // Registra a distribuição (histórico)
                const string insertDistribuicao = @"
                    INSERT INTO AbatimentoFichaVenda
                        (IdAbatimento, IdVenda, ValorAbatido)
                    VALUES (@IdAbatimento, @IdVenda, @ValorAbatido);";

                using (var cmd = new SqlCommand(insertDistribuicao, connection, transaction))
                {
                    cmd.Parameters.Add("@IdAbatimento", SqlDbType.Int).Value = idAbatimento;
                    cmd.Parameters.Add("@IdVenda", SqlDbType.Int).Value = idVendaAberta;
                    cmd.Parameters.Add("@ValorAbatido", SqlDbType.Decimal).Value = abater;
                    await cmd.ExecuteNonQueryAsync();
                }

                restante -= abater;
            }

            transaction.Commit();
        }
        catch
        {
            transaction.Rollback();
            throw;
        }
    }

    public async Task<List<object>> ClientesComFichaEmAbertoAsync(string fichaEmAberto)
    {
        using var connection = _db.CreateConnection();
        await connection.OpenAsync();

        const string query = "SELECT * FROM Venda WHERE ValorNaFicha > 0 AND NomeDoComprado = @NomeDoComprado AND DataDaVenda >= DATEADD(DAY,-30,GETDATE())";
        using var cmd = new SqlCommand(query, connection);
        cmd.Parameters.AddWithValue("@NomeDoComprado", fichaEmAberto);

        using var reader = await cmd.ExecuteReaderAsync();
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

        return vendas;
    }

    public async Task<List<VendaRealizadaDto>> VendasDaSemanaAsync()
    {
        using var connection = _db.CreateConnection();
        await connection.OpenAsync();

        const string query =
            @"SET DATEFIRST 1; SELECT DATENAME(WEEKDAY, DataDaVenda) AS DiaDaSemana, COUNT(*) AS Quantidade FROM Venda WHERE CAST(DataDaVenda AS DATE) >= DATEADD(DAY, 1 - DATEPART(WEEKDAY, GETDATE()), CAST(GETDATE() AS DATE)) AND CAST(DataDaVenda AS DATE) <= DATEADD(DAY, 6 - DATEPART(WEEKDAY, GETDATE()), CAST(GETDATE() AS DATE)) GROUP BY DATENAME(WEEKDAY, DataDaVenda) ORDER BY MIN(DATEPART(WEEKDAY, DataDaVenda));";

        using var command = new SqlCommand(query, connection);
        using var reader = await command.ExecuteReaderAsync();

        var vendas = new List<VendaRealizadaDto>();
        while (await reader.ReadAsync())
        {
            vendas.Add(new VendaRealizadaDto
            {
                QuantidadeDoDia = Convert.ToInt32(reader["Quantidade"]),
                DiaDaSemana = reader["DiaDaSemana"].ToString(),
            });
        }

        return vendas;
    }

    public async Task<object> CancelarAutomaticoAsync(int idVenda)
    {
        using var conn = _db.CreateConnection();
        await conn.OpenAsync();

        using var transaction = conn.BeginTransaction();
        try
        {
            var produtosParaRepor = new List<(string Nome, int Qtd)>();

            const string sqlBusca = "SELECT NomeDoProduto, QuantidadeTotal FROM RealizarVendas WHERE IdVenda = @id";
            using (var cmdBusca = new SqlCommand(sqlBusca, conn, transaction))
            {
                cmdBusca.Parameters.AddWithValue("@id", idVenda);
                using var reader = await cmdBusca.ExecuteReaderAsync();
                while (await reader.ReadAsync())
                {
                    produtosParaRepor.Add((
                        reader["NomeDoProduto"].ToString(),
                        Convert.ToInt32(reader["QuantidadeTotal"])
                    ));
                }
            }

            if (produtosParaRepor.Count == 0)
                throw new InvalidOperationException("Nenhum produto encontrado para esta venda.");

            foreach (var item in produtosParaRepor)
            {
                const string sqlEstoque = "UPDATE AdicionarProduto SET Quantidade = Quantidade + @q WHERE NomeDoProduto = @n";
                using var cmdEstoque = new SqlCommand(sqlEstoque, conn, transaction);
                cmdEstoque.Parameters.AddWithValue("@q", item.Qtd);
                cmdEstoque.Parameters.AddWithValue("@n", item.Nome);
                await cmdEstoque.ExecuteNonQueryAsync();
            }

            const string sqlDelAbatimentosVenda = "DELETE FROM AbatimentoFichaVenda WHERE IdVenda = @id";
            const string sqlDelPagamentos = "DELETE FROM PagamentoVenda WHERE IdVenda = @id";
            const string sqlDelItens = "DELETE FROM RealizarVendas WHERE IdVenda = @id";
            const string sqlDelVenda = "DELETE FROM Venda WHERE IdVenda = @id";
            const string sqlDelAbatimentosOrfaos = @"
                DELETE FROM AbatimentoFicha 
                WHERE IdAbatimento NOT IN (SELECT IdAbatimento FROM AbatimentoFichaVenda);";

            using (var cmdDelAbat = new SqlCommand(sqlDelAbatimentosVenda, conn, transaction))
            {
                cmdDelAbat.Parameters.AddWithValue("@id", idVenda);
                await cmdDelAbat.ExecuteNonQueryAsync();
            }

            using (var cmdDelPg = new SqlCommand(sqlDelPagamentos, conn, transaction))
            {
                cmdDelPg.Parameters.AddWithValue("@id", idVenda);
                await cmdDelPg.ExecuteNonQueryAsync();
            }

            using (var cmdDel = new SqlCommand(sqlDelItens, conn, transaction))
            {
                cmdDel.Parameters.AddWithValue("@id", idVenda);
                await cmdDel.ExecuteNonQueryAsync();
            }

            using (var cmdDelV = new SqlCommand(sqlDelVenda, conn, transaction))
            {
                cmdDelV.Parameters.AddWithValue("@id", idVenda);
                await cmdDelV.ExecuteNonQueryAsync();
            }

            using (var cmdDelOrf = new SqlCommand(sqlDelAbatimentosOrfaos, conn, transaction))
            {
                await cmdDelOrf.ExecuteNonQueryAsync();
            }

            transaction.Commit();
            return new { mensagem = "Venda cancelada e estoque reposto!", itens = produtosParaRepor };
        }
        catch
        {
            transaction.Rollback();
            throw;
        }
    }

    public async Task<string> DesfazerUltimoAbatimentoAsync(int idVenda)
    {
        var connectString = _db.CreateConnection().ConnectionString;
        using var connection = new SqlConnection(connectString);
        await connection.OpenAsync();

        using var transaction = connection.BeginTransaction();
        try
        {
            // 1. Busca o último abatimento vinculado a essa venda
            const string queryUltimoAbatimento = @"
                SELECT TOP 1 
                    AFV.IdAbatimento, 
                    AFV.ValorAbatido
                FROM AbatimentoFichaVenda AFV
                INNER JOIN AbatimentoFicha AF ON AF.IdAbatimento = AFV.IdAbatimento
                WHERE AFV.IdVenda = @IdVenda
                ORDER BY AF.DataAbatimento DESC, AFV.IdAbatimento DESC;";

            int idAbatimento;
            decimal valorAbatido;

            using (var cmd = new SqlCommand(queryUltimoAbatimento, connection, transaction))
            {
                cmd.Parameters.Add("@IdVenda", SqlDbType.Int).Value = idVenda;
                using var reader = await cmd.ExecuteReaderAsync();
                if (!await reader.ReadAsync())
                {
                    throw new InvalidOperationException("Nenhum abatimento encontrado para esta venda.");
                }

                idAbatimento = Convert.ToInt32(reader["IdAbatimento"]);
                valorAbatido = Convert.ToDecimal(reader["ValorAbatido"]);
            }

            // 2. Estorna o valor de volta no ValorNaFicha da Venda
            const string queryRestaurarSaldo = @"
                UPDATE Venda
                SET ValorNaFicha = ValorNaFicha + @ValorAbatido
                WHERE IdVenda = @IdVenda;";

            using (var cmd = new SqlCommand(queryRestaurarSaldo, connection, transaction))
            {
                cmd.Parameters.Add("@ValorAbatido", SqlDbType.Decimal).Value = valorAbatido;
                cmd.Parameters.Add("@IdVenda", SqlDbType.Int).Value = idVenda;
                await cmd.ExecuteNonQueryAsync();
            }

            // 3. Deleta o registro em AbatimentoFichaVenda correspondente
            const string queryDeletarAbatimentoVenda = @"
                DELETE FROM AbatimentoFichaVenda
                WHERE IdAbatimento = @IdAbatimento AND IdVenda = @IdVenda;";

            using (var cmd = new SqlCommand(queryDeletarAbatimentoVenda, connection, transaction))
            {
                cmd.Parameters.Add("@IdAbatimento", SqlDbType.Int).Value = idAbatimento;
                cmd.Parameters.Add("@IdVenda", SqlDbType.Int).Value = idVenda;
                await cmd.ExecuteNonQueryAsync();
            }

            // 4. Atualiza o cabeçalho AbatimentoFicha (diminui o ValorPago) e remove se ficar órfão ou zerado
            const string queryAjustarCabecalho = @"
                UPDATE AbatimentoFicha
                SET ValorPago = ValorPago - @ValorAbatido
                WHERE IdAbatimento = @IdAbatimento;

                DELETE FROM AbatimentoFicha
                WHERE IdAbatimento = @IdAbatimento
                  AND (ValorPago <= 0 OR IdAbatimento NOT IN (SELECT IdAbatimento FROM AbatimentoFichaVenda));";

            using (var cmd = new SqlCommand(queryAjustarCabecalho, connection, transaction))
            {
                cmd.Parameters.Add("@ValorAbatido", SqlDbType.Decimal).Value = valorAbatido;
                cmd.Parameters.Add("@IdAbatimento", SqlDbType.Int).Value = idAbatimento;
                await cmd.ExecuteNonQueryAsync();
            }

            transaction.Commit();
            return $"Abatimento de {valorAbatido.ToString("C", new CultureInfo("pt-BR"))} desfeito com sucesso.";
        }
        catch
        {
            transaction.Rollback();
            throw;
        }
    }
}

