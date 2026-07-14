const themeToggle = document.getElementById('theme-toggle');
const themeIcon = document.getElementById('theme-icon');
const sparkleIcon = '<path d="M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z"/>';
const moonIcon = '<path d="M20.985 12.486a9 9 0 1 1-9.473-9.472c.405-.022.617.46.402.803a6 6 0 0 0 8.268 8.268c.344-.215.825-.004.803.401"/>';

function updateIcon(theme) {
  themeIcon.innerHTML = theme === 'dark' ? moonIcon : sparkleIcon;
}

function supportsViewTransitions() {
  return !!document.startViewTransition;
}

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  updateIcon(theme);
}

function initTheme() {
  // Тема уже применена в <head>, здесь только обновляем иконку
  const currentTheme = document.documentElement.getAttribute('data-theme');
  updateIcon(currentTheme);

  if (!supportsViewTransitions()) {
    document.body.classList.add('safari-fallback');
  }

  themeToggle.addEventListener('click', (e) => {
    const oldTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = oldTheme === 'dark' ? 'light' : 'dark';
    if (supportsViewTransitions()) {
      const x = e.clientX, y = e.clientY;
      const maxRadius = Math.hypot(
        Math.max(x, window.innerWidth - x),
        Math.max(y, window.innerHeight - y)
      );
      const transition = document.startViewTransition(() => {
        applyTheme(newTheme);
      });
      document.documentElement.style.setProperty('--x', `${x}px`);
      document.documentElement.style.setProperty('--y', `${y}px`);
      document.documentElement.style.setProperty('--r', `${maxRadius}px`);
      transition.finished.then(() => {
        localStorage.setItem('part-ai-theme', newTheme);
      });
    } else {
      applyTheme(newTheme);
      localStorage.setItem('part-ai-theme', newTheme);
    }
  });

  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    if (!localStorage.getItem('part-ai-theme')) {
      const newTheme = e.matches ? 'dark' : 'light';
      applyTheme(newTheme);
    }
  });
}

export { initTheme };