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
        [JsonPropertyName("diaDaSemana")]
        public string? DiaDaSemana { get; set; }
        [JsonPropertyName("qunatidadeDoDia")]
        public int? QuantidadeDoDia { get; set; }

    }
    public class FiltrarVendas
    {
        [JsonPropertyName("nomeDoComprado")]
        public string? NomeDoComprado { get; set; }

        [JsonPropertyName("formaDePagamento")]
        public string? FormaDePagamento { get; set; }
    }
    public class FiltrarVendasPelaData
    {
        [JsonPropertyName("dataInicio")]
        public DateTime? DataInicio { get; set; }

        [JsonPropertyName("dataFim")]
        public DateTime? DataFim { get; set; }
    }
    public class FiltrarVendasPelaFicha
    {
        [JsonPropertyName("fichaEmAberto")]
        public string? FichaEmAberto { get; set; }
    }
    public class AlertQuantidade
    {
        public int QuantidadeDoProduto { get; set; }
    }

}