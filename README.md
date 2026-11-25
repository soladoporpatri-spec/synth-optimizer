# Synth Optimizer

Site oficial da **Synth Optimizer** — serviço remoto de otimização de PC Gamer e consoles com foco em desempenho, estabilidade, redução de travamentos e menor latência.

🌐 **Site no ar:** [https://synthoptimizer.com/](https://synthoptimizer.com/)

## Recursos

- **Multilíngue:** suporte a Português (`/`), Inglês EUA (`/en/`), Inglês Reino Unido (`/en-gb/`) e Espanhol (`/es/`), com detecção automática do idioma do navegador e seletor manual.
- **SEO técnico e on-page:** `sitemap.xml`, `robots.txt`, `llms.txt`, tags canônicas, `hreflang`, Open Graph, Twitter Cards e dados estruturados JSON-LD (`Organization`, `WebSite`, `Service`, `FAQPage`).
- **Performance:** imagens WebP otimizadas, carregamento sob demanda (`lazy loading`), scripts com `defer` e experiência visual responsiva.
- **Privacidade e LGPD:** controle de consentimento (`consent.js`) e páginas dedicadas de [Política de Privacidade](/privacidade/) e [Termos de Uso](/termos/).
- **Configuração de produção:** `.htaccess` pronto para LiteSpeed/Apache (HTTPS forçado, redirecionamento canônico, compressão, cache e cabeçalhos de segurança).

## Estrutura do projeto

```text
.
├── index.html          # Página principal (pt-BR)
├── en/                 # Versão em Inglês (en-US)
├── en-gb/              # Versão em Inglês (en-GB)
├── es/                 # Versão em Espanhol (es)
├── privacidade/        # Política de Privacidade
├── termos/             # Termos de Uso
├── imagens/            # Imagens, miniaturas WebP, ícones e Open Graph
├── style.css           # Estilos principais
├── sales.css           # Estilos comerciais e seções de conversão
├── script.js           # Interações, galeria, FAQ e animações
├── consent.js          # Banner de consentimento e eventos de analytics
├── legal.js            # Funcionalidades das páginas legais
├── 404.html            # Página de erro personalizada
├── .htaccess           # Regras de servidor (Hostinger / Apache / LiteSpeed)
├── robots.txt          # Diretivas para rastreadores
├── sitemap.xml         # Mapa do site
├── llms.txt            # Resumo estruturado para LLMs
└── site.webmanifest    # Manifesto PWA
```
