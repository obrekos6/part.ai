import { initTheme } from './theme.js';
import { initSidebar } from './sidebar.js';
import { initPlaceholder } from './placeholder.js';
import { initChat } from './chat.js';
import { openPanel, closePanel } from './preview.js';

// Динамический заголовок
const titles = ["Чем может помочь part.ai?", "Что сегодня создадим?", "Есть идея?", "О чём думаешь?"];
document.getElementById('dynamic-title').innerText = titles[Math.floor(Math.random() * titles.length)];

// Инициализация всех модулей
initTheme();
initSidebar();
initPlaceholder();
initChat();

// В конце файла или где удобно
window.partAi = { openPanel, closePanel };