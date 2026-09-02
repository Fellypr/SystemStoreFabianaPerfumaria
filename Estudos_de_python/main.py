#Script para consulta de NF-e no Portal da Fazenda Nacional.
#Requisitos de ambiente:
#baixe o python 3.12.6 e o pip 25.0.1
#crie um venv com o nome de venv:
#python -m venv venv
#ativar o venv:
#venv\Scripts\activate
#instalar as dependências:
#- pip install undetected-chromedriver selenium pandas beautifulsoup4
#para instalar as dependências, basta executar o comando:
#pip install -r requirements.txt

import sys
import json
import time
import re
import os
import atexit
import argparse
import pandas as pd
import undetected_chromedriver as uc
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException, NoSuchElementException, WebDriverException
from bs4 import BeautifulSoup
from buscar_imagem import buscar_imagem_produto

NFE_URL = (
    "https://www.nfe.fazenda.gov.br/portal/consultaRecaptcha.aspx"
    "?tipoConsulta=resumo&tipoConteudo=7PhJ+gAVw2g%3d"
)
PROFILE_DIR = os.path.join(os.path.expanduser("~"), ".nfe_chrome_profile")
LOCK_PATH = PROFILE_DIR + ".lock"


def _processo_ativo(pid: int) -> bool:
    if pid <= 0:
        return False
    try:
        os.kill(pid, 0)
        return True
    except (OSError, SystemError):
        return False


def adquirir_lock_perfil() -> None:
    os.makedirs(PROFILE_DIR, exist_ok=True)
    if os.path.exists(LOCK_PATH):
        try:
            with open(LOCK_PATH, encoding="utf-8") as f:
                pid_antigo = int(f.read().strip())
            if _processo_ativo(pid_antigo):
                print(
                    f"Outra consulta NF-e em andamento (PID {pid_antigo}). "
                    "Aguarde a conclusão ou encerre o processo anterior.",
                    file=sys.stderr,
                    flush=True,
                )
                sys.exit(1)
        except (ValueError, OSError):
            pass
    with open(LOCK_PATH, "w", encoding="utf-8") as f:
        f.write(str(os.getpid()))
    atexit.register(liberar_lock_perfil)


def liberar_lock_perfil() -> None:
    try:
        if os.path.exists(LOCK_PATH):
            with open(LOCK_PATH, encoding="utf-8") as f:
                pid = int(f.read().strip())
            if pid == os.getpid():
                os.remove(LOCK_PATH)
    except (ValueError, OSError):
        pass


def salvar_debug_captcha(driver, prefix: str = "erro_captcha") -> None:
    script_dir = os.path.dirname(os.path.abspath(__file__))
    png_path = os.path.join(script_dir, f"{prefix}.png")
    html_path = os.path.join(script_dir, f"{prefix}.html")
    try:
        driver.save_screenshot(png_path)
        print(f"Screenshot salva em '{png_path}'.", file=sys.stderr, flush=True)
    except Exception as e:
        print(f"Não foi possível salvar screenshot: {e}", file=sys.stderr, flush=True)
    try:
        with open(html_path, "w", encoding="utf-8") as f:
            f.write(driver.page_source)
        print(f"HTML salvo em '{html_path}'.", file=sys.stderr, flush=True)
    except Exception as e:
        print(f"Não foi possível salvar HTML: {e}", file=sys.stderr, flush=True)


def criar_driver(semi_manual: bool = False, cdp_address: str | None = None):
    is_windows = os.name == "nt"
    options = uc.ChromeOptions()
    if not is_windows:
        options.add_argument("--no-sandbox")
        options.add_argument("--disable-dev-shm-usage")

    if is_windows:
        options.binary_location = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
    else:
        options.add_argument(
            "user-agent=Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 "
            "(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        )

    options.add_argument(f"--user-data-dir={PROFILE_DIR}")

    if cdp_address:
        options.add_experimental_option("debuggerAddress", cdp_address)
        print(
            f"Conectado ao Chrome existente via CDP ({cdp_address}). "
            "Inicie o Chrome com: chrome.exe --remote-debugging-port=9222",
            file=sys.stderr,
            flush=True,
        )
        return uc.Chrome(options=options)

    print("Iniciando o navegador com perfil persistente...", file=sys.stderr, flush=True)
    driver = uc.Chrome(options=options, version_main=152)
    print(
        "Consulta manual ativa: o Selenium só será usado para extrair os dados "
        "depois que a página da NF-e carregar.",
        file=sys.stderr,
        flush=True,
    )
    return driver


def detectar_falha_captcha(driver) -> bool:
    try:
        return bool(
            driver.execute_script(
                """
                var el = document.body ? document.body.innerText : '';
                return el.indexOf('Falha na valida') !== -1;
                """
            )
        )
    except WebDriverException:
        return False


def pagina_nfe_carregada(driver) -> bool:
    try:
        url_atual = driver.current_url
        if "consultarecaptcha" in url_atual.lower():
            return False
        return bool(
            driver.execute_script(
                """
                return !!(
                    document.querySelector("[class*='fixo-prod-serv-descricao']") ||
                    document.getElementById('NFe') ||
                    document.querySelector('.box')
                );
                """
            )
        )
    except WebDriverException:
        return False


def aguardar_consulta_manual(driver) -> None:
    print(
        "\nConsulta manual ativa:\n"
        "1) Digite a chave de 44 dígitos no navegador\n"
        "2) Resolva o hCaptcha e clique em 'Continuar'\n"
        "3) Aguarde a página da NF-e carregar completamente\n\n"
        "O script verificará automaticamente a página a cada 1 minuto.",
        file=sys.stderr,
        flush=True,
    )

    while True:
        time.sleep(60)
        print(
            "Já se passou 1 minuto. Verificando se a página da NF-e foi carregada...",
            file=sys.stderr,
            flush=True,
        )

        if pagina_nfe_carregada(driver):
            return

        if detectar_falha_captcha(driver):
            print(
                "A Sefaz rejeitou o captcha. Recarregue a página manualmente e tente novamente.",
                file=sys.stderr,
                flush=True,
            )
        else:
            print(
                "A página da NF-e ainda não foi detectada. "
                "Nova verificação será feita em 1 minuto.",
                file=sys.stderr,
                flush=True,
            )


def fluxo_captcha_com_recovery(driver) -> bool:
    aguardar_consulta_manual(driver)
    return True


def consultar_nfe(chave_acesso: str, semi_manual: bool = False, cdp_address: str | None = None):
    """
    Realiza a consulta da NF-e no Portal da Fazenda.
    """
    if len(chave_acesso) != 44:
        print("Erro: A chave de acesso deve ter exatamente 44 dígitos.", file=sys.stderr, flush=True)
        return

    adquirir_lock_perfil()
    driver = None
    try:
        driver = criar_driver(semi_manual=semi_manual, cdp_address=cdp_address)
        driver.get(NFE_URL)

        fluxo_captcha_com_recovery(driver)

        print("Acesso detectado! Aguardando estabilização dos scripts da Sefaz...", file=sys.stderr, flush=True)
        time.sleep(10)

        print("Mudando para a aba 'Produtos e Serviços'...", file=sys.stderr, flush=True)
        wait = WebDriverWait(driver, 40)

        try:
            aba_produtos = driver.find_element(By.CSS_SELECTOR, "a[onclick*='mostraAba(3)']")
            driver.execute_script("arguments[0].scrollIntoView(true);", aba_produtos)
            aba_produtos.click()
        except Exception:
            driver.execute_script("mostraAba(3);")

        try:
            wait = WebDriverWait(driver, 10)
            wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "[class*='fixo-prod-serv-descricao']")))
        except TimeoutException:
            print(
                "A aba parece não ter carregado na primeira tentativa. Forçando mostraAba(3) novamente...",
                file=sys.stderr,
                flush=True,
            )
            driver.execute_script("mostraAba(3);")
            WebDriverWait(driver, 15).until(
                EC.presence_of_element_located((By.CSS_SELECTOR, "[class*='fixo-prod-serv-descricao']"))
            )

        print("Aba de produtos carregada. Iniciando extração dos dados...", file=sys.stderr, flush=True)

        print("Expandindo detalhes dos produtos...", file=sys.stderr, flush=True)
        try:
            driver.execute_script("document.querySelectorAll('.toggle').forEach(el => el.click());")
            time.sleep(3)

            with open("debug_page.html", "w", encoding="utf-8") as f:
                f.write(driver.page_source)
            print("Página com detalhes expandidos salva em 'debug_page.html'.", file=sys.stderr, flush=True)
        except Exception as e:
            print(f"Aviso: Houve uma falha ao tentar expandir tabelas: {e}", file=sys.stderr, flush=True)

        soup = BeautifulSoup(driver.page_source, "html.parser")
        produtos = []

        descricoes_elementos = soup.find_all(class_=lambda x: x and "fixo-prod-serv-descricao" in x)

        for desc in descricoes_elementos:
            container = desc.find_parent(["tr", "table", "fieldset", "div"])

            if not container:
                continue

            nome = desc.get_text(strip=True)
            if not nome:
                continue

            if nome.lower() == "descrição":
                continue

            qtd_elem = container.find(class_=lambda x: x and "fixo-prod-serv-qtd" in x)
            qtd = qtd_elem.get_text(strip=True) if qtd_elem else ""

            tabela_pai = container.find_parent("table")
            tabela_detalhes = None

            if tabela_pai:
                tabela_detalhes = tabela_pai.find_next_sibling(
                    "table", class_=re.compile(r"toggable|box", re.IGNORECASE)
                )

            if tabela_detalhes:
                label_vu = tabela_detalhes.find(
                    "label", string=re.compile(r"Valor unitário de comercialização", re.IGNORECASE)
                )

                if label_vu:
                    span_vu = label_vu.find_next_sibling("span")
                    if span_vu:
                        vu = span_vu.get_text(strip=True)
                    else:
                        vu = re.sub(
                            r"(?i)Valor unitário de comercialização",
                            "",
                            label_vu.parent.get_text(strip=True),
                        ).strip(":- ")
                else:
                    vu = "Não encontrado"
            else:
                vu = "Tabela de detalhes não encontrada"

            if vu in ["Não encontrado", "Tabela de detalhes não encontrada", ""]:
                v_unit = container.find(attrs={"id": re.compile(r"vUnCom", re.IGNORECASE)}) or container.find(
                    attrs={"class": re.compile(r"vUnCom", re.IGNORECASE)}
                )
                if v_unit:
                    vu = v_unit.get_text(strip=True)

            if vu in ["Não encontrado", "Tabela de detalhes não encontrada", ""]:
                print(
                    f"DEBUG: Tabela de detalhes encontrada para o produto? {bool(tabela_detalhes)}",
                    file=sys.stderr,
                    flush=True,
                )

            ean = "Não encontrado"

            if tabela_detalhes:
                label_ean = tabela_detalhes.find(
                    "label",
                    string=re.compile(r"Código EAN Tributável|Código EAN Comercial|EAN|GTIN", re.IGNORECASE),
                )

                if label_ean:
                    span_ean = label_ean.find_next_sibling("span")
                    if span_ean:
                        ean = span_ean.get_text(strip=True)
                    else:
                        ean = re.sub(
                            r"(?i)Código EAN Tributável|Código EAN Comercial|Código EAN|EAN|GTIN",
                            "",
                            label_ean.parent.get_text(strip=True),
                        ).strip(":- \n")

            if ean in ["", "Não encontrado"]:
                base_busca = tabela_detalhes if tabela_detalhes else container
                v_ean = base_busca.find(attrs={"id": re.compile(r"cEANTrib|cEAN", re.IGNORECASE)}) or base_busca.find(
                    attrs={"class": re.compile(r"cEANTrib|cEAN", re.IGNORECASE)}
                )
                if v_ean:
                    ean = v_ean.get_text(strip=True)

            try:
                vu_limpo = vu.replace("R$", "").replace(".", "").replace(",", ".").strip()
                vu_float = float(vu_limpo)
            except ValueError:
                vu_float = 0.0

            try:
                qtd_limpo = float(qtd.replace(",", ".").strip())
                qtd_float = int(qtd_limpo)
            except ValueError:
                qtd_float = 0

            imagem_url = buscar_imagem_produto(nome)

            produtos.append(
                {
                    "NomeProduto": nome,
                    "Unidade": qtd_float,
                    "PrecoVista": round(vu_float * 1.30, 2),
                    "PrecoRevista": round(vu_float * 2.20, 2),
                    "PrecoAdquirido": vu_float,
                    "PrecoEmFicha": round(vu_float * 1.80, 2),
                    "CodigoBarra": ean if ean else "Não encontrado",
                    "ImagemURL": imagem_url,
                    "MarcaDoProduto": nome.split()[0] if nome else "Não encontrado",
                }
            )

        if produtos:
            print("\nExtração concluída! Dados obtidos:\n", file=sys.stderr, flush=True)
            df = pd.DataFrame(produtos)
            print(df.to_string(index=False), file=sys.stderr, flush=True)

            print(json.dumps(produtos, ensure_ascii=False), flush=True)

            nome_arquivo = f"nfe_{chave_acesso}.xlsx"
            try:
                with pd.ExcelWriter(nome_arquivo, engine="openpyxl") as writer:
                    df.to_excel(writer, index=False, sheet_name="Produtos")

                    worksheet = writer.sheets["Produtos"]
                    for column in worksheet.columns:
                        max_length = 0
                        column_letter = column[0].column_letter

                        for cell in column:
                            try:
                                if len(str(cell.value)) > max_length:
                                    max_length = len(cell.value)
                            except Exception:
                                pass

                        adjusted_width = max_length + 2
                        worksheet.column_dimensions[column_letter].width = adjusted_width

                    print(f"\nDados formatados salvos no arquivo: {nome_arquivo}", file=sys.stderr, flush=True)

            except Exception as e:
                print(f"Erro ao salvar o arquivo Excel: {e}", file=sys.stderr, flush=True)
                print("Salvando em formato CSV como fallback...", file=sys.stderr, flush=True)
                try:
                    nome_csv = f"nfe_{chave_acesso}.csv"
                    df.to_csv(nome_csv, index=False, encoding="utf-8-sig")
                    print(f"Dados salvos no arquivo CSV: {nome_csv}", file=sys.stderr, flush=True)
                except Exception as e_csv:
                    print(f"Erro ao salvar CSV: {e_csv}", file=sys.stderr, flush=True)

        else:
            print(
                "Nenhum produto foi encontrado na NF-e ou houve falha na extração. Confira a chave de acesso.",
                file=sys.stderr,
                flush=True,
            )

    except TimeoutException:
        print(
            "Erro: Tempo limite excedido ao aguardar o carregamento da página ou de um elemento obrigatório.",
            file=sys.stderr,
            flush=True,
        )
        if driver:
            salvar_debug_captcha(driver, "erro_timeout")

    except NoSuchElementException as e:
        print(f"Erro: Um elemento obrigatório não foi encontrado no HTML. Detalhes: {e}", file=sys.stderr, flush=True)
    except WebDriverException as e:
        print(f"Erro no navegador: {e}", file=sys.stderr, flush=True)
    except Exception as e:
        print(f"Erro inesperado: {e}", file=sys.stderr, flush=True)
    finally:
        if driver and not cdp_address:
            try:
                driver.quit()
            except Exception:
                pass
        liberar_lock_perfil()


def parse_args():
    parser = argparse.ArgumentParser(description="Consulta NF-e no Portal da Fazenda Nacional.")
    parser.add_argument("chave_acesso", nargs="?", help="Chave de acesso da NF-e (44 dígitos)")
    parser.add_argument(
        "--semi-manual",
        action="store_true",
        help="Modo semi-manual: zero automação durante captcha; usuário confirma com ENTER quando NF-e carregar",
    )
    parser.add_argument(
        "--cdp",
        metavar="ADDRESS",
        help="Conectar ao Chrome já aberto (ex: 127.0.0.1:9222). "
        "Inicie com: chrome.exe --remote-debugging-port=9222 --user-data-dir=%USERPROFILE%\\.nfe_chrome_profile",
    )
    return parser.parse_args()


if __name__ == "__main__":
    args = parse_args()
    semi_manual = args.semi_manual or os.environ.get("NFE_SEMI_MANUAL", "").lower() in ("1", "true", "yes")
    chave = args.chave_acesso

    if not chave and len(sys.argv) > 1 and not sys.argv[1].startswith("-"):
        chave = sys.argv[1]

    if chave:
        consultar_nfe(chave, semi_manual=semi_manual, cdp_address=args.cdp)
    else:
        print("erro ao receber chave do front-end: nenhum argumento fornecido.", file=sys.stderr, flush=True)
