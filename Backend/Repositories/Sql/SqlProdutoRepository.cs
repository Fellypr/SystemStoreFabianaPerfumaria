using System.Data;
using Backend.Dtos;
using Backend.Dtos.Produtos;
using Backend.Infrastructure.Db;
using Backend.Model;
using Backend.Repositories.Interfaces;
using Microsoft.Data.SqlClient;

namespace Backend.Repositories.Sql;

public sealed class SqlProdutoRepository : IProdutoRepository
{
    private readonly IDbConnectionFactory _db;

    public SqlProdutoRepository(IDbConnectionFactory db)
    {
        _db = db ?? throw new ArgumentNullException(nameof(db));
    }

    public async Task<int> CountByNomeAsync(string nomeDoProduto)
    {
        using var connection = _db.CreateConnection();
        await connection.OpenAsync();

        const string sql = "SELECT COUNT(*) FROM AdicionarProduto WHERE NomeDoProduto = @NomeDoProduto";
        using var cmd = new SqlCommand(sql, connection);
        cmd.Parameters.Add(new SqlParameter("@NomeDoProduto", nomeDoProduto));

        return (int)await cmd.ExecuteScalarAsync();
    }

    public async Task<int> CountByCodigoBarraAsync(string codigoDeBarra)
    {
        using var connection = _db.CreateConnection();
        await connection.OpenAsync();

        const string sql = "SELECT COUNT(*) FROM AdicionarProduto WHERE CodigoDeBarra = @CodigoDeBarra";
        using var cmd = new SqlCommand(sql, connection);
        cmd.Parameters.Add(new SqlParameter("@CodigoDeBarra", codigoDeBarra));

        return (int)await cmd.ExecuteScalarAsync();
    }

    public async Task<int> InsertAsync(Produto produto)
    {
        using var connection = _db.CreateConnection();
        await connection.OpenAsync();

        const string sql =
            "INSERT INTO AdicionarProduto (NomeDoProduto, Marca, Preco, Quantidade, CodigoDeBarra, UrlImagem, PrecoAdquirido, Preco_Da_Ficha, Preco_a_vista) VALUES (@NomeDoProduto, @Marca, @Preco, @Quantidade, @CodigoDeBarra, @UrlImagem, @PrecoAdquirido, @Preco_Da_Ficha, @Preco_a_vista)";
        using var cmd = new SqlCommand(sql, connection);

        cmd.Parameters.Add(new SqlParameter("@NomeDoProduto", produto.NomeDoProduto));
        cmd.Parameters.Add(new SqlParameter("@Marca", produto.Marca));
        cmd.Parameters.Add(new SqlParameter("@Preco", produto.Preco));
        cmd.Parameters.Add(new SqlParameter("@Quantidade", produto.Quantidade));
        cmd.Parameters.Add(new SqlParameter("@CodigoDeBarra", produto.CodigoDeBarra));
        cmd.Parameters.Add(new SqlParameter("@UrlImagem", produto.UrlImagem));
        cmd.Parameters.Add(new SqlParameter("@PrecoAdquirido", produto.PrecoAdquirido));
        cmd.Parameters.Add(new SqlParameter("@Preco_Da_Ficha", produto.PrecoEmFicha));
        cmd.Parameters.Add(new SqlParameter("@Preco_a_vista", produto.PrecoAvista));

        return await cmd.ExecuteNonQueryAsync();
    }

    public async Task<List<Produto>> GetAllAsync()
    {
        using var connection = _db.CreateConnection();
        await connection.OpenAsync();

        const string sql = "SELECT * FROM AdicionarProduto";
        using var cmd = new SqlCommand(sql, connection);

        using var reader = await cmd.ExecuteReaderAsync();
        var produtos = new List<Produto>();
        while (await reader.ReadAsync())
        {
            produtos.Add(new Produto
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
            });
        }

        return produtos;
    }

    public async Task<int> UpdateAsync(Produto produto)
    {
        using var connection = _db.CreateConnection();
        await connection.OpenAsync();

        const string sql = @"
                UPDATE AdicionarProduto
                SET NomeDoProduto = @Nome, Marca = @Marca, Quantidade = @Quantidade, Preco = @Preco, PrecoAdquirido = @PrecoAdquirido, CodigoDeBarra = @CodigoDeBarra, Preco_Da_Ficha = @Preco_Da_Ficha, Preco_a_vista = @Preco_a_vista, UrlImagem = @UrlImagem
                WHERE Id_Produto = @Id";

        using var cmd = new SqlCommand(sql, connection);
        cmd.Parameters.AddWithValue("@Nome", produto.NomeDoProduto);
        cmd.Parameters.AddWithValue("@Marca", produto.Marca);
        cmd.Parameters.AddWithValue("@Quantidade", produto.Quantidade);
        cmd.Parameters.AddWithValue("@Preco", produto.Preco);
        cmd.Parameters.AddWithValue("@Id", produto.Id_Produto);
        cmd.Parameters.AddWithValue("@PrecoAdquirido", produto.PrecoAdquirido);
        cmd.Parameters.AddWithValue("@CodigoDeBarra", produto.CodigoDeBarra);
        cmd.Parameters.AddWithValue("@Preco_Da_Ficha", produto.PrecoEmFicha);
        cmd.Parameters.AddWithValue("@Preco_a_vista", produto.PrecoAvista);
        cmd.Parameters.AddWithValue("@UrlImagem", produto.UrlImagem ?? (object)DBNull.Value);

        return await cmd.ExecuteNonQueryAsync();
    }

    public async Task<int> DeleteAsync(int id)
    {
        using var connection = _db.CreateConnection();
        await connection.OpenAsync();

        const string sql = "DELETE FROM AdicionarProduto WHERE Id_Produto = @Id";
        using var cmd = new SqlCommand(sql, connection);
        cmd.Parameters.AddWithValue("@Id", id);

        return await cmd.ExecuteNonQueryAsync();
    }

    public async Task<ResultadoPaginado<object>> BuscarEstoqueAsync(BuscarPorEstoqueDto filtro)
    {
        using var connection = _db.CreateConnection();
        await connection.OpenAsync();

        string whereClause = @"
            WHERE 
                (@Nome IS NULL OR NomeDoProduto LIKE @Nome) AND
                (@Marca IS NULL OR Marca LIKE @Marca) AND
                (@Codigo IS NULL OR CodigoDeBarra = @Codigo)";

        string countSql = $@"SELECT COUNT(*) FROM AdicionarProduto {whereClause}";

        using var countCmd = new SqlCommand(countSql, connection);
        countCmd.Parameters.AddWithValue("@Nome", string.IsNullOrEmpty(filtro.NomeDoProduto) ? (object)DBNull.Value : "%" + filtro.NomeDoProduto + "%");
        countCmd.Parameters.AddWithValue("@Marca", string.IsNullOrEmpty(filtro.Marca) ? (object)DBNull.Value : "%" + filtro.Marca + "%");
        countCmd.Parameters.AddWithValue("@Codigo", string.IsNullOrEmpty(filtro.CodigoDeBarra) ? (object)DBNull.Value : filtro.CodigoDeBarra);

        int totalRegistros = (int)await countCmd.ExecuteScalarAsync();

        int pagina = filtro.Pagina > 0 ? filtro.Pagina : 1;
        int tamanhoPagina = filtro.TamanhoPagina > 0 ? filtro.TamanhoPagina : 20;
        int skip = (pagina - 1) * tamanhoPagina;

        string sql = $@"
            SELECT * FROM AdicionarProduto 
            {whereClause}
            ORDER BY Id_Produto DESC
            OFFSET @Skip ROWS FETCH NEXT @Take ROWS ONLY";

        using var cmd = new SqlCommand(sql, connection);
        cmd.Parameters.AddWithValue("@Nome", string.IsNullOrEmpty(filtro.NomeDoProduto) ? (object)DBNull.Value : "%" + filtro.NomeDoProduto + "%");
        cmd.Parameters.AddWithValue("@Marca", string.IsNullOrEmpty(filtro.Marca) ? (object)DBNull.Value : "%" + filtro.Marca + "%");
        cmd.Parameters.AddWithValue("@Codigo", string.IsNullOrEmpty(filtro.CodigoDeBarra) ? (object)DBNull.Value : filtro.CodigoDeBarra);
        cmd.Parameters.AddWithValue("@Skip", skip);
        cmd.Parameters.AddWithValue("@Take", tamanhoPagina);

        using var reader = await cmd.ExecuteReaderAsync();
        var lista = new List<object>();
        while (await reader.ReadAsync())
        {
            lista.Add(new
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

        int totalPaginas = (int)Math.Ceiling((double)totalRegistros / tamanhoPagina);

        return new ResultadoPaginado<object>
        {
            Itens = lista,
            TotalRegistros = totalRegistros,
            PaginaAtual = pagina,
            TotalPaginas = totalPaginas == 0 ? 1 : totalPaginas
        };
    }

    public async Task<List<object>> BuscarParaVendaAsync(BuscarPorEstoqueDto filtro)
    {
        string termo = filtro.CodigoDeBarra;
        if (string.IsNullOrWhiteSpace(termo))
            termo = filtro.NomeDoProduto;

        termo = (termo ?? string.Empty).Trim();
        var ehCodigoDeBarra = termo.All(char.IsDigit);

        using var connection = _db.CreateConnection();
        await connection.OpenAsync();

        string sql = ehCodigoDeBarra
            ? @"SELECT TOP 1 *
                              FROM AdicionarProduto
                              WHERE CodigoDeBarra = @Termo"
            : @"SELECT *
                              FROM AdicionarProduto
                              WHERE NomeDoProduto LIKE @Termo";

        using var cmd = new SqlCommand(sql, connection);
        cmd.Parameters.AddWithValue("@Termo", ehCodigoDeBarra ? termo : $"%{termo}%");

        using var reader = await cmd.ExecuteReaderAsync();
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

        return lista;
    }

}

