using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Backend.Dtos.Produtos;
using Backend.Model;
using Backend.Services.Interfaces;

namespace Backend.Controllers
{
    [Route("api/[Controller]")]
    [ApiController]
    public class AdicionarProduto : Controller
    {
        private readonly IProdutoService _produtoService;

        public AdicionarProduto(IProdutoService produtoService)
        {
            _produtoService = produtoService ?? throw new ArgumentNullException(nameof(produtoService));
        }

        [HttpPost("CadastroDeProdutos")]
        public async Task<ActionResult> Produtos([FromBody] Produto AdicionarProdutos)
        {
            try
            {
                var msg = await _produtoService.CadastrarAsync(AdicionarProdutos);
                return Ok(msg);
            }
            catch (InvalidOperationException ex) when (ex.Message == "O Nome do produto Já Existe")
            {
                return Conflict($"O Nome do produto Já Existe");
            }
            catch (InvalidOperationException ex) when (ex.Message == "O Codigo de Barra Já Existe")
            {
                return Conflict("O Codigo de Barra Já Existe");
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Erro ao adicionar produto: {ex.Message}");
            }
        }

        [HttpGet("HistoricoDeProdutos")]
        public async Task<ActionResult> HistoricoDeProdutos()
        {
            try
            {
                var produtos = await _produtoService.HistoricoAsync();
                return Ok(produtos);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Erro ao obter histórico de produtos: {ex.Message}");
            }
        }

        [HttpPut("AtualizarProduto/{id_Produto}")]
        public async Task<IActionResult> AtualizarProduto(int id, [FromBody] Produto produtoAtualizado)
        {
            try
            {
                var msg = await _produtoService.AtualizarAsync(id, produtoAtualizado);
                return Ok(msg);
            }
            catch (KeyNotFoundException ex) when (ex.Message == "Produto não encontrado.")
            {
                return NotFound("Produto não encontrado.");
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Erro interno ao atualizar o produto: {ex.Message}");
            }
        }

        [HttpDelete("ExcluirProduto/{Id}")]
        public async Task<IActionResult> ExcluirProduto(int id)
        {
            try
            {
                var msg = await _produtoService.ExcluirAsync(id);
                return Ok(msg);
            }
            catch (KeyNotFoundException ex) when (ex.Message == "Produto não encontrado.")
            {
                return NotFound("Produto não encontrado.");
            }
            catch (Exception ex)
            {
                return BadRequest($"Erro ao excluir o produto: {ex.Message}");
            }
        }

        [HttpPost("BuscarProdutoEstoque")]
        public async Task<IActionResult> Buscar([FromBody] BuscarPorEstoqueDto search)
        {
            try
            {
                var listaDeProduto = await _produtoService.BuscarEstoqueAsync(search);
                if (listaDeProduto.Count == 0)
                    return NotFound("Nenhum produto encontrado.");

                return Ok(listaDeProduto);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPost("BuscarProdutoParaRealizarVenda")]
        public async Task<IActionResult> BuscarParaRealizarVenda([FromBody] BuscarPorEstoqueDto searchvenda)
        {
            try
            {
                var lista = await _produtoService.BuscarParaVendaAsync(searchvenda);
                return Ok(lista);
            }
            catch (InvalidOperationException ex) when (ex.Message == "Digite o nome ou escaneie o produto.")
            {
                return BadRequest("Digite o nome ou escaneie o produto.");
            }
            catch (KeyNotFoundException ex) when (ex.Message == "Nenhum produto encontrado.")
            {
                return NotFound("Nenhum produto encontrado.");
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Erro ao buscar produto para venda: {ex.Message}");
            }
        }
        [HttpPost("iniciar-scraping")]
        public async Task<IActionResult> IniciarScraping([FromBody] CodigoDeAcessoDto dto)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(dto.ChaveAcesso))
                {
                    return BadRequest("Preencha a chave de acesso");
                }
                else if (dto.ChaveAcesso.Length != 44)
                {
                    return BadRequest("Chave de acesso deve ter 44 caracteres");
                }

                var resultado = await _produtoService.IniciarScrapingAsync(dto);
                if (resultado.StartsWith("Erro ao iniciar scraping:", StringComparison.OrdinalIgnoreCase))
                    return StatusCode(500, resultado);

                return Ok(resultado);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
        [HttpPost("verificar-produtos")]
        public async Task<IActionResult> VerificarProdutos([FromBody] List<AdicionarProdutoViaCodDto> produtos)
        {
            try
            {
                if (produtos == null || !produtos.Any())
                {
                    return BadRequest("Nenhum produto encontrado para verificar");
                }
                var resultado = await _produtoService.VerificarStatusDosProdutos(produtos);
                return Ok(resultado);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPost("adicionar-produtos")]
        public async Task<IActionResult> AdicionarProdutos([FromBody] List<AdicionarProdutoViaCodDto> produtos)
        {
            try
            {
                if (produtos == null || !produtos.Any())
                {
                    return BadRequest("Nenhum produto encontrado para adicionar");
                }
                var resultado = await _produtoService.AdicionarProdutosAsync(produtos);
                return Ok(resultado);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Erro ao adicionar produtos: {ex.Message}");
            }
        }
    }
}
