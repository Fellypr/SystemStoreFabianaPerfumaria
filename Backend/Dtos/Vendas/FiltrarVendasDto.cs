using System.Text.Json.Serialization;

namespace Backend.Dtos.Vendas;

public class FiltrarVendasDto
{
    [JsonPropertyName("nomeDoComprado")]
    public string NomeDoComprado { get; set; }

    [JsonPropertyName("formaDePagamento")]
    public string FormaDePagamento { get; set; }

    [JsonPropertyName("dataInicio")]
    public DateTime? DataInicial { get; set; }

    [JsonPropertyName("dataFim")]
    public DateTime? DataFinal { get; set; }
}

