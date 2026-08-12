/* =========================================================================
   Marmorizart · comportamento da landing page
   ========================================================================= */
(function () {
  'use strict';

  var WHATSAPP = '553137872707';

  /* ---------------------------------------------------------------------
     PLANILHA DO GOOGLE
     Cole aqui a URL do App da Web gerada pelo Apps Script (termina em /exec).
     O passo a passo está em integracao/planilha-apps-script.gs.
     Enquanto estiver vazio, o site funciona normalmente: o lead segue para
     o WhatsApp, só não fica registrado na planilha.
     --------------------------------------------------------------------- */
  var PLANILHA = '';

  var $  = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  function whats(texto) {
    return 'https://wa.me/' + WHATSAPP + '?text=' + encodeURIComponent(texto);
  }
  function abrirWhats(texto) {
    var url = whats(texto);
    var aba = window.open(url, '_blank');
    if (!aba) window.location.href = url;   // se o navegador bloquear a nova aba
  }

  /* grava o lead na planilha sem travar o redirecionamento:
     sendBeacon entrega em segundo plano, mesmo com a página saindo do ar */
  function registrarLead(dados) {
    if (!PLANILHA) return;
    dados.origem = document.title;
    dados.pagina = location.href;
    try {
      var corpo = new URLSearchParams(dados);
      if (navigator.sendBeacon && navigator.sendBeacon(PLANILHA, corpo)) return;
      fetch(PLANILHA, { method: 'POST', mode: 'no-cors', keepalive: true, body: corpo });
    } catch (err) { /* nunca impedir o cliente de chegar ao WhatsApp */ }
  }

  /* telefone: (31) 99999-9999 */
  function mascaraFone(v) {
    var d = (v || '').replace(/\D/g, '').slice(0, 11);
    if (d.length > 6) return '(' + d.slice(0, 2) + ') ' + d.slice(2, d.length === 11 ? 7 : 6) + '-' + d.slice(d.length === 11 ? 7 : 6);
    if (d.length > 2) return '(' + d.slice(0, 2) + ') ' + d.slice(2);
    if (d.length) return '(' + d;
    return '';
  }
  function foneValido(v) {
    return (v || '').replace(/\D/g, '').length >= 10;
  }
  $$('input[type="tel"]').forEach(function (campo) {
    campo.addEventListener('input', function () { campo.value = mascaraFone(campo.value); });
  });

  /* ---------------------------------------------------------------------
     AVALIAÇÕES DO GOOGLE
     Textos reais do perfil no Google Meu Negócio, transcritos das capturas
     enviadas pelo cliente. Os prints não traziam o nome de quem avaliou,
     por isso a assinatura usa a data da avaliação.
     Para acrescentar outra, basta copiar uma linha deste bloco.
     --------------------------------------------------------------------- */
  var AVALIACOES = [
    { nota: 5, texto: 'Serviço na minha cozinha ficou impecável, amamos!',
      autor: 'Avaliação no Google', local: 'há um mês' },
    { nota: 5, texto: 'Gostei do trabalho e agilidade do serviço. Mesmo sendo leiga no assunto, consegui resolver tudo pelo WhatsApp. Tendo mais serviços, com certeza vou lá.',
      autor: 'Avaliação no Google', local: 'há um mês' },
    { nota: 5, texto: 'São profissionais em criar sua arte em granitos. Excelente preço, qualidade e atendimento. Entrega no dia marcado.',
      autor: 'Avaliação no Google', local: 'há 5 anos' },
    { nota: 5, texto: 'Fizeram um excelente trabalho na pia do meu banheiro. Recomendo, bom atendimento, prazo e qualidade do serviço.',
      autor: 'Avaliação no Google', local: 'há 3 anos' },
    { nota: 5, texto: 'Nossa, amei o atendimento. Super educados e cumprem o prometido, sem contar que o trabalho é excelente. Estão de parabéns pelo serviço.',
      autor: 'Avaliação no Google', local: 'há 5 anos' },
    { nota: 5, texto: 'Atendimento excelente, rapidez na entrega.',
      autor: 'Avaliação no Google', local: 'há 6 anos' }
  ];

  /* ---------- preloader ---------- */
  var pre = $('#preloader');
  if (pre) {
    if (sessionStorage.getItem('mz_visto')) {
      pre.classList.add('is-off');
    } else {
      window.addEventListener('load', function () {
        setTimeout(function () {
          pre.classList.add('is-off');
          sessionStorage.setItem('mz_visto', '1');
        }, 700);
      });
      setTimeout(function () { pre.classList.add('is-off'); }, 3000);
    }
  }


  /* ---------- header e menu ---------- */
  var head = $('#head'), nav = $('#nav'), burger = $('#burger');
  window.addEventListener('scroll', function () {
    head.classList.toggle('is-solid', window.scrollY > 40);
  }, { passive: true });

  if (burger) {
    burger.addEventListener('click', function () {
      var open = nav.classList.toggle('is-open');
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
      burger.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
    });
    $$('#nav a').forEach(function (a) {
      a.addEventListener('click', function () {
        nav.classList.remove('is-open');
        burger.setAttribute('aria-expanded', 'false');
      });
    });
  }


  /* ---------- cards que viram ----------
     um clique ou toque alterna a face, em qualquer aparelho.
     só um card fica virado por vez */
  (function cards() {
    var lista = $$('.card');

    lista.forEach(function (card) {
      card.addEventListener('click', function (e) {
        if (e.target.closest('a')) return;          // o botão do verso segue seu caminho
        var virado = card.classList.contains('is-flip');
        lista.forEach(function (c) { c.classList.remove('is-flip'); });
        card.classList.toggle('is-flip', !virado);
      });
      card.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); card.classList.toggle('is-flip'); }
      });
    });
  })();

  /* ---------- depoimentos: um por vez, com avanço automático ---------- */
  (function depoimentos() {
    var bloco = $('#depo'), palco = $('#depoPalco'), dots = $('#depoDots');
    if (!bloco || !palco) return;
    var atual = 0, relogio;
    var animar = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    AVALIACOES.forEach(function (r, i) {
      var estrelas = '';
      for (var k = 0; k < 5; k++) estrelas += k < r.nota ? '★' : '☆';

      var item = document.createElement('blockquote');
      item.className = 'depo__item' + (i === 0 ? ' is-on' : '');
      item.id = 'depo-' + i;
      if (i) item.hidden = true;
      item.innerHTML =
        '<div class="depo__stars" aria-label="' + r.nota + ' de 5 estrelas">' + estrelas + '</div>' +
        '<p>' + r.texto + '</p>' +
        '<footer class="depo__quem"><strong>' + r.autor + '</strong><span>' + r.local + '</span></footer>';
      palco.appendChild(item);

      var b = document.createElement('button');
      b.setAttribute('role', 'tab');
      b.setAttribute('aria-controls', 'depo-' + i);
      b.setAttribute('aria-selected', i === 0 ? 'true' : 'false');
      b.setAttribute('aria-label', 'Avaliação ' + (i + 1));
      b.addEventListener('click', function () { mostrar(i); rodar(); });
      dots.appendChild(b);
    });

    var itens = $$('.depo__item', palco);
    var botoes = $$('button', dots);

    function mostrar(i) {
      atual = (i + itens.length) % itens.length;
      itens.forEach(function (it, k) {
        if (k === atual) {
          it.hidden = false;
          void it.offsetWidth;
          it.classList.add('is-on');
        } else {
          it.classList.remove('is-on');
          setTimeout(function () { if (!it.classList.contains('is-on')) it.hidden = true; }, 560);
        }
      });
      botoes.forEach(function (b, k) { b.setAttribute('aria-selected', k === atual ? 'true' : 'false'); });
      var ativo = botoes[atual];
      if (ativo) { ativo.style.animation = 'none'; void ativo.offsetWidth; ativo.style.animation = ''; }
    }

    function rodar() {
      if (!animar) return;
      clearInterval(relogio);
      relogio = setInterval(function () { mostrar(atual + 1); }, 7000);
    }

    bloco.addEventListener('mouseenter', function () { bloco.classList.add('is-parado'); clearInterval(relogio); });
    bloco.addEventListener('mouseleave', function () { bloco.classList.remove('is-parado'); rodar(); });

    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (e) {
        if (e[0].isIntersecting) { rodar(); } else { clearInterval(relogio); }
      }, { threshold: .3 });
      io.observe(bloco);
    } else { rodar(); }
  })();

  /* ---------- materiais: troca de painel com avanço automático ---------- */
  (function materiais() {
    var bloco = $('#mats');
    if (!bloco) return;
    var abas = $$('.mats__nav button', bloco);
    var paineis = $$('.matp', bloco);
    var atual = 0, relogio;
    var animar = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function mostrar(i) {
      atual = (i + paineis.length) % paineis.length;
      abas.forEach(function (b, k) {
        b.setAttribute('aria-selected', k === atual ? 'true' : 'false');
        b.tabIndex = k === atual ? 0 : -1;
      });
      paineis.forEach(function (p, k) {
        if (k === atual) {
          p.hidden = false;
          void p.offsetWidth;                 // aplica o estado inicial sem depender de requestAnimationFrame
          p.classList.add('is-on');
        } else {
          p.classList.remove('is-on');
          setTimeout(function () { if (!p.classList.contains('is-on')) p.hidden = true; }, 500);
        }
      });
      // reinicia a barra do item ativo
      var barra = abas[atual].querySelector('.mats__barra');
      if (barra) { barra.style.animation = 'none'; void barra.offsetWidth; barra.style.animation = ''; }
    }

    function rodar() {
      if (!animar) return;
      clearInterval(relogio);
      relogio = setInterval(function () { mostrar(atual + 1); }, 6000);
    }

    abas.forEach(function (b, k) {
      b.addEventListener('click', function () { mostrar(k); rodar(); });
      b.addEventListener('mouseenter', function () { if (animar) { mostrar(k); rodar(); } });
      b.addEventListener('keydown', function (e) {
        var d = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1
              : e.key === 'ArrowLeft'  || e.key === 'ArrowUp'   ? -1 : 0;
        if (!d) return;
        e.preventDefault();
        mostrar(atual + d);
        abas[atual].focus();
        rodar();
      });
    });

    bloco.addEventListener('mouseenter', function () { bloco.classList.add('is-parado'); clearInterval(relogio); });
    bloco.addEventListener('mouseleave', function () { bloco.classList.remove('is-parado'); rodar(); });

    // só começa a girar quando a seção aparece na tela
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (e) {
        if (e[0].isIntersecting) { rodar(); } else { clearInterval(relogio); }
      }, { threshold: .25 });
      io.observe(bloco);
    } else { rodar(); }
  })();

  /* ---------- formulário curto de orçamento ----------
     todo botão de orçamento abre este formulário: o lead é registrado na
     planilha e só então segue para o WhatsApp com a mensagem pronta.
     O href continua apontando para o WhatsApp, como saída para quem
     estiver sem JavaScript. */
  (function lead() {
    var caixa = $('#lead');
    if (!caixa) return;
    var form = $('#leadForm'), nome = $('#leadNome'), fone = $('#leadFone'),
        peca = $('#leadPeca'), titulo = $('#leadTitle');

    var PECAS = ['Bancada de cozinha', 'Ilha de cozinha', 'Lavatório de banheiro', 'Soleira e peitoril',
                 'Escada e degrau', 'Área gourmet', 'Tampo de mesa', 'Piso, fachada e revestimento',
                 'Restauração e polimento', 'Lápide e arte funerária'];

    function abrir(contexto) {
      var conhecida = PECAS.indexOf(contexto) > -1;
      peca.value = conhecida ? contexto : '';
      titulo.textContent = conhecida ? 'Orçamento de ' + contexto.toLowerCase() : 'Vamos ao seu orçamento';
      caixa.hidden = false;
      document.body.style.overflow = 'hidden';
      requestAnimationFrame(function () { caixa.classList.add('is-on'); });
      setTimeout(function () { nome.focus(); }, 320);
    }
    function fechar() {
      caixa.classList.remove('is-on');
      document.body.style.overflow = '';
      setTimeout(function () { caixa.hidden = true; }, 320);
    }

    $$('[data-wa]').forEach(function (el) {
      var ctx = el.dataset.wa;
      var rotulo = (ctx === 'orcamento' || ctx === 'hero') ? '' : ctx;
      if (rotulo) el.href = whats('Olá, Marmorizart! Vim pelo site e quero um orçamento de: ' + rotulo + '. Pode me ajudar?');
      el.addEventListener('click', function (e) {
        e.preventDefault();
        abrir(rotulo);
      });
    });

    $('#leadX').addEventListener('click', fechar);
    caixa.addEventListener('click', function (e) { if (e.target === caixa) fechar(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !caixa.hidden) fechar(); });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var erro = false;
      [nome, fone, peca].forEach(function (campo) {
        var ok = campo === fone ? foneValido(campo.value) : campo.value.trim() !== '';
        campo.classList.toggle('is-erro', !ok);
        if (!ok && !erro) { campo.focus(); erro = true; }
      });
      if (erro) return;

      registrarLead({
        nome: nome.value.trim(),
        telefone: fone.value.trim(),
        peca: peca.value,
        cidade: '',
        medidas: ''
      });
      abrirWhats('Olá, Marmorizart! Meu nome é ' + nome.value.trim() + '.\n' +
                 'Meu WhatsApp é ' + fone.value.trim() + '.\n' +
                 'Preciso de: ' + peca.value + '.\n' +
                 'Vim pelo site e gostaria do orçamento.');
      fechar();
      form.reset();
    });
  })();

  /* ---------- formulário principal ---------- */
  (function form() {
    var f = $('#form');
    if (!f) return;
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      var nome = $('#fNome'), fone = $('#fFone'), cidade = $('#fCidade'),
          peca = $('#fPeca'), medida = $('#fMedida');
      var falta = false;

      [nome, fone, cidade, peca].forEach(function (campo) {
        var ok = campo === fone ? foneValido(campo.value) : campo.value.trim() !== '';
        campo.closest('.f').classList.toggle('is-erro', !ok);
        if (!ok && !falta) { campo.focus(); falta = true; }
      });
      if (falta) return;

      registrarLead({
        nome: nome.value.trim(),
        telefone: fone.value.trim(),
        peca: peca.value,
        cidade: cidade.value.trim(),
        medidas: medida.value.trim()
      });

      var msg = 'Olá, Marmorizart! Meu nome é ' + nome.value.trim() + '.\n' +
                'Meu WhatsApp é ' + fone.value.trim() + '.\n' +
                'Sou de ' + cidade.value.trim() + '.\n' +
                'Preciso de: ' + peca.value + '.\n' +
                'Medidas: ' + (medida.value.trim() || 'ainda não tenho, preciso de ajuda') + '.\n' +
                'Vim pelo site e gostaria do orçamento.';
      abrirWhats(msg);
    });
  })();

  /* ---------- pop-up ---------- */
  (function popup() {
    var pop = $('#pop');
    if (!pop || sessionStorage.getItem('mz_pop')) return;
    var aberto = false;

    function abrir() {
      if (aberto || sessionStorage.getItem('mz_pop')) return;
      aberto = true;
      pop.hidden = false;
      document.body.style.overflow = 'hidden';
      requestAnimationFrame(function () { pop.classList.add('is-on'); });
      sessionStorage.setItem('mz_pop', '1');
      setTimeout(function () { $('#popNome').focus(); }, 350);
    }
    function fechar() {
      pop.classList.remove('is-on');
      document.body.style.overflow = '';
      setTimeout(function () { pop.hidden = true; }, 350);
    }

    var tempo = setTimeout(abrir, 32000);
    function porScroll() {
      var p = window.scrollY / (document.body.scrollHeight - window.innerHeight);
      if (p > 0.6) { abrir(); window.removeEventListener('scroll', porScroll); }
    }
    window.addEventListener('scroll', porScroll, { passive: true });
    document.addEventListener('mouseout', function (e) {
      if (!e.relatedTarget && e.clientY < 12) abrir();
    });

    $('#popX').addEventListener('click', function () { clearTimeout(tempo); fechar(); });
    pop.addEventListener('click', function (e) { if (e.target === pop) fechar(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !pop.hidden) fechar(); });

    $('#popForm').addEventListener('submit', function (e) {
      e.preventDefault();
      var nome = $('#popNome').value.trim(), peca = $('#popPeca').value;
      if (!nome || !peca) return;
      registrarLead({ nome: nome, telefone: '', peca: peca, cidade: '', medidas: 'veio do pop-up de medição' });
      abrirWhats('Olá, Marmorizart! Meu nome é ' + nome + ' e quero a medição gratuita para: ' + peca + '. Vim pelo site.');
      fechar();
    });
  })();

  /* ---------- botão flutuante ---------- */
  (function flutuante() {
    var f = $('#float');
    if (!f) return;
    window.addEventListener('scroll', function () {
      f.classList.toggle('is-on', window.scrollY > 600);
    }, { passive: true });
  })();

  /* ---------- rolagem suave até o formulário ---------- */
  $$('a[href="#orcamento"]').forEach(function (a) {
    if (a.dataset.wa && a.dataset.wa !== 'orcamento' && a.dataset.wa !== 'hero') return;
    a.addEventListener('click', function (e) {
      e.preventDefault();
      var alvo = $('#orcamento');
      alvo.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setTimeout(function () { $('#fNome').focus({ preventScroll: true }); }, 700);
    });
  });

  /* ---------- animação de entrada ---------- */
  (function entrada() {
    var alvos = $$('.sechead, .card, .passos li, .g, .nao li, .ficha__frase, .ficha__dl, .tabela, .kit, .checklist, .sobre__fig, .sobre__txt, .maisopcoes, .cidades, .faq details, .form, .cta__txt');
    if (!('IntersectionObserver' in window)) return;
    var io = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
    alvos.forEach(function (el, k) {
      el.classList.add('rise');
      el.style.transitionDelay = ((k % 4) * 60) + 'ms';
      io.observe(el);
    });
  })();

  /* ---------- ano do rodapé ---------- */
  var ano = $('#ano');
  if (ano) ano.textContent = new Date().getFullYear();
})();
