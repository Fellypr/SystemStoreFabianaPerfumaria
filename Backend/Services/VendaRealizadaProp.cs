using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Backend.Services
{
    using System.Text.Json.Serialization;

    public class VendaRealizadaProp
    {
        [JsonPropertyName("nomeDoProduto")]
        public string NomeDoProduto { get; set; }

        [JsonPropertyName("precoTotal")]
        public decimal PrecoTotal { get; set; }

        [JsonPropertyName("quantidade")]
        public int QuantidadeTotal { get; set; }

        [JsonPropertyName("dataDaVenda")]
        public DateTime DataDaVenda { get; set; }

        [JsonPropertyName("formaDePagamento")]
        public string FormaDePagamento { get; set; }
    }
    

}