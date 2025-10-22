var builder = WebApplication.CreateBuilder(args);


builder.Services.AddCors(options =>
{
    options.AddPolicy("PermitirFrontend",
        policy => policy
            .WithOrigins("http://localhost:5173", "http://192.168.1.190")
            .AllowAnyMethod()
            .AllowAnyHeader()
    );
});

builder.Services.AddControllers();

var app = builder.Build();


app.UseCors("PermitirFrontend");

app.UseAuthorization();
app.MapControllers();

app.Run();
