using System.Text.Json.Serialization;
using Backend.Dtos.Pagamentos;

namespace Backend.Dtos.Vendas;

public class VendaRealizadaDto
{
    [JsonPropertyName("idVenda")]
    public int IdVenda { get; set; }

    [JsonPropertyName("id_produto")]
    public int Id_Produto { get; set; }

    [JsonPropertyName("nomeDoProduto")]
    public string NomeDoProduto { get; set; }

    [JsonPropertyName("produtosVendidos")]
    public string Produtos_Vendidos { get; set; }

    [JsonPropertyName("precoTotal")]
    public decimal PrecoTotal { get; set; }

    [JsonPropertyName("precoUnitario")]
    public decimal PrecoUnitario { get; set; }

    [JsonPropertyName("quantidade")]
    public int QuantidadeTotal { get; set; }

    [JsonPropertyName("dataDaVenda")]
    public DateTime DataDaVenda { get; set; }

    [JsonPropertyName("formaDePagamento")]
    public List<PagamentoDto> FormaDePagamento { get; set; }

    [JsonPropertyName("pagamentos")]
    public List<PagamentoDto> Pagamentos { get; set; }

    [JsonPropertyName("quantidadeTotal")]
    public int quantidadeTotal { get; set; }

    [JsonPropertyName("valorNaFicha")]
    public decimal ValorNaFicha { get; set; }

    [JsonPropertyName("comprador")]
    public string Comprador { get; set; }
    
    [JsonPropertyName("funcionario")]
    public string Funcionario { get; set; }

    [JsonPropertyName("diaDaSemana")]
    public string DiaDaSemana { get; set; }

    [JsonPropertyName("qunatidadeDoDia")]
    public int? QuantidadeDoDia { get; set; }

    [JsonPropertyName("numeroDeTelefone")]
    public string NumeroDeTelefone { get; set; }
}

