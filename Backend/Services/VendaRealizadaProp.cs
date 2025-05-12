using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Backend.Services
{
    using System.Text.Json.Serialization;

    public class VendaRealizadaProp
    {   
        [JsonPropertyName("idVenda")]
        public int IdVenda { get; set; }
        [JsonPropertyName("id_produto")]
        public int Id_Produto { get; set; }
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

        [JsonPropertyName("quantidadeTotal")]
        public int quantidadeTotal { get; set; }

        [JsonPropertyName("valorNaFicha")]
        public decimal ValorNaFicha { get; set; }

        [JsonPropertyName("comprador")]
        public string? Comprador { get; set; }

    }
    public class FiltrarVendas
    {  
        [JsonPropertyName("nomeDoComprado")]
        public string? NomeDoComprado { get; set; }

        [JsonPropertyName("formaDePagamento")]
        public string? FormaDePagamento { get; set; }

        [JsonPropertyName("data")]
        public DateTime? Data { get; set; }
    }
    

}