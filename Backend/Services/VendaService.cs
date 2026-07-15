using Backend.Dtos.Vendas;
using Backend.Repositories.Interfaces;
using Backend.Services.Interfaces;

namespace Backend.Services;

public sealed class VendaService : IVendaService
{
    private readonly IVendaRepository _repo;

    public VendaService(IVendaRepository repo)
    {
        _repo = repo ?? throw new ArgumentNullException(nameof(repo));
    }

    public async Task<string> RealizarVendaAsync(List<VendaRealizadaDto> vendas)
    {
        if (vendas == null || !vendas.Any())
            throw new InvalidOperationException("Nenhuma venda recebida.");

        await _repo.RealizarVendaAsync(vendas);
        
        return "Venda realizada com sucesso.";
    }

    public Task<List<VendaRealizadaDto>> VendasDoDiaAsync(string formaDepagamento) => _repo.VendasDoDiaAsync(formaDepagamento);

    public Task<List<VendaRealizadaDto>> HistoricoCrediarioAsync(string cliente, DateTime? data) => _repo.HistoricoCrediarioAsync(cliente, data);

    public Task<List<VendaRealizadaDto>> FiltrarAsync(string comprado, string formaDePagamento, string funcionaria, DateTime? dataFinal, DateTime? dataInicial) =>
        _repo.FiltrarAsync(comprado, formaDePagamento, funcionaria, dataFinal, dataInicial);

    public async Task<string> AbaterValorAsync(int idVenda,int idCliente, VendaRealizadaDto atualizar)
    {
        await _repo.AbaterValorNaFichaAsync(idVenda, idCliente, atualizar.ValorNaFicha);
        return "Valor abatido com sucesso";
    }

    public Task<List<object>> ClientesComFichaAsync(FiltrarVendasPelaFichaDto filtro) => _repo.ClientesComFichaEmAbertoAsync(filtro.FichaEmAberto);

    public Task<List<VendaRealizadaDto>> VendasDaSemanaAsync() => _repo.VendasDaSemanaAsync();

    public Task<object> CancelarAutomaticoAsync(int idVenda) => _repo.CancelarAutomaticoAsync(idVenda);
}

