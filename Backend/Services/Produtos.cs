using System.Text.Json.Serialization;
using System.ComponentModel.DataAnnotations;

namespace StoreSystemFabianaPerfumaria.Services;
public class Produtos
{
    [JsonPropertyName("id_Produto")]
    public int Id_Produto { get; set; }
    [JsonPropertyName("NomeDoProduto")]
    [Required(ErrorMessage = "O campo NomeDoProduto é obrigatório")]
    public string NomeDoProduto { get; set; }
    [Required(ErrorMessage = "O campo Marca é obrigatório")]
    [JsonPropertyName("Marca")]
    public string Marca { get; set; }
    [Required(ErrorMessage = "O campo Preco é obrigatório")]
    [JsonPropertyName("Preco")]
    public decimal Preco { get; set; }
    [JsonPropertyName("PrecoAdquirido")]
    public decimal? PrecoAdquirido { get; set; }
    public decimal? PrecoAvista { get; set; }
    public decimal? PrecoEmFicha { get; set; }

    [JsonPropertyName("Quantidade")]
    [Required(ErrorMessage = "O campo Quantidade é obrigatório")]
    [Range(1, int.MaxValue, ErrorMessage = "A quantidade deve ser maior que zero")]
    [RegularExpression(@"^\d+$", ErrorMessage = "A quantidade deve ser um valor numérico")]
    public int Quantidade { get; set; }
    [JsonPropertyName("CodigoDeBarra")]
    [Required(ErrorMessage = "O campo CodigoDeBarra é obrigatório")]
    [RegularExpression(@"^\d+$", ErrorMessage = "O CodigoDeBarra deve ser um valor numérico")]
    public string CodigoDeBarra { get; set; }

    [JsonPropertyName("UrlImagem")]
    public string UrlImagem { get; set; }
};
