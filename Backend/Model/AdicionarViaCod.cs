using System;
using System.Collections.Generic;
using System.Diagnostics.Contracts;
using System.Linq;
using System.Threading.Tasks;

namespace Backend.Model 
{
    public class Produtos
    {
        public string Nome { get; set; }
        public string MarcaDoProduto { get; set; }
        public string CodigoBarra { get; set; }
        public int Unidade { get; set; }
        public decimal PrecoRevista { get; set; }
        public decimal PrecoAdquirido { get; set; }
        public decimal PrecoVista { get; set; }
        public string? ImagemUrl { get; set; }
    }
};