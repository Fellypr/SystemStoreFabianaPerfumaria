using Backend.Dtos.Clientes;
using Backend.Repositories.Interfaces;
using Backend.Services.Interfaces;

namespace Backend.Services;

public sealed class ClienteService : IClienteService
{
    private readonly IClienteRepository _repo;

    public ClienteService(IClienteRepository repo)
    {
        _repo = repo ?? throw new ArgumentNullException(nameof(repo));
    }

    public Task<int> CadastrarAsync(CadastroDeClienteDto cadastro) => _repo.InsertAsync(cadastro);

    public Task<List<CadastroDeClienteDto>> HistoricoAsync() => _repo.GetHistoricoAsync();

    public Task<List<object>> BuscarAsync(BuscarClienteDto buscar) => _repo.BuscarAsync(buscar);

    public async Task<string> AtualizarAsync(CadastroDeClienteDto clienteAtualizado)
    {
        var linhasAfetadas = await _repo.UpdateAsync(clienteAtualizado);
        if (linhasAfetadas == 0)
            throw new KeyNotFoundException("Cliente nao encontrado.");

        return "Cliente atualizado com sucesso!";
    }

    public async Task<string> ExcluirAsync(int id)
    {
        var ok = await _repo.ExcluirCascadeAsync(id);
        if (!ok)
            throw new KeyNotFoundException("Cliente nao encontrado.");

        return "Cliente excluido com sucesso.";
    }
}

