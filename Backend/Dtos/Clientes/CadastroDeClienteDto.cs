using System.Text.Json.Serialization;

namespace Backend.Dtos.Clientes;

public class CadastroDeClienteDto
{
    [JsonPropertyName("id_Cliente")]
    public int Id_Cliente { get; set; }

    public string NomeDoCliente { get; set; }
    public string Cpf { get; set; }
    public string Telefone { get; set; }
    public string Endereco { get; set; }
    public string Bairro { get; set; }
    public int Numero { get; set; }
    public string PontoDeReferencia { get; set; }
}

