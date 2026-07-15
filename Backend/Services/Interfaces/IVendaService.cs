using Backend.Dtos.Vendas;

namespace Backend.Services.Interfaces;

public interface IVendaService
{
    Task<string> RealizarVendaAsync(List<VendaRealizadaDto> vendas);
    Task<List<VendaRealizadaDto>> VendasDoDiaAsync(string formaDepagamento);
    Task<List<VendaRealizadaDto>> HistoricoCrediarioAsync(string cliente, DateTime? data);
    Task<List<VendaRealizadaDto>> FiltrarAsync(string comprado, string formaDePagamento, string funcionaria, DateTime? dataFinal, DateTime? dataInicial);
    Task<string> AbaterValorAsync(int idVenda, int idCliente, VendaRealizadaDto atualizar);
    Task<List<object>> ClientesComFichaAsync(FiltrarVendasPelaFichaDto filtro);
    Task<List<VendaRealizadaDto>> VendasDaSemanaAsync();
    Task<object> CancelarAutomaticoAsync(int idVenda);
}

