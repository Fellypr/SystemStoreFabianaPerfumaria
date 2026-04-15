using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Routing.Tree;
using Backend.Dtos.Clientes;
using Backend.Services.Interfaces;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CadastroDeClienteController : ControllerBase
    {
        private readonly IClienteService _clienteService;

        public CadastroDeClienteController(IClienteService clienteService)
        {
            _clienteService = clienteService ?? throw new ArgumentNullException(nameof(clienteService));
        }

        [HttpPost("CadastroDeCliente")]

        public async Task<ActionResult> CadastroDeCliente([FromBody] CadastroDeClienteDto Cadastro)
        {
            try
            {
                return Ok(await _clienteService.CadastrarAsync(Cadastro));

            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpGet("HistoricoDeClientes")]
        public async Task<ActionResult> HistoricoDeClientes()
        {
            try
            {
                return Ok(await _clienteService.HistoricoAsync());
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }

        }
        [HttpPost("BuscarCliente")]

        public async Task<ActionResult> BuscarCliente([FromBody] BuscarClienteDto Buscar)
        {
            try
            {
                return Ok(await _clienteService.BuscarAsync(Buscar));

            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }


        }
        [HttpPut("AtualizarCliente/{id_Cliente}")]

        public async Task<ActionResult> AtualizarCliente([FromBody] CadastroDeClienteDto ClienteAtualizado)
        {
            try
            {
                var msg = await _clienteService.AtualizarAsync(ClienteAtualizado);
                return Ok(msg);
            }
            catch (KeyNotFoundException ex) when (ex.Message == "Cliente nao encontrado.")
            {
                return NotFound("Cliente nao encontrado.");
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
        [HttpDelete("ExcluirCadastro/{id}")]

        public async Task<ActionResult> ExcluirCliente(int id)
        {
            try
            {
                var msg = await _clienteService.ExcluirAsync(id);
                return Ok(msg);
            }
            catch (KeyNotFoundException ex) when (ex.Message == "Cliente nao encontrado.")
            {
                return NotFound("Cliente nao encontrado.");
            }
            catch (Exception ex)
            {
                return BadRequest($"Erro ao excluir o cliente: {ex.Message}");
            }
        }

    }
}