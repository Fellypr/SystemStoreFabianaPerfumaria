using Backend.Dtos.Clientes;

namespace Backend.Repositories.Interfaces;

public interface IClienteRepository
{
    Task<int> InsertAsync(CadastroDeClienteDto cliente);
    Task<List<CadastroDeClienteDto>> GetHistoricoAsync();
    Task<List<object>> BuscarAsync(BuscarClienteDto filtro);
    Task<int> UpdateAsync(CadastroDeClienteDto clienteAtualizado);
    Task<bool> ExcluirCascadeAsync(int id);
}

