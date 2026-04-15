using Backend.Dtos.Auth;

namespace Backend.Services.Interfaces;

public interface IAuthService
{
    bool LoginValido(LoginDto login);
}

