using Backend.Dtos.Pagamentos;
using Backend.Dtos.Vendas;

namespace Backend.Repositories.Interfaces;

public interface IVendaRepository
{
    Task RealizarVendaAsync(List<VendaRealizadaDto> vendas);
    Task<List<VendaRealizadaDto>> VendasDoDiaAsync(string formaDepagamento);
    Task<List<PagamentoDto>> GetPagamentosAsync(int idVenda);
    Task<List<VendaRealizadaDto>> HistoricoCrediarioAsync(string cliente, DateTime? data);
    Task<List<VendaRealizadaDto>> FiltrarAsync(string comprado, string formaDePagamento, string funcionaria, DateTime? dataFinal, DateTime? dataInicial);
    Task AbaterValorNaFichaAsync(int idVenda, decimal valor);
    Task<List<object>> ClientesComFichaEmAbertoAsync(string fichaEmAberto);
    Task<List<VendaRealizadaDto>> VendasDaSemanaAsync();
    Task<object> CancelarAutomaticoAsync(int idVenda);
}

