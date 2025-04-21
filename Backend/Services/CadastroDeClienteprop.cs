using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Backend.Services
{
    public class CadastroDeClienteProp
    {   
        public string NomeDoCliente { get; set; }
        public string Cpf { get; set; }
        public string Telefone{ get; set; }
        public string Endereco { get; set; }
        public string Bairro { get; set; }
        public int Numero{ get; set; }
        public string? PontoDeReferencia { get; set; }
        
    }
}