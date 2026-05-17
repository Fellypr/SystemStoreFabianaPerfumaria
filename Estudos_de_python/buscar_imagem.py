"""
Módulo de busca automática de imagem de produto via DuckDuckGo Images.

Sem necessidade de API key, sem configuração adicional.

Requisitos:
    pip install ddgs
"""

import sys
import json
import re
import time
import hashlib
import requests
from pathlib import Path
from ddgs import DDGS

# --- Configuração ---
# Caminho do arquivo de cache (mesmo diretório do script)
CACHE_DIR = Path(__file__).parent
CACHE_FILE = CACHE_DIR / "cache_imagens.json"

# Tempo de expiração do cache: 30 dias (em segundos)
CACHE_EXPIRACAO_SEGUNDOS = 30 * 24 * 60 * 60


def _carregar_cache() -> dict:
    """
    Carrega o cache de imagens do disco.
    
    O cache é um dicionário JSON com a estrutura:
    {
        "chave_sanitizada_do_produto": {
            "url": "https://...",
            "timestamp": 1234567890.0
        }
    }
    """
    if CACHE_FILE.exists():
        try:
            with open(CACHE_FILE, "r", encoding="utf-8") as f:
                return json.load(f)
        except (json.JSONDecodeError, IOError):
            return {}
    return {}


def _salvar_cache(cache: dict):
    """Persiste o cache de imagens no disco."""
    try:
        with open(CACHE_FILE, "w", encoding="utf-8") as f:
            json.dump(cache, f, ensure_ascii=False, indent=2)
    except IOError as e:
        print(f"Aviso: Não foi possível salvar o cache de imagens: {e}", file=sys.stderr, flush=True)


def _gerar_chave_cache(nome_produto: str) -> str:
    """
    Gera uma chave de cache normalizada a partir do nome do produto.
    
    Remove acentos, espaços extras e converte para minúsculas para que
    variações do mesmo nome ("Arroz Branco 5kg" vs "arroz branco  5KG")
    resultem na mesma chave.
    """
    nome_limpo = nome_produto.strip().lower()
    nome_limpo = re.sub(r'\s+', ' ', nome_limpo)
    return hashlib.md5(nome_limpo.encode("utf-8")).hexdigest()


def _sanitizar_nome(nome_produto: str) -> str:
    """
    Limpa o nome do produto para melhorar a busca.
    
    Remove códigos internos, caracteres especiais e termos técnicos
    que atrapalhariam a busca de imagem.
    """
    nome = nome_produto.strip()
    # Remove códigos entre parênteses ou colchetes: "Arroz (COD:123)" -> "Arroz"
    nome = re.sub(r'[\(\[][^)\]]*[\)\]]', '', nome)
    # Remove sequências de números soltos com mais de 6 dígitos (códigos internos)
    nome = re.sub(r'\b\d{7,}\b', '', nome)
    # Remove caracteres especiais que não ajudam na busca
    nome = re.sub(r'[#@&*%$!]', '', nome)
    # Remove espaços extras
    nome = re.sub(r'\s+', ' ', nome).strip()
    return nome


def _validar_url_imagem(url: str, timeout: int = 5) -> bool:
    """
    Verifica se a URL retorna uma imagem válida.
    
    Faz um HEAD request para verificar:
    - Status 200
    - Content-Type começando com 'image/'
    """
    try:
        resp = requests.head(url, timeout=timeout, allow_redirects=True, headers={
            "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36"
        })
        content_type = resp.headers.get("Content-Type", "")
        return resp.status_code == 200 and "image" in content_type.lower()
    except requests.RequestException:
        return False


def buscar_imagem_produto(nome_produto: str) -> str:
    """
    Busca a URL da primeira imagem do produto via DuckDuckGo Images.
    
    Fluxo:
        1. Verifica o cache local
        2. Se não encontrou no cache, faz scraping no DuckDuckGo
        3. Valida a URL da imagem
        4. Salva no cache para futuras consultas
        5. Retorna a URL ou string vazia se não encontrou
    
    Args:
        nome_produto: Nome do produto a ser pesquisado (ex: "Arroz Branco 5kg")
        
    Returns:
        URL da imagem encontrada ou string vazia ("")
    """
    if not nome_produto or not nome_produto.strip():
        return ""

    # --- 1. Verificar cache ---
    cache = _carregar_cache()
    chave = _gerar_chave_cache(nome_produto)
    
    if chave in cache:
        entrada = cache[chave]
        idade = time.time() - entrada.get("timestamp", 0)
        
        if idade < CACHE_EXPIRACAO_SEGUNDOS:
            print(f"  [Cache] Imagem encontrada no cache para: {nome_produto[:40]}...", file=sys.stderr, flush=True)
            return entrada.get("url", "")
        else:
            print(f"  [Cache] Entrada expirada para: {nome_produto[:40]}...", file=sys.stderr, flush=True)

    # --- 2. Sanitizar e buscar via DuckDuckGo ---
    nome_limpo = _sanitizar_nome(nome_produto)
    query = f"{nome_limpo} produto"

    print(f"  [DuckDuckGo] Buscando imagem para: \"{query}\"", file=sys.stderr, flush=True)

    # Retry com backoff para lidar com rate limits (erro 403)
    max_tentativas = 3
    resultados = []

    for tentativa in range(1, max_tentativas + 1):
        try:
            ddgs = DDGS()
            resultados = list(ddgs.images(
                query=query,
                region="br-pt",
                safesearch="moderate",
                max_results=5
            ))
            break  # Sucesso, sai do loop
        except Exception as e:
            erro_str = str(e)
            if "Ratelimit" in erro_str or "403" in erro_str:
                wait_time = tentativa * 3  # 3s, 6s, 9s
                print(f"  [DuckDuckGo] Rate limit (tentativa {tentativa}/{max_tentativas}). Aguardando {wait_time}s...", file=sys.stderr, flush=True)
                time.sleep(wait_time)
            else:
                print(f"  [DuckDuckGo] Erro na busca: {e}", file=sys.stderr, flush=True)
                return ""

    try:
        if not resultados:
            print(f"  [DuckDuckGo] Nenhuma imagem encontrada para: \"{query}\"", file=sys.stderr, flush=True)
            # Salva no cache como vazio para não repetir a busca
            cache[chave] = {"url": "", "timestamp": time.time()}
            _salvar_cache(cache)
            return ""

        # --- 3. Extrair e validar URLs ---
        url_imagem = ""
        for resultado in resultados:
            url_candidata = resultado.get("image", "")
            if url_candidata and _validar_url_imagem(url_candidata):
                url_imagem = url_candidata
                break

        # Se nenhuma URL passou na validação, pega a primeira mesmo assim
        if not url_imagem and resultados:
            url_imagem = resultados[0].get("image", "")

        # --- 4. Salvar no cache ---
        cache[chave] = {
            "url": url_imagem,
            "timestamp": time.time()
        }
        _salvar_cache(cache)

        print(f"  [DuckDuckGo] Imagem encontrada: {url_imagem[:80]}...", file=sys.stderr, flush=True)
        return url_imagem

    except Exception as e:
        print(f"  [DuckDuckGo] Erro na busca: {e}", file=sys.stderr, flush=True)
        return ""


def buscar_imagens_lote(nomes_produtos: list[str], delay: float = 1.0) -> dict[str, str]:
    """
    Busca imagens para uma lista de produtos com delay entre requisições.
    
    Útil para processar todos os produtos de uma NF-e de uma vez.
    O delay entre requisições evita bloqueios do DuckDuckGo.
    
    Args:
        nomes_produtos: Lista de nomes de produtos
        delay: Segundos de espera entre cada requisição (padrão: 1.0s)
        
    Returns:
        Dicionário {nome_produto: url_imagem}
    """
    resultados = {}
    total = len(nomes_produtos)

    print(f"\nIniciando busca de imagens para {total} produtos...", file=sys.stderr, flush=True)

    for i, nome in enumerate(nomes_produtos, 1):
        print(f"  [{i}/{total}] {nome[:50]}...", file=sys.stderr, flush=True)
        resultados[nome] = buscar_imagem_produto(nome)
        
        # Delay entre requisições para evitar bloqueio
        if i < total:
            time.sleep(delay)

    encontradas = sum(1 for url in resultados.values() if url)
    print(f"\nBusca concluída: {encontradas}/{total} imagens encontradas.", file=sys.stderr, flush=True)

    return resultados


# --- Execução direta para testes ---
if __name__ == "__main__":
    if len(sys.argv) > 1:
        nome_teste = " ".join(sys.argv[1:])
        print(f"Testando busca para: \"{nome_teste}\"\n", file=sys.stderr, flush=True)
        url = buscar_imagem_produto(nome_teste)
        if url:
            # Saída JSON limpa no stdout
            print(json.dumps({"produto": nome_teste, "imagem_url": url}, ensure_ascii=False))
        else:
            print("Nenhuma imagem encontrada.", file=sys.stderr, flush=True)
    else:
        print("Uso: python buscar_imagem.py \"Nome do Produto\"", file=sys.stderr, flush=True)
        print("Exemplo: python buscar_imagem.py \"Arroz Tio João 5kg\"", file=sys.stderr, flush=True)
