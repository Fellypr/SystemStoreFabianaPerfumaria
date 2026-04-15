var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();

builder.Services.AddScoped<Backend.Infrastructure.Db.IDbConnectionFactory, Backend.Infrastructure.Db.SqlConnectionFactory>();

builder.Services.AddScoped<Backend.Repositories.Interfaces.IProdutoRepository, Backend.Repositories.Sql.SqlProdutoRepository>();
builder.Services.AddScoped<Backend.Repositories.Interfaces.IClienteRepository, Backend.Repositories.Sql.SqlClienteRepository>();
builder.Services.AddScoped<Backend.Repositories.Interfaces.IVendaRepository, Backend.Repositories.Sql.SqlVendaRepository>();

builder.Services.AddScoped<Backend.Services.Interfaces.IProdutoService, Backend.Services.ProdutoService>();
builder.Services.AddScoped<Backend.Services.Interfaces.IClienteService, Backend.Services.ClienteService>();
builder.Services.AddScoped<Backend.Services.Interfaces.IVendaService, Backend.Services.VendaService>();
builder.Services.AddScoped<Backend.Services.Interfaces.IAuthService, Backend.Services.AuthService>();

builder.Services.AddCors(options =>
{
    options.AddPolicy("PermitirFrontend", policy =>
    {
        policy
            .WithOrigins(
                "http://localhost:5173",
                "http://192.168.0.139:5173"
            )
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

var app = builder.Build();

app.UseCors("PermitirFrontend");

app.UseRouting();

app.UseAuthorization();

app.MapControllers();

app.Run();
