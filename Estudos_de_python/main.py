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
import random
import pandas as pd
import undetected_chromedriver as uc
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException, NoSuchElementException, WebDriverException
from bs4 import BeautifulSoup
from buscar_imagem import buscar_imagem_produto

def consultar_nfe(chave_acesso: str):
    """
    Realiza a consulta da NF-e no Portal da Fazenda.
    """
    # 1. Configuração e Acesso
    if len(chave_acesso) != 44:
        print("Erro: A chave de acesso deve ter exatamente 44 dígitos.", file=sys.stderr, flush=True)
        return

    url = "https://www.nfe.fazenda.gov.br/portal/consultaRecaptcha.aspx?tipoConsulta=resumo&tipoConteudo=7PhJ%20gAVw2g="
    
    is_windows = os.name == "nt"

    # Configurações do Chrome (compatível com Windows/Linux)
    # NOTA: NÃO adicionar --disable-blink-features ou --disable-infobars,
    # pois o undetected-chromedriver já aplica essas proteções internamente.
    # Adicioná-las manualmente serve como fingerprint detectável.
    options = uc.ChromeOptions()
    if not is_windows:
        options.add_argument("--no-sandbox")
        options.add_argument("--disable-dev-shm-usage")

    if is_windows:
        options.binary_location = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
    else:
        # Define um User-Agent fixo e estável para Linux
        options.add_argument("user-agent=Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36")
    
    # Perfil PERSISTENTE: acumula trust score do hCaptcha/Cloudflare entre execuções.
    # Perfis temporários (UUID) tinham trust score ZERO a cada execução,
    # causando desafios de alta complexidade ("reflexo de luz") a cada vez.
    PROFILE_DIR = os.path.join(os.path.expanduser("~"), ".nfe_chrome_profile")
    os.makedirs(PROFILE_DIR, exist_ok=True)
    options.add_argument(f"--user-data-dir={PROFILE_DIR}")
    # Nota: Sem modo --headless, pois o captcha precisará ser resolvido manualmente.
    
    driver = None
    try:
        print("Iniciando o navegador com perfil persistente...", file=sys.stderr, flush=True)
        # Chrome iniciado via undetected_chromedriver (Windows/Linux)
        driver = uc.Chrome(options=options, version_main=148)  # Auto-detect version
        
        # NÃO deletar cookies! Preservar sessão Cloudflare (cf_clearance, __cf_bm).
        # Deletar cookies antes da navegação destruía o trust score acumulado
        # e fazia o Cloudflare marcar a sessão como não-confiável.
        driver.get(url)
        
        # Localiza o input pelo ID fornecido e insere a chave de acesso
        wait = WebDriverWait(driver, 40)
        input_chave = wait.until(EC.presence_of_element_located(
            (By.ID, "ctl00_ContentPlaceHolder1_txtChaveAcessoResumo")
        ))
        
        # Digitação humanizada: simula velocidade de digitação humana (~50-150ms por tecla).
        # send_keys() direto injeta 44 chars instantaneamente, o que é detectável.
        for char in chave_acesso:
            input_chave.send_keys(char)
            time.sleep(random.uniform(0.05, 0.15))
        
        # 2. Fluxo de Captcha (monitoramento passivo via JS)
        # Usa execute_script ao invés de page_source para evitar chamadas CDP
        # que são detectáveis por sistemas anti-bot.
        print("Resolva o hCaptcha e clique em 'Continuar'. O script detectará automaticamente.", file=sys.stderr, flush=True)
        
        captcha_resolvido = False
        tempo_maximo_espera = 600  # Tempo máximo: 10 minutos (600 segundos) para captchas difíceis
        inicio = time.time()
        ultima_msg_erro = 0  # Controle para não repetir msg de erro a cada polling
        
        # Loop de verificação (polling) a cada 3 segundos via JS
        while time.time() - inicio < tempo_maximo_espera:
            try:
                # Verifica via JS se a URL mudou (não gera fingerprint CDP como page_source)
                url_atual = driver.execute_script("return window.location.href;")
                
                # Detecta navegação para a página de resultado (saiu do captcha)
                if "consultarecaptcha" not in url_atual.lower():
                    # Confirma que os dados da NF-e realmente carregaram
                    tem_dados = driver.execute_script("""
                        return !!(
                            document.querySelector("[class*='fixo-prod-serv-descricao']") ||
                            document.getElementById('NFe') ||
                            document.querySelector('.box')
                        );
                    """)
                    if tem_dados:
                        captcha_resolvido = True
                        break
                
                # Detecta erro de validação do captcha (sem refresh agressivo!)
                # NÃO deletar cookies nem fazer refresh — isso invalidaria o token.
                erro_captcha = driver.execute_script("""
                    var el = document.body ? document.body.innerText : '';
                    return el.indexOf('Falha na valida') !== -1;
                """)
                if erro_captcha and (time.time() - ultima_msg_erro > 10):
                    print("⚠ Falha na validação detectada. Resolva o hCaptcha novamente e clique em 'Continuar'.", file=sys.stderr, flush=True)
                    ultima_msg_erro = time.time()
                    
            except WebDriverException:
                pass
                
            time.sleep(3)  # Intervalo mais longo (3s) para reduzir ruído CDP
            
        if not captcha_resolvido:
            print("Tempo limite de 10 minutos excedido. O captcha não foi resolvido.", file=sys.stderr, flush=True)
            return
            
        # 3. Estabilização e Navegação
        print("Acesso detectado! Aguardando estabilização dos scripts da Sefaz...", file=sys.stderr, flush=True)
        # Delay obrigatório de 10s para que o Portal da Fazenda carregue tudo e não falhe na chamada de js
        time.sleep(10)
        
        print("Mudando para a aba 'Produtos e Serviços'...", file=sys.stderr, flush=True)
        
        # Clique Inteligente: tenta clicar via elemento, se falhar ou estiver oculto, usa execute_script
        try:
            aba_produtos = driver.find_element(By.CSS_SELECTOR, "a[onclick*='mostraAba(3)']")
            # scroll para a aba caso não esteja na tela, antes de clicar
            driver.execute_script("arguments[0].scrollIntoView(true);", aba_produtos)
            aba_produtos.click()
        except Exception:
            # Fallback seguro
            driver.execute_script("mostraAba(3);")
        
        # Aguarda 10 segundos pelo carregamento. Se não carregar, executa novamente como fallback
        try:
            wait = WebDriverWait(driver, 10)
            wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "[class*='fixo-prod-serv-descricao']")))
        except TimeoutException:
            print("A aba parece não ter carregado na primeira tentativa. Forçando mostraAba(3) novamente...", file=sys.stderr, flush=True)
            driver.execute_script("mostraAba(3);")
            # Tenta aguardar mais uma vez, caso de timeout aqui ele vai cair no except TimeoutException geral
            WebDriverWait(driver, 15).until(
                EC.presence_of_element_located((By.CSS_SELECTOR, "[class*='fixo-prod-serv-descricao']"))
            )
            
        print("Aba de produtos carregada. Iniciando extração dos dados...", file=sys.stderr, flush=True)
        
        # 3.5 Comando de Expansão em Massa
        print("Expandindo detalhes dos produtos...", file=sys.stderr, flush=True)
        try:
            driver.execute_script("document.querySelectorAll('.toggle').forEach(el => el.click());")
            time.sleep(3) # Aguarda renderização das tabelas
            
            # Salva o log HTML após a expansão para depuração
            with open("debug_page.html", "w", encoding="utf-8") as f:
                f.write(driver.page_source)
            print("Página com detalhes expandidos salva em 'debug_page.html'.", file=sys.stderr, flush=True)
        except Exception as e:
            print(f"Aviso: Houve uma falha ao tentar expandir tabelas: {e}", file=sys.stderr, flush=True)
            
        # 4. Extração de Dados Flexível com BeautifulSoup
        soup = BeautifulSoup(driver.page_source, 'html.parser')
        produtos = []
        
        # Encontra todas as descrições usando classes parciais
        descricoes_elementos = soup.find_all(class_=lambda x: x and 'fixo-prod-serv-descricao' in x)
        
        for desc in descricoes_elementos:
            # Pega o contêiner do produto (para que qtd/vu/ean sejam relativos ao próprio produto)
            container = desc.find_parent(['tr', 'table', 'fieldset', 'div'])
            
            if not container:
                continue
                
            nome = desc.get_text(strip=True)
            if not nome:
                continue

            if nome.lower() == "descrição":
                continue
                
            # Extrai Quantidade
            qtd_elem = container.find(class_=lambda x: x and 'fixo-prod-serv-qtd' in x)
            qtd = qtd_elem.get_text(strip=True) if qtd_elem else ""
            
            # Extrai Valor Unitário
            # --- Busca pelo Valor Unitário de Comercialização ---
            # --- Extração Precisa do Valor Unitário (Tabela Interna) ---
            # 1. Dentro do seu loop de produtos, localize a tabela de detalhes
            # No HTML da Sefaz, cada produto fica em uma <table class="toggle box">
            # e seus detalhes em uma tabela IRMÃ: <table class="toggable box">
            
            tabela_pai = container.find_parent('table')
            tabela_detalhes = None
            
            if tabela_pai:
                tabela_detalhes = tabela_pai.find_next_sibling('table', class_=re.compile(r'toggable|box', re.IGNORECASE))

            if tabela_detalhes:
                # 2. Localizamos diretamente a label do Valor Unitário
                label_vu = tabela_detalhes.find('label', string=re.compile(r'Valor unitário de comercialização', re.IGNORECASE))
                
                if label_vu:
                    # 3. O valor real está na tag <span> logo em seguida, na mesma célula
                    span_vu = label_vu.find_next_sibling('span')
                    if span_vu:
                        vu = span_vu.get_text(strip=True)
                    else:
                        # Fallback: pega no parent (td)
                        vu = re.sub(r'(?i)Valor unitário de comercialização', '', label_vu.parent.get_text(strip=True)).strip(":- ")
                else:
                    vu = "Não encontrado"
            else:
                vu = "Tabela de detalhes não encontrada"
                
            # 3.5 Fallback Técnico (vUnCom)
            if vu in ["Não encontrado", "Tabela de detalhes não encontrada", ""]:
                v_unit = container.find(attrs={"id": re.compile(r'vUnCom', re.IGNORECASE)}) or container.find(attrs={"class": re.compile(r'vUnCom', re.IGNORECASE)})
                if v_unit:
                    vu = v_unit.get_text(strip=True)
                    
            # 4. Logs de Depuração
            if vu in ["Não encontrado", "Tabela de detalhes não encontrada", ""]:
                print(f"DEBUG: Tabela de detalhes encontrada para o produto? {bool(tabela_detalhes)}", file=sys.stderr, flush=True)
            
            # Extrai Código EAN (Busca na tabela de detalhes)
            ean = "Não encontrado"
            
            if tabela_detalhes:
                # 1. Localizamos a label do EAN
                label_ean = tabela_detalhes.find('label', string=re.compile(r'Código EAN Tributável|Código EAN Comercial|EAN|GTIN', re.IGNORECASE))
                
                if label_ean:
                    # 2. O valor real está na tag <span> logo em seguida, na mesma célula
                    span_ean = label_ean.find_next_sibling('span')
                    if span_ean:
                        ean = span_ean.get_text(strip=True)
                    else:
                        # Fallback: pega no parent (td) e limpa o nome da label
                        ean = re.sub(r'(?i)Código EAN Tributável|Código EAN Comercial|Código EAN|EAN|GTIN', '', label_ean.parent.get_text(strip=True)).strip(":- \n")
            
            # 3. Fallback Técnico para EAN (cEANTrib ou cEAN no XML)
            if ean in ["", "Não encontrado"]:
                base_busca = tabela_detalhes if tabela_detalhes else container
                v_ean = base_busca.find(attrs={"id": re.compile(r'cEANTrib|cEAN', re.IGNORECASE)}) or base_busca.find(attrs={"class": re.compile(r'cEANTrib|cEAN', re.IGNORECASE)})
                if v_ean:
                    ean = v_ean.get_text(strip=True)

            try:
                vu_limpo = vu.replace('R$', '').replace('.', '').replace(',', '.').strip()
                vu_float = float(vu_limpo)  
            except ValueError:
                vu_float = 0.0
            
            try:
                qtd_limpo = float(qtd.replace(',', '.').strip())
                qtd_float = int(qtd_limpo)
            except ValueError:
                qtd_float = 0

            # Busca imagem do produto via Google Custom Search API
            imagem_url = buscar_imagem_produto(nome)

            produtos.append({
                "NomeProduto": nome,
                "Unidade": qtd_float,
                "PrecoVista": round(vu_float * 1.30, 2),
                "PrecoRevista": round(vu_float * 2.20, 2),
                "PrecoAdquirido": vu_float,
                "PrecoEmFicha": round(vu_float * 1.80, 2),
                "CodigoBarra": ean if ean else "Não encontrado",
                "ImagemURL": imagem_url,
                "MarcaDoProduto": nome.split()[0] if nome else "Não encontrado"
            })
            
        # 5. Saída
        if produtos:
            print("\nExtração concluída! Dados obtidos:\n", file=sys.stderr, flush=True)
            df = pd.DataFrame(produtos)
            print(df.to_string(index=False), file=sys.stderr, flush=True)
            
            # Saída JSON limpa no stdout (único dado que o C# vai ler)
            print(json.dumps(produtos, ensure_ascii=False), flush=True)
            
            # 5.1. Formatação do Arquivo Excel
            nome_arquivo = f"nfe_{chave_acesso_vindo_frontend}.xlsx"
            try:
                with pd.ExcelWriter(nome_arquivo, engine='openpyxl') as writer:
                    df.to_excel(writer, index=False, sheet_name='Produtos')
                    
                    # Ajuste automático de largura das colunas
                    worksheet = writer.sheets['Produtos']
                    for column in worksheet.columns:
                        max_length = 0
                        column_letter = column[0].column_letter
                        
                        for cell in column:
                            try:
                                if len(str(cell.value)) > max_length:
                                    max_length = len(cell.value)
                            except:
                                pass
                        
                        adjusted_width = (max_length + 2)
                        worksheet.column_dimensions[column_letter].width = adjusted_width
                        
                    print(f"\nDados formatados salvos no arquivo: {nome_arquivo}", file=sys.stderr, flush=True)
                    
            except Exception as e:
                print(f"Erro ao salvar o arquivo Excel: {e}", file=sys.stderr, flush=True)
                print("Salvando em formato CSV como fallback...", file=sys.stderr, flush=True)
                try:
                    nome_csv = f"nfe_{chave_acesso_vindo_frontend}.csv"
                    df.to_csv(nome_csv, index=False, encoding='utf-8-sig')
                    print(f"Dados salvos no arquivo CSV: {nome_csv}", file=sys.stderr, flush=True)
                except Exception as e_csv:
                    print(f"Erro ao salvar CSV: {e_csv}", file=sys.stderr, flush=True)

        else:
            print("Nenhum produto foi encontrado na NF-e ou houve falha na extração. Confira a chave de acesso.", file=sys.stderr, flush=True)

    # 6. Tratamento de Erro Reforçado
    except TimeoutException:
        print("Erro: Tempo limite excedido ao aguardar o carregamento da página ou de um elemento obrigatório.", file=sys.stderr, flush=True)
        if driver:
            try:
                driver.save_screenshot("erro_timeout.png")
                print("Screenshot salva como 'erro_timeout.png' na mesma pasta para debug.", file=sys.stderr, flush=True)
            except Exception as ss_erro:
                print(f"Não foi possível salvar a screenshot: {ss_erro}", file=sys.stderr, flush=True)
                
    except NoSuchElementException as e:
        print(f"Erro: Um elemento obrigatório não foi encontrado no HTML. Detalhes: {e}", file=sys.stderr, flush=True)
    except WebDriverException as e:
        print(f"Erro no navegador: {e}", file=sys.stderr, flush=True)
    except Exception as e:
        print(f"Erro inesperado: {e}", file=sys.stderr, flush=True)
    finally:
        if driver:
            try:
                driver.quit()
            except Exception:
                pass

if __name__ == "__main__":
    # Chave teste a'tualizada conforme seu último commit
    if len(sys.argv) > 1:
        chave_acesso_vindo_frontend = sys.argv[1]
        consultar_nfe(chave_acesso_vindo_frontend)
    else:
        print("erro ao receber chave do front-end: nenhum argumento fornecido.", file=sys.stderr, flush=True)
