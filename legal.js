/*
 * Páginas legais: quando o arquivo é aberto direto no computador (file://), links como "/en/terms/"
 * não existem. Este script converte esses links em caminhos relativos. No site publicado não faz nada.
 */
(function () {
  'use strict';
  var sw = document.querySelectorAll('.lang-switch a');
  for (var k = 0; k < sw.length; k++) {
    sw[k].addEventListener('click', function () {
      try { localStorage.setItem('synth_lang', this.getAttribute('hreflang')); } catch (e) { /* ignora */ }
    });
  }
  if (location.protocol !== 'file:') return;
  var root = document.documentElement.getAttribute('data-root') || '';
  var links = document.querySelectorAll('a[href^="/"]');
  for (var i = 0; i < links.length; i++) {
    var raw = links[i].getAttribute('href');
    if (raw.indexOf('//') === 0) continue;
    var parts = raw.split('#');
    var rel = parts[0].replace(/^\//, '');
    if (rel === '' || rel.slice(-1) === '/') rel += 'index.html';
    links[i].setAttribute('href', root + rel + (parts[1] ? '#' + parts[1] : ''));
  }
})();
