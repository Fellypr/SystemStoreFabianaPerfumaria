namespace Backend.Dtos.Produtos;

public class BuscarPorEstoqueDto
{
    public string NomeDoProduto { get; set; }
    public string Marca { get; set; }
    public string CodigoDeBarra { get; set; }
    public int Pagina { get; set; } = 1;
    public int TamanhoPagina { get; set; } = 20;
}

