using Backend.Dtos.Clientes;

namespace Backend.Services.Interfaces;

public interface IClienteService
{
    Task<int> CadastrarAsync(CadastroDeClienteDto cadastro);
    Task<List<CadastroDeClienteDto>> HistoricoAsync();
    Task<List<object>> BuscarAsync(BuscarClienteDto buscar);
    Task<string> AtualizarAsync(CadastroDeClienteDto clienteAtualizado);
    Task<string> ExcluirAsync(int id);
}

