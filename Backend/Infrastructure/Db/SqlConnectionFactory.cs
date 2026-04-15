using Microsoft.Data.SqlClient;

namespace Backend.Infrastructure.Db;

public sealed class SqlConnectionFactory : IDbConnectionFactory
{
    private readonly IConfiguration _configuration;

    public SqlConnectionFactory(IConfiguration configuration)
    {
        _configuration = configuration ?? throw new ArgumentNullException(nameof(configuration));
    }

    public SqlConnection CreateConnection()
    {
        var cs = _configuration.GetConnectionString("DefaultConnection");
        return new SqlConnection(cs);
    }
}

