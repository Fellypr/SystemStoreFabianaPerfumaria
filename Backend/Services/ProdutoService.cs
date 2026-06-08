using Backend.Dtos;
using Backend.Dtos.Produtos;
using Backend.Model;
using Backend.Repositories.Interfaces;
using Backend.Services.Interfaces;
using Backend.Hubs;

using System.Text.Json;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.SignalR;
using System.Text;
using System.Diagnostics;

namespace Backend.Services;

public sealed class ProdutoService : IProdutoService
{
    private readonly IProdutoRepository _repo;
    private readonly IProdutoViaCodRepository _repoViaCod;
    private readonly IHubContext<ScrapingHub> _hubContext;

    public ProdutoService(IProdutoRepository repo, IProdutoViaCodRepository repoViaCod, IHubContext<ScrapingHub> hubContext)
    {
        _repo = repo ?? throw new ArgumentNullException(nameof(repo));
        _repoViaCod = repoViaCod ?? throw new ArgumentNullException(nameof(repoViaCod));
        _hubContext = hubContext ?? throw new ArgumentNullException(nameof(hubContext));
    }

    public async Task<string> CadastrarAsync(Produto produto)
    {
        var countNome = await _repo.CountByNomeAsync(produto.NomeDoProduto);
        if (countNome > 0)
            throw new InvalidOperationException("O Nome do produto Já Existe");

        var countCodigo = await _repo.CountByCodigoBarraAsync(produto.CodigoDeBarra);
        if (countCodigo > 0)
            throw new InvalidOperationException("O Codigo de Barra Já Existe");

        var result = await _repo.InsertAsync(produto);
        if (result > 0)
            return "Produto Adicionado com sucesso";

        throw new InvalidOperationException("Erro ao adicionar produto");
    }

    public Task<List<Produto>> HistoricoAsync() => _repo.GetAllAsync();

    public async Task<string> AtualizarAsync(int id, Produto produto)
    {
        var linhasAfetadas = await _repo.UpdateAsync(produto);
        if (linhasAfetadas == 0)
            throw new KeyNotFoundException("Produto não encontrado.");

        return "Produto atualizado com sucesso!";
    }

    public async Task<string> ExcluirAsync(int id)
    {
        var rowsAffected = await _repo.DeleteAsync(id);
        if (rowsAffected > 0)
            return "Produto excluído com sucesso.";

        throw new KeyNotFoundException("Produto não encontrado.");
    }

    public Task<ResultadoPaginado<object>> BuscarEstoqueAsync(BuscarPorEstoqueDto filtro) => _repo.BuscarEstoqueAsync(filtro);

    public async Task<List<object>> BuscarParaVendaAsync(BuscarPorEstoqueDto filtro)
    {
        var termo = filtro.CodigoDeBarra;
        if (string.IsNullOrWhiteSpace(termo))
            termo = filtro.NomeDoProduto;

        if (string.IsNullOrWhiteSpace(termo))
            throw new InvalidOperationException("Digite o nome ou escaneie o produto.");

        var lista = await _repo.BuscarParaVendaAsync(filtro);
        if (!lista.Any())
            throw new KeyNotFoundException("Nenhum produto encontrado.");

        return lista;
    }

    private static string? FindEstudosDePythonDirectory()
    {
        // AppContext.BaseDirectory geralmente aponta para Backend/bin/...; subimos até achar "Estudos_de_python".
        var dir = new DirectoryInfo(AppContext.BaseDirectory);
        for (var i = 0; i < 10 && dir != null; i++)
        {
            var candidate = Path.Combine(dir.FullName, "Estudos_de_python");
            if (Directory.Exists(candidate))
                return candidate;

            dir = dir.Parent;
        }

        return null;
    }

    public async Task<string> IniciarScrapingAsync(CodigoDeAcessoDto dto)
    {
        try
        {

            var estudosDir = FindEstudosDePythonDirectory();
            if (string.IsNullOrWhiteSpace(estudosDir))
            {
                throw new InvalidOperationException(
                    "Diretório 'Estudos_de_python' não encontrado a partir do diretório da aplicação. " +
                    "Verifique se a pasta existe na raiz do projeto."
                );
            }

            var isWindows = OperatingSystem.IsWindows();
            var pythonExe = Path.Combine(estudosDir, "venv", isWindows ? Path.Combine("Scripts", "python.exe") : Path.Combine("bin", "python"));
            var scriptPath = Path.Combine(estudosDir, "main.py");

            if (!File.Exists(scriptPath))
            {
                throw new InvalidOperationException(
                    $"Script do scraping não encontrado em '{scriptPath}'. Verifique se o arquivo 'main.py' existe dentro de 'Estudos_de_python'."
                );
            }

            if (!File.Exists(pythonExe))
            {
                var expected = isWindows
                    ? Path.Combine(estudosDir, "venv", "Scripts", "python.exe")
                    : Path.Combine(estudosDir, "venv", "bin", "python");

                throw new InvalidOperationException(
                    $"Python do venv não encontrado em '{expected}'. " +
                    "Crie/atualize o venv dentro de 'Estudos_de_python/venv' para este ambiente."
                );
            }

            var start = new ProcessStartInfo
            {
                FileName = pythonExe,
                WorkingDirectory = estudosDir,
                RedirectStandardOutput = true,
                RedirectStandardError = true,
                UseShellExecute = false,
                CreateNoWindow = true,
            };
            start.ArgumentList.Add(scriptPath);
            start.ArgumentList.Add("00000000000000000000000000000000000000000000");

            using var process = new Process { StartInfo = start };
            StringBuilder jsonAcumulado = new StringBuilder();
            process.ErrorDataReceived += async (sender, e) =>
            {
                if (!string.IsNullOrEmpty(e.Data))
                {
                    Console.WriteLine(e.Data);
                    if (!string.IsNullOrEmpty(dto.ConnectionId))
                    {
                        await _hubContext.Clients.Client(dto.ConnectionId).SendAsync("ReceiveLog", e.Data);
                    }
                }
            };
            process.OutputDataReceived += (sender, e) =>
            {
                if (!string.IsNullOrEmpty(e.Data))
                {
                    jsonAcumulado.Append(e.Data);
                }
            };

            process.Start();
            process.BeginOutputReadLine();
            process.BeginErrorReadLine();
            await process.WaitForExitAsync();
            var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
            var produtos = JsonSerializer.Deserialize<List<AdicionarProdutoViaCodDto>>(jsonAcumulado.ToString(), options);
            if (produtos == null)
                throw new InvalidOperationException("Nenhum produto encontrado.");



            return JsonSerializer.Serialize(produtos, options);

        }
        catch (Exception ex)
        {
            return $"Erro ao iniciar scraping: {ex.Message}";
        }

    }
    public async Task<List<AdicionarProdutoViaCodDto>> VerificarStatusDosProdutos(List<AdicionarProdutoViaCodDto> produto)
    {
        try
        {
            foreach (var produtos in produto)
            {
                var produtosExistentes = await _repoViaCod.GetByCodigoBarraAsync(produtos.CodigoBarra);
                if (produtosExistentes != null){
                    var quantidadeNaNota = produtos.UnidadeAdicionada ?? produtos.Unidade;
                    produtos.Status = "Ja existe";
                    produtos.PrecoRevista = produtosExistentes.PrecoRevista;
                    produtos.PrecoVista = produtosExistentes.PrecoVista;
                    produtos.PrecoEmFicha = produtosExistentes.PrecoEmFicha;
                    produtos.ImagemUrl = produtosExistentes.ImagemUrl;
                    produtos.CodigoBarra = produtosExistentes.CodigoBarra;
                    produtos.PrecoAdquirido = produtosExistentes.PrecoAdquirido;
                    produtos.NomeProduto = produtosExistentes.NomeProduto;
                    produtos.Unidade = produtosExistentes.Unidade;
                    produtos.UnidadeAdicionada = quantidadeNaNota;
                    produtos.MarcaDoProduto = produtosExistentes.MarcaDoProduto;
                }else{
                    produtos.Status = "Novo";
                    produtos.NomeProduto = produtos.NomeProduto.Trim().ToUpper();
                    produtos.UnidadeAdicionada = produtos.Unidade;
                }
            }
        }catch(Exception ex){
            throw new InvalidOperationException(ex.Message);
        }
        return produto;
    }
    public async Task<string> AdicionarProdutosAsync(List<AdicionarProdutoViaCodDto> produtos){
        int adicionados = 0;
        int atualizados = 0;
        try{

            foreach(var produto in produtos){
                var produtoExistente = await _repoViaCod.GetByCodigoBarraAsync(produto.CodigoBarra);
                if(produtoExistente != null){
                    await _repoViaCod.UpdateUnidadeProdutoAsync(produto);
                    atualizados++;
                }else{
                    await _repoViaCod.CreateProductCodAsync(produto);
                    adicionados++;
                }
            }
            return $"Produtos adicionados: {adicionados}, Produtos atualizados: {atualizados}";
        }catch(Exception ex){
            return $"Erro ao adicionar produtos: {ex.Message}";
        }
    }
}

