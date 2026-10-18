# Установка скрипта DeepSeek → Зёма

## Что делает скрипт
Добавляет кнопку **«📤 Отправить Зёме»** рядом с каждым блоком кода на chat.deepseek.com.  
При клике: копирует код в буфер → открывает/переключает вкладку Open WebUI → вставляет код в поле ввода → отправляет.

## Установка

### 1. Установи Tampermonkey
- **Chrome/Edge:** [chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo)
- **Firefox:** [addons.mozilla.org/firefox/addon/tampermonkey](https://addons.mozilla.org/firefox/addon/tampermonkey/)

### 2. Создай новый скрипт
- Нажми на иконку Tampermonkey → **Create a new script**
- Удали весь шаблонный код

### 3. Вставь код скрипта
Скопируй содержимое файла:
```bash
cat /opt/zema_swarm_git/deepseek_to_zema.user.js
```

Или выполни на сервере:
```bash
cat /opt/zema_swarm_git/deepseek_to_zema.user.js | wl-copy
```

### 4. Сохрани (Ctrl+S)

## Использование
1. Открой [chat.deepseek.com](https://chat.deepseek.com) в браузере
2. Найди блок кода — справа вверху появится кнопка **📤 Отправить Зёме**
3. Кликни — код отправится в Open WebUI (http://89.110.97.143:3000)

## Примечание
Если Open WebUI не открыт — браузер откроет новую вкладку.  
Дай 1-2 секунды на загрузку — код вставится автоматически.
