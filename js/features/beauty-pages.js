// beauty-pages.js - 全局美化页面（双击解锁拖动，单击切换页面）
(function() {
    'use strict';

    var STORAGE_KEY = 'beauty_pages_config';
    var PAGE_COUNT = 3;

    var DEFAULT_CONFIG = {
        showIndicator: true,
        indicatorPos: null,
        pages: [
            { type: 'chat', label: '聊天' },
            {
                type: 'beauty',
                label: '阿晏&小回',
                bgImage: '',
                avatar: '',
                title: '',
                subtitle: '',
                tags: [
                    { key: '昵称', value: '小回' },
                    { key: '副文', value: '星河入梦' },
                    { key: '标签', value: '✨ 温柔' },
                    { key: '文案', value: '你是人间理想' },
                    { key: '注册', value: '2026-08-29' },
                    { key: '标题', value: '✨ 星河入梦 ✨' }
                ],
                textColor: '#ffffff',
                fontSize: 20,
                subtitleColor: 'rgba(255,255,255,0.7)',
                subtitleSize: 14,
                tagColor: 'rgba(255,255,255,0.85)',
                tagSize: 16
            },
            {
                type: 'beauty',
                label: '阿晏&66',
                bgImage: '',
                avatar: '',
                title: '',
                subtitle: '',
                tags: [
                    { key: '昵称', value: '66' },
                    { key: '副文', value: '月色温柔' },
                    { key: '标签', value: '🌙 偏爱' },
                    { key: '文案', value: '你是我唯一的偏爱' },
                    { key: '注册', value: '2026-08-29' },
                    { key: '标题', value: '🌙 月色温柔 🌙' }
                ],
                textColor: '#ffffff',
                fontSize: 20,
                subtitleColor: 'rgba(255,255,255,0.7)',
                subtitleSize: 14,
                tagColor: 'rgba(255,255,255,0.85)',
                tagSize: 16
            }
        ],
        currentIndex: 0
    };

    var config = null;
    var isAnimating = false;

    // ---- 拖动相关 ----
    var isDraggable = false;          // 是否允许拖动（双击解锁）
    var indicatorDragging = false;
    var dragStartX = 0, dragStartY = 0;
    var dragOrigLeft = 0, dragOrigTop = 0;
    var longPressTimer = null;        // 长按定时器
    var isLongPress = false;

    function _getConfig() {
        try {
            var saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                var parsed = JSON.parse(saved);
                if (parsed.showIndicator === undefined) parsed.showIndicator = true;
                for (var i = 0; i < DEFAULT_CONFIG.pages.length; i++) {
                    if (!parsed.pages[i]) parsed.pages[i] = DEFAULT_CONFIG.pages[i];
                    for (var key in DEFAULT_CONFIG.pages[i]) {
                        if (parsed.pages[i][key] === undefined) {
                            parsed.pages[i][key] = DEFAULT_CONFIG.pages[i][key];
                        }
                    }
                }
                return parsed;
            }
        } catch(e) {}
        return JSON.parse(JSON.stringify(DEFAULT_CONFIG));
    }

    function _saveConfig() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
        } catch(e) {}
    }

    function _esc(s) {
        return String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
    }

    function _notify(msg, type, duration) {
        type = type || 'info';
        duration = duration || 2000;
        if (typeof showNotification === 'function') {
            showNotification(msg, type, duration);
        } else {
            alert(msg);
        }
    }

    function updateBeautyPage(index) {
        var pageData = config.pages[index];
        if (!pageData || pageData.type !== 'beauty') return;

        var pageEl = document.querySelector('.beauty-page-' + index);
        if (!pageEl) return;

        var bgLayer = pageEl.querySelector('.beauty-bg-layer');
        if (bgLayer) {
            if (pageData.bgImage) {
                bgLayer.style.backgroundImage = 'url(' + pageData.bgImage + ')';
                bgLayer.style.opacity = '1';
            } else {
                bgLayer.style.backgroundImage = '';
                bgLayer.style.opacity = '0';
            }
        }

        var tagContainer = pageEl.querySelector('.beauty-tags');
        if (tagContainer) {
            tagContainer.innerHTML = '';
            var tags = pageData.tags || [];
            if (tags.length === 0) {
                var empty = document.createElement('div');
                empty.style.cssText = 'text-align:center;padding:20px;color:rgba(255,255,255,0.3);font-size:14px;';
                empty.textContent = '点击添加标签';
                empty.addEventListener('click', function(e) {
                    e.stopPropagation();
                    openBeautySettings(index);
                });
                tagContainer.appendChild(empty);
            } else {
                tags.forEach(function(tag) {
                    var row = document.createElement('div');
                    row.className = 'beauty-tag-row';
                    row.style.cssText = `
                        display: flex;
                        justify-content: space-between;
                        padding: 12px 0;
                        border-bottom: 1px solid rgba(255,255,255,0.06);
                        font-size: ${pageData.tagSize || 16}px;
                        color: ${pageData.tagColor || 'rgba(255,255,255,0.85)'};
                        cursor: pointer;
                        transition: background 0.2s;
                        align-items: center;
                    `;
                    row.innerHTML = `
                        <span style="opacity:0.6;font-weight:300;">${_esc(tag.key)}</span>
                        <span style="font-weight:400;">${_esc(tag.value)}</span>
                    `;
                    row.addEventListener('click', function(e) {
                        e.stopPropagation();
                        openBeautySettings(index);
                    });
                    tagContainer.appendChild(row);
                });
            }
        }
    }

    function refreshAllPages() {
        for (var i = 0; i < config.pages.length; i++) {
            if (config.pages[i].type === 'beauty') {
                updateBeautyPage(i);
            }
        }
        updateIndicatorVisibility();
        restoreIndicatorPosition();
        updateDragModeUI();
    }

    function goToPage(index, animate) {
        if (isAnimating) return;
        if (index < 0 || index >= PAGE_COUNT) return;

        var track = document.getElementById('beauty-pages-track');
        if (!track) return;

        config.currentIndex = index;
        _saveConfig();

        var offset = -index * 100;
        if (animate !== false) {
            isAnimating = true;
            track.style.transition = 'transform 0.4s cubic-bezier(0.22, 1, 0.36, 1)';
        } else {
            track.style.transition = 'none';
        }

        track.style.transform = 'translateX(' + offset + '%)';

        if (animate !== false) {
            setTimeout(function() { isAnimating = false; }, 450);
        } else {
            isAnimating = false;
        }

        updateIndicator(index);
    }

    function updateIndicator(index) {
        var dots = document.querySelectorAll('.beauty-dot');
        dots.forEach(function(dot, i) {
            if (i === index) {
                dot.style.background = 'var(--accent-color, #e0698a)';
                dot.style.width = '18px';
                dot.style.borderRadius = '4px';
            } else {
                dot.style.background = 'rgba(255,255,255,0.3)';
                dot.style.width = '8px';
                dot.style.borderRadius = '50%';
            }
        });
    }

    function updateIndicatorVisibility() {
        var indicator = document.getElementById('beauty-indicator');
        if (indicator) {
            indicator.style.display = config.showIndicator ? 'flex' : 'none';
        }
    }

    function saveIndicatorPosition(left, top) {
        config.indicatorPos = { left: left, top: top };
        _saveConfig();
    }

    function restoreIndicatorPosition() {
        var indicator = document.getElementById('beauty-indicator');
        if (!indicator) return;
        if (config.indicatorPos) {
            indicator.style.left = config.indicatorPos.left + 'px';
            indicator.style.top = config.indicatorPos.top + 'px';
            indicator.style.right = 'auto';
            indicator.style.bottom = 'auto';
            indicator.style.transform = 'none';
        } else {
            indicator.style.left = '50%';
            indicator.style.top = 'auto';
            indicator.style.bottom = '130px';
            indicator.style.right = 'auto';
            indicator.style.transform = 'translateX(-50%)';
        }
    }

    function updateDragModeUI() {
        var indicator = document.getElementById('beauty-indicator');
        if (!indicator) return;
        if (isDraggable) {
            indicator.style.border = '1px solid var(--accent-color, #e0698a)';
            indicator.style.boxShadow = '0 0 20px rgba(var(--accent-color-rgb, 224,105,138), 0.3)';
            indicator.style.cursor = 'grab';
            indicator.title = '拖动模式：单击切换页面，长按拖动';
        } else {
            indicator.style.border = '1px solid rgba(255,255,255,0.06)';
            indicator.style.boxShadow = 'none';
            indicator.style.cursor = 'pointer';
            indicator.title = '双击进入拖动模式';
        }
    }

    // =============================================
    // 指示器事件处理（单击切换页面，长按拖动）
    // =============================================
    function handleIndicatorClick(e) {
        e.stopPropagation();
        // 如果正在拖动，不处理点击
        if (indicatorDragging) return;
        var dot = e.target.closest('.beauty-dot');
        if (dot) {
            var idx = parseInt(dot.dataset.index);
            if (idx !== config.currentIndex) {
                goToPage(idx, true);
            }
        }
    }

    function handleIndicatorDoubleClick(e) {
        e.stopPropagation();
        isDraggable = !isDraggable;
        updateDragModeUI();
        if (isDraggable) {
            _notify('🔓 已解锁拖动（长按拖动）', 'info', 1500);
        } else {
            _notify('🔒 已锁定指示器', 'info', 1500);
            var indicator = document.getElementById('beauty-indicator');
            if (indicator) {
                var rect = indicator.getBoundingClientRect();
                saveIndicatorPosition(rect.left, rect.top);
            }
        }
    }

    // =============================================
    // 创建可拖动指示器
    // =============================================
    function addIndicator(wrapper) {
        var indicator = document.createElement('div');
        indicator.id = 'beauty-indicator';
        indicator.style.cssText = `
            position: fixed;
            z-index: 1000;
            display: flex;
            gap: 8px;
            background: rgba(0,0,0,0.25);
            backdrop-filter: blur(6px);
            padding: 4px 12px;
            border-radius: 16px;
            border: 1px solid rgba(255,255,255,0.06);
            cursor: pointer;
            user-select: none;
            touch-action: none;
            transition: border 0.3s, box-shadow 0.3s;
        `;
        indicator.title = '双击进入拖动模式';

        if (config.indicatorPos) {
            indicator.style.left = config.indicatorPos.left + 'px';
            indicator.style.top = config.indicatorPos.top + 'px';
            indicator.style.right = 'auto';
            indicator.style.bottom = 'auto';
            indicator.style.transform = 'none';
        } else {
            indicator.style.left = '50%';
            indicator.style.top = 'auto';
            indicator.style.bottom = '130px';
            indicator.style.right = 'auto';
            indicator.style.transform = 'translateX(-50%)';
        }

        var labels = ['💬 聊天', '🌸 小回', '🌙 66'];

        for (var i = 0; i < PAGE_COUNT; i++) {
            var dot = document.createElement('button');
            dot.className = 'beauty-dot';
            dot.dataset.index = i;
            dot.style.cssText = `
                width: ${i === config.currentIndex ? '16px' : '8px'};
                height: 6px;
                border-radius: ${i === config.currentIndex ? '3px' : '50%'};
                border: none;
                cursor: pointer;
                transition: all 0.3s ease;
                background: ${i === config.currentIndex ? 'var(--accent-color, #e0698a)' : 'rgba(255,255,255,0.3)'};
                padding: 0;
                flex-shrink: 0;
                pointer-events: auto;
            `;
            dot.title = labels[i];
            indicator.appendChild(dot);
        }

        // ---- 双击检测 ----
        var lastClickTime = 0;
        indicator.addEventListener('click', function(e) {
            var now = Date.now();
            if (now - lastClickTime < 400) {
                // 双击
                handleIndicatorDoubleClick(e);
                lastClickTime = 0;
            } else {
                lastClickTime = now;
                setTimeout(function() {
                    if (Date.now() - lastClickTime < 300) return;
                    handleIndicatorClick(e);
                }, 250);
            }
        });

        // ---- 长按拖动（仅在 isDraggable 为 true 时生效） ----
        var pressTimer = null;
        var isPressed = false;

        function startPress(e) {
            if (!isDraggable) return;
            isPressed = true;
            indicatorDragging = false;
            var clientX = e.clientX || e.touches[0].clientX;
            var clientY = e.clientY || e.touches[0].clientY;
            var rect = indicator.getBoundingClientRect();
            dragStartX = clientX - rect.left;
            dragStartY = clientY - rect.top;
            dragOrigLeft = rect.left;
            dragOrigTop = rect.top;
            // 长按 300ms 后进入拖动模式
            pressTimer = setTimeout(function() {
                if (isPressed) {
                    indicatorDragging = true;
                    indicator.style.cursor = 'grabbing';
                    if (e.cancelable) e.preventDefault();
                }
            }, 300);
        }

        function movePress(e) {
            if (!isDraggable || !isPressed) return;
            var clientX = e.clientX || e.touches[0].clientX;
            var clientY = e.clientY || e.touches[0].clientY;
            // 如果已经进入拖动模式，移动指示器
            if (indicatorDragging) {
                var newLeft = clientX - dragStartX;
                var newTop = clientY - dragStartY;
                var maxX = window.innerWidth - indicator.offsetWidth;
                var maxY = window.innerHeight - indicator.offsetHeight;
                newLeft = Math.max(0, Math.min(newLeft, maxX));
                newTop = Math.max(0, Math.min(newTop, maxY));
                indicator.style.left = newLeft + 'px';
                indicator.style.top = newTop + 'px';
                indicator.style.right = 'auto';
                indicator.style.bottom = 'auto';
                indicator.style.transform = 'none';
                if (e.cancelable) e.preventDefault();
            } else {
                // 如果移动距离过大，取消长按（防止长按被误触）
                var rect = indicator.getBoundingClientRect();
                var dx = (clientX - dragStartX - rect.left);
                var dy = (clientY - dragStartY - rect.top);
                if (Math.abs(dx) > 10 || Math.abs(dy) > 10) {
                    clearTimeout(pressTimer);
                    isPressed = false;
                    indicator.style.cursor = 'grab';
                }
            }
        }

        function endPress(e) {
            clearTimeout(pressTimer);
            if (indicatorDragging) {
                // 拖动结束，保存位置
                var rect = indicator.getBoundingClientRect();
                saveIndicatorPosition(rect.left, rect.top);
                indicatorDragging = false;
                indicator.style.cursor = 'grab';
            }
            isPressed = false;
            if (e.cancelable) e.preventDefault();
        }

        // 鼠标事件
        indicator.addEventListener('mousedown', startPress);
        document.addEventListener('mousemove', movePress);
        document.addEventListener('mouseup', endPress);

        // 触摸事件
        indicator.addEventListener('touchstart', startPress, { passive: false });
        document.addEventListener('touchmove', movePress, { passive: false });
        document.addEventListener('touchend', endPress, { passive: false });

        // 阻止在拖动时触发页面滑动
        indicator.addEventListener('touchmove', function(e) {
            if (indicatorDragging) e.stopPropagation();
        }, { passive: false });

        if (!config.showIndicator) {
            indicator.style.display = 'none';
        }

        wrapper.appendChild(indicator);
        updateDragModeUI();
    }

    // =============================================
    // 页面滑动（与指示器隔离）
    // =============================================
    function bindTouchEvents(wrapper, track) {
        var startX = 0, startIndex = 0, isDragging = false;

        wrapper.addEventListener('touchstart', function(e) {
            if (isAnimating) return;
            if (e.target.closest('#beauty-indicator')) return;
            var touch = e.touches[0];
            startX = touch.clientX;
            startIndex = config.currentIndex || 0;
            isDragging = true;
            track.style.transition = 'none';
        }, { passive: true });

        wrapper.addEventListener('touchmove', function(e) {
            if (!isDragging || isAnimating) return;
            if (e.target.closest('#beauty-indicator')) return;
            var touch = e.touches[0];
            var diff = touch.clientX - startX;
            var offset = -startIndex * 100 + (diff / wrapper.offsetWidth * 100);
            offset = Math.min(0, Math.max(offset, -(PAGE_COUNT - 1) * 100));
            track.style.transform = 'translateX(' + offset + '%)';
        }, { passive: true });

        wrapper.addEventListener('touchend', function(e) {
            if (!isDragging) return;
            isDragging = false;
            if (e.target.closest('#beauty-indicator')) return;
            var diff = 0;
            var lastTouch = e.changedTouches[0];
            if (lastTouch) diff = lastTouch.clientX - startX;
            var threshold = 50;
            var newIndex = startIndex;
            if (diff < -threshold) newIndex = Math.min(startIndex + 1, PAGE_COUNT - 1);
            else if (diff > threshold) newIndex = Math.max(startIndex - 1, 0);
            goToPage(newIndex, true);
        }, { passive: true });

        var mouseDown = false, mouseStartX = 0, mouseStartIndex = 0;
        wrapper.addEventListener('mousedown', function(e) {
            if (isAnimating) return;
            if (e.button !== 0) return;
            if (e.target.closest('#beauty-indicator')) return;
            mouseDown = true;
            mouseStartX = e.clientX;
            mouseStartIndex = config.currentIndex || 0;
            track.style.transition = 'none';
            e.preventDefault();
        });

        document.addEventListener('mousemove', function(e) {
            if (!mouseDown || isAnimating) return;
            if (e.target.closest('#beauty-indicator')) return;
            var diff = e.clientX - mouseStartX;
            var offset = -mouseStartIndex * 100 + (diff / wrapper.offsetWidth * 100);
            offset = Math.min(0, Math.max(offset, -(PAGE_COUNT - 1) * 100));
            track.style.transform = 'translateX(' + offset + '%)';
        });

        document.addEventListener('mouseup', function(e) {
            if (!mouseDown) return;
            mouseDown = false;
            if (e.target.closest('#beauty-indicator')) return;
            var diff = e.clientX - mouseStartX;
            var threshold = 50;
            var newIndex = mouseStartIndex;
            if (diff < -threshold) newIndex = Math.min(mouseStartIndex + 1, PAGE_COUNT - 1);
            else if (diff > threshold) newIndex = Math.max(mouseStartIndex - 1, 0);
            goToPage(newIndex, true);
        });
    }

    // =============================================
    // 顶部栏布局
    // =============================================
    function modifyHeaderLayout() {
        var headerInner = document.querySelector('.header-inner');
        if (!headerInner) {
            setTimeout(modifyHeaderLayout, 500);
            return;
        }

        if (headerInner.dataset.beautyModified === 'true') return;
        headerInner.dataset.beautyModified = 'true';

        var userInfos = headerInner.querySelectorAll('.user-info');
        if (userInfos.length < 2) return;

        var leftUser = userInfos[0];
        var rightUser = userInfos[1];

        function restructureUser(userEl, isLeft) {
            var nameEl = userEl.querySelector('.username');
            var avatarContainer = userEl.querySelector('.avatar-container');
            var statusEl = userEl.querySelector('.status');

            if (!nameEl || !avatarContainer || !statusEl) return;

            var nameText = nameEl.textContent || '';
            var statusText = statusEl.querySelector('span') ? statusEl.querySelector('span').textContent : '在线';
            var avatarHTML = avatarContainer.innerHTML;

            userEl.innerHTML = '';
            userEl.style.cssText = 'display:flex;align-items:center;gap:8px;flex-shrink:0;';

            var avatarWrap = document.createElement('div');
            avatarWrap.style.cssText = 'width:32px;height:32px;flex-shrink:0;border-radius:50%;overflow:hidden;background:rgba(var(--accent-color-rgb,224,105,138),0.15);display:flex;align-items:center;justify-content:center;';
            avatarWrap.innerHTML = avatarHTML;
            var img = avatarWrap.querySelector('img');
            if (img) {
                img.style.cssText = 'width:100%;height:100%;object-fit:cover;';
            } else {
                var icon = avatarWrap.querySelector('i');
                if (icon) {
                    icon.style.cssText = 'font-size:16px;color:var(--text-secondary);';
                } else {
                    avatarWrap.innerHTML = '<i class="fas fa-user" style="font-size:16px;color:var(--text-secondary);"></i>';
                }
            }
            userEl.appendChild(avatarWrap);

            var infoWrap = document.createElement('div');
            infoWrap.style.cssText = 'display:flex;flex-direction:column;line-height:1.2;';

            var nameClone = document.createElement('div');
            nameClone.className = 'username';
            nameClone.style.cssText = 'font-size:14px;font-weight:600;color:var(--text-primary);';
            nameClone.textContent = nameText;
            infoWrap.appendChild(nameClone);

            var statusClone = document.createElement('div');
            statusClone.className = 'status';
            statusClone.style.cssText = 'font-size:10px;color:var(--text-secondary);opacity:0.7;';
            statusClone.textContent = statusText;
            infoWrap.appendChild(statusClone);

            userEl.appendChild(infoWrap);

            if (!isLeft) {
                userEl.style.marginLeft = 'auto';
            }
        }

        restructureUser(leftUser, true);
        restructureUser(rightUser, false);

        headerInner.style.cssText = 'display:flex;justify-content:space-between;align-items:center;padding:4px 12px;';
    }

    // =============================================
    // 初始化页面
    // =============================================
    function createBeautyPage(index) {
        var page = document.createElement('div');
        page.className = 'beauty-page beauty-page-' + index;
        page.style.cssText = `
            flex: 0 0 100%;
            height: 100%;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            position: relative;
            overflow: hidden;
            background: linear-gradient(135deg, #0f0c29, #302b63, #24243e);
            padding: 20px;
            box-sizing: border-box;
        `;

        var bgLayer = document.createElement('div');
        bgLayer.className = 'beauty-bg-layer';
        bgLayer.style.cssText = `
            position: absolute;
            inset: 0;
            background-size: cover;
            background-position: center;
            background-repeat: no-repeat;
            z-index: 0;
            transition: opacity 0.5s ease;
            opacity: 0;
            cursor: pointer;
        `;
        bgLayer.addEventListener('click', function(e) {
            e.stopPropagation();
            openBeautySettings(index);
        });
        page.appendChild(bgLayer);

        var card = document.createElement('div');
        card.className = 'beauty-card';
        card.style.cssText = `
            position: relative;
            z-index: 1;
            background: rgba(255,255,255,0.04);
            backdrop-filter: blur(8px);
            -webkit-backdrop-filter: blur(8px);
            border-radius: 16px;
            padding: 16px 20px;
            width: 100%;
            max-width: 360px;
            border: 1px solid rgba(255,255,255,0.06);
            box-shadow: 0 4px 20px rgba(0,0,0,0.15);
        `;

        var tagContainer = document.createElement('div');
        tagContainer.className = 'beauty-tags';
        tagContainer.style.cssText = `
            display: flex;
            flex-direction: column;
            gap: 2px;
        `;
        card.appendChild(tagContainer);

        page.appendChild(card);
        updateBeautyPage(index);

        return page;
    }

    function initBeautyPages() {
        config = _getConfig();

        if (document.getElementById('beauty-pages-wrapper')) {
            return;
        }

        var chatContainer = document.querySelector('.main-chat-area');
        if (!chatContainer) {
            console.warn('[美化页面] 找不到聊天容器');
            return;
        }

        var wrapper = document.createElement('div');
        wrapper.id = 'beauty-pages-wrapper';
        wrapper.style.cssText = `
            position: relative;
            width: 100%;
            height: 100%;
            overflow: hidden;
            touch-action: pan-y;
        `;

        var track = document.createElement('div');
        track.id = 'beauty-pages-track';
        track.style.cssText = `
            display: flex;
            height: 100%;
            transition: transform 0.4s cubic-bezier(0.22, 1, 0.36, 1);
            will-change: transform;
        `;

        var chatPage = document.createElement('div');
        chatPage.className = 'beauty-page beauty-page-chat';
        chatPage.style.cssText = `
            flex: 0 0 100%;
            height: 100%;
            overflow-y: auto;
            position: relative;
        `;
        while (chatContainer.firstChild) {
            chatPage.appendChild(chatContainer.firstChild);
        }
        track.appendChild(chatPage);

        var beautyPage1 = createBeautyPage(1);
        track.appendChild(beautyPage1);

        var beautyPage2 = createBeautyPage(2);
        track.appendChild(beautyPage2);

        wrapper.appendChild(track);
        chatContainer.appendChild(wrapper);

        addIndicator(wrapper);
        goToPage(config.currentIndex || 0, false);
        bindTouchEvents(wrapper, track);

        window.beautyPages = {
            goToPage: goToPage,
            openSettings: openBeautySettings,
            getConfig: function() { return config; },
            refresh: refreshAllPages
        };

        console.log('[美化页面] 已初始化');
    }

    // =============================================
    // 设置面板
    // =============================================
    function openBeautySettings(pageIndex) {
        var currentPage = (pageIndex !== undefined) ? pageIndex : (config.currentIndex || 0);
        if (currentPage === 0) currentPage = 1;

        var old = document.getElementById('beauty-settings-modal');
        if (old) old.remove();

        var wrap = document.createElement('div');
        wrap.id = 'beauty-settings-modal';
        wrap.style.cssText = `
            position: fixed; inset: 0; z-index: 99999;
            display: flex; align-items: center; justify-content: center;
            background: rgba(0,0,0,0.6);
            backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);
        `;

        var inner = document.createElement('div');
        inner.style.cssText = `
            background: var(--primary-bg);
            border-radius: 24px; padding: 24px;
            width: min(440px, 92vw);
            max-height: 85vh;
            overflow-y: auto;
            border: 1px solid var(--border-color);
            box-shadow: 0 24px 64px rgba(0,0,0,0.3);
        `;

        var header = document.createElement('div');
        header.style.cssText = 'display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;';
        header.innerHTML = `
            <span style="font-size:18px;font-weight:700;color:var(--text-primary);">🖼️ 美化页面设置</span>
            <button id="beauty-settings-close" style="background:none;border:none;font-size:20px;color:var(--text-secondary);cursor:pointer;">✕</button>
        `;
        inner.appendChild(header);

        var pageSelect = document.createElement('div');
        pageSelect.style.cssText = 'display:flex;gap:8px;margin-bottom:16px;';
        var pageOptions = ['💬 聊天', '🌸 阿晏&小回', '🌙 阿晏&66'];
        for (var i = 0; i < PAGE_COUNT; i++) {
            var btn = document.createElement('button');
            btn.textContent = pageOptions[i];
            btn.style.cssText = `
                flex:1; padding:8px 4px; border:2px solid ${i === currentPage ? 'var(--accent-color)' : 'var(--border-color)'};
                border-radius:10px; background:${i === currentPage ? 'rgba(var(--accent-color-rgb),0.1)' : 'var(--secondary-bg)'};
                color:${i === currentPage ? 'var(--accent-color)' : 'var(--text-secondary)'};
                font-size:11px; font-weight:${i === currentPage ? '700' : '400'};
                cursor:pointer; font-family:var(--font-family);
            `;
            btn.onclick = (function(idx) {
                return function() {
                    goToPage(idx, true);
                    var modal = document.getElementById('beauty-settings-modal');
                    if (modal) modal.remove();
                    openBeautySettings(idx);
                };
            })(i);
            pageSelect.appendChild(btn);
        }
        inner.appendChild(pageSelect);

        for (var pi = 1; pi < PAGE_COUNT; pi++) {
            var pageData = config.pages[pi];
            if (pageData.type !== 'beauty') continue;

            var section = document.createElement('div');
            section.id = 'beauty-settings-section-' + pi;
            section.style.cssText = `
                padding: 12px 0;
                border-bottom: 1px solid rgba(var(--border-color-rgb),0.1);
                ${pi !== currentPage ? 'display:none;' : ''}
            `;

            var tagsHtml = '';
            var tags = pageData.tags || [];
            tags.forEach(function(tag, idx) {
                tagsHtml += `
                    <div style="display:flex;gap:6px;margin-bottom:6px;align-items:center;">
                        <input class="beauty-tag-key" data-page="${pi}" data-idx="${idx}" type="text" value="${_esc(tag.key)}" placeholder="标签名" style="flex:1;padding:6px 8px;border:1px solid var(--border-color);border-radius:6px;background:var(--secondary-bg);color:var(--text-primary);font-size:12px;font-family:var(--font-family);">
                        <input class="beauty-tag-value" data-page="${pi}" data-idx="${idx}" type="text" value="${_esc(tag.value)}" placeholder="内容" style="flex:1.5;padding:6px 8px;border:1px solid var(--border-color);border-radius:6px;background:var(--secondary-bg);color:var(--text-primary);font-size:12px;font-family:var(--font-family);">
                        <button class="beauty-tag-remove" data-page="${pi}" data-idx="${idx}" style="padding:4px 8px;border:none;background:none;color:#ff6b6b;cursor:pointer;font-size:14px;">✕</button>
                    </div>
                `;
            });

            section.innerHTML = `
                <div style="font-size:13px;font-weight:600;color:var(--text-primary);margin-bottom:10px;">${pageOptions[pi]}</div>
                <div style="margin-bottom:10px;">
                    <label style="font-size:12px;color:var(--text-secondary);display:block;margin-bottom:4px;">背景图</label>
                    <div style="display:flex;gap:8px;">
                        <button class="beauty-bg-upload" data-page="${pi}" style="flex:1;padding:8px;border:1.5px dashed var(--border-color);border-radius:8px;background:transparent;color:var(--text-secondary);font-size:12px;cursor:pointer;font-family:var(--font-family);">📤 上传</button>
                        <button class="beauty-bg-url" data-page="${pi}" style="flex:1;padding:8px;border:1.5px dashed var(--border-color);border-radius:8px;background:transparent;color:var(--text-secondary);font-size:12px;cursor:pointer;font-family:var(--font-family);">🔗 URL</button>
                        <button class="beauty-bg-clear" data-page="${pi}" style="padding:8px 12px;border:1px solid var(--border-color);border-radius:8px;background:var(--secondary-bg);color:#ff6b6b;font-size:12px;cursor:pointer;font-family:var(--font-family);">清除</button>
                    </div>
                    <input type="file" class="beauty-bg-file" data-page="${pi}" accept="image/*" style="display:none;">
                    <div class="beauty-bg-preview" data-page="${pi}" style="display:${pageData.bgImage ? 'block' : 'none'};margin-top:6px;border-radius:8px;overflow:hidden;border:1px solid var(--border-color);">
                        <img src="${pageData.bgImage || ''}" style="width:100%;max-height:80px;object-fit:cover;display:block;">
                    </div>
                </div>
                <div style="margin-bottom:8px;">
                    <label style="font-size:12px;color:var(--text-secondary);display:block;margin-bottom:4px;">标签列表</label>
                    <div id="beauty-tags-container-${pi}" style="display:flex;flex-direction:column;gap:2px;">
                        ${tagsHtml}
                    </div>
                    <button class="beauty-tag-add" data-page="${pi}" style="margin-top:6px;padding:6px 12px;border:1px dashed var(--border-color);border-radius:8px;background:transparent;color:var(--text-secondary);font-size:12px;cursor:pointer;font-family:var(--font-family);">+ 添加标签</button>
                </div>
                <div style="display:flex;gap:12px;flex-wrap:wrap;">
                    <div style="flex:1;min-width:80px;">
                        <label style="font-size:11px;color:var(--text-secondary);display:block;margin-bottom:2px;">标签颜色</label>
                        <input class="beauty-color-input" data-page="${pi}" data-key="tagColor" type="color" value="${pageData.tagColor || 'rgba(255,255,255,0.85)'}" style="width:100%;height:32px;border:1px solid var(--border-color);border-radius:6px;padding:2px;background:var(--secondary-bg);cursor:pointer;">
                    </div>
                    <div style="flex:1;min-width:80px;">
                        <label style="font-size:11px;color:var(--text-secondary);display:block;margin-bottom:2px;">标签大小</label>
                        <div style="display:flex;align-items:center;gap:6px;">
                            <input class="beauty-size-input" data-page="${pi}" data-key="tagSize" type="range" min="10" max="20" value="${pageData.tagSize || 14}" style="flex:1;">
                            <span class="beauty-size-value" style="font-size:12px;color:var(--text-secondary);min-width:32px;">${pageData.tagSize || 14}px</span>
                        </div>
                    </div>
                </div>
            `;
            inner.appendChild(section);
        }

        var saveBtn = document.createElement('button');
        saveBtn.textContent = '💾 保存所有设置';
        saveBtn.style.cssText = `
            width:100%; padding:12px; border:none; border-radius:12px;
            background:var(--accent-color); color:#fff;
            font-size:14px; font-weight:700; cursor:pointer;
            margin-top:12px; font-family:var(--font-family);
        `;
        saveBtn.onclick = function() {
            saveAllSettings();
            wrap.remove();
            _notify('设置已保存 ✨', 'success');
        };
        inner.appendChild(saveBtn);

        wrap.appendChild(inner);
        document.body.appendChild(wrap);

        document.getElementById('beauty-settings-close').onclick = function() { wrap.remove(); };
        wrap.onclick = function(e) { if (e.target === wrap) wrap.remove(); };

        bindSettingsEvents();
    }

    function bindSettingsEvents() {
        document.querySelectorAll('.beauty-bg-upload').forEach(function(btn) {
            btn.onclick = function() {
                var page = parseInt(this.dataset.page);
                var fileInput = document.querySelector('.beauty-bg-file[data-page="' + page + '"]');
                if (fileInput) fileInput.click();
            };
        });
        document.querySelectorAll('.beauty-bg-file').forEach(function(input) {
            input.onchange = function(e) {
                var page = parseInt(this.dataset.page);
                var file = e.target.files[0];
                if (!file) return;
                var reader = new FileReader();
                reader.onload = function(ev) {
                    var data = ev.target.result;
                    config.pages[page].bgImage = data;
                    _saveConfig();
                    updateBeautyPage(page);
                    var preview = document.querySelector('.beauty-bg-preview[data-page="' + page + '"]');
                    var img = preview ? preview.querySelector('img') : null;
                    if (preview && img) {
                        img.src = data;
                        preview.style.display = 'block';
                    }
                    _notify('背景图已加载', 'success', 1000);
                };
                reader.readAsDataURL(file);
                this.value = '';
            };
        });
        document.querySelectorAll('.beauty-bg-url').forEach(function(btn) {
            btn.onclick = function() {
                var page = parseInt(this.dataset.page);
                var url = prompt('请输入图片URL地址：');
                if (url && url.trim()) {
                    config.pages[page].bgImage = url.trim();
                    _saveConfig();
                    updateBeautyPage(page);
                    var preview = document.querySelector('.beauty-bg-preview[data-page="' + page + '"]');
                    var img = preview ? preview.querySelector('img') : null;
                    if (preview && img) {
                        img.src = url.trim();
                        preview.style.display = 'block';
                    }
                    _notify('背景图已更新', 'success', 1000);
                }
            };
        });
        document.querySelectorAll('.beauty-bg-clear').forEach(function(btn) {
            btn.onclick = function() {
                var page = parseInt(this.dataset.page);
                if (!confirm('确定清除背景图吗？')) return;
                config.pages[page].bgImage = '';
                _saveConfig();
                updateBeautyPage(page);
                var preview = document.querySelector('.beauty-bg-preview[data-page="' + page + '"]');
                if (preview) preview.style.display = 'none';
                _notify('背景已清除', 'info');
            };
        });

        document.querySelectorAll('.beauty-tag-add').forEach(function(btn) {
            btn.onclick = function() {
                var page = parseInt(this.dataset.page);
                var tags = config.pages[page].tags || [];
                tags.push({ key: '新标签', value: '内容' });
                config.pages[page].tags = tags;
                _saveConfig();
                var container = document.getElementById('beauty-tags-container-' + page);
                if (container) {
                    var newHtml = '';
                    tags.forEach(function(tag, idx) {
                        newHtml += `
                            <div style="display:flex;gap:6px;margin-bottom:6px;align-items:center;">
                                <input class="beauty-tag-key" data-page="${page}" data-idx="${idx}" type="text" value="${_esc(tag.key)}" placeholder="标签名" style="flex:1;padding:6px 8px;border:1px solid var(--border-color);border-radius:6px;background:var(--secondary-bg);color:var(--text-primary);font-size:12px;font-family:var(--font-family);">
                                <input class="beauty-tag-value" data-page="${page}" data-idx="${idx}" type="text" value="${_esc(tag.value)}" placeholder="内容" style="flex:1.5;padding:6px 8px;border:1px solid var(--border-color);border-radius:6px;background:var(--secondary-bg);color:var(--text-primary);font-size:12px;font-family:var(--font-family);">
                                <button class="beauty-tag-remove" data-page="${page}" data-idx="${idx}" style="padding:4px 8px;border:none;background:none;color:#ff6b6b;cursor:pointer;font-size:14px;">✕</button>
                            </div>
                        `;
                    });
                    container.innerHTML = newHtml;
                    bindTagEvents();
                }
                updateBeautyPage(page);
                _notify('标签已添加', 'success', 1000);
            };
        });

        function bindTagEvents() {
            document.querySelectorAll('.beauty-tag-key').forEach(function(input) {
                input.onchange = function() {
                    var page = parseInt(this.dataset.page);
                    var idx = parseInt(this.dataset.idx);
                    var tags = config.pages[page].tags || [];
                    if (tags[idx]) {
                        tags[idx].key = this.value.trim() || '标签';
                        _saveConfig();
                        updateBeautyPage(page);
                    }
                };
            });
            document.querySelectorAll('.beauty-tag-value').forEach(function(input) {
                input.onchange = function() {
                    var page = parseInt(this.dataset.page);
                    var idx = parseInt(this.dataset.idx);
                    var tags = config.pages[page].tags || [];
                    if (tags[idx]) {
                        tags[idx].value = this.value.trim() || '内容';
                        _saveConfig();
                        updateBeautyPage(page);
                    }
                };
            });
            document.querySelectorAll('.beauty-tag-remove').forEach(function(btn) {
                btn.onclick = function() {
                    var page = parseInt(this.dataset.page);
                    var idx = parseInt(this.dataset.idx);
                    var tags = config.pages[page].tags || [];
                    if (idx >= 0 && idx < tags.length) {
                        tags.splice(idx, 1);
                        config.pages[page].tags = tags;
                        _saveConfig();
                        var container = document.getElementById('beauty-tags-container-' + page);
                        if (container) {
                            var newHtml = '';
                            tags.forEach(function(tag, i) {
                                newHtml += `
                                    <div style="display:flex;gap:6px;margin-bottom:6px;align-items:center;">
                                        <input class="beauty-tag-key" data-page="${page}" data-idx="${i}" type="text" value="${_esc(tag.key)}" placeholder="标签名" style="flex:1;padding:6px 8px;border:1px solid var(--border-color);border-radius:6px;background:var(--secondary-bg);color:var(--text-primary);font-size:12px;font-family:var(--font-family);">
                                        <input class="beauty-tag-value" data-page="${page}" data-idx="${i}" type="text" value="${_esc(tag.value)}" placeholder="内容" style="flex:1.5;padding:6px 8px;border:1px solid var(--border-color);border-radius:6px;background:var(--secondary-bg);color:var(--text-primary);font-size:12px;font-family:var(--font-family);">
                                        <button class="beauty-tag-remove" data-page="${page}" data-idx="${i}" style="padding:4px 8px;border:none;background:none;color:#ff6b6b;cursor:pointer;font-size:14px;">✕</button>
                                    </div>
                                `;
                            });
                            container.innerHTML = newHtml;
                            bindTagEvents();
                        }
                        updateBeautyPage(page);
                        _notify('标签已删除', 'info');
                    }
                };
            });
        }
        bindTagEvents();
    }

    function saveAllSettings() {
        _saveConfig();
        refreshAllPages();
    }

    // =============================================
    // 设置入口
    // =============================================
    function addSettingsEntry() {
        var observer = new MutationObserver(function() {
            var advancedModal = document.getElementById('advanced-modal');
            if (advancedModal && advancedModal.style.display !== 'none') {
                var list = advancedModal.querySelector('.settings-item-list');
                if (list && !document.getElementById('beauty-settings-entry')) {
                    var entry = document.createElement('div');
                    entry.id = 'beauty-settings-entry';
                    entry.className = 'settings-item';
                    entry.style.cssText = 'cursor:pointer;';
                    entry.innerHTML = '<i class="fas fa-palette"></i><span>美化页面</span>';
                    entry.onclick = function() {
                        var adv = document.getElementById('advanced-modal');
                        if (adv && typeof hideModal === 'function') hideModal(adv);
                        setTimeout(function() {
                            openBeautySettings();
                        }, 300);
                    };
                    list.appendChild(entry);
                }
            }
        });

        observer.observe(document.body, { childList: true, subtree: true });
    }

    // =============================================
    // 初始化
    // =============================================
    function init() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', function() {
                setTimeout(initBeautyPages, 500);
                setTimeout(addSettingsEntry, 800);
                setTimeout(modifyHeaderLayout, 1200);
                setTimeout(modifyHeaderLayout, 2500);
            });
        } else {
            setTimeout(initBeautyPages, 500);
            setTimeout(addSettingsEntry, 800);
            setTimeout(modifyHeaderLayout, 1200);
            setTimeout(modifyHeaderLayout, 2500);
        }
    }

    init();

    console.log('[美化页面] 模块已加载（双击解锁，长按拖动）');
})();
