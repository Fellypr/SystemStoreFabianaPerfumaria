using Backend.Dtos.Produtos;
using Backend.Model;

namespace Backend.Repositories.Interfaces;

public interface IProdutoRepository
{
    Task<int> CountByNomeAsync(string nomeDoProduto);
    Task<int> CountByCodigoBarraAsync(string codigoDeBarra);
    Task<int> InsertAsync(Produto produto);
    Task<List<Produto>> GetAllAsync();
    Task<int> UpdateAsync(Produto produto);
    Task<int> DeleteAsync(int id);
    Task<List<object>> BuscarEstoqueAsync(BuscarPorEstoqueDto filtro);
    Task<List<object>> BuscarParaVendaAsync(BuscarPorEstoqueDto filtro);
}

