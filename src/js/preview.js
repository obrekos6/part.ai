// Левая панель предпросмотра (рендер HTML/CSS/JS)
let panelCreated = false;
let overlay, panel, bodyEl, titleEl;

function createPanel() {
  if (panelCreated) return;
  panelCreated = true;

  // Оверлей (используем те же стили, что уже есть в проекте)
  overlay = document.createElement('div');
  overlay.className = 'preview-overlay';
  document.body.appendChild(overlay);

  // Панель — теперь слева
  panel = document.createElement('div');
  panel.className = 'preview-panel preview-panel-left';
  panel.innerHTML = `
    <div class="preview-header">
      <span class="preview-title" id="preview-title-left">Превью</span>
      <div class="preview-actions">
        <button class="preview-action-btn" id="preview-refresh-btn">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>
          Обновить
        </button>
        <button class="preview-close-btn" id="preview-close-btn-left">
          <svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>
    </div>
    <div class="preview-body" id="preview-body-left">
      <div class="preview-empty">Нет содержимого для предпросмотра</div>
    </div>
  `;
  document.body.appendChild(panel);

  titleEl = document.getElementById('preview-title-left');
  bodyEl = document.getElementById('preview-body-left');

  overlay.addEventListener('click', closePanel);
  document.getElementById('preview-close-btn-left').addEventListener('click', closePanel);

  document.getElementById('preview-refresh-btn').addEventListener('click', () => {
    if (panel._lastContent !== undefined) {
      renderContent(panel._lastLang, panel._lastContent);
    }
  });
}

// Собирает полноценный HTML-документ вокруг фрагмента, чтобы его можно было
// показать в iframe даже если пришёл просто кусок разметки/css/js.
function buildIframeDoc(lang, content) {
  const l = (lang || '').toLowerCase();

  if (l === 'html' || l === 'htm') {
    // Если это уже полноценный документ — используем как есть
    if (/<html[\s>]/i.test(content)) return content;
    return `<!DOCTYPE html><html><head><meta charset="UTF-8"></head><body>${content}</body></html>`;
  }

  if (l === 'css') {
    return `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>${content}</style></head><body><div style="font-family:sans-serif;padding:16px;color:#333;">Предпросмотр стилей (нет разметки — показан пустой документ со стилями)</div></body></html>`;
  }

  if (l === 'javascript' || l === 'js') {
    return `<!DOCTYPE html><html><head><meta charset="UTF-8"></head><body><div id="app" style="font-family:sans-serif;padding:16px;color:#333;"></div><script>try{${content}}catch(e){document.body.innerHTML='<pre style="color:red;padding:16px;">'+e+'</pre>';}</script></body></html>`;
  }

  return `<!DOCTYPE html><html><head><meta charset="UTF-8"></head><body><pre style="padding:16px;white-space:pre-wrap;">${content.replace(/</g, '&lt;')}</pre></body></html>`;
}

function renderContent(lang, content) {
  bodyEl.innerHTML = '';
  const iframe = document.createElement('iframe');
  iframe.className = 'preview-iframe';
  iframe.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-forms allow-modals allow-popups');
  bodyEl.appendChild(iframe);

  const doc = buildIframeDoc(lang, content || '');
  iframe.srcdoc = doc;
}

function openPanel(fileName, extension, content) {
  createPanel();
  titleEl.textContent = fileName || 'Превью';

  panel._lastLang = extension;
  panel._lastContent = content;

  renderContent(extension, content);

  overlay.classList.add('active');
  panel.classList.add('active');
}

function closePanel() {
  overlay?.classList.remove('active');
  panel?.classList.remove('active');
}

export { openPanel, closePanel };