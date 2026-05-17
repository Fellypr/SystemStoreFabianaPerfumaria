namespace Backend.Dtos.Produtos;
public class AdicionarProdutoViaCodDto
{
    public string NomeProduto { get; set; }
    public string CodigoBarra { get; set; }
    public int Unidade { get; set; }
    public int? UnidadeAdicionada{get; set;}
    public decimal PrecoAdquirido { get; set; }
    public decimal PrecoRevista { get; set; }
    public decimal PrecoVista { get; set; }
    public decimal PrecoEmFicha { get; set; }
    public string MarcaDoProduto { get; set; }
    
    public string? Status { get; set; }
    public string? ImagemUrl { get; set; }
}
public class CodigoDeAcessoDto
{
    public required string ChaveAcesso { get; set; }
    public string? ConnectionId { get; set; }
}