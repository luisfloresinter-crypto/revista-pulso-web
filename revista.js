/* Navegación accesible de 10 páginas y demostración HTTP opcional. */
(() => {
  'use strict';
  const pages = [...document.querySelectorAll('.sheet')];
  const tabs = [...document.querySelectorAll('.chapter-btn')];
  const prev = document.getElementById('prev');
  const next = document.getElementById('next');
  const counter = document.getElementById('page-counter');
  const caption = document.getElementById('chapter-caption');
  let current = 0;

  function changePage(index, updateUrl=true) {
    const n = Math.max(0, Math.min(pages.length - 1, index));
    pages.forEach((page, i) => { page.hidden = i !== n; page.classList.toggle('active', i === n); });
    tabs.forEach((tab, i) => { tab.classList.toggle('current', i === n); tab.setAttribute('aria-current', i === n ? 'page' : 'false'); });
    current = n;
    counter.innerHTML = `${String(n + 1).padStart(2,'0')} <span>/ 10</span>`;
    caption.textContent = pages[n].dataset.title;
    prev.disabled = n === 0; next.disabled = n === pages.length - 1;
    if (updateUrl) history.replaceState(null, '', `#pagina-${String(n+1).padStart(2,'0')}`);
    window.scrollTo({top:0, behavior:'instant'});
  }
  function pageFromHash() { const match = location.hash.match(/^#pagina-(\d{2})$/); return match ? Number(match[1]) - 1 : 0; }
  prev.addEventListener('click', () => changePage(current - 1));
  next.addEventListener('click', () => changePage(current + 1));
  tabs.forEach((tab,i) => tab.addEventListener('click', () => changePage(i)));
  document.querySelectorAll('a[href^="#pagina-"]').forEach(link => link.addEventListener('click', e => {
    const id = link.getAttribute('href').slice(1); const index = pages.findIndex(p=>p.id===id);
    if (index !== -1) { e.preventDefault(); changePage(index); }
  }));
  document.addEventListener('keydown', e => {
    if (e.altKey || e.ctrlKey || e.metaKey || ['INPUT','TEXTAREA','SELECT'].includes(document.activeElement?.tagName)) return;
    if (e.key === 'ArrowRight') { e.preventDefault(); changePage(current+1); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); changePage(current-1); }
  });
  window.addEventListener('hashchange', () => changePage(pageFromHash(), false));
  document.getElementById('print-btn').addEventListener('click', () => window.print());
  const apiBtn = document.getElementById('api-button');
  const apiResult = document.getElementById('api-result');
  apiBtn.addEventListener('click', async () => {
    apiBtn.disabled = true;
    if (location.protocol === 'file:') {
      apiResult.textContent = 'Esta revista está abierta como archivo estático. Si tienes Node.js, ejecuta «node servidor.js» y entra a http://localhost:3000 para probar la API.';
      apiBtn.disabled = false; return;
    }
    try {
      const response = await fetch('./api/estado', {headers:{Accept:'application/json'}});
      const type = response.headers.get('content-type') || '';
      if (!response.ok || !type.includes('application/json')) throw new Error('La edición publicada no incluye backend');
      const data = await response.json();
      apiResult.textContent = `Respuesta HTTP ${response.status}: ${data.mensaje} (${data.entorno}).`;
    } catch {
      apiResult.textContent = 'Esta edición está publicada de forma estática. La API de demostración solo se activa ejecutando localmente «node servidor.js».';
    } finally { apiBtn.disabled = false; }
  });
  changePage(pageFromHash(), false);
})();
