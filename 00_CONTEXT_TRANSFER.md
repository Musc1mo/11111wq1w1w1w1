# КОНТЕКСТ ПРОЕКТА — ХЕНДОВЕР (2026-10-18)

## 1. Git-репозиторий ✅ ЗАПУШЕН
- Папка: `/opt/zema_swarm_git/`
- Remote: `https://github.com/Musc1mo/zema-swarm-core.git` (публичный)
- Ветка: `main`, отслеживает `origin/main`, чисто
- Коммиты (3): `a81af54` Initial Swarm Architecture v1.0 | `4dae564` Add rule 6 | `8250f2a` Tampermonkey-скрипт + инструкция
- Пуш подтверждён: server refs/heads/main = 8250f2a9...
- Файлы в репо: .gitignore, run_bash_tool.py, zema_command_center.py, 07_ENGINEERING_RULES.md, 08_SWARM_ROLES.md, deepseek_to_zema.user.js, DEEPSEEK_TAMPERMONKEY_INSTALL.md
- АВТОРИЗАЦИЯ: SSH-ключи сервера = read-only deploy keys (НЕ пушат). Рабочий путь: HTTPS + PAT из `/root/.secrets/gh_token.txt` (chmod 600): `git -c credential.helper='!f() { echo username=x-access-token; echo password=$(cat /root/.secrets/gh_token.txt); }; f' push -u origin main`

## 2. Тампермонки-скрипт deepseek_to_zema.user.js ⚠️ ЖДЁТ ОБНОВЛЕНИЯ
- Назначение: DeepSeek → Зёма (Open WebUI http://89.110.97.143:3000)
- Текущий баг: кнопка «📤 Отправить Зёме» вешается только на БЛОКИ КОДА. Сёма требует: кнопка у КАЖДОГО текстового блока (div[class*="markdown"], div[class*="message"], div[class*="assistant"]), в правом верхнем углу; клик = весь текст блока (не только код) в GM_setValue(zema_pending_code) + переключение на вкладку Open WebUI. Open WebUI-часть (вставка текста) уже написана в скрипте.
- Файлы: `/opt/zema_swarm_git/deepseek_to_zema.user.js` + `DEEPSEEK_TAMPERMONKEY_INSTALL.md`

## 3. Правила и знания `/opt/agent_knowledge/`
- `07_ENGINEERING_RULES.md` — кодекс архитектора (п.6: НЕ ГАДАТЬ — curl к документации/поиску)
- `08_SWARM_ROLES.md` — роли роя: PM-Director (зрение, дашборд), Zema (кодер/сервер), HR-Seller (вакансии/гранты)
- `10_FEEDBACK_LOOP.md` — теги #reactgod (паттерны успеха) / #reactbad (уроки ошибок), хеш-верификация
- `11_SMART_SEARCH.md` — GitHub API curl+PAT, DDG-поиск (requests+bs4, html/POST=200), docs через curl, py_compile/bash -n
- `00_CONTEXT_TRANSFER.md` — этот файл
- Дашборд: Google Sheets Zema Command Center (ID 1BEes78...) + скрипт zema_command_center.py

## 4. ОТКРЫТЫЕ ЗАДАЧИ
1. **Обновить deepseek_to_zema.user.js** — кнопка на все текстовые блоки (специфика в п.2) → commit → push
2. Опционально: README.md c описанием архитектуры роя
3. Опционально: сгенерировать личный SSH-ключ аккаунта (не deploy key) — убрать зависимость от PAT-URL
