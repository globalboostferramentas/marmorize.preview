/* =========================================================================
   Marmorizart · comportamento da landing page
   ========================================================================= */
(function () {
  'use strict';

  var WHATSAPP = '553137872707';
  var $  = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  function whats(texto) {
    return 'https://wa.me/' + WHATSAPP + '?text=' + encodeURIComponent(texto);
  }
  function abrirWhats(texto) {
    window.open(whats(texto), '_blank', 'noopener');
  }

  /* ---------------------------------------------------------------------
     AVALIAÇÕES DO GOOGLE
     ATENÇÃO: os textos abaixo são MODELOS de exemplo, escritos para
     mostrar o layout. Antes de publicar, troque cada item pelo comentário
     REAL do perfil no Google Meu Negócio (nome, cidade, nota e texto).
     --------------------------------------------------------------------- */
  var AVALIACOES = [
    { nota: 5, texto: 'Exemplo de avaliação. Substitua este texto pelo comentário real do cliente no Google.', autor: 'Nome do cliente', local: 'Betim · Google' },
    { nota: 5, texto: 'Exemplo de avaliação. Substitua este texto pelo comentário real do cliente no Google.', autor: 'Nome do cliente', local: 'Betim · Google' },
    { nota: 4, texto: 'Exemplo de avaliação. Substitua este texto pelo comentário real do cliente no Google.', autor: 'Nome do cliente', local: 'Contagem · Google' },
    { nota: 5, texto: 'Exemplo de avaliação. Substitua este texto pelo comentário real do cliente no Google.', autor: 'Nome do cliente', local: 'Betim · Google' },
    { nota: 5, texto: 'Exemplo de avaliação. Substitua este texto pelo comentário real do cliente no Google.', autor: 'Nome do cliente', local: 'Ibirité · Google' },
    { nota: 4, texto: 'Exemplo de avaliação. Substitua este texto pelo comentário real do cliente no Google.', autor: 'Nome do cliente', local: 'Betim · Google' }
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

  /* ---------- status aberto / fechado ---------- */
  function status() {
    var dot = $('#statusDot'), txt = $('#statusText');
    if (!dot || !txt) return;
    var agora = new Date();
    var dia = agora.getDay();               // 0 domingo
    var min = agora.getHours() * 60 + agora.getMinutes();
    var aberto = dia >= 1 && dia <= 5 && ((min >= 480 && min < 720) || (min >= 780 && min < 1040));

    var curto = window.matchMedia('(max-width: 760px)').matches;

    if (aberto) {
      dot.className = 'dot on';
      txt.textContent = curto ? 'Aberto agora' : 'Loja aberta agora';
    } else {
      dot.className = 'dot off';
      if (curto) {
        txt.textContent = dia === 6 ? 'Sábado sob agendamento' : 'WhatsApp sempre aberto';
      } else {
        txt.textContent = dia === 6
          ? 'Sábado: medição sob agendamento · WhatsApp respondido'
          : 'Loja fechada · WhatsApp respondido a qualquer hora';
      }
    }
  }
  status();
  window.addEventListener('resize', status);

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

  /* ---------- hero: slideshow ---------- */
  (function hero() {
    var slides = $$('.hero__slide');
    if (slides.length < 2) return;
    var dots = $('#heroDots'), num = $('#heroNum');
    var i = 0, timer;

    slides.forEach(function (_, k) {
      var b = document.createElement('button');
      b.setAttribute('role', 'tab');
      b.setAttribute('aria-label', 'Foto ' + (k + 1));
      if (k === 0) b.classList.add('is-on');
      b.addEventListener('click', function () { ir(k); });
      dots.appendChild(b);
    });
    var botoes = $$('button', dots);

    function ir(k) {
      slides[i].classList.remove('is-on');
      botoes[i].classList.remove('is-on');
      i = (k + slides.length) % slides.length;
      slides[i].classList.add('is-on');
      botoes[i].classList.add('is-on');
      num.textContent = ('0' + (i + 1)).slice(-2);
      reiniciar();
    }
    function reiniciar() {
      clearInterval(timer);
      timer = setInterval(function () { ir(i + 1); }, 6000);
    }

    $('#heroNext').addEventListener('click', function () { ir(i + 1); });
    $('#heroPrev').addEventListener('click', function () { ir(i - 1); });
    reiniciar();

    document.addEventListener('visibilitychange', function () {
      if (document.hidden) { clearInterval(timer); } else { reiniciar(); }
    });
  })();

  /* ---------- cards que viram (toque no mobile) ---------- */
  $$('.card').forEach(function (card) {
    card.addEventListener('click', function (e) {
      if (e.target.closest('a')) return;
      if (window.matchMedia('(hover: none)').matches) card.classList.toggle('is-flip');
    });
    card.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); card.classList.toggle('is-flip'); }
    });
  });

  /* ---------- carrossel de avaliações, deslizando sozinho ---------- */
  (function reviews() {
    var trilho = $('#trilho');
    if (!trilho) return;

    function cartao(r, copia) {
      var art = document.createElement('article');
      art.className = 'rev';
      if (copia) art.setAttribute('aria-hidden', 'true');
      var estrelas = '';
      for (var k = 0; k < 5; k++) estrelas += k < r.nota ? '★' : '☆';
      art.innerHTML =
        '<div class="rev__stars" aria-label="' + r.nota + ' de 5 estrelas">' + estrelas + '</div>' +
        '<p>' + r.texto + '</p>' +
        '<div class="rev__who"><strong>' + r.autor + '</strong><span>' + r.local + '</span></div>';
      return art;
    }

    // a lista entra duas vezes: a segunda é a cópia que faz o laço parecer infinito
    AVALIACOES.forEach(function (r) { trilho.appendChild(cartao(r, false)); });
    AVALIACOES.forEach(function (r) { trilho.appendChild(cartao(r, true)); });

    // velocidade constante (px por segundo), independente do número de avaliações
    function ritmo() {
      var metade = trilho.scrollWidth / 2;
      if (!metade) return;
      trilho.style.setProperty('--corrida', metade + 'px');
      trilho.style.animationDuration = (metade / 45) + 's';
    }
    ritmo();
    window.addEventListener('resize', ritmo);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(ritmo);
  })();

  /* ---------- links de whatsapp com contexto ---------- */
  $$('[data-wa]').forEach(function (el) {
    el.addEventListener('click', function (e) {
      var ctx = el.dataset.wa;
      if (ctx === 'orcamento' || ctx === 'hero') return;   // esses rolam até o formulário
      e.preventDefault();
      abrirWhats('Olá, Marmorizart! Vim pelo site e quero um orçamento de: ' + ctx + '. Pode me ajudar?');
    });
  });

  /* ---------- formulário principal ---------- */
  (function form() {
    var f = $('#form');
    if (!f) return;
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      var nome = $('#fNome'), cidade = $('#fCidade'), peca = $('#fPeca'), medida = $('#fMedida');
      var falta = false;

      [nome, cidade, peca].forEach(function (campo) {
        var ok = campo.value.trim() !== '';
        campo.closest('.f').classList.toggle('is-erro', !ok);
        if (!ok && !falta) { campo.focus(); falta = true; }
      });
      if (falta) return;

      var msg = 'Olá, Marmorizart! Meu nome é ' + nome.value.trim() + '.\n' +
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
    var alvos = $$('.sechead, .card, .mat, .passos li, .g, .nao li, .ficha__frase, .ficha__dl, .tabela, .kit, .checklist, .sobre__fig, .sobre__txt, .maisopcoes, .cidades, .faq details, .form, .cta__txt, .alerta');
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
