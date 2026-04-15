using Backend.Dtos.Produtos;
using Backend.Model;
using Backend.Repositories.Interfaces;
using Backend.Services.Interfaces;

namespace Backend.Services;

public sealed class ProdutoService : IProdutoService
{
    private readonly IProdutoRepository _repo;

    public ProdutoService(IProdutoRepository repo)
    {
        _repo = repo ?? throw new ArgumentNullException(nameof(repo));
    }

    public async Task<string> CadastrarAsync(Produto produto)
    {
        var countNome = await _repo.CountByNomeAsync(produto.NomeDoProduto);
        if (countNome > 0)
            throw new InvalidOperationException("O Nome do produto Já Existe");

        var countCodigo = await _repo.CountByCodigoBarraAsync(produto.CodigoDeBarra);
        if (countCodigo > 0)
            throw new InvalidOperationException("O Codigo de Barra Já Existe");

        var result = await _repo.InsertAsync(produto);
        if (result > 0)
            return "Produto Adicionado com sucesso";

        throw new InvalidOperationException("Erro ao adicionar produto");
    }

    public Task<List<Produto>> HistoricoAsync() => _repo.GetAllAsync();

    public async Task<string> AtualizarAsync(int id, Produto produto)
    {
        var linhasAfetadas = await _repo.UpdateAsync(produto);
        if (linhasAfetadas == 0)
            throw new KeyNotFoundException("Produto não encontrado.");

        return "Produto atualizado com sucesso!";
    }

    public async Task<string> ExcluirAsync(int id)
    {
        var rowsAffected = await _repo.DeleteAsync(id);
        if (rowsAffected > 0)
            return "Produto excluído com sucesso.";

        throw new KeyNotFoundException("Produto não encontrado.");
    }

    public Task<List<object>> BuscarEstoqueAsync(BuscarPorEstoqueDto filtro) => _repo.BuscarEstoqueAsync(filtro);

    public async Task<List<object>> BuscarParaVendaAsync(BuscarPorEstoqueDto filtro)
    {
        var termo = filtro.CodigoDeBarra;
        if (string.IsNullOrWhiteSpace(termo))
            termo = filtro.NomeDoProduto;

        if (string.IsNullOrWhiteSpace(termo))
            throw new InvalidOperationException("Digite o nome ou escaneie o produto.");

        var lista = await _repo.BuscarParaVendaAsync(filtro);
        if (!lista.Any())
            throw new KeyNotFoundException("Nenhum produto encontrado.");

        return lista;
    }
}

