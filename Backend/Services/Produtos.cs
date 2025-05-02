using System.Text.Json.Serialization;
namespace StoreSystemFabianaPerfumaria.Services;

public class Produtos
{     
    [JsonPropertyName("id_Produto")]
    public int Id_Produto { get; set; }
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
