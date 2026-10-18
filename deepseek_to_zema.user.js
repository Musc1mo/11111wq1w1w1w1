// ==UserScript==
// @name         DeepSeek → Зёма (Open WebUI) Отправка кода
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Кнопка «📤 Отправить Зёме» рядом с блоками кода на DeepSeek. Открывает Open WebUI и вставляет код.
// @author       Зёма
// @match        https://chat.deepseek.com/*
// @match        http://89.110.97.143:3000/*
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_deleteValue
// @grant        GM_setClipboard
// @grant        window.close
// @run-at       document-idle
// ==/UserScript==

(function() {
    'use strict';

    const OPENWEBUI_URL = 'http://89.110.97.143:3000';
    const STORAGE_KEY = 'zema_pending_code';

    // ============================================================
    // ЧАСТЬ 1: ЛОГИКА НА OPEN WEBUI — вставка полученного кода
    // ============================================================
    if (window.location.origin === 'http://89.110.97.143:3000') {
        console.log('[Зёма] Open WebUI: проверяю входящий код...');
        const pendingCode = GM_getValue(STORAGE_KEY, null);
        if (pendingCode) {
            // Пробуем разные селекторы поля ввода (Open WebUI использует contenteditable)
            const insertCode = () => {
                // Open WebUI использует ProseMirror / tiptap
                // Пробуем contenteditable div внутри чата
                const selectors = [
                    'textarea',
                    'div[contenteditable="true"]',
                    '.prose mirror-editor',
                    '.chat-input textarea',
                    '[data-testid="chat-input"]',
                    'form textarea',
                    '.input-area div[contenteditable]',
                    '#chat-input',
                    '[placeholder*="Send"]',
                    '[placeholder*="сообщение"]',
                    '[placeholder*="message"]'
                ];
                let input = null;
                for (const sel of selectors) {
                    input = document.querySelector(sel);
                    if (input) break;
                }
                if (!input) {
                    // Если не нашли — пробуем найти любой contenteditable div
                    input = document.querySelector('div[contenteditable="true"]');
                }
                if (input) {
                    if (input.tagName === 'TEXTAREA' || input.tagName === 'INPUT') {
                        input.value = pendingCode;
                        input.dispatchEvent(new Event("input", { bubbles: true }));
                        input.dispatchEvent(new Event('change', { bubbles: true }));
                    } else if (input.isContentEditable) {
                        // contenteditable div
                        input.focus();
                        input.innerText = '';
                        document.execCommand('insertText', false, pendingCode);
                        input.dispatchEvent(new Event('input', { bubbles: true }));
                    }
                    // Ищем кнопку отправки
                    setTimeout(() => {
                        const sendBtns = document.querySelectorAll('button[type="submit"], button.send-button, [aria-label*="Send"], [aria-label*="Отправить"], svg[viewBox="0 0 24 24"]');
                        // Пробуем найти кнопку рядом
                        const allButtons = document.querySelectorAll('button');
                        let sendBtn = null;
                        for (const btn of allButtons) {
                            if (btn.innerText.includes('Send') || btn.innerText.includes('Отправить') || btn.innerHTML.includes('send') || btn.innerHTML.includes('arrow')) {
                                sendBtn = btn;
                                break;
                            }
                        }
                        if (sendBtn) {
                            sendBtn.click();
                        } else {
                            // Enter если ничего
                            const enterEvent = new KeyboardEvent('keydown', { key: 'Enter', code: 'Enter', bubbles: true });
                            input.dispatchEvent(enterEvent);
                        }
                        // Очищаем stored code
                        GM_deleteValue(STORAGE_KEY);
                        console.log('[Зёма] Код вставлен и отправлен!');
                    }, 500);
                } else {
                    // Если поле ввода не найдено — создаем алерт
                    alert('[Зёма] Код скопирован в буфер. Вставь его в поле ввода Open WebUI вручную.');
                    GM_deleteValue(STORAGE_KEY);
                }
            };
            // Если DOM ещё не готов — ждём
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', insertCode);
            } else {
                // Даём время на загрузку интерфейса
                setTimeout(insertCode, 1500);
            }
        }
        return; // На Open WebUI больше ничего не делаем
    }

    // ============================================================
    // ЧАСТЬ 2: ЛОГИКА НА DEEPSEEK — кнопки рядом с кодом
    // ============================================================
    console.log('[Зёма] DeepSeek: скрипт активирован');

    // Функция добавления кнопки к блоку кода
    function addSendButton(codeBlock) {
        // Проверяем, не добавлена ли уже кнопка
        if (codeBlock.parentElement && codeBlock.parentElement.querySelector('.zema-send-btn')) {
            return;
        }

        const btn = document.createElement('button');
        btn.className = 'zema-send-btn';
        btn.textContent = '📤 Отправить Зёме';
        btn.style.cssText = `
            position: absolute;
            top: 4px;
            right: 4px;
            z-index: 9999;
            background: #4f46e5;
            color: white;
            border: none;
            border-radius: 6px;
            padding: 4px 10px;
            font-size: 12px;
            cursor: pointer;
            opacity: 0.8;
            transition: opacity 0.2s;
            box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        `;
        btn.onmouseenter = () => { btn.style.opacity = '1'; };
        btn.onmouseleave = () => { btn.style.opacity = '0.8'; };

        btn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();

            let codeText = '';
            // Определяем текст кода
            if (codeBlock.tagName === 'CODE' || codeBlock.tagName === 'PRE') {
                codeText = codeBlock.textContent || codeBlock.innerText;
            } else {
                const codeEl = codeBlock.querySelector('code');
                codeText = (codeEl && (codeEl.textContent || codeEl.innerText)) || codeBlock.textContent || codeBlock.innerText;
            }

            // Обрезаем до 50000 символов
            if (codeText.length > 50000) {
                codeText = codeText.substring(0, 50000) + '\n\n... [truncated]';
            }

            // Копируем в буфер обмена
            GM_setClipboard(codeText);
            console.log('[Зёма] Код скопирован в буфер');

            // Сохраняем в GM storage
            GM_setValue(STORAGE_KEY, codeText);

            // Пробуем найти и переключиться на вкладку Open WebUI
            // Через window.open — если вкладка уже есть, она просто переключится
            const owWindow = window.open(OPENWEBUI_URL, 'zema_openwebui');
            if (owWindow) {
                owWindow.focus();
                btn.textContent = '✅ Отправлено!';
                btn.style.background = '#10b981';
                setTimeout(() => {
                    btn.textContent = '📤 Отправить Зёме';
                    btn.style.background = '#4f46e5';
                }, 2000);
            } else {
                // Если блокировщик всплывающих окон — копируем в буфер и сообщаем
                alert('[Зёма] Код скопирован в буфер. Открой ' + OPENWEBUI_URL + ' вручную — код вставится автоматически.');
            }
        });

        // Позиционируем кнопку относительно родителя
        const wrapper = codeBlock.parentElement;
        if (getComputedStyle(wrapper).position === 'static') {
            wrapper.style.position = 'relative';
        }
        wrapper.appendChild(btn);
    }

    // Основная функция поиска блоков кода
    function scanForCodeBlocks() {
        // Пробуем разные селекторы для блоков кода на DeepSeek
        const selectors = [
            'pre code',
            '.md-code-block',
            '[class*="code-block"]',
            '[class*="CodeBlock"]',
            'pre',
            'code[class*="language"]'
        ];

        let found = false;
        for (const sel of selectors) {
            const elements = document.querySelectorAll(sel);
            if (elements.length > 0) {
                elements.forEach(el => addSendButton(el));
                found = true;
            }
        }

        if (!found) {
            // Fallback: ищем любые pre или code элементы
            document.querySelectorAll('pre, code').forEach(el => addSendButton(el));
        }
    }

    // Запуск после загрузки страницы
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', scanForCodeBlocks);
    } else {
        scanForCodeBlocks();
    }

    // Реагируем на изменения DOM (подгрузка новых сообщений)
    let debounceTimer = null;
    const observer = new MutationObserver(() => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(scanForCodeBlocks, 500);
    });
    observer.observe(document.body, { childList: true, subtree: true });

    console.log('[Зёма] DeepSeek → Зёма скрипт загружен. Жду блоки кода...');
})();
