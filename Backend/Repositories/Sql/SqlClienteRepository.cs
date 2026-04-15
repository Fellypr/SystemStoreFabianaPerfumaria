using System.Data;
using Backend.Dtos.Clientes;
using Backend.Infrastructure.Db;
using Backend.Repositories.Interfaces;
using Microsoft.Data.SqlClient;

namespace Backend.Repositories.Sql;

public sealed class SqlClienteRepository : IClienteRepository
{
    private readonly IDbConnectionFactory _db;

    public SqlClienteRepository(IDbConnectionFactory db)
    {
        _db = db ?? throw new ArgumentNullException(nameof(db));
    }

    public async Task<int> InsertAsync(CadastroDeClienteDto cliente)
    {
        using var connection = _db.CreateConnection();
        await connection.OpenAsync();

        const string sql =
            "INSERT INTO CadastroDeCliente (NomeDoCliente,Cpf,Telefone,Endereco,Bairro,Numero,PontodeReferencia) VALUES (@NomeDoCliente,@Cpf,@Telefone,@Endereco,@Bairro,@Numero,@PontodeReferencia);";
        using var cmd = new SqlCommand(sql, connection);

        cmd.Parameters.Add(new SqlParameter("@NomeDoCliente", cliente.NomeDoCliente));
        cmd.Parameters.Add(new SqlParameter("@Cpf", cliente.Cpf));
        cmd.Parameters.Add(new SqlParameter("@Telefone", cliente.Telefone));
        cmd.Parameters.Add(new SqlParameter("@Endereco", cliente.Endereco));
        cmd.Parameters.Add(new SqlParameter("@Bairro", cliente.Bairro));
        cmd.Parameters.Add(new SqlParameter("@Numero", cliente.Numero));
        cmd.Parameters.Add(new SqlParameter("@PontodeReferencia", cliente.PontoDeReferencia));

        return await cmd.ExecuteNonQueryAsync();
    }

    public async Task<List<CadastroDeClienteDto>> GetHistoricoAsync()
    {
        using var connection = _db.CreateConnection();
        await connection.OpenAsync();

        const string sql = "SELECT * FROM CadastroDeCliente ORDER BY Id_Cliente DESC";
        using var cmd = new SqlCommand(sql, connection);

        using var reader = await cmd.ExecuteReaderAsync();
        var clientes = new List<CadastroDeClienteDto>();
        while (await reader.ReadAsync())
        {
            clientes.Add(new CadastroDeClienteDto
            {
                NomeDoCliente = reader["NomeDoCliente"].ToString(),
                Cpf = reader["Cpf"].ToString(),
                Telefone = reader["Telefone"].ToString(),
                Endereco = reader["Endereco"].ToString(),
                Bairro = reader["Bairro"].ToString(),
                Numero = Convert.ToInt32(reader["Numero"]),
                PontoDeReferencia = reader["PontoDeReferencia"].ToString(),
                Id_Cliente = Convert.ToInt32(reader["Id_Cliente"]),
            });
        }

        return clientes;
    }

    public async Task<List<object>> BuscarAsync(BuscarClienteDto filtro)
    {
        using var connection = _db.CreateConnection();
        await connection.OpenAsync();

        const string sql = "SELECT * FROM CadastroDeCliente WHERE NomeDoCliente LIKE @NomeDoCliente OR Cpf LIKE @Cpf;";
        using var cmd = new SqlCommand(sql, connection);
        cmd.Parameters.Add(new SqlParameter("@NomeDoCliente", "%" + filtro.NomeDoCliente + "%"));
        cmd.Parameters.Add(new SqlParameter("@Cpf", "%" + filtro.Cpf + "%"));

        using var reader = await cmd.ExecuteReaderAsync();
        var lista = new List<object>();
        while (await reader.ReadAsync())
        {
            lista.Add(new
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

        return lista;
    }

    public async Task<int> UpdateAsync(CadastroDeClienteDto clienteAtualizado)
    {
        using var connection = _db.CreateConnection();
        await connection.OpenAsync();

        const string sql = @"
                UPDATE CadastroDeCliente
                SET NomeDoCliente = @NomeDoCliente, Cpf = @Cpf, Telefone = @Telefone, Endereco = @Endereco, Bairro = @Bairro, Numero = @Numero, PontoDeReferencia = @PontoDeReferencia
                WHERE Id_Cliente = @Id_Cliente";

        using var cmd = new SqlCommand(sql, connection);
        cmd.Parameters.AddWithValue("@NomeDoCliente", clienteAtualizado.NomeDoCliente);
        cmd.Parameters.AddWithValue("@Cpf", clienteAtualizado.Cpf);
        cmd.Parameters.AddWithValue("@Telefone", clienteAtualizado.Telefone);
        cmd.Parameters.AddWithValue("@Endereco", clienteAtualizado.Endereco);
        cmd.Parameters.AddWithValue("@Bairro", clienteAtualizado.Bairro);
        cmd.Parameters.AddWithValue("@Numero", clienteAtualizado.Numero);
        cmd.Parameters.AddWithValue("@PontoDeReferencia", clienteAtualizado.PontoDeReferencia);
        cmd.Parameters.AddWithValue("@Id_Cliente", clienteAtualizado.Id_Cliente);

        return await cmd.ExecuteNonQueryAsync();
    }

    public async Task<bool> ExcluirCascadeAsync(int id)
    {
        using var connection = _db.CreateConnection();
        await connection.OpenAsync();

        using var transaction = connection.BeginTransaction();
        try
        {
            const string deleteItems = @"DELETE RV FROM RealizarVendas RV 
                   INNER JOIN Venda V ON RV.IdVenda = V.IdVenda 
                   WHERE V.IdVendaDeCliente = @Id";
            using (var cmd1 = new SqlCommand(deleteItems, connection, transaction))
            {
                cmd1.Parameters.AddWithValue("@Id", id);
                await cmd1.ExecuteNonQueryAsync();
            }

            const string deleteVenda = "DELETE FROM Venda WHERE IdVendaDeCliente = @Id_Cliente";
            using (var cmd2 = new SqlCommand(deleteVenda, connection, transaction))
            {
                cmd2.Parameters.AddWithValue("@Id_Cliente", id);
                await cmd2.ExecuteNonQueryAsync();
            }

            const string deleteCliente = "DELETE FROM CadastroDeCliente WHERE Id_Cliente = @Id_Cliente";
            using (var cmd3 = new SqlCommand(deleteCliente, connection, transaction))
            {
                cmd3.Parameters.AddWithValue("@Id_Cliente", id);
                var rows = await cmd3.ExecuteNonQueryAsync();
                if (rows <= 0)
                {
                    transaction.Rollback();
                    return false;
                }
            }

            transaction.Commit();
            return true;
        }
        catch
        {
            transaction.Rollback();
            throw;
        }
    }
}

