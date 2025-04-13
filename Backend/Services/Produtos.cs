using System.Text.Json.Serialization;
namespace StoreSystemFabianaPerfumaria.Services;

public class Produtos
{
    [JsonPropertyName("NomeDoProduto")]
    public string NomeDoProduto { get; set; }

    [JsonPropertyName("Marca")]
    public string Marca { get; set; }

    [JsonPropertyName("Preco")]
    public decimal Preco { get; set; }

    [JsonPropertyName("Quantidade")]
    public int Quantidade { get; set; }
    [JsonPropertyName("CodigoDeBarra")]
    public string CodigoDeBarra { get; set; }

    [JsonPropertyName("UrlImagem")]
    public string UrlImagem { get; set; }
};
