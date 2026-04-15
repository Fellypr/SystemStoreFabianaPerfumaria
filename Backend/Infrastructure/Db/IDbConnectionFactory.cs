using Microsoft.Data.SqlClient;

namespace Backend.Infrastructure.Db;

public interface IDbConnectionFactory
{
    SqlConnection CreateConnection();
}

