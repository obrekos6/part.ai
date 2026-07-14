const form = document.getElementById('chat-form');
const input = document.getElementById('message-input');
const sendBtn = document.getElementById('send-btn');
const inputBox = document.getElementById('chat-form');
const centerContent = document.querySelector('.center-content');
const title = document.getElementById('dynamic-title');
const subtitle = document.querySelector('.subtitle');
const inputContainer = document.querySelector('.input-container');

const ASK_AI_URL = 'https://ymgxlmeqtpyfgxvcclun.supabase.co/functions/v1/ask-ai';
const MAX_HISTORY = 20;
const STORAGE_KEY = 'part-ai-chat';

let chatStarted = false;
let messageHistory = [];
let allMessages = [];
let codeBlockCounter = 0;

const PREVIEWABLE_LANGS = new Set(['html', 'htm', 'css', 'js', 'javascript']);

/* localStorage */
function loadFromStorage() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const data = JSON.parse(saved);
      allMessages = data.allMessages || [];
      messageHistory = data.messageHistory || [];
      return data.chatStarted || false;
    }
  } catch (e) {
    localStorage.removeItem(STORAGE_KEY);
  }
  return false;
}

function saveToStorage() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      allMessages,
      messageHistory,
      chatStarted,
    }));
  } catch (e) {}
}

/* DOM skeleton */
let scrollArea = document.getElementById('chat-scroll-area');
if (!scrollArea) {
  scrollArea = document.createElement('div');
  scrollArea.id = 'chat-scroll-area';
  scrollArea.style.cssText = `
    flex: 1;
    overflow-y: auto;
    display: none;
    padding: 0 24px 16px 24px;
    width: 100%;
    min-height: 0;
  `;
  centerContent.insertBefore(scrollArea, inputContainer);
}

let messagesContainer = document.getElementById('chat-messages');
if (!messagesContainer) {
  messagesContainer = document.createElement('div');
  messagesContainer.id = 'chat-messages';
  messagesContainer.style.cssText = `
    width: 100%;
    max-width: min(680px, 90vw);
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    gap: 16px;
  `;
  scrollArea.appendChild(messagesContainer);
}

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/* code block parsing */
const CODE_BLOCK_RE = /```([a-zA-Z0-9_+-]*)(?::([^\n`]+))?\n([\s\S]*?)```/g;

const EXT_BY_LANG = {
  html: 'html', htm: 'html',
  css: 'css',
  js: 'js', javascript: 'js', jsx: 'jsx',
  ts: 'ts', typescript: 'ts', tsx: 'tsx',
  python: 'py', py: 'py',
  json: 'json',
  bash: 'sh', sh: 'sh', shell: 'sh',
  java: 'java',
  c: 'c', cpp: 'cpp', 'c++': 'cpp',
  php: 'php',
  sql: 'sql',
  yaml: 'yml', yml: 'yml',
  xml: 'xml',
  md: 'md', markdown: 'md',
};

function makeAutoNameCounter() {
  const counts = {};
  return function (lang) {
    const key = (lang || 'txt').toLowerCase();
    const ext = EXT_BY_LANG[key] || key || 'txt';
    counts[ext] = (counts[ext] || 0) + 1;
    const n = counts[ext];
    return n === 1 ? `code.${ext}` : `code-${n}.${ext}`;
  };
}

function extractCodeBlocks(text) {
  const segments = [];
  let lastIndex = 0;
  let match;
  const nextAutoName = makeAutoNameCounter();

  CODE_BLOCK_RE.lastIndex = 0;
  while ((match = CODE_BLOCK_RE.exec(text)) !== null) {
    if (match.index > lastIndex) {
      segments.push({ type: 'text', content: text.slice(lastIndex, match.index) });
    }

    const lang = (match[1] || '').trim();
    const explicitName = match[2] ? match[2].trim() : '';
    const fileName = explicitName || nextAutoName(lang);

    segments.push({
      type: 'code',
      lang,
      fileName,
      code: match[3].replace(/\n$/, ''),
    });
    lastIndex = CODE_BLOCK_RE.lastIndex;
  }

  if (lastIndex < text.length) {
    segments.push({ type: 'text', content: text.slice(lastIndex) });
  }

  return segments;
}

function hasCodeBlock(text) {
  return /```[a-zA-Z0-9_+-]*(?::[^\n`]+)?\n[\s\S]*?```/.test(text);
}

function parseMarkdown(text) {
  const codeBlocks = [];
  let html = text.replace(/```([a-zA-Z0-9+-]*)?\n?([\s\S]*?)```/g, (match, lang, code) => {
    const idx = codeBlocks.length;
    codeBlocks.push({ lang: (lang || '').trim(), code: escapeHtml(code).trimEnd() });
    return `\x00CODEBLOCK${idx}\x00`;
  });

  html = escapeHtml(html);

  html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
  html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');
  html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>');

  html = html.replace(/^\s*---\s*$/gm, '<hr>');

  const lines = html.split('\n');
  const outLines = [];
  let quoteBuf = [];

  function flushQuote() {
    if (quoteBuf.length) {
      const content = quoteBuf.map(l => l.replace(/^> ?/, '')).join('<br>');
      outLines.push(`<blockquote>${content}</blockquote>`);
      quoteBuf = [];
    }
  }

  for (const line of lines) {
    if (line.startsWith('>')) {
      quoteBuf.push(line);
    } else {
      flushQuote();
      outLines.push(line);
    }
  }
  flushQuote();
  html = outLines.join('\n');

  const listLines = html.split('\n');
  const listOut = [];
  let inList = false;
  let listType = 'ul';
  let listItems = [];

  for (const line of listLines) {
    const trimmed = line.trim();
    const ulMatch = trimmed.match(/^[-*] (.*)$/);
    const olMatch = trimmed.match(/^(\d+)\. (.*)$/);
    const checkMatch = trimmed.match(/^[-*] \[([ xX])\] (.*)$/);

    if (checkMatch) {
      const checked = checkMatch[1].toLowerCase() === 'x';
      const itemText = `<span class="md-check">${checked ? '☑' : '☐'}</span> ${checkMatch[2]}`;
      if (!inList) { inList = true; listType = 'ul'; listItems = []; }
      listItems.push(itemText);
    } else if (ulMatch) {
      if (!inList) { inList = true; listType = 'ul'; listItems = []; }
      listItems.push(ulMatch[1]);
    } else if (olMatch) {
      if (!inList) { inList = true; listType = 'ol'; listItems = []; }
      listItems.push(olMatch[2]);
    } else {
      if (inList) {
        const tag = listType === 'ul' ? 'ul' : 'ol';
        listOut.push(`<${tag}><li>${listItems.join('</li><li>')}</li></${tag}>`);
        inList = false;
        listItems = [];
      }
      listOut.push(line);
    }
  }
  if (inList) {
    const tag = listType === 'ul' ? 'ul' : 'ol';
    listOut.push(`<${tag}><li>${listItems.join('</li><li>')}</li></${tag}>`);
  }
  html = listOut.join('\n');

  const tableRegex = /^(\|.*\|)\n\|[-:\s|]+\n((?:\|.*\|\n?)+)/gm;
  html = html.replace(tableRegex, (match, headerLine, bodyLines) => {
    const headers = headerLine.split('|').map(s => s.trim()).filter(s => s);
    const rows = bodyLines.trim().split('\n').map(row => {
      return row.split('|').map(s => s.trim()).filter(s => s);
    });
    let tableHtml = '<table class="md-table"><thead><tr>';
    headers.forEach(h => { tableHtml += `<th>${h}</th>`; });
    tableHtml += '</tr></thead><tbody>';
    rows.forEach(row => {
      tableHtml += '<tr>';
      row.forEach(cell => { tableHtml += `<td>${cell}</td>`; });
      tableHtml += '</tr>';
    });
    tableHtml += '</tbody></table>';
    return tableHtml;
  });

  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');

  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)/g, '<em>$1</em>');
  html = html.replace(/~~(.+?)~~/g, '<del>$1</del>');
  html = html.replace(/__(.+?)__/g, '<u>$1</u>');
  html = html.replace(/`(.+?)`/g, '<code>$1</code>');

  html = html.replace(/\x00CODEBLOCK(\d+)\x00/g, (match, idx) => {
    const { lang, code } = codeBlocks[+idx];
    return `<pre class="md-code-block"><code${lang ? ` class="language-${lang}"` : ''}>${code}</code></pre>`;
  });

  html = html.replace(/\n/g, '<br>');

  return html;
}

const FILE_ICON_SVG = `<svg viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>`;

/* create code block - like thinking block, no preview, no "show full" button */
function createCodeBlock(lang, fileName, code) {
  codeBlockCounter += 1;

  const wrapper = document.createElement('div');
  wrapper.className = 'code-block';

  wrapper.innerHTML = `
    <div class="code-block-header">
      <div class="code-block-header-info">
        ${FILE_ICON_SVG}
        <span class="code-block-filename">${escapeHtml(fileName)}</span>
        <span class="code-block-lang">${escapeHtml(lang || '')}</span>
      </div>
    </div>
    <div class="code-block-body">
      <pre class="code-block-code"><code></code></pre>
    </div>
  `;

  wrapper.querySelector('.code-block-code code').textContent = code;

  const bodyEl = wrapper.querySelector('.code-block-body');

  /* auto-expand short code */
  requestAnimationFrame(() => {
    const codeEl = wrapper.querySelector('.code-block-code');
    const COLLAPSED_MAX_HEIGHT = 108;
    if (codeEl.scrollHeight <= COLLAPSED_MAX_HEIGHT) {
      bodyEl.classList.add('expanded');
    }
  });

  return wrapper;
}

/* thinking block - hidden by default, shows time on right */
function createThinkingBlock(title = 'Thinking') {
  const wrapper = document.createElement('div');
  wrapper.className = 'thinking-block';
  wrapper.style.display = 'none';

  const safeTitle = (() => {
    const div = document.createElement('div');
    div.textContent = title;
    return div.innerHTML;
  })();

  wrapper.innerHTML = `
    <button class="thinking-header" type="button" aria-expanded="false">
      <div class="thinking-left">
        <svg class="thinking-icon spinning" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <polyline points="12 6 12 12 16 14"/>
        </svg>
        <span class="thinking-title">${safeTitle}</span>
      </div>
      <div class="thinking-right">
        <span class="thinking-time"></span>
        <svg class="thinking-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </div>
    </button>
    <div class="thinking-body-wrap">
      <div class="thinking-body"></div>
    </div>
  `;

  const header = wrapper.querySelector('.thinking-header');
  const bodyWrap = wrapper.querySelector('.thinking-body-wrap');
  const bodyEl = wrapper.querySelector('.thinking-body');
  const chevron = wrapper.querySelector('.thinking-chevron');
  const timeEl = wrapper.querySelector('.thinking-time');
  const startedAt = Date.now();
  let isExpanded = false;
  let timerInterval = null;

  function updateTimer() {
    const elapsed = (Date.now() - startedAt) / 1000;
    timeEl.textContent = elapsed.toFixed(2) + 's';
  }

  function show() {
    wrapper.style.display = 'block';
    wrapper.style.opacity = '0';
    wrapper.style.transform = 'translateY(-6px)';
    requestAnimationFrame(() => {
      wrapper.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
      wrapper.style.opacity = '1';
      wrapper.style.transform = 'translateY(0)';
    });
    updateTimer();
    if (timerInterval) clearInterval(timerInterval);
    timerInterval = setInterval(updateTimer, 100);
  }

  function toggle() {
    isExpanded = !isExpanded;
    wrapper.classList.toggle('expanded', isExpanded);
    header.setAttribute('aria-expanded', String(isExpanded));
    
    if (isExpanded) {
      bodyWrap.style.maxHeight = bodyEl.scrollHeight + 20 + 'px';
    } else {
      bodyWrap.style.maxHeight = '0';
    }
  }

  header.addEventListener('click', toggle);

  header.addEventListener('mouseenter', () => {
    if (!wrapper.classList.contains('done')) {
      timeEl.style.display = 'none';
      chevron.style.display = 'block';
    }
  });

  header.addEventListener('mouseleave', () => {
    if (!wrapper.classList.contains('done')) {
      timeEl.style.display = 'block';
      chevron.style.display = 'none';
    }
  });

  function finish() {
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }
    wrapper.classList.add('done');
    
    const icon = wrapper.querySelector('.thinking-icon');
    icon.classList.remove('spinning');
    icon.innerHTML = `
      <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="2"/>
      <path d="M8 12l3 3 5-5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    `;
    
    const elapsed = (Date.now() - startedAt) / 1000;
    const displayTime = elapsed < 0.01 ? '<0.01s' : elapsed.toFixed(2) + 's';
    timeEl.textContent = displayTime;
    
    timeEl.style.display = 'block';
    chevron.style.display = 'none';
    
    header.addEventListener('mouseenter', () => {
      timeEl.style.display = 'none';
      chevron.style.display = 'block';
    });
    header.addEventListener('mouseleave', () => {
      timeEl.style.display = 'block';
      chevron.style.display = 'none';
    });
  }

  return {
    el: wrapper,
    show,
    appendText(chunk) {
      bodyEl.textContent += chunk;
      if (wrapper.classList.contains('expanded')) {
        bodyWrap.style.maxHeight = bodyEl.scrollHeight + 20 + 'px';
      }
    },
    finish,
    getStartedAt() { return startedAt; }
  };
}

function renderMessageContent(container, text, isUser) {
  container.innerHTML = '';

  if (isUser) {
    container.innerHTML = text.replace(/\n/g, '<br>');
    return;
  }

  const segments = extractCodeBlocks(text);

  if (segments.length === 1 && segments[0].type === 'text') {
    container.innerHTML = parseMarkdown(text);
    return;
  }

  for (const seg of segments) {
    if (seg.type === 'text') {
      if (seg.content.trim() === '') continue;
      const span = document.createElement('div');
      span.innerHTML = parseMarkdown(seg.content);
      container.appendChild(span);
    } else {
      container.appendChild(createCodeBlock(seg.lang, seg.fileName, seg.code));
    }
  }
}

function addMessage(text, isUser) {
  allMessages.push({ text, isUser });

  const msg = document.createElement('div');
  msg.className = 'chat-message';
  msg.style.cssText = `
    padding: 12px 16px;
    border-radius: 14px;
    max-width: 85%;
    word-wrap: break-word;
    font-size: 14px;
    line-height: 1.6;
    align-self: ${isUser ? 'flex-end' : 'flex-start'};
    background-color: ${isUser ? 'var(--text-primary)' : 'var(--btn-bg)'};
    color: ${isUser ? 'var(--bg-main)' : 'var(--text-primary)'};
    border: 1px solid var(--border-color);
    opacity: 0;
    transform: translateY(20px);
  `;

  if (!isUser && hasCodeBlock(text)) {
    msg.style.maxWidth = '100%';
  }

  renderMessageContent(msg, text, isUser);
  messagesContainer.appendChild(msg);

  requestAnimationFrame(() => {
    msg.style.transition = 'opacity 0.35s ease, transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)';
    msg.style.opacity = '1';
    msg.style.transform = 'translateY(0)';
  });

  scrollArea.scrollTop = scrollArea.scrollHeight;
  saveToStorage();
  return msg;
}

/* show typing indicator - "..." gray text */
let typingIndicator = null;

function showTypingIndicator() {
  if (typingIndicator) {
    typingIndicator.remove();
    typingIndicator = null;
  }

  typingIndicator = document.createElement('div');
  typingIndicator.className = 'typing-indicator';
  typingIndicator.style.cssText = `
    padding: 8px 16px;
    border-radius: 14px;
    align-self: flex-start;
    color: var(--text-muted);
    font-size: 16px;
    letter-spacing: 3px;
    opacity: 0;
    transform: translateY(10px);
    transition: opacity 0.3s ease, transform 0.3s ease;
  `;
  typingIndicator.textContent = '...';
  messagesContainer.appendChild(typingIndicator);

  requestAnimationFrame(() => {
    typingIndicator.style.opacity = '1';
    typingIndicator.style.transform = 'translateY(0)';
  });

  scrollArea.scrollTop = scrollArea.scrollHeight;

  /* show slow response hint after 15 seconds */
  let slowHintTimeout = setTimeout(() => {
    if (typingIndicator && typingIndicator.parentNode) {
      const hint = document.createElement('div');
      hint.style.cssText = `
        font-size: 12px;
        color: var(--text-muted);
        opacity: 0.6;
        padding: 4px 16px;
        margin-top: -4px;
        align-self: flex-start;
      `;
      hint.textContent = 'Ответ занимает больше обычного, но я усердно работаю! Попробуйте перезагрузить страницу, если ответ через чур долгий.';
      typingIndicator.after(hint);
      typingIndicator._hint = hint;
    }
  }, 15000);

  typingIndicator._slowHintTimeout = slowHintTimeout;
}

function hideTypingIndicator() {
  if (typingIndicator) {
    if (typingIndicator._slowHintTimeout) {
      clearTimeout(typingIndicator._slowHintTimeout);
    }
    if (typingIndicator._hint) {
      typingIndicator._hint.remove();
    }
    typingIndicator.remove();
    typingIndicator = null;
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function transitionToChat() {
  if (chatStarted) return;
  chatStarted = true;
  saveToStorage();

  title.style.transition = 'opacity 0.3s ease, transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
  title.style.opacity = '0';
  title.style.transform = 'translateY(-20px)';

  await sleep(200);

  subtitle.style.transition = 'opacity 0.3s ease, transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
  subtitle.style.opacity = '0';
  subtitle.style.transform = 'translateY(-20px)';

  await sleep(200);

  scrollArea.style.display = 'block';
  centerContent.style.justifyContent = 'flex-start';
  centerContent.style.paddingTop = '20px';
  centerContent.style.paddingBottom = '0';

  title.style.display = 'none';
  subtitle.style.display = 'none';
}

function resetToWelcome() {
  chatStarted = false;
  messageHistory = [];
  allMessages = [];
  messagesContainer.innerHTML = '';
  scrollArea.style.display = 'none';
  scrollArea.scrollTop = 0;
  saveToStorage();

  title.style.display = '';
  subtitle.style.display = '';
  title.style.opacity = '1';
  title.style.transform = 'translateY(0)';
  subtitle.style.opacity = '1';
  subtitle.style.transform = 'translateY(0)';
  title.style.transition = '';
  subtitle.style.transition = '';

  centerContent.style.justifyContent = 'center';
  centerContent.style.paddingTop = '';
  centerContent.style.paddingBottom = '';
}

function restoreAllMessages() {
  messagesContainer.innerHTML = '';
  for (const msg of allMessages) {
    const el = document.createElement('div');
    el.className = 'chat-message';
    el.style.cssText = `
      padding: 12px 16px;
      border-radius: 14px;
      max-width: 85%;
      word-wrap: break-word;
      font-size: 14px;
      line-height: 1.6;
      align-self: ${msg.isUser ? 'flex-end' : 'flex-start'};
      background-color: ${msg.isUser ? 'var(--text-primary)' : 'var(--btn-bg)'};
      color: ${msg.isUser ? 'var(--bg-main)' : 'var(--text-primary)'};
      border: 1px solid var(--border-color);
      opacity: 0;
      transform: translateY(20px);
    `;

    if (!msg.isUser && hasCodeBlock(msg.text)) {
      el.style.maxWidth = '100%';
    }

    renderMessageContent(el, msg.text, msg.isUser);
    messagesContainer.appendChild(el);

    requestAnimationFrame(() => {
      el.style.transition = 'opacity 0.35s ease, transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)';
      el.style.opacity = '1';
      el.style.transform = 'translateY(0)';
    });
  }
  scrollArea.scrollTop = scrollArea.scrollHeight;
}

/* stream response - no error messages, just typing indicator */
async function streamResponse() {
  let fullText = '';
  let reasoningText = '';
  let thinkingBlock = null;
  let hasContentStarted = false;

  showTypingIndicator();

  try {
    const response = await fetch(ASK_AI_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: messageHistory }),
    });

    if (!response.ok) {
      console.warn('Response error, retrying...');
      
      const retryResponse = await fetch(ASK_AI_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: messageHistory }),
      });
      
      if (!retryResponse.ok) {
        /* hide typing, show nothing */
        hideTypingIndicator();
        return fullText;
      }
      
      /* use retry response - only now hide typing */
      hideTypingIndicator();
      
      const reader = retryResponse.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      const streamingMsg = document.createElement('div');
      streamingMsg.className = 'chat-message';
      streamingMsg.id = 'streaming-message';
      streamingMsg.style.cssText = `
        padding: 12px 16px;
        border-radius: 14px;
        max-width: 85%;
        word-wrap: break-word;
        font-size: 14px;
        line-height: 1.6;
        align-self: flex-start;
        background-color: var(--btn-bg);
        color: var(--text-primary);
        border: 1px solid var(--border-color);
        opacity: 0;
        transform: translateY(20px);
      `;
      messagesContainer.appendChild(streamingMsg);

      requestAnimationFrame(() => {
        streamingMsg.style.transition = 'opacity 0.35s ease, transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)';
        streamingMsg.style.opacity = '1';
        streamingMsg.style.transform = 'translateY(0)';
      });

      const contentEl = document.createElement('div');
      streamingMsg.appendChild(contentEl);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') continue;

            try {
              const parsed = JSON.parse(data);
              const delta = parsed.choices?.[0]?.delta || {};

              const reasoningChunk = delta.reasoning || delta.reasoning_content;
              if (reasoningChunk) {
                if (!thinkingBlock) {
                  thinkingBlock = createThinkingBlock('Thinking');
                  streamingMsg.insertBefore(thinkingBlock.el, contentEl);
                  thinkingBlock.show();
                }
                reasoningText += reasoningChunk;
                thinkingBlock.appendText(reasoningChunk);
                scrollArea.scrollTop = scrollArea.scrollHeight;
              }

              const content = delta.content;
              if (content) {
                if (!hasContentStarted) {
                  hasContentStarted = true;
                }
                if (thinkingBlock && !thinkingBlock.el.classList.contains('done')) {
                  thinkingBlock.finish();
                }

                fullText += content;
                if (hasCodeBlock(fullText)) {
                  streamingMsg.style.maxWidth = '100%';
                }
                renderMessageContent(contentEl, fullText, false);
                scrollArea.scrollTop = scrollArea.scrollHeight;
              }
            } catch {
              /* skip invalid json */
            }
          }
        }
      }

      if (thinkingBlock && !thinkingBlock.el.classList.contains('done')) {
        thinkingBlock.finish();
      }

      streamingMsg.removeAttribute('id');

      if (fullText) {
        messageHistory.push({ role: 'assistant', content: fullText });
        if (messageHistory.length > MAX_HISTORY) {
          messageHistory = messageHistory.slice(-MAX_HISTORY);
        }
        allMessages.push({ text: fullText, isUser: false });
        saveToStorage();
      }

      /* final cleanup */
      hideTypingIndicator();
      return fullText;
    }

    /* successful response - only now hide typing */
    hideTypingIndicator();

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    const streamingMsg = document.createElement('div');
    streamingMsg.className = 'chat-message';
    streamingMsg.id = 'streaming-message';
    streamingMsg.style.cssText = `
      padding: 12px 16px;
      border-radius: 14px;
      max-width: 85%;
      word-wrap: break-word;
      font-size: 14px;
      line-height: 1.6;
      align-self: flex-start;
      background-color: var(--btn-bg);
      color: var(--text-primary);
      border: 1px solid var(--border-color);
      opacity: 0;
      transform: translateY(20px);
    `;
    messagesContainer.appendChild(streamingMsg);

    requestAnimationFrame(() => {
      streamingMsg.style.transition = 'opacity 0.35s ease, transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)';
      streamingMsg.style.opacity = '1';
      streamingMsg.style.transform = 'translateY(0)';
    });

    const contentEl = document.createElement('div');
    streamingMsg.appendChild(contentEl);

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') continue;

          try {
            const parsed = JSON.parse(data);
            const delta = parsed.choices?.[0]?.delta || {};

            const reasoningChunk = delta.reasoning || delta.reasoning_content;
            if (reasoningChunk) {
              if (!thinkingBlock) {
                thinkingBlock = createThinkingBlock('Thinking');
                streamingMsg.insertBefore(thinkingBlock.el, contentEl);
                thinkingBlock.show();
              }
              reasoningText += reasoningChunk;
              thinkingBlock.appendText(reasoningChunk);
              scrollArea.scrollTop = scrollArea.scrollHeight;
            }

            const content = delta.content;
            if (content) {
              if (!hasContentStarted) {
                hasContentStarted = true;
              }
              if (thinkingBlock && !thinkingBlock.el.classList.contains('done')) {
                thinkingBlock.finish();
              }

              fullText += content;
              if (hasCodeBlock(fullText)) {
                streamingMsg.style.maxWidth = '100%';
              }
              renderMessageContent(contentEl, fullText, false);
              scrollArea.scrollTop = scrollArea.scrollHeight;
            }
          } catch {
            /* skip invalid json */
          }
        }
      }
    }

    if (thinkingBlock && !thinkingBlock.el.classList.contains('done')) {
      thinkingBlock.finish();
    }

    streamingMsg.removeAttribute('id');

    if (fullText) {
      messageHistory.push({ role: 'assistant', content: fullText });
      if (messageHistory.length > MAX_HISTORY) {
        messageHistory = messageHistory.slice(-MAX_HISTORY);
      }
      allMessages.push({ text: fullText, isUser: false });
      saveToStorage();
    }
  } catch (error) {
    console.error('Stream error:', error);
    /* silently fail - no error message shown to user */
  }

  /* final cleanup */
  hideTypingIndicator();
  return fullText;
}

function initChat() {
  const wasStarted = loadFromStorage();
  if (wasStarted && allMessages.length > 0) {
    chatStarted = true;
    scrollArea.style.display = 'block';
    centerContent.style.justifyContent = 'flex-start';
    centerContent.style.paddingTop = '20px';
    centerContent.style.paddingBottom = '0';
    title.style.display = 'none';
    subtitle.style.display = 'none';
    restoreAllMessages();
  }

  input.addEventListener('input', function () {
    this.style.height = 'auto';
    this.style.height = Math.min(this.scrollHeight, 200) + 'px';
    sendBtn.classList.toggle('active', this.value.trim().length > 0);
  });

  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    const message = input.value.trim();

    if (message === '') {
      form.classList.add('shake');
      setTimeout(() => form.classList.remove('shake'), 400);
      return;
    }

    input.value = '';
    input.style.height = 'auto';
    sendBtn.classList.remove('active');
    input.focus();

    if (!chatStarted) {
      await transitionToChat();
    }

    messageHistory.push({ role: 'user', content: message });
    if (messageHistory.length > MAX_HISTORY) {
      messageHistory = messageHistory.slice(-MAX_HISTORY);
    }

    addMessage(message, true);
    await streamResponse();
  });

  input.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      form.dispatchEvent(new Event('submit'));
    }
  });

  let angle = 0, animationId;
  const rotateGradient = () => {
    angle = (angle + 0.5) % 360;
    inputBox.style.setProperty('--gradient-angle', `${angle}deg`);
    animationId = requestAnimationFrame(rotateGradient);
  };

  input.addEventListener('focus', () => {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    inputBox.style.setProperty('--glow-color', isDark ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.5)');
    inputBox.classList.add('glow-active');
    rotateGradient();
  });

  input.addEventListener('blur', () => {
    inputBox.classList.remove('glow-active');
    cancelAnimationFrame(animationId);
  });

  window.addEventListener('beforeunload', () => {
    if (animationId) cancelAnimationFrame(animationId);
  });

  const newChatBtn = document.getElementById('new-chat-btn');
  if (newChatBtn) {
    newChatBtn.addEventListener('click', () => {
      resetToWelcome();
    });
  }
}

export { initChat, resetToWelcome };