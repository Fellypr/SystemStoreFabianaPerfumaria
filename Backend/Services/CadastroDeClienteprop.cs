using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace Backend.Services
{
    public class CadastroDeClienteProp
    {   
        [JsonPropertyName("id_Cliente")]
        public int Id_Cliente { get; set; }
        public string NomeDoCliente { get; set; }
        public string Cpf { get; set; }
        public string Telefone{ get; set; }
        public string Endereco { get; set; }
        public string Bairro { get; set; }
        public int Numero{ get; set; }
        public string? PontoDeReferencia { get; set; }
        
    }
    public class BuscarCliente
    {
        public string? NomeDoCliente { get; set; }
        public string? Cpf { get; set; }
    }
}