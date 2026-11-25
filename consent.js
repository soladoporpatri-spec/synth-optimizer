/*
 * Consentimento de cookies (LGPD) + analytics opcional.
 *
 * Enquanto GA4_ID estiver vazio, o site NÃO usa cookies de medição, NÃO rastreia nada
 * e nenhum aviso é exibido. Para ativar o Google Analytics 4:
 *   1. Crie a propriedade em https://analytics.google.com e copie o ID de medição (G-XXXXXXXXXX).
 *   2. Cole o ID em GA4_ID abaixo e publique o arquivo.
 * Depois disso o aviso de cookies passa a aparecer e o Analytics só carrega se o visitante aceitar.
 *
 * Eventos enviados (quando há consentimento): whatsapp_click (com plano e preço) e discord_click.
 * Marque whatsapp_click como "evento-chave" (conversão) no GA4 para medir contratações.
 */
(function () {
  'use strict';

  var GA4_ID = ''; // Ex.: 'G-XXXXXXXXXX'
  var KEY = 'synth_consent_v1';
  var loaded = false;
  // Textos do aviso, conforme o idioma da página
  var LANG = (document.documentElement.lang || 'pt-BR').slice(0, 2).toLowerCase();
  var TEXTS = {
    pt: {
      label: 'Preferências de cookies',
      body: 'Usamos cookies de medição (Google Analytics) para entender como o site é usado e melhorar a experiência. Você pode aceitar ou recusar. Veja a <a href="/privacidade/#cookies">política de cookies</a>.',
      accept: 'Aceitar', decline: 'Recusar'
    },
    en: {
      label: 'Cookie preferences',
      body: 'We use measurement cookies (Google Analytics) to understand how the site is used and to improve the experience. You can accept or decline. See the <a href="/en/privacy/#cookies">cookie policy</a>.',
      accept: 'Accept', decline: 'Decline'
    },
    es: {
      label: 'Preferencias de cookies',
      body: 'Usamos cookies de medición (Google Analytics) para entender cómo se usa el sitio y mejorar la experiencia. Puedes aceptar o rechazar. Consulta la <a href="/es/privacidad/#cookies">política de cookies</a>.',
      accept: 'Aceptar', decline: 'Rechazar'
    }
  };
  var TX = TEXTS[LANG] || TEXTS.pt;

  function read() {
    try { return localStorage.getItem(KEY); } catch (e) { return null; }
  }
  function write(v) {
    try { localStorage.setItem(KEY, v); } catch (e) { /* navegação privada: ignora */ }
  }

  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }

  function loadAnalytics() {
    if (loaded || !GA4_ID) return;
    loaded = true;
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(GA4_ID);
    document.head.appendChild(s);
    gtag('js', new Date());
    gtag('config', GA4_ID, { anonymize_ip: true });
  }

  // Usado pelo script.js nos cliques de WhatsApp/Discord. Não faz nada sem consentimento.
  window.trackEvent = function (name, params) {
    if (!loaded) return;
    gtag('event', name, params || {});
  };

  function removeBanner() {
    var b = document.getElementById('cookie-banner');
    if (b) b.remove();
  }

  function showBanner() {
    if (document.getElementById('cookie-banner')) return;
    var b = document.createElement('div');
    b.id = 'cookie-banner';
    b.className = 'cookie-banner';
    b.setAttribute('role', 'dialog');
    b.setAttribute('aria-label', TX.label);
    b.innerHTML =
      '<p>' + TX.body + '</p>' +
      '<div class="cookie-actions">' +
      '<button type="button" class="cookie-btn cookie-accept">' + TX.accept + '</button>' +
      '<button type="button" class="cookie-btn cookie-decline">' + TX.decline + '</button>' +
      '</div>';
    document.body.appendChild(b);
    b.querySelector('.cookie-accept').addEventListener('click', function () {
      write('granted'); removeBanner(); loadAnalytics();
    });
    b.querySelector('.cookie-decline').addEventListener('click', function () {
      write('denied'); removeBanner();
    });
  }

  // Permite reabrir a escolha (ex.: link "Gerenciar cookies").
  window.openCookieSettings = showBanner;

  function init() {
    if (!GA4_ID) return;
    var choice = read();
    if (choice === 'granted') loadAnalytics();
    else if (choice !== 'denied') showBanner();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
