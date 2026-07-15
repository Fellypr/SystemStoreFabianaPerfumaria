using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Backend.Dtos.Produtos;
using Backend.Dtos.Vendas;
using Backend.Dtos.Pagamentos;
using System.Globalization;
using Backend.Services.Interfaces;

namespace Backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class RealizarVendaController : Controller
    {
        private readonly IVendaService _vendaService;
        private readonly IProdutoService _produtoService;

        public RealizarVendaController(IVendaService vendaService, IProdutoService produtoService)
        {
            _vendaService = vendaService ?? throw new ArgumentNullException(nameof(vendaService));
            _produtoService = produtoService ?? throw new ArgumentNullException(nameof(produtoService));
        }


        [HttpPost("BuscarProduto")]

        public async Task<ActionResult> RealizarVendaDoProduto([FromBody] BuscarProdutoDto RealizarVenda)
        {
            try
            {
                var filtro = new BuscarPorEstoqueDto
                {
                    CodigoDeBarra = RealizarVenda.CodigoDeBarra,
                    NomeDoProduto = RealizarVenda.NomeDoProduto,
                    Marca = null
                };

                var lista = await _produtoService.BuscarParaVendaAsync(filtro);
                if (lista == null || !lista.Any())
                    return NotFound("Produto não encontrado");

                return Ok(lista.First());
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }

        }
        [HttpPost("RealizarVenda")]
        public async Task<ActionResult> RealizarVenda([FromBody] List<VendaRealizadaDto> vendas)
        {
            try
            {
                var msg = await _vendaService.RealizarVendaAsync(vendas);
                return Ok(msg);
            }
            catch (InvalidOperationException ex) when (ex.Message == "Nenhuma venda recebida.")
            {
                return BadRequest("Nenhuma venda recebida.");
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Erro ao realizar venda: {ex.Message}");
            }
        }



        [HttpGet("VendasRealizadas")]
        public async Task<ActionResult> HistoricoDeVendasRealizadas([FromQuery] string formaDepagamento)
        {
            try
            {
                return Ok(await _vendaService.VendasDoDiaAsync(formaDepagamento));
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }

        }
        [HttpGet("HistoricoCrediario")]
        public async Task<ActionResult> HistoricoDeVendasRealizadasPelaSemana([FromQuery] string cliente, [FromQuery] DateTime? data)
        {
            try
            {
                return Ok(await _vendaService.HistoricoCrediarioAsync(cliente, data));

            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }

        }
        [HttpGet("FiltrarVendas")]
public async Task<ActionResult> FiltrarVendas(
    [FromQuery] string comprado, 
    [FromQuery] string formaDePagamento, 
    [FromQuery] string funcionaria,
    [FromQuery] DateTime? dataFinal, 
    [FromQuery] DateTime? dataInicial)
{
    try
    {
        return Ok(await _vendaService.FiltrarAsync(comprado, formaDePagamento,funcionaria, dataFinal, dataInicial));
    }
    catch (Exception ex)
    {
        return BadRequest($"Erro ao filtrar vendas: {ex.Message}");
    }
}


        [HttpPost("AbaterValor/{idVenda}/{idCliente}")]
        public async Task<ActionResult> AbaterValorNaFicha(
    int idVenda,
    int idCliente,
    [FromBody] VendaRealizadaDto atualizar)
        {
            try
            {
                var msg = await _vendaService.AbaterValorAsync(idVenda,idCliente, atualizar);
                return Ok(msg);
            }
            catch (Exception ex)
            {
                return BadRequest($"Erro ao abater valor: {ex.Message}");
            }
        }



        [HttpPost("ClientesComFichaEmAberto")]

        public async Task<ActionResult> ClienteComValorDaFichaEmAberto([FromBody] FiltrarVendasPelaFichaDto FiltrarData)
        {
            try
            {
                return Ok(await _vendaService.ClientesComFichaAsync(FiltrarData));
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpGet("VendasDaSemana")]
        public async Task<ActionResult> HistoricoDeVendasRealizadasPelaSemana()
        {
            try
            {
                return Ok(await _vendaService.VendasDaSemanaAsync());
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }

        }
        [HttpDelete("cancelar-automatico/{idVenda}")]
        public async Task<IActionResult> CancelarVendaAuto(int idVenda)
        {
            try
            {
                var result = await _vendaService.CancelarAutomaticoAsync(idVenda);
                return Ok(result);
            }
            catch (InvalidOperationException ex) when (ex.Message == "Nenhum produto encontrado para esta venda.")
            {
                return NotFound("Nenhum produto encontrado para esta venda.");
            }
            catch (Exception ex)
            {
                return BadRequest($"Erro crítico ao cancelar: {ex.Message}");
            }
        }




    }

}

