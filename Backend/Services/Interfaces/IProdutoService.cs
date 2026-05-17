using Backend.Dtos.Produtos;
using Backend.Model;

namespace Backend.Services.Interfaces;

public interface IProdutoService
{
    Task<string> CadastrarAsync(Produto produto);
    Task<List<Produto>> HistoricoAsync();
    Task<string> AtualizarAsync(int id, Produto produto);
    Task<string> ExcluirAsync(int id);
    Task<List<object>> BuscarEstoqueAsync(BuscarPorEstoqueDto filtro);
    Task<List<object>> BuscarParaVendaAsync(BuscarPorEstoqueDto filtro);
    Task<string> IniciarScrapingAsync(CodigoDeAcessoDto dto);
    Task<List<AdicionarProdutoViaCodDto>> VerificarStatusDosProdutos(List<AdicionarProdutoViaCodDto> produtos);
    Task <string> AdicionarProdutosAsync(List<AdicionarProdutoViaCodDto> produtos);
}

