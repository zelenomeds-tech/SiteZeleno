/* =========================================================================
   JANELA FLUTUANTE DE AGENDAMENTO
   -------------------------------------------------------------------------
   Qualquer link que aponte para agendamento.html passa a abrir esta janela
   por cima da pagina atual, em vez de navegar para fora. A pagina
   agendamento.html continua existindo e funcionando sozinha: serve de
   fallback para acesso direto, para quem esta sem JavaScript e para o Google.

   A plataforma real de agendamento responde com "frame-ancestors 'self'",
   ou seja, ela nao pode ser carregada dentro de um iframe de outro dominio.
   Por isso a janela mostra uma previa da interface e leva o paciente para a
   plataforma em nova aba.
   ========================================================================= */
(function () {
    'use strict';

    var PLATAFORMA = 'https://loja-zeleno-front.vercel.app/agendar.html';

    /* O script pode ser incluido da raiz ou de dentro de /blog, entao a base
       dos assets sai do proprio caminho do arquivo. */
    var base = (function () {
        var s = document.currentScript;
        if (!s || !s.src) { return ''; }
        return s.src.replace(/[^/]*$/, '');
    })();

    var CSS = [
        '.zag-overlay{position:fixed;inset:0;z-index:100000;display:none;align-items:center;justify-content:center;padding:24px;',
        'background:rgba(0,20,14,.72);opacity:0;transition:opacity .28s ease}',
        '.zag-overlay.is-open{display:flex}',
        '.zag-overlay.is-visible{opacity:1}',
        '.zag-dialog{position:relative;width:100%;max-width:940px;max-height:calc(100dvh - 48px);overflow-y:auto;',
        'background:#00261b;color:#f0f0f0;border:1px solid rgba(73,147,117,.22);border-radius:26px;',
        'box-shadow:0 40px 90px rgba(0,0,0,.55);padding:38px 40px;',
        'font-family:"Poppins",sans-serif;-webkit-font-smoothing:antialiased;',
        'display:grid;grid-template-columns:236px 1fr;gap:36px;align-items:center;',
        'transform:translateY(14px) scale(.98);transition:transform .28s cubic-bezier(.85,0,.15,1)}',
        '.zag-overlay.is-visible .zag-dialog{transform:none}',

        '.zag-close{position:absolute;top:14px;right:16px;width:38px;height:38px;border-radius:50%;',
        'background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.16);color:#fff;',
        'font-size:18px;line-height:1;cursor:pointer;transition:.25s;display:inline-flex;align-items:center;justify-content:center;z-index:2}',
        '.zag-close:hover{background:#fff;color:#00543d}',

        /* text-wrap balance/pretty: nenhuma palavra pode ficar sozinha na ultima linha. */
        '.zag-copy h2{font-size:clamp(1.5rem,2.6vw,2.1rem);font-weight:900;line-height:1.05;text-transform:uppercase;color:#fff;margin:0 0 14px;text-wrap:balance}',
        '.zag-copy h2 span{color:#499375}',
        '.zag-copy>p{font-size:.95rem;line-height:1.6;color:rgba(255,255,255,.72);margin:0 0 22px;max-width:430px;text-wrap:pretty}',
        '.zag-note,.zag-review p,.zag-body h3,.zag-confirm{text-wrap:pretty}',
        '.zag-cta{display:inline-flex;align-items:center;gap:10px;background:#499375;color:#fff;text-decoration:none;',
        'padding:15px 32px;border-radius:6px;font-size:12px;font-weight:900;text-transform:uppercase;letter-spacing:1.5px;',
        'transition:.3s;box-shadow:0 14px 30px rgba(73,147,117,.28)}',
        '.zag-cta:hover{background:#fff;color:#00543d;transform:translateY(-3px)}',
        '.zag-note{margin:12px 0 0;font-size:11px;color:rgba(255,255,255,.45)}',
        '.zag-reviews{display:flex;gap:14px;margin-top:24px;padding-top:20px;border-top:1px solid rgba(255,255,255,.10)}',
        '.zag-review{flex:1}',
        '.zag-stars{color:#499375;font-size:9px;margin-bottom:5px;letter-spacing:1px}',
        '.zag-review p{font-size:11.5px;line-height:1.5;color:rgba(255,255,255,.68);font-style:italic;margin:0}',
        '.zag-review b{display:block;margin-top:5px;font-size:10.5px;color:#499375;font-style:normal}',

        '.zag-phone{position:relative;width:236px;height:472px;background:#000;border:8px solid #1a1a1a;border-radius:36px;',
        'box-shadow:0 30px 60px rgba(0,0,0,.6);overflow:hidden;justify-self:center}',
        '.zag-screen{width:100%;height:100%;background:#fff;border-radius:28px;overflow:hidden;display:flex;flex-direction:column;text-decoration:none;color:#00261b}',
        '.zag-top{background:#00543d;padding:18px 14px 12px;text-align:center}',
        '.zag-top img{height:20px;width:auto;filter:brightness(0) invert(1)}',
        '.zag-top p{color:rgba(255,255,255,.75);font-size:7.5px;margin:7px 0 0;letter-spacing:1.2px;text-transform:uppercase}',
        '.zag-body{padding:13px;display:flex;flex-direction:column;gap:10px;flex:1}',
        '.zag-body h3{font-size:9.5px;color:#00543d;font-weight:900;text-transform:uppercase;letter-spacing:1px;margin:0}',
        '.zag-dates{display:flex;gap:5px}',
        '.zag-chip{flex:1;border:1px solid rgba(0,84,61,.15);border-radius:8px;padding:6px 0;text-align:center}',
        '.zag-chip span{display:block;font-size:7.5px;text-transform:uppercase;color:#6d8479;letter-spacing:.8px}',
        '.zag-chip b{font-size:13px;color:#00543d}',
        '.zag-chip.on{background:#00543d;border-color:#00543d}',
        '.zag-chip.on span{color:rgba(255,255,255,.7)}.zag-chip.on b{color:#fff}',
        '.zag-slots{display:grid;grid-template-columns:1fr 1fr;gap:5px}',
        '.zag-slot{border:1px solid rgba(0,84,61,.15);border-radius:6px;padding:7px 0;text-align:center;font-size:10.5px;font-weight:700;color:#00543d}',
        '.zag-slot.off{color:#b9c4be;border-color:#eef1ef;background:#f6f8f7;text-decoration:line-through}',
        '.zag-slot.on{background:#499375;border-color:#499375;color:#fff}',
        '.zag-doc{display:flex;align-items:center;gap:7px;border-top:1px solid #eef1ef;padding-top:10px}',
        '.zag-doc img{width:28px;height:28px;border-radius:50%;object-fit:cover}',
        '.zag-doc b{display:block;font-size:10px;color:#00543d}',
        '.zag-doc span{font-size:8.5px;color:#6d8479}',
        '.zag-confirm{margin-top:auto;background:#00543d;color:#fff;text-align:center;padding:11px;border-radius:8px;',
        'font-size:9px;font-weight:900;text-transform:uppercase;letter-spacing:1.2px}',

        '@media (max-width:820px){',
        '.zag-overlay{padding:14px}',
        '.zag-dialog{grid-template-columns:1fr;gap:24px;padding:44px 22px 26px;text-align:center;border-radius:20px}',
        '.zag-copy>p{margin-left:auto;margin-right:auto}',
        '.zag-reviews{flex-direction:column;gap:14px;text-align:left}',
        '.zag-phone{order:-1;width:200px;height:400px}',
        '}',
        '@media (prefers-reduced-motion:reduce){',
        '.zag-overlay,.zag-dialog{transition:none}',
        '}'
    ].join('');

    var MARCACAO =
        '<div class="zag-dialog" role="dialog" aria-modal="true" aria-labelledby="zagTitulo">' +
            '<button type="button" class="zag-close" data-zag-fechar aria-label="Fechar">&times;</button>' +

            '<a class="zag-phone" href="' + PLATAFORMA + '" target="_blank" rel="noopener" aria-label="Abrir a plataforma de agendamento Zeleno">' +
                '<span class="zag-screen">' +
                    '<span class="zag-top">' +
                        '<img src="' + base + 'logo.png" alt="Zeleno">' +
                        '<p>Agendamento de consulta</p>' +
                    '</span>' +
                    '<span class="zag-body">' +
                        '<h3>Escolha o dia</h3>' +
                        '<span class="zag-dates">' +
                            '<span class="zag-chip"><span>Seg</span><b>12</b></span>' +
                            '<span class="zag-chip on"><span>Ter</span><b>13</b></span>' +
                            '<span class="zag-chip"><span>Qua</span><b>14</b></span>' +
                            '<span class="zag-chip"><span>Qui</span><b>15</b></span>' +
                        '</span>' +
                        '<h3>Horários disponíveis</h3>' +
                        '<span class="zag-slots">' +
                            '<span class="zag-slot">09:00</span>' +
                            '<span class="zag-slot off">10:00</span>' +
                            '<span class="zag-slot on">11:30</span>' +
                            '<span class="zag-slot">14:00</span>' +
                            '<span class="zag-slot">15:30</span>' +
                            '<span class="zag-slot off">17:00</span>' +
                        '</span>' +
                        '<span class="zag-doc">' +
                            '<img src="' + base + 'doctor.png" alt="">' +
                            '<span><b>Consulta com prescritor</b><span>Teleconsulta &middot; 30 minutos</span></span>' +
                        '</span>' +
                        '<span class="zag-confirm">Confirmar agendamento</span>' +
                    '</span>' +
                '</span>' +
            '</a>' +

            '<div class="zag-copy">' +
                '<h2 id="zagTitulo">Sua saúde merece o <span>nível Premium</span></h2>' +
                '<p>Agende sua consulta com especialistas em cannabis medicinal na plataforma mais segura do Brasil.</p>' +
                '<a class="zag-cta" href="' + PLATAFORMA + '" target="_blank" rel="noopener">' +
                    '<i class="fas fa-calendar-check" aria-hidden="true"></i> Agendar minha consulta' +
                '</a>' +
                '<p class="zag-note">Escolha o dia e o horário em menos de 2 minutos.</p>' +
                '<div class="zag-reviews">' +
                    '<div class="zag-review">' +
                        '<div class="zag-stars">★★★★★</div>' +
                        '<p>"O agendamento foi super simples e o suporte da Zeleno é impecável."</p>' +
                        '<b>Mariana S.</b>' +
                    '</div>' +
                    '<div class="zag-review">' +
                        '<div class="zag-stars">★★★★★</div>' +
                        '<p>"Médicos muito preparados. Me senti segura durante todo o processo."</p>' +
                        '<b>Dr. João P.</b>' +
                    '</div>' +
                '</div>' +
            '</div>' +
        '</div>';

    var overlay = null;
    var ultimoFoco = null;

    function montar() {
        if (overlay) { return overlay; }

        var estilo = document.createElement('style');
        estilo.textContent = CSS;
        document.head.appendChild(estilo);

        overlay = document.createElement('div');
        overlay.className = 'zag-overlay';
        overlay.id = 'zagOverlay';
        overlay.innerHTML = MARCACAO;
        document.body.appendChild(overlay);

        /* Clique fora do cartao fecha. */
        overlay.addEventListener('click', function (e) {
            if (e.target === overlay || e.target.hasAttribute('data-zag-fechar')) { fechar(); }
        });

        return overlay;
    }

    function abrir() {
        montar();
        ultimoFoco = document.activeElement;
        overlay.classList.add('is-open');
        /* Um quadro depois, para a transicao de opacidade acontecer. */
        requestAnimationFrame(function () { overlay.classList.add('is-visible'); });
        document.body.style.overflow = 'hidden';
        var fechar_ = overlay.querySelector('.zag-close');
        if (fechar_) { fechar_.focus(); }
    }

    function fechar() {
        if (!overlay) { return; }
        overlay.classList.remove('is-visible');
        window.setTimeout(function () {
            overlay.classList.remove('is-open');
            document.body.style.overflow = '';
            if (ultimoFoco && ultimoFoco.focus) { ultimoFoco.focus(); }
        }, 260);
    }

    function estaAberto() {
        return overlay && overlay.classList.contains('is-open');
    }

    /* Intercepta qualquer link para a pagina de agendamento, na raiz ou em /blog. */
    document.addEventListener('click', function (e) {
        var link = e.target.closest ? e.target.closest('a[href]') : null;
        if (!link) { return; }
        if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) { return; }
        if (link.target && link.target !== '_self') { return; }

        var href = link.getAttribute('href') || '';
        if (!/(^|\/)agendamento\.html(\?|#|$)/.test(href)) { return; }

        e.preventDefault();
        abrir();
    });

    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && estaAberto()) { fechar(); }
    });

    /* Exposto para uso manual, se algum botao precisar abrir por JS. */
    window.ZelenoAgendamento = { abrir: abrir, fechar: fechar };
})();
