const sidebar = document.getElementById('sidebar');
const toggleBtn = document.getElementById('toggle-btn');
const sidebarOverlay = document.getElementById('sidebar-overlay');
const newChatBtn = document.getElementById('new-chat-btn');
const messageInput = document.getElementById('message-input');

let isSidebarVisible = localStorage.getItem('part-ai-sidebar') !== 'hidden';

const closeIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M9 3v18"/><path d="m16 15-3-3 3-3"/></svg>`;
const openIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M9 3v18"/><path d="m14 9 3 3-3 3"/></svg>`;

function isMobile() {
  return window.innerWidth <= 768;
}

function applySidebarState() {
  if (!sidebar) return;
  sidebar.classList.toggle('hidden', !isSidebarVisible);
  if (toggleBtn) toggleBtn.innerHTML = isSidebarVisible ? closeIcon : openIcon;
  if (isMobile()) {
    if (sidebarOverlay) sidebarOverlay.classList.toggle('active', isSidebarVisible);
  } else {
    if (sidebarOverlay) sidebarOverlay.classList.remove('active');
  }
}

function toggleSidebar() {
  isSidebarVisible = !isSidebarVisible;
  applySidebarState();
  if (!isMobile()) {
    localStorage.setItem('part-ai-sidebar', isSidebarVisible ? 'visible' : 'hidden');
  }
}

function initSidebar() {
  // Применяем сохранённое состояние сайдбара мгновенно, без анимации
  if (localStorage.getItem('part-ai-sidebar') === 'hidden') {
    isSidebarVisible = false;
    sidebar.classList.add('pre-hidden');
    // Убираем pre-hidden после первого рендера, чтобы анимация снова работала
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        sidebar.classList.remove('pre-hidden');
        applySidebarState();
      });
    });
  } else {
    applySidebarState();
  }

  if (toggleBtn) toggleBtn.addEventListener('click', toggleSidebar);
  if (sidebarOverlay) {
    sidebarOverlay.addEventListener('click', () => {
      if (isMobile() && isSidebarVisible) toggleSidebar();
    });
  }

  // Автоматически закрываем сайдбар на мобильных при старте, если он открыт
  if (isMobile() && isSidebarVisible) {
    toggleSidebar();
  }

  window.addEventListener('resize', () => {
    if (window.innerWidth > 768 && isSidebarVisible) {
      if (sidebarOverlay) sidebarOverlay.classList.remove('active');
    }
    applySidebarState();
  });

  if (newChatBtn) {
    newChatBtn.addEventListener('click', () => {
      if (messageInput) {
        messageInput.value = '';
        messageInput.focus();
      }
      if (isMobile() && isSidebarVisible) toggleSidebar();
    });
  }
}

export { initSidebar };