# Marmorizart · landing page

Site estático de página única. Sem build, sem dependência externa além das fontes do Google.
Para publicar, suba o conteúdo da pasta `site/` na raiz do domínio `marmorizart.com.br`.

```
site/
├── index.html
├── llms.txt          arquivo de contexto para IAs (GEO/AEO)
├── robots.txt        libera os rastreadores de IA e aponta o sitemap
├── sitemap.xml
└── assets/
    ├── css/style.css
    ├── js/app.js
    └── img/          imagens já otimizadas (jpg + webp), logo e ícones
```

## Captura de leads na planilha do Google

Todo botão de orçamento abre um formulário curto (nome, WhatsApp, peça). Ao enviar, o lead é gravado
numa planilha do Google e só então o WhatsApp abre com a mensagem pronta. O formulário completo da
última dobra e o pop-up de medição gravam na mesma planilha.

**Para ligar**: siga o passo a passo no início de `../integracao/planilha-apps-script.gs` (criar a
planilha, colar o script, publicar como App da Web) e cole a URL gerada na constante `PLANILHA`, no
começo de `assets/js/app.js`.

Enquanto `PLANILHA` estiver vazia o site funciona normalmente: o cliente é levado ao WhatsApp, só não
fica registro na planilha. O envio usa `sendBeacon`, que entrega em segundo plano, então nem uma
planilha fora do ar nem uma internet lenta seguram o cliente na tela.

## O que precisa ser trocado antes de publicar

1. **Nome de quem avaliou.** As seis avaliações do array `AVALIACOES` (topo de `assets/js/app.js`) são
   reais, transcritas das capturas do Google Meu Negócio. Como os prints começavam nas estrelas, o nome
   de quem avaliou não veio junto, e a assinatura ficou como "Avaliação no Google" mais a data. Se quiser
   os nomes, é só pegá-los no perfil e trocar o campo `autor` de cada item.
   Duas correções de digitação foram feitas na transcrição: "concerteza" virou "com certeza" e uma
   avaliação escrita toda em maiúsculas foi passada para caixa normal. O conteúdo não mudou.
2. **Autoria das fotos.** A galeria está intitulada "obras executadas e projetos de referência" porque
   algumas imagens enviadas são claramente referência (a cozinha branca veio de um print do Facebook,
   o render 3D é projeto). Assim que o Rafael mandar as 8 a 12 obras próprias prometidas no briefing,
   dá para separar as duas coisas e afirmar autoria em cada legenda.
3. **Prazo de garantia.** O briefing diz que ele precisa confirmar o prazo. O texto atual afirma apenas o
   que está confirmado: peça com defeito de fabricação é refeita e a empresa tem até 30 dias para resolver.
4. **Coordenadas do mapa.** O `LocalBusiness` no JSON-LD está sem `geo` (latitude/longitude) para não
   inventar valor. Pegue as coordenadas exatas no Google Meu Negócio e acrescente:
   `"geo": {"@type":"GeoCoordinates","latitude":"-19.xxxx","longitude":"-44.xxxx"}`
5. **Perfil do Google.** O link "Ver no Google" aponta para uma busca. Troque pela URL curta do perfil
   (`g.page/...` ou o link de avaliações) quando tiver o acesso em mãos.

## Identidade visual

Preto tinta (`#0C0C0D`), areia (`#EFEAE1`) e latão champanhe (`#C3A46B`), definidos nas variáveis do topo
de `assets/css/style.css`. Trocar a cor de acento em todo o site é mudar `--ouro` ali.

A logo aparece **monocromática** no site: `logo-marmorizart-claro.png` no fundo escuro e
`logo-marmorizart-escuro.png` no fundo claro. A logo original com o "ART" vermelho continua em
`logo-marmorizart.png`, usada no dado estruturado e disponível para material impresso.

## Amostras de material (dobra 02)

As cinco texturas (`material-*.jpg` / `.webp`) mostram a pedra de perto:

- **Mármore, quartzito, quartzo/Silestone e travertino** vieram do site atual da Marmorizart
  (`marmorizart.com.br/wp-content/uploads/2026/01/`), ampliadas de 200 px para 720 px.
- **Granito** foi recortado da foto real da escada em Branco Itaúnas que o Rafael enviou, e não da
  imagem do site antigo, que era só um fundo escuro sem textura aproveitável.

Não inventei amostra de pedra com nome próprio: o seletor é por família de material (granito, mármore,
quartzito, quartzo, travertino). Se ele mandar foto de chapa de cada pedra, dá para desdobrar em itens
individuais com amostra real.

Dekton, que aparece no site atual, foi retirado: não está entre os materiais confirmados no briefing.

## Avaliações (dobra 05)

Mostra uma avaliação por vez, com troca a cada 7 segundos: o texto entra em transparência subindo alguns
pixels e o traço ativo, embaixo, se preenche em latão até a próxima entrar. Para quando o mouse encosta e
só gira quando a seção está na tela. Dá para clicar em qualquer traço para ir direto a uma avaliação.
É o mesmo movimento do seletor de materiais, para as duas seções rotativas falarem a mesma língua.

Para trocar o ritmo, mude os 7000 do `setInterval` em `app.js` e os `7s` da animação `corre` no CSS.

## Decisões de conteúdo

- O site **não** repete o erro do site antigo. Em vez de "mais de 20 anos de mercado", ele diz o que é
  verdade: empresa aberta em agosto de 2019, com equipe que tem mais de 20 anos de ofício. Isso aparece
  no título da seção "A Marmorizart", sem citar o site anterior.
- **Nenhum valor aparece no site.** O orçamento é sempre feito pelo WhatsApp, por decisão do cliente.
  A dobra de preços foi removida e as dobras foram renumeradas de 01 a 10. O que sobrou no lugar é o
  bloco "O que entra e o que não entra", dentro de "Como funciona", que mantém a clareza sobre
  instalação e transporte sem citar cifra.
- **"Esse valor já inclui a instalação?"** é a pergunta que ele mais se cansa de responder. A resposta
  segue em três lugares: no bloco "O que entra e o que não entra", em "O que não fazemos" e no FAQ.
- Continuam no site, por não serem preço: condições de pagamento (pix, dinheiro, cartão em até 10x),
  entrada de 50% e os 10% de desconto no pagamento à vista. Se ele quiser tirar o percentual de
  desconto também, ele está no FAQ e no `llms.txt`.
- A seção **"O que a Marmorizart não faz"** existe para filtrar lead ruim (urgência para o mesmo dia,
  porcelanato, frete, orçamento por telefone). Ela reduz volume de conversa improdutiva.
- O formulário e o pop-up **não gravam nada**: montam a mensagem e abrem o WhatsApp já preenchido, no
  formato que ele pede (comprimento x largura, testeira e rodopia).

## SEO, GEO e AEO

- Título, meta description, H1 e headings orientados a "marmoraria em Betim" e às buscas de cauda longa
  do setor (preço de bancada de granito, lavatório em mármore, soleira e peitoril).
- Dados estruturados JSON-LD: `LocalBusiness` + `HomeAndConstructionBusiness` (com horários, área de
  atendimento e catálogo de serviços, sem preço), `WebSite`, `WebPage` com `speakable`, e
  `FAQPage` com as 12 perguntas.
- Bloco de resumo logo abaixo do hero: frase curta e factual, feita para ser citada por IA.
- `llms.txt` com a ficha completa da empresa e `robots.txt` liberando GPTBot, ClaudeBot, PerplexityBot,
  OAI-SearchBot e Google-Extended.

## Manutenção rápida

- **Voltar a mostrar preço um dia:** o caminho é criar de novo a seção antes de "Como funciona",
  acrescentar `makesOffer` e `priceRange` ao JSON-LD e atualizar `llms.txt` e as respostas do FAQ.
  Hoje não existe nenhum valor em nenhum dos arquivos.
- **Trocar foto:** coloque o arquivo em `assets/img/` nos dois formatos (jpg e webp) e troque o caminho.
  As imagens já foram recortadas para remover interface de Instagram, Facebook e marca d'água de data.
- **Número de WhatsApp:** constante `WHATSAPP` no topo de `assets/js/app.js`, mais os links diretos no
  HTML (botão flutuante e bloco de contato).
