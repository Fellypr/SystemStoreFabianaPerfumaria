#nullable enable
using Backend.Dtos.Produtos;
using Backend.Infrastructure.Db;
using Backend.Repositories.Interfaces;
using Microsoft.Data.SqlClient;

namespace Backend.Repositories.Sql;

public sealed class SqlProdutoViaCodRepository : IProdutoViaCodRepository
{
    private readonly IDbConnectionFactory _db;

    public SqlProdutoViaCodRepository(IDbConnectionFactory db)
    {
        _db = db ?? throw new ArgumentNullException(nameof(db));
    }

    public async Task<AdicionarProdutoViaCodDto?> GetByCodigoBarraAsync(string codigoDeBarras)
    {
        using var connection = _db.CreateConnection();
        await connection.OpenAsync();

        const string sql = @"
SELECT TOP 1
    NomeDoProduto,
    CodigoDeBarra,
    Quantidade,
    PrecoAdquirido,
    Preco,
    Preco_a_vista,
    UrlImagem,
    Preco_Da_Ficha,
    Marca
FROM AdicionarProduto
WHERE CodigoDeBarra = @CodigoDeBarra";

        using var cmd = new SqlCommand(sql, connection);
        cmd.Parameters.Add(new SqlParameter("@CodigoDeBarra", codigoDeBarras));

        using var reader = await cmd.ExecuteReaderAsync();
        if (!await reader.ReadAsync())
            return null;

        return new AdicionarProdutoViaCodDto
        {
            NomeProduto = reader["NomeDoProduto"]?.ToString(),
            MarcaDoProduto = reader["Marca"]?.ToString(),
            CodigoBarra = reader["CodigoDeBarra"]?.ToString(),
            Unidade = Convert.ToInt32(reader["Quantidade"]),
            PrecoAdquirido = Convert.IsDBNull(reader["PrecoAdquirido"]) ? 0 : Convert.ToDecimal(reader["PrecoAdquirido"]),
            PrecoRevista = Convert.IsDBNull(reader["Preco"]) ? 0 : Convert.ToDecimal(reader["Preco"]),
            PrecoVista = Convert.IsDBNull(reader["Preco_a_vista"]) ? 0 : Convert.ToDecimal(reader["Preco_a_vista"]),
            ImagemUrl = reader["UrlImagem"] == DBNull.Value ? null : reader["UrlImagem"]?.ToString(),
            PrecoEmFicha = Convert.IsDBNull(reader["Preco_Da_Ficha"]) ? 0 : Convert.ToDecimal(reader["Preco_Da_Ficha"]),
        };
    }

    public async Task<int> CreateProductCodAsync(AdicionarProdutoViaCodDto produto)
    {
        using var connection = _db.CreateConnection();
        await connection.OpenAsync();

        const string sql = @"
INSERT INTO AdicionarProduto
    (NomeDoProduto, Preco, Quantidade, CodigoDeBarra, UrlImagem, PrecoAdquirido, Preco_a_vista, Preco_Da_Ficha,Marca)
VALUES
    (@NomeDoProduto, @Preco, @Quantidade, @CodigoDeBarra, @UrlImagem, @PrecoAdquirido, @Preco_a_vista, @Preco_Da_Ficha,@Marca)";

        using var cmd = new SqlCommand(sql, connection);
        cmd.Parameters.AddWithValue("@NomeDoProduto", (object?)produto.NomeProduto ?? DBNull.Value);
        cmd.Parameters.AddWithValue("@Preco", produto.PrecoRevista);
        cmd.Parameters.AddWithValue("@Quantidade", produto.Unidade);
        cmd.Parameters.AddWithValue("@CodigoDeBarra", (object?)produto.CodigoBarra ?? DBNull.Value);
        cmd.Parameters.AddWithValue("@UrlImagem", (object?)produto.ImagemUrl ?? DBNull.Value);
        cmd.Parameters.AddWithValue("@PrecoAdquirido", produto.PrecoAdquirido);
        cmd.Parameters.AddWithValue("@Preco_a_vista", produto.PrecoVista);
        cmd.Parameters.AddWithValue("@Preco_Da_Ficha", produto.PrecoEmFicha);
        cmd.Parameters.AddWithValue("@Marca", produto.MarcaDoProduto);


        return await cmd.ExecuteNonQueryAsync();
    }

    public async Task<int> UpdateUnidadeProdutoAsync(AdicionarProdutoViaCodDto produto)
    {
        using var connection = _db.CreateConnection();
        await connection.OpenAsync();

        const string sql = @"UPDATE AdicionarProduto SET Quantidade = Quantidade + @QuantidadeNova, NomeDoProduto = @NomeDoProduto, Marca = @Marca, Preco = @PrecoRevista, PrecoAdquirido = @PrecoAdquirido, Preco_a_vista = @Preco_a_vista, Preco_Da_Ficha = @PrecoEmFicha, UrlImagem = @UrlImagem WHERE CodigoDeBarra = @CodigoDeBarra";

        using var cmd = new SqlCommand(sql, connection);
        var quantidadeSomar = produto.UnidadeAdicionada ?? produto.Unidade;
        cmd.Parameters.AddWithValue("@CodigoDeBarra", (object?)produto.CodigoBarra ?? DBNull.Value);
        cmd.Parameters.AddWithValue("@QuantidadeNova", quantidadeSomar);
        cmd.Parameters.AddWithValue("@NomeDoProduto", (object?)produto.NomeProduto ?? DBNull.Value);
        cmd.Parameters.AddWithValue("@PrecoRevista", produto.PrecoRevista);
        cmd.Parameters.AddWithValue("@PrecoAdquirido", produto.PrecoAdquirido);
        cmd.Parameters.AddWithValue("@Preco_a_vista", produto.PrecoVista);
        cmd.Parameters.AddWithValue("@PrecoEmFicha", produto.PrecoEmFicha);
        cmd.Parameters.AddWithValue("@UrlImagem", (object?)produto.ImagemUrl ?? DBNull.Value);
        cmd.Parameters.AddWithValue("@Marca", (object?)produto.MarcaDoProduto ?? DBNull.Value);

        return await cmd.ExecuteNonQueryAsync();
    }
}

