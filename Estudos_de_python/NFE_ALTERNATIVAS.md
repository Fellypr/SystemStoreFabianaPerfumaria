# Alternativas estruturais à consulta por captcha (NF-e)

O portal da Sefaz (`consultaRecaptcha.aspx`) usa hCaptcha de propósito para desincentivar scraping automatizado. Mesmo com correções no script Python, falhas intermitentes podem persistir quando a sessão é classificada como automatizada.

Para uso operacional diário, estas alternativas **eliminam o captcha** do fluxo.

---

## 1. XML da NF-e fornecido pelo emitente (recomendado para entrada de mercadoria)

### O que é

Todo emitente de NF-e é **obrigado** a disponibilizar o arquivo XML da nota ao destinatário (art. 6º da Lei 12.741/2012 e normas do Convênio ICMS 115/03).

### Vantagens

- Sem captcha, sem navegador, sem dependência do portal público
- Dados completos e estruturados (produtos, EAN, valores, impostos)
- Parsing direto com bibliotecas XML (Python `xml.etree`, C# `System.Xml`)

### Como integrar

1. Solicitar ao fornecedor o XML por e-mail, portal do fornecedor ou EDI
2. Criar endpoint/serviço que leia o XML e extraia itens (`<det>`, `xProd`, `cEAN`, `vUnCom`, `qCom`)
3. Mapear para o mesmo DTO usado hoje (`AdicionarProdutoViaCodDto`)

### Esforço estimado

Baixo a médio — um parser XML substitui todo o fluxo Selenium para notas recebidas.

---

## 2. Download via certificado digital (fluxo autorizado)

### O que é

Com **certificado A1 ou A3** (e-CNPJ ou e-CPF) do destinatário, é possível consultar e baixar NF-e pelos serviços oficiais:

| Serviço | Uso |
|---------|-----|
| **Portal Nacional** (área logada com certificado) | Consulta e download de XML/PDF sem captcha público |
| **Distribuição DF-e (NFeDistribuicaoDFe)** | Web service que entrega XML de NF-e **destinadas** ao CNPJ |
| **Manifestação do Destinatário (MD-e)** | Ciência/confirmação + acesso ao XML após manifestação |

### Vantagens

- Fluxo previsto e suportado pela Sefaz
- Adequado para automação em backend (sem Chrome/Selenium)
- Escala para múltiplas notas por dia

### Requisitos

- Certificado digital válido do CNPJ da loja
- Biblioteca de assinatura/consulta (ex.: `ACBr`, `Zeus NFe`, ou implementação SOAP em C#)
- Ambiente de homologação para testes antes de produção

### Esforço estimado

Médio a alto — integração SOAP + gestão de certificado, mas é a solução mais robusta para produção.

---

## 3. Comparação rápida

| Critério | Scraping + hCaptcha | XML do fornecedor | Certificado + DF-e |
|----------|---------------------|-------------------|---------------------|
| Captcha | Sim, manual | Não | Não |
| Automação backend | Frágil | Excelente | Excelente |
| Cobertura | Qualquer chave pública | Só notas do fornecedor | NF-e destinadas ao CNPJ |
| Conformidade legal | Zona cinzenta (ToS) | Total | Total |
| Manutenção | Alta (portal muda) | Baixa | Média |

---

## Recomendação para este projeto

1. **Curto prazo:** manter o script `main.py` com modo semi-manual (`--semi-manual`) ou CDP (`--cdp 127.0.0.1:9222`) para consultas pontuais
2. **Médio prazo:** implementar importação de XML enviado pelo fornecedor na tela de cadastro de produtos
3. **Longo prazo:** integrar **NFeDistribuicaoDFe** no backend C# para buscar automaticamente NF-e destinadas ao CNPJ da Fabiana Perfumaria

---

## Referências

- [Portal NF-e — Consulta pública](https://www.nfe.fazenda.gov.br/portal/consultaRecaptcha.aspx)
- [Manual de Orientação do Contribuinte — DF-e](https://www.nfe.fazenda.gov.br/portal/principal.aspx)
- Convênio ICMS 115/03 — obrigatoriedade de XML ao destinatário
