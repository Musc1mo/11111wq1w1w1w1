// ==UserScript==
// @name         DeepSeek Экспорт чата в MD
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Плавающая кнопка «💾 Экспорт в MD» — выгружает весь диалог с DeepSeek в Markdown-файл
// @author       Зёма
// @match        https://chat.deepseek.com/*
// @grant        none
// @run-at       document-idle
// ==/UserScript==

(function() {
    'use strict';

    console.log('[Зёма] DeepSeek Экспортёр: загружен');

    // ============================================================
    // 1. Создаём плавающую кнопку
    // ============================================================
    const btn = document.createElement('button');
    btn.id = 'zema-export-btn';
    btn.textContent = '💾 Экспорт в MD';
    btn.style.cssText = [
        'position: fixed',
        'bottom: 24px',
        'right: 24px',
        'z-index: 99999',
        'background: #4f46e5',
        'color: white',
        'border: none',
        'border-radius: 12px',
        'padding: 12px 20px',
        'font-size: 15px',
        'font-weight: 600',
        'cursor: pointer',
        'box-shadow: 0 4px 16px rgba(79,70,229,0.4)',
        'opacity: 0.85',
        'transition: all 0.2s ease',
        'font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    ].join(';') + ';';

    btn.onmouseenter = function() { btn.style.opacity = '1'; btn.style.transform = 'scale(1.05)'; };
    btn.onmouseleave = function() { btn.style.opacity = '0.85'; btn.style.transform = 'scale(1)'; };
    btn.onmousedown = function() { btn.style.transform = 'scale(0.95)'; };
    btn.onmouseup = function() { btn.style.transform = 'scale(1.05)'; };

    document.body.appendChild(btn);

    // ============================================================
    // 2. Функция сбора чата
    // ============================================================
    function exportChatToMarkdown() {
        // Пробуем разные селекторы сообщений на DeepSeek
        var messages = [];

        // Стратегия 1: селекторы сообщений
        var messageSelectors = [
            'div[class*="message"]',
            'div[class*="chat-message"]',
            'div[class*="conversation-item"]',
            '[data-testid*="message"]'
        ];

        for (var i = 0; i < messageSelectors.length; i++) {
            var found = document.querySelectorAll(messageSelectors[i]);
            if (found.length > 0) {
                messages = Array.from(found);
                break;
            }
        }

        // Стратегия 2: блоки с ролями user/assistant
        if (messages.length === 0) {
            var roleSelectors = [
                'div[class*="user"]',
                'div[class*="assistant"]',
                'div[class*="User"]',
                'div[class*="Assistant"]',
                '[role="user"]',
                '[role="assistant"]'
            ];
            for (var j = 0; j < roleSelectors.length; j++) {
                var found2 = document.querySelectorAll(roleSelectors[j]);
                if (found2.length > 0) {
                    messages = Array.from(found2);
                    break;
                }
            }
        }

        // Стратегия 3: markdown-блоки
        if (messages.length === 0) {
            var mdSelectors = [
                '.md-code-block',
                '.markdown-body',
                '.prose',
                '[class*="markdown"]'
            ];
            for (var k = 0; k < mdSelectors.length; k++) {
                var found3 = document.querySelectorAll(mdSelectors[k]);
                if (found3.length > 0) {
                    // Группируем по родительским блокам
                    var parents = {};
                    found3.forEach(function(el) {
                        var parent = el.closest('div[class*="user"], div[class*="assistant"], div[class*="message"]');
                        if (parent) {
                            var key = parent.className + '_' + parent.innerHTML.length;
                            parents[key] = parent;
                        }
                    });
                    var parentArr = Object.values(parents);
                    if (parentArr.length > 0) {
                        messages = parentArr;
                    } else {
                        messages = Array.from(found3);
                    }
                    break;
                }
            }
        }

        // Стратегия 4: любые div с текстом в основном контейнере
        if (messages.length === 0) {
            var chatContainer = document.querySelector(
                '[class*="chat"], [class*="conversation"], main, article, [class*="dialog"]'
            );
            if (chatContainer) {
                var allDivs = chatContainer.querySelectorAll('div > div');
                var tempMessages = [];
                allDivs.forEach(function(el) {
                    var text = (el.textContent || '').trim();
                    if (text.length > 50) {
                        tempMessages.push(el);
                    }
                });
                if (tempMessages.length > 0) {
                    messages = tempMessages;
                }
            }
        }

        if (messages.length === 0) {
            alert('[Зёма] Не найдено ни одного сообщения. Открой диалог с DeepSeek и попробуй ещё раз.');
            return null;
        }

        // Собираем Markdown
        var markdown = '# DeepSeek Chat Export\n\n';
        markdown += '*Экспортировано: ' + new Date().toLocaleString() + '*\n\n';
        markdown += '---\n\n';

        messages.forEach(function(msg, idx) {
            var classList = msg.className || '';
            var role = 'Unknown';
            if (/user/i.test(classList)) role = 'User';
            else if (/assistant/i.test(classList)) role = 'Assistant';
            else if (/system/i.test(classList)) role = 'System';
            else if (/tool/i.test(classList)) role = 'Tool';
            else {
                role = (idx % 2 === 0) ? 'User' : 'Assistant';
            }

            // Собираем текст
            var text = '';

            // Ищем параграфы
            var paragraphs = msg.querySelectorAll('p, li, h1, h2, h3, h4, h5, h6');
            if (paragraphs.length > 0) {
                paragraphs.forEach(function(p) {
                    var pText = (p.textContent || '').trim();
                    if (pText) {
                        var tag = p.tagName.toLowerCase();
                        if (tag.match(/^h[1-6]$/)) {
                            var level = tag.charAt(1);
                            text += '#'.repeat(parseInt(level)) + ' ' + pText + '\n\n';
                        } else if (tag === 'li') {
                            text += '- ' + pText + '\n';
                        } else {
                            text += pText + '\n\n';
                        }
                    }
                });
            }

            // Ищем блоки кода
            var codeBlocks = msg.querySelectorAll('pre code');
            codeBlocks.forEach(function(code) {
                var lang = '';
                var match = (code.className || '').match(/language-(\w+)/);
                if (match) lang = match[1];
                var codeText = code.textContent || code.innerText || '';
                text += '```' + lang + '\n' + codeText + '\n```\n\n';
            });

            // Если ничего не нашли — берём весь текст
            if (!text.trim()) {
                text = msg.innerText || msg.textContent || '';
            }

            if (text.trim()) {
                markdown += '### ' + role + '\n\n' + text.trim() + '\n\n---\n\n';
            }
        });

        // Формируем имя файла
        var now = new Date();
        var pad = function(n) { return String(n).padStart(2, '0'); };
        var filename = 'deepseek_chat_' +
            now.getFullYear() + '-' +
            pad(now.getMonth() + 1) + '-' +
            pad(now.getDate()) + '_' +
            pad(now.getHours()) + '-' +
            pad(now.getMinutes()) + '.md';

        return { text: markdown, filename: filename };
    }

    // ============================================================
    // Функция скачивания
    // ============================================================
    function downloadMarkdown(text, filename) {
        var blob = new Blob([text], { type: 'text/markdown;charset=utf-8' });
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.style.display = 'none';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        console.log('[Зёма] Файл скачан: ' + filename);
    }

    // ============================================================
    // 3. Обработчик клика
    // ============================================================
    btn.addEventListener('click', function() {
        var origText = btn.textContent;
        btn.textContent = '⏳ Сбор...';
        btn.style.background = '#f59e0b';
        btn.disabled = true;

        setTimeout(function() {
            try {
                var result = exportChatToMarkdown();
                if (result) {
                    downloadMarkdown(result.text, result.filename);
                    btn.textContent = '✅ Скачано!';
                    btn.style.background = '#10b981';
                } else {
                    btn.textContent = '❌ Нет сообщений';
                    btn.style.background = '#ef4444';
                }
            } catch (err) {
                console.error('[Зёма] Ошибка:', err);
                btn.textContent = '❌ Ошибка';
                btn.style.background = '#ef4444';
            }

            setTimeout(function() {
                btn.textContent = origText;
                btn.style.background = '#4f46e5';
                btn.disabled = false;
            }, 2500);
        }, 100);
    });

    // ============================================================
    // 4. Наблюдатель — восстановление кнопки
    // ============================================================
    var observer = new MutationObserver(function() {
        if (!document.getElementById('zema-export-btn')) {
            document.body.appendChild(btn);
            console.log('[Зёма] Кнопка восстановлена');
        }
    });
    observer.observe(document.body, { childList: true, subtree: true });

    console.log('[Зёма] DeepSeek Экспортёр: готов. Кнопка в правом нижнем углу.');
})();
