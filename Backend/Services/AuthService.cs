using Backend.Dtos.Auth;
using Backend.Services.Interfaces;

namespace Backend.Services;

public sealed class AuthService : IAuthService
{
    public bool LoginValido(LoginDto login)
    {
        return login.Email == "galemiliano" && login.Senha == "101490";
    }
}

