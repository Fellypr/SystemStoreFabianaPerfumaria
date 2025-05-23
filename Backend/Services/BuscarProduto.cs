using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Backend.Services
{
    public class BuscarProduto
    {
        public string CodigoDeBarra { get; set; }
        public string NomeDoProduto { get; set; }
    }
    public class BuscarPorEstoque
    {
        public string? NomeDoProduto { get; set; }
        public string? Marca { get; set; }
        public string? CodigoDeBarra { get; set; }
    }
}