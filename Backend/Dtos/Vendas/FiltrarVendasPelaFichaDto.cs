using System.Text.Json.Serialization;

namespace Backend.Dtos.Vendas;

public class FiltrarVendasPelaFichaDto
{
    [JsonPropertyName("fichaEmAberto")]
    public string FichaEmAberto { get; set; }
}

