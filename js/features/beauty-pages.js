// beauty-pages.js - 自定义个人主页布局（修复版）
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
                label: '个人主页',
                bgImage: '',
                avatar: '',
                nickname: '阿晏',
                signature: '🌍 地球online',
                rightLabels: [
                    { label: '文案', value: '遇见你的每一天都是' },
                    { label: '副标', value: '晴天' }
                ],
                anniversary: {
                    date: '2026-06-12',
                    title: '纪念日',
                    avatar1: '',
                    avatar2: ''
                },
                overlapPhotos: [
                    { url: '' },
                    { url: '' }
                ],
                music: {
                    cover: '',
                    title: '未定义',
                    subtitle: '未定义'
                },
                contact: {
                    avatar: '',
                    name: '未定义',
                    subtitle: '未定义'
                },
                bigImage: '',
                polaroids: [
                    { url: '' },
                    { url: '' },
                    { url: '' },
                    { url: '' }
                ],
                textColor: '#ffffff',
                fontSize: 16,
                subtitleColor: '#b3b3b3',
                subtitleSize: 13
            },
            {
                type: 'beauty',
                label: '个人主页2',
                bgImage: '',
                avatar: '',
                nickname: '阿晏',
                signature: '🌙 月色温柔',
                rightLabels: [
                    { label: '文案', value: '月色温柔' },
                    { label: '副标', value: '66' }
                ],
                anniversary: {
                    date: '2026-06-12',
                    title: '纪念日',
                    avatar1: '',
                    avatar2: ''
                },
                overlapPhotos: [
                    { url: '' },
                    { url: '' }
                ],
                music: {
                    cover: '',
                    title: '未定义',
                    subtitle: '未定义'
                },
                contact: {
                    avatar: '',
                    name: '未定义',
                    subtitle: '未定义'
                },
                bigImage: '',
                polaroids: [
                    { url: '' },
                    { url: '' },
                    { url: '' },
                    { url: '' }
                ],
                textColor: '#ffffff',
                fontSize: 16,
                subtitleColor: '#b3b3b3',
                subtitleSize: 13
            }
        ],
        currentIndex: 0
    };

    var config = null;
    var isAnimating = false;

    // ---- 拖动相关 ----
    var isDraggable = false;
    var indicatorDragging = false;
    var dragStartX = 0, dragStartY = 0;
    var dragOrigLeft = 0, dragOrigTop = 0;
    var pressTimer = null;
    var isPressed = false;
    // 移动端双击检测
    var lastTouchTime = 0;
    var touchCount = 0;

    // ---- 工具函数 ----
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
                    if (!parsed.pages[i].rightLabels) parsed.pages[i].rightLabels = [{ label: '文案', value: '' }, { label: '副标', value: '' }];
                    if (!parsed.pages[i].anniversary) parsed.pages[i].anniversary = { date: '', title: '纪念日', avatar1: '', avatar2: '' };
                    if (!parsed.pages[i].overlapPhotos) parsed.pages[i].overlapPhotos = [{ url: '' }, { url: '' }];
                    if (!parsed.pages[i].music) parsed.pages[i].music = { cover: '', title: '未定义', subtitle: '未定义' };
                    if (!parsed.pages[i].contact) parsed.pages[i].contact = { avatar: '', name: '未定义', subtitle: '未定义' };
                    if (!parsed.pages[i].polaroids) parsed.pages[i].polaroids = [{ url: '' }, { url: '' }, { url: '' }, { url: '' }];
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

    function _calcDays(dateStr) {
        if (!dateStr) return 0;
        var target = new Date(dateStr);
        var now = new Date();
        var diff = now - target;
        return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
    }

    // =============================================
    // 更新页面
    // =============================================
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

        var avatarEl = pageEl.querySelector('.bp-avatar');
        if (avatarEl) {
            if (pageData.avatar) { avatarEl.src = pageData.avatar; avatarEl.style.display = 'block'; }
            else { avatarEl.style.display = 'none'; }
            var def = avatarEl.parentElement.querySelector('.bp-avatar-def');
            if (def) { def.style.display = pageData.avatar ? 'none' : 'flex'; }
        }

        var nameEl = pageEl.querySelector('.bp-name');
        if (nameEl) nameEl.textContent = pageData.nickname || '未定义';
        var sigEl = pageEl.querySelector('.bp-signature');
        if (sigEl) sigEl.textContent = pageData.signature || '';
        var labels = pageEl.querySelectorAll('.bp-right-label');
        if (labels.length >= 2) {
            labels[0].textContent = (pageData.rightLabels && pageData.rightLabels[0] ? pageData.rightLabels[0].value : '');
            labels[1].textContent = (pageData.rightLabels && pageData.rightLabels[1] ? pageData.rightLabels[1].value : '');
        }

        var annDate = pageEl.querySelector('.bp-ann-date');
        if (annDate) annDate.textContent = pageData.anniversary.date || '未设置';
        var annDays = pageEl.querySelector('.bp-ann-days');
        if (annDays) annDays.textContent = _calcDays(pageData.anniversary.date);
        var annAv1 = pageEl.querySelector('.bp-ann-av1');
        if (annAv1) {
            if (pageData.anniversary.avatar1) { annAv1.src = pageData.anniversary.avatar1; annAv1.style.display = 'block'; }
            else { annAv1.style.display = 'none'; }
        }
        var annAv2 = pageEl.querySelector('.bp-ann-av2');
        if (annAv2) {
            if (pageData.anniversary.avatar2) { annAv2.src = pageData.anniversary.avatar2; annAv2.style.display = 'block'; }
            else { annAv2.style.display = 'none'; }
        }

        var opPhotos = pageEl.querySelectorAll('.bp-op-photo');
        opPhotos.forEach(function(el, idx) {
            var url = pageData.overlapPhotos && pageData.overlapPhotos[idx] ? pageData.overlapPhotos[idx].url : '';
            if (url) { el.src = url; el.style.display = 'block'; }
            else { el.style.display = 'none'; }
        });

        var musicCover = pageEl.querySelector('.bp-music-cover');
        if (musicCover) {
            if (pageData.music.cover) { musicCover.src = pageData.music.cover; musicCover.style.display = 'block'; }
            else { musicCover.style.display = 'none'; }
        }
        var musicTitle = pageEl.querySelector('.bp-music-title');
        if (musicTitle) musicTitle.textContent = pageData.music.title || '未定义';
        var musicSub = pageEl.querySelector('.bp-music-sub');
        if (musicSub) musicSub.textContent = pageData.music.subtitle || '未定义';

        var contactAv = pageEl.querySelector('.bp-contact-av');
        if (contactAv) {
            if (pageData.contact.avatar) { contactAv.src = pageData.contact.avatar; contactAv.style.display = 'block'; }
            else { contactAv.style.display = 'none'; }
        }
        var contactName = pageEl.querySelector('.bp-contact-name');
        if (contactName) contactName.textContent = pageData.contact.name || '未定义';
        var contactSub = pageEl.querySelector('.bp-contact-sub');
        if (contactSub) contactSub.textContent = pageData.contact.subtitle || '未定义';

        var bigImg = pageEl.querySelector('.bp-big-img');
        if (bigImg) {
            if (pageData.bigImage) { bigImg.src = pageData.bigImage; bigImg.style.display = 'block'; }
            else { bigImg.style.display = 'none'; }
        }

        var pols = pageEl.querySelectorAll('.bp-polaroid-img');
        pols.forEach(function(el, idx) {
            var url = pageData.polaroids && pageData.polaroids[idx] ? pageData.polaroids[idx].url : '';
            if (url) { el.src = url; el.style.display = 'block'; }
            else { el.style.display = 'none'; }
        });
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
    // 指示器事件（适配移动端）
    // =============================================
    function handleIndicatorClick(e) {
        e.stopPropagation();
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
    // 添加指示器
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

        var labels = ['💬 聊天', '📱 主页1', '📱 主页2'];

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

        // ---- 移动端双击检测（touch） ----
        var lastTouchEnd = 0;
        var touchTimer = null;
        indicator.addEventListener('touchstart', function(e) {
            e.stopPropagation();
            var now = Date.now();
            if (now - lastTouchEnd < 400) {
                clearTimeout(touchTimer);
                handleIndicatorDoubleClick(e);
                lastTouchEnd = 0;
                e.preventDefault();
                return;
            }
            lastTouchEnd = now;
            touchTimer = setTimeout(function() {
                if (lastTouchEnd && Date.now() - lastTouchEnd < 300) return;
                handleIndicatorClick(e);
            }, 300);
        }, { passive: false });

        // PC 双击检测
        var lastClickTime = 0;
        indicator.addEventListener('click', function(e) {
            if ('ontouchstart' in window) return;
            var now = Date.now();
            if (now - lastClickTime < 400) {
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

        // ---- 移动端长按拖动 ----
        var pressTimerTouch = null;
        var isPressedTouch = false;
        var dragStartXTouch = 0, dragStartYTouch = 0;
        var dragOrigLeftTouch = 0, dragOrigTopTouch = 0;
        var indicatorDraggingTouch = false;

        indicator.addEventListener('touchstart', function(e) {
            if (!isDraggable) return;
            isPressedTouch = true;
            indicatorDraggingTouch = false;
            var touch = e.touches[0];
            var rect = indicator.getBoundingClientRect();
            dragStartXTouch = touch.clientX - rect.left;
            dragStartYTouch = touch.clientY - rect.top;
            dragOrigLeftTouch = rect.left;
            dragOrigTopTouch = rect.top;
            pressTimerTouch = setTimeout(function() {
                if (isPressedTouch) {
                    indicatorDraggingTouch = true;
                    e.preventDefault();
                }
            }, 300);
        }, { passive: false });

        document.addEventListener('touchmove', function(e) {
            if (!isDraggable || !isPressedTouch) return;
            var touch = e.touches[0];
            if (indicatorDraggingTouch) {
                var newLeft = touch.clientX - dragStartXTouch;
                var newTop = touch.clientY - dragStartYTouch;
                var maxX = window.innerWidth - indicator.offsetWidth;
                var maxY = window.innerHeight - indicator.offsetHeight;
                newLeft = Math.max(0, Math.min(newLeft, maxX));
                newTop = Math.max(0, Math.min(newTop, maxY));
                indicator.style.left = newLeft + 'px';
                indicator.style.top = newTop + 'px';
                indicator.style.right = 'auto';
                indicator.style.bottom = 'auto';
                indicator.style.transform = 'none';
                e.preventDefault();
            } else {
                var rect = indicator.getBoundingClientRect();
                var dx = (touch.clientX - dragStartXTouch - rect.left);
                var dy = (touch.clientY - dragStartYTouch - rect.top);
                if (Math.abs(dx) > 10 || Math.abs(dy) > 10) {
                    clearTimeout(pressTimerTouch);
                    isPressedTouch = false;
                }
            }
        }, { passive: false });

        document.addEventListener('touchend', function(e) {
            clearTimeout(pressTimerTouch);
            if (indicatorDraggingTouch) {
                var rect = indicator.getBoundingClientRect();
                saveIndicatorPosition(rect.left, rect.top);
                indicatorDraggingTouch = false;
            }
            isPressedTouch = false;
        }, { passive: false });

        // ---- PC 长按拖动 ----
        var mouseDown = false;
        var mouseDragStartX = 0, mouseDragStartY = 0;
        var mouseDragOrigLeft = 0, mouseDragOrigTop = 0;
        var mouseDragging = false;
        var mousePressTimer = null;

        indicator.addEventListener('mousedown', function(e) {
            if (!isDraggable) return;
            if (e.button !== 0) return;
            mouseDown = true;
            mouseDragging = false;
            var rect = indicator.getBoundingClientRect();
            mouseDragStartX = e.clientX - rect.left;
            mouseDragStartY = e.clientY - rect.top;
            mouseDragOrigLeft = rect.left;
            mouseDragOrigTop = rect.top;
            mousePressTimer = setTimeout(function() {
                if (mouseDown) {
                    mouseDragging = true;
                    indicator.style.cursor = 'grabbing';
                }
            }, 300);
        });

        document.addEventListener('mousemove', function(e) {
            if (!isDraggable || !mouseDown) return;
            if (mouseDragging) {
                var newLeft = e.clientX - mouseDragStartX;
                var newTop = e.clientY - mouseDragStartY;
                var maxX = window.innerWidth - indicator.offsetWidth;
                var maxY = window.innerHeight - indicator.offsetHeight;
                newLeft = Math.max(0, Math.min(newLeft, maxX));
                newTop = Math.max(0, Math.min(newTop, maxY));
                indicator.style.left = newLeft + 'px';
                indicator.style.top = newTop + 'px';
                indicator.style.right = 'auto';
                indicator.style.bottom = 'auto';
                indicator.style.transform = 'none';
            } else {
                var rect = indicator.getBoundingClientRect();
                var dx = (e.clientX - mouseDragStartX - rect.left);
                var dy = (e.clientY - mouseDragStartY - rect.top);
                if (Math.abs(dx) > 10 || Math.abs(dy) > 10) {
                    clearTimeout(mousePressTimer);
                    mouseDown = false;
                    indicator.style.cursor = 'grab';
                }
            }
        });

        document.addEventListener('mouseup', function(e) {
            clearTimeout(mousePressTimer);
            if (mouseDragging) {
                var rect = indicator.getBoundingClientRect();
                saveIndicatorPosition(rect.left, rect.top);
                mouseDragging = false;
                indicator.style.cursor = 'grab';
            }
            mouseDown = false;
        });

        if (!config.showIndicator) {
            indicator.style.display = 'none';
        }

        wrapper.appendChild(indicator);
        updateDragModeUI();
    }

    // =============================================
    // 页面滑动
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
    // 创建美化页面
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
            justify-content: flex-start;
            position: relative;
            overflow-y: auto;
            overflow-x: hidden;
            background: linear-gradient(135deg, #0f0c29, #302b63, #24243e);
            padding: 12px 10px 80px;
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

        var content = document.createElement('div');
        content.className = 'beauty-content';
        content.style.cssText = `
            position: relative;
            z-index: 1;
            width: 100%;
            max-width: 360px;
            display: flex;
            flex-direction: column;
            gap: 8px;
        `;

        // =============================================
        // 模块1：顶部信息
        // =============================================
        var module1 = document.createElement('div');
        module1.className = 'bp-module bp-module-1';
        module1.style.cssText = `
            background: rgba(255,255,255,0.06);
            backdrop-filter: blur(8px);
            -webkit-backdrop-filter: blur(8px);
            border-radius: 12px;
            padding: 12px 14px;
            border: 1px solid rgba(255,255,255,0.06);
            display: flex;
            align-items: center;
            gap: 12px;
            cursor: pointer;
            transition: background 0.2s;
        `;
        module1.addEventListener('click', function(e) {
            e.stopPropagation();
            openBeautySettings(index);
        });

        var avWrap = document.createElement('div');
        avWrap.style.cssText = 'position:relative;flex-shrink:0;';
        var avatar = document.createElement('img');
        avatar.className = 'bp-avatar';
        avatar.style.cssText = 'width:44px;height:44px;border-radius:50%;object-fit:cover;border:2px solid rgba(255,255,255,0.15);display:none;';
        avWrap.appendChild(avatar);
        var avatarDef = document.createElement('i');
        avatarDef.className = 'bp-avatar-def fas fa-user';
        avatarDef.style.cssText = 'font-size:20px;color:rgba(255,255,255,0.2);width:44px;height:44px;display:flex;align-items:center;justify-content:center;border-radius:50%;background:rgba(255,255,255,0.05);border:2px solid rgba(255,255,255,0.06);';
        avWrap.appendChild(avatarDef);
        module1.appendChild(avWrap);

        var midWrap = document.createElement('div');
        midWrap.style.cssText = 'flex:1;min-width:0;';
        var nameEl = document.createElement('div');
        nameEl.className = 'bp-name';
        nameEl.style.cssText = 'font-size:15px;font-weight:600;color:#fff;letter-spacing:0.5px;';
        nameEl.textContent = '未定义';
        midWrap.appendChild(nameEl);
        var sigEl = document.createElement('div');
        sigEl.className = 'bp-signature';
        sigEl.style.cssText = 'font-size:11px;color:rgba(255,255,255,0.5);margin-top:2px;';
        sigEl.textContent = '';
        midWrap.appendChild(sigEl);
        module1.appendChild(midWrap);

        var rightWrap = document.createElement('div');
        rightWrap.style.cssText = 'display:flex;flex-direction:column;align-items:flex-end;flex-shrink:0;gap:1px;';
        var r1 = document.createElement('div');
        r1.className = 'bp-right-label';
        r1.style.cssText = 'font-size:12px;color:rgba(255,255,255,0.7);text-align:right;';
        r1.textContent = '';
        rightWrap.appendChild(r1);
        var r2 = document.createElement('div');
        r2.className = 'bp-right-label';
        r2.style.cssText = 'font-size:12px;color:rgba(255,255,255,0.5);text-align:right;';
        r2.textContent = '';
        rightWrap.appendChild(r2);
        module1.appendChild(rightWrap);
        content.appendChild(module1);

        // =============================================
        // 模块2：纪念日 + 重叠拍立得
        // =============================================
        var module2 = document.createElement('div');
        module2.className = 'bp-module bp-module-2';
        module2.style.cssText = 'display:flex;gap:8px;cursor:pointer;';
        module2.addEventListener('click', function(e) {
            if (e.target.closest('.bp-ann-item') || e.target.closest('.bp-op-item')) return;
            openBeautySettings(index);
        });

        var annWrap = document.createElement('div');
        annWrap.className = 'bp-ann-item';
        annWrap.style.cssText = `
            flex: 1;
            background: rgba(255,255,255,0.06);
            backdrop-filter: blur(8px);
            -webkit-backdrop-filter: blur(8px);
            border-radius: 12px;
            padding: 10px 12px;
            border: 1px solid rgba(255,255,255,0.06);
            display: flex;
            flex-direction: column;
            cursor: pointer;
        `;
        annWrap.addEventListener('click', function(e) {
            e.stopPropagation();
            openAnniversarySettings(index);
        });

        var avRow = document.createElement('div');
        avRow.style.cssText = 'display:flex;align-items:center;margin-bottom:4px;position:relative;';
        var av1 = document.createElement('img');
        av1.className = 'bp-ann-av1';
        av1.style.cssText = 'width:28px;height:28px;border-radius:50%;object-fit:cover;border:2px solid rgba(255,255,255,0.15);display:none;z-index:2;';
        avRow.appendChild(av1);
        var av2 = document.createElement('img');
        av2.className = 'bp-ann-av2';
        av2.style.cssText = 'width:28px;height:28px;border-radius:50%;object-fit:cover;border:2px solid rgba(255,255,255,0.15);display:none;margin-left:-8px;z-index:1;';
        avRow.appendChild(av2);
        var avDef1 = document.createElement('i');
        avDef1.className = 'fas fa-user';
        avDef1.style.cssText = 'font-size:12px;color:rgba(255,255,255,0.2);width:28px;height:28px;display:flex;align-items:center;justify-content:center;border-radius:50%;background:rgba(255,255,255,0.05);border:2px solid rgba(255,255,255,0.06);';
        avRow.appendChild(avDef1);
        var avDef2 = document.createElement('i');
        avDef2.className = 'fas fa-user';
        avDef2.style.cssText = 'font-size:12px;color:rgba(255,255,255,0.2);width:28px;height:28px;display:flex;align-items:center;justify-content:center;border-radius:50%;background:rgba(255,255,255,0.05);border:2px solid rgba(255,255,255,0.06);margin-left:-8px;';
        avRow.appendChild(avDef2);
        annWrap.appendChild(avRow);

        var annDate = document.createElement('div');
        annDate.className = 'bp-ann-date';
        annDate.style.cssText = 'font-size:10px;color:rgba(255,255,255,0.4);margin-bottom:2px;';
        annDate.textContent = '未设置';
        annWrap.appendChild(annDate);
        var annDays = document.createElement('div');
        annDays.className = 'bp-ann-days';
        annDays.style.cssText = 'font-size:16px;font-weight:700;color:#fff;';
        annDays.textContent = '0';
        annWrap.appendChild(annDays);
        var annLabel = document.createElement('div');
        annLabel.style.cssText = 'font-size:9px;color:rgba(255,255,255,0.3);margin-top:1px;';
        annLabel.textContent = '纪念日';
        annWrap.appendChild(annLabel);
        module2.appendChild(annWrap);

        var opWrap = document.createElement('div');
        opWrap.className = 'bp-op-item';
        opWrap.style.cssText = `
            flex: 1;
            position: relative;
            border-radius: 12px;
            overflow: hidden;
            background: rgba(255,255,255,0.04);
            border: 1px solid rgba(255,255,255,0.06);
            aspect-ratio: 1/1;
            cursor: pointer;
        `;
        opWrap.addEventListener('click', function(e) {
            e.stopPropagation();
            openOverlapPhotosSettings(index);
        });
        var op1 = document.createElement('img');
        op1.className = 'bp-op-photo';
        op1.style.cssText = 'position:absolute;top:10%;left:10%;width:75%;height:75%;object-fit:cover;border-radius:6px;border:3px solid rgba(255,255,255,0.1);display:none;transform:rotate(-3deg);z-index:1;';
        opWrap.appendChild(op1);
        var op2 = document.createElement('img');
        op2.className = 'bp-op-photo';
        op2.style.cssText = 'position:absolute;bottom:10%;right:10%;width:70%;height:70%;object-fit:cover;border-radius:6px;border:3px solid rgba(255,255,255,0.1);display:none;transform:rotate(4deg);z-index:2;';
        opWrap.appendChild(op2);
        var opPlace = document.createElement('div');
        opPlace.style.cssText = 'position:absolute;inset:0;display:flex;align-items:center;justify-content:center;color:rgba(255,255,255,0.1);font-size:12px;';
        opPlace.textContent = '📷 点击设置';
        opWrap.appendChild(opPlace);
        module2.appendChild(opWrap);
        content.appendChild(module2);

        // =============================================
        // 模块3：音乐播放器
        // =============================================
        var module3 = document.createElement('div');
        module3.className = 'bp-module bp-module-3';
        module3.style.cssText = `
            background: rgba(255,255,255,0.06);
            backdrop-filter: blur(8px);
            -webkit-backdrop-filter: blur(8px);
            border-radius: 12px;
            padding: 10px 14px;
            border: 1px solid rgba(255,255,255,0.06);
            display: flex;
            align-items: center;
            gap: 12px;
            cursor: pointer;
        `;
        module3.addEventListener('click', function(e) {
            if (e.target.closest('.bp-music-play')) return;
            openMusicSettings(index);
        });

        var mcWrap = document.createElement('div');
        mcWrap.style.cssText = 'position:relative;flex-shrink:0;';
        var mc = document.createElement('img');
        mc.className = 'bp-music-cover';
        mc.style.cssText = 'width:44px;height:44px;border-radius:50%;object-fit:cover;border:2px solid rgba(255,255,255,0.1);display:none;';
        mcWrap.appendChild(mc);
        var mcDef = document.createElement('i');
        mcDef.className = 'fas fa-music';
        mcDef.style.cssText = 'font-size:18px;color:rgba(255,255,255,0.15);width:44px;height:44px;display:flex;align-items:center;justify-content:center;border-radius:50%;background:rgba(255,255,255,0.05);border:2px solid rgba(255,255,255,0.06);';
        mcWrap.appendChild(mcDef);
        module3.appendChild(mcWrap);

        var mText = document.createElement('div');
        mText.style.cssText = 'flex:1;min-width:0;';
        var mt = document.createElement('div');
        mt.className = 'bp-music-title';
        mt.style.cssText = 'font-size:13px;font-weight:500;color:rgba(255,255,255,0.85);';
        mt.textContent = '未定义';
        mText.appendChild(mt);
        var ms = document.createElement('div');
        ms.className = 'bp-music-sub';
        ms.style.cssText = 'font-size:10px;color:rgba(255,255,255,0.4);margin-top:2px;';
        ms.textContent = '未定义';
        mText.appendChild(ms);
        module3.appendChild(mText);

        var playBtn = document.createElement('button');
        playBtn.className = 'bp-music-play';
        playBtn.style.cssText = `
            width:32px;height:32px;border-radius:50%;border:none;
            background: var(--accent-color, #e0698a);
            color: #fff;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 14px;
            flex-shrink: 0;
            transition: transform 0.2s;
            box-shadow: 0 2px 12px rgba(var(--accent-color-rgb, 224,105,138), 0.3);
        `;
        playBtn.innerHTML = '<i class="fas fa-play"></i>';
        playBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            var icon = this.querySelector('i');
            if (icon.classList.contains('fa-play')) {
                icon.className = 'fas fa-pause';
                _notify('🎵 正在播放', 'info', 1000);
            } else {
                icon.className = 'fas fa-play';
                _notify('⏸️ 已暂停', 'info', 1000);
            }
        });
        module3.appendChild(playBtn);
        content.appendChild(module3);

        // =============================================
        // 模块4：联系人
        // =============================================
        var module4 = document.createElement('div');
        module4.className = 'bp-module bp-module-4';
        module4.style.cssText = `
            background: rgba(255,255,255,0.06);
            backdrop-filter: blur(8px);
            -webkit-backdrop-filter: blur(8px);
            border-radius: 12px;
            padding: 10px 14px;
            border: 1px solid rgba(255,255,255,0.06);
            display: flex;
            align-items: center;
            gap: 12px;
            cursor: pointer;
        `;
        module4.addEventListener('click', function(e) {
            e.stopPropagation();
            openContactSettings(index);
        });

        var cAvWrap = document.createElement('div');
        cAvWrap.style.cssText = 'position:relative;flex-shrink:0;';
        var cAv = document.createElement('img');
        cAv.className = 'bp-contact-av';
        cAv.style.cssText = 'width:36px;height:36px;border-radius:50%;object-fit:cover;border:2px solid rgba(255,255,255,0.1);display:none;';
        cAvWrap.appendChild(cAv);
        var cAvDef = document.createElement('i');
        cAvDef.className = 'fas fa-user';
        cAvDef.style.cssText = 'font-size:14px;color:rgba(255,255,255,0.15);width:36px;height:36px;display:flex;align-items:center;justify-content:center;border-radius:50%;background:rgba(255,255,255,0.05);border:2px solid rgba(255,255,255,0.06);';
        cAvWrap.appendChild(cAvDef);
        module4.appendChild(cAvWrap);

        var cText = document.createElement('div');
        cText.style.cssText = 'flex:1;min-width:0;';
        var cName = document.createElement('div');
        cName.className = 'bp-contact-name';
        cName.style.cssText = 'font-size:13px;font-weight:500;color:rgba(255,255,255,0.85);';
        cName.textContent = '未定义';
        cText.appendChild(cName);
        var cSub = document.createElement('div');
        cSub.className = 'bp-contact-sub';
        cSub.style.cssText = 'font-size:10px;color:rgba(255,255,255,0.4);margin-top:2px;';
        cSub.textContent = '未定义';
        cText.appendChild(cSub);
        module4.appendChild(cText);

        var dots = document.createElement('span');
        dots.style.cssText = 'font-size:18px;color:rgba(255,255,255,0.2);letter-spacing:1px;flex-shrink:0;';
        dots.textContent = '...';
        module4.appendChild(dots);
        content.appendChild(module4);

        // =============================================
        // 模块5：大图
        // =============================================
        var module5 = document.createElement('div');
        module5.className = 'bp-module bp-module-5';
        module5.style.cssText = `
            border-radius: 12px;
            overflow: hidden;
            background: rgba(255,255,255,0.04);
            border: 1px solid rgba(255,255,255,0.06);
            aspect-ratio: 16/9;
            cursor: pointer;
            position: relative;
        `;
        module5.addEventListener('click', function(e) {
            e.stopPropagation();
            openBigImageSettings(index);
        });

        var bigImg = document.createElement('img');
        bigImg.className = 'bp-big-img';
        bigImg.style.cssText = 'width:100%;height:100%;object-fit:cover;display:none;';
        module5.appendChild(bigImg);
        var bigPlace = document.createElement('div');
        bigPlace.style.cssText = 'position:absolute;inset:0;display:flex;align-items:center;justify-content:center;color:rgba(255,255,255,0.1);font-size:13px;';
        bigPlace.textContent = '📷 点击设置大图';
        module5.appendChild(bigPlace);
        content.appendChild(module5);

        // =============================================
        // 模块6：四张拍立得
        // =============================================
        var module6 = document.createElement('div');
        module6.className = 'bp-module bp-module-6';
        module6.style.cssText = 'display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:6px;cursor:pointer;';
        module6.addEventListener('click', function(e) {
            if (e.target.closest('.bp-polaroid-item')) return;
            openPolaroidsSettings(index);
        });

        for (var p = 0; p < 4; p++) {
            var polItem = document.createElement('div');
            polItem.className = 'bp-polaroid-item';
            polItem.style.cssText = `
                aspect-ratio: 1/1;
                border-radius: 6px;
                overflow: hidden;
                background: rgba(255,255,255,0.04);
                border: 1px solid rgba(255,255,255,0.06);
                cursor: pointer;
                position: relative;
            `;
            polItem.addEventListener('click', function(e) {
                e.stopPropagation();
                var idx = parseInt(this.dataset.idx);
                openPolaroidSettings(index, idx);
            });
            polItem.dataset.idx = p;
            var polImg = document.createElement('img');
            polImg.className = 'bp-polaroid-img';
            polImg.style.cssText = 'width:100%;height:100%;object-fit:cover;display:none;';
            polItem.appendChild(polImg);
            var polPlace = document.createElement('div');
            polPlace.style.cssText = 'position:absolute;inset:0;display:flex;align-items:center;justify-content:center;color:rgba(255,255,255,0.08);font-size:10px;';
            polPlace.textContent = '+';
            polItem.appendChild(polPlace);
            module6.appendChild(polItem);
        }
        content.appendChild(module6);

        page.appendChild(content);
        updateBeautyPage(index);
        return page;
    }

    // =============================================
    // 各模块设置函数
    // =============================================
    function openAnniversarySettings(pageIndex) {
        var old = document.getElementById('ann-settings-modal');
        if (old) old.remove();
        var pageData = config.pages[pageIndex];
        var ann = pageData.anniversary || { date: '', title: '纪念日', avatar1: '', avatar2: '' };
        var wrap = document.createElement('div');
        wrap.id = 'ann-settings-modal';
        wrap.style.cssText = 'position:fixed;inset:0;z-index:99998;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.5);backdrop-filter:blur(8px);';
        var inner = document.createElement('div');
        inner.style.cssText = 'background:var(--primary-bg);border-radius:20px;padding:24px;width:min(380px,90vw);border:1px solid var(--border-color);box-shadow:0 24px 64px rgba(0,0,0,0.3);max-height:80vh;overflow-y:auto;';
        inner.innerHTML = `
            <div style="display:flex;justify-content:space-between;margin-bottom:16px;"><span style="font-size:18px;font-weight:700;color:var(--text-primary);">📅 纪念日设置</span><button id="ann-close" style="background:none;border:none;font-size:20px;color:var(--text-secondary);cursor:pointer;">✕</button></div>
            <div style="margin-bottom:10px;"><label style="font-size:12px;color:var(--text-secondary);display:block;margin-bottom:4px;">纪念日日期</label><input id="ann-date-input" type="date" value="${ann.date || ''}" style="width:100%;padding:8px;border:1px solid var(--border-color);border-radius:8px;background:var(--secondary-bg);color:var(--text-primary);font-size:13px;box-sizing:border-box;font-family:var(--font-family);"></div>
            <div style="margin-bottom:10px;"><label style="font-size:12px;color:var(--text-secondary);display:block;margin-bottom:4px;">纪念日名称</label><input id="ann-title-input" type="text" value="${_esc(ann.title || '纪念日')}" style="width:100%;padding:8px;border:1px solid var(--border-color);border-radius:8px;background:var(--secondary-bg);color:var(--text-primary);font-size:13px;box-sizing:border-box;font-family:var(--font-family);"></div>
            <div style="margin-bottom:10px;"><label style="font-size:12px;color:var(--text-secondary);display:block;margin-bottom:4px;">头像1</label><div style="display:flex;gap:8px;"><button id="ann-av1-upload" style="flex:1;padding:6px;border:1px dashed var(--border-color);border-radius:8px;background:transparent;color:var(--text-secondary);font-size:11px;cursor:pointer;">📤 上传</button><button id="ann-av1-url" style="flex:1;padding:6px;border:1px dashed var(--border-color);border-radius:8px;background:transparent;color:var(--text-secondary);font-size:11px;cursor:pointer;">🔗 URL</button><button id="ann-av1-clear" style="padding:6px 10px;border:1px solid var(--border-color);border-radius:8px;background:var(--secondary-bg);color:#ff6b6b;font-size:11px;cursor:pointer;">清除</button></div><input type="file" id="ann-av1-file" accept="image/*" style="display:none;"></div>
            <div style="margin-bottom:12px;"><label style="font-size:12px;color:var(--text-secondary);display:block;margin-bottom:4px;">头像2</label><div style="display:flex;gap:8px;"><button id="ann-av2-upload" style="flex:1;padding:6px;border:1px dashed var(--border-color);border-radius:8px;background:transparent;color:var(--text-secondary);font-size:11px;cursor:pointer;">📤 上传</button><button id="ann-av2-url" style="flex:1;padding:6px;border:1px dashed var(--border-color);border-radius:8px;background:transparent;color:var(--text-secondary);font-size:11px;cursor:pointer;">🔗 URL</button><button id="ann-av2-clear" style="padding:6px 10px;border:1px solid var(--border-color);border-radius:8px;background:var(--secondary-bg);color:#ff6b6b;font-size:11px;cursor:pointer;">清除</button></div><input type="file" id="ann-av2-file" accept="image/*" style="display:none;"></div>
            <div style="display:flex;gap:10px;"><button id="ann-cancel" style="flex:1;padding:10px;border:1px solid var(--border-color);border-radius:12px;background:var(--secondary-bg);color:var(--text-secondary);font-size:13px;cursor:pointer;">取消</button><button id="ann-save" style="flex:2;padding:10px;border:none;border-radius:12px;background:var(--accent-color);color:#fff;font-weight:700;font-size:13px;cursor:pointer;">保存</button></div>
        `;
        wrap.appendChild(inner);
        document.body.appendChild(wrap);
        var close = function() { wrap.remove(); };
        document.getElementById('ann-close').onclick = close;
        document.getElementById('ann-cancel').onclick = close;
        wrap.onclick = function(e) { if (e.target === wrap) close(); };
        var tempAv1 = ann.avatar1 || '';
        var tempAv2 = ann.avatar2 || '';
        function setupUpload(btnId, fileId, urlId, clearId, setter) {
            document.getElementById(btnId).onclick = function() { document.getElementById(fileId).click(); };
            document.getElementById(fileId).onchange = function(e) {
                var file = e.target.files[0];
                if (!file) return;
                var reader = new FileReader();
                reader.onload = function(ev) { setter(ev.target.result); _notify('已加载', 'success', 1000); };
                reader.readAsDataURL(file);
                this.value = '';
            };
            document.getElementById(urlId).onclick = function() {
                var url = prompt('请输入图片URL：');
                if (url && url.trim()) setter(url.trim());
            };
            document.getElementById(clearId).onclick = function() { setter(''); };
        }
        setupUpload('ann-av1-upload', 'ann-av1-file', 'ann-av1-url', 'ann-av1-clear', function(v) { tempAv1 = v; });
        setupUpload('ann-av2-upload', 'ann-av2-file', 'ann-av2-url', 'ann-av2-clear', function(v) { tempAv2 = v; });
        document.getElementById('ann-save').onclick = function() {
            pageData.anniversary.date = document.getElementById('ann-date-input').value;
            pageData.anniversary.title = document.getElementById('ann-title-input').value.trim() || '纪念日';
            pageData.anniversary.avatar1 = tempAv1;
            pageData.anniversary.avatar2 = tempAv2;
            _saveConfig();
            updateBeautyPage(pageIndex);
            close();
            _notify('纪念日已更新 ✨', 'success');
        };
    }

    function openOverlapPhotosSettings(pageIndex) {
        var old = document.getElementById('op-settings-modal');
        if (old) old.remove();
        var pageData = config.pages[pageIndex];
        var photos = pageData.overlapPhotos || [{ url: '' }, { url: '' }];
        var wrap = document.createElement('div');
        wrap.id = 'op-settings-modal';
        wrap.style.cssText = 'position:fixed;inset:0;z-index:99998;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.5);backdrop-filter:blur(8px);';
        var inner = document.createElement('div');
        inner.style.cssText = 'background:var(--primary-bg);border-radius:20px;padding:24px;width:min(380px,90vw);border:1px solid var(--border-color);box-shadow:0 24px 64px rgba(0,0,0,0.3);';
        inner.innerHTML = `
            <div style="display:flex;justify-content:space-between;margin-bottom:16px;"><span style="font-size:18px;font-weight:700;color:var(--text-primary);">📷 重叠拍立得</span><button id="op-close" style="background:none;border:none;font-size:20px;color:var(--text-secondary);cursor:pointer;">✕</button></div>
            <div style="margin-bottom:12px;"><label style="font-size:12px;color:var(--text-secondary);display:block;margin-bottom:4px;">照片1（左/上）</label><div style="display:flex;gap:8px;"><button class="op-set-btn" data-idx="0" data-action="upload" style="flex:1;padding:6px;border:1px dashed var(--border-color);border-radius:8px;background:transparent;color:var(--text-secondary);font-size:11px;cursor:pointer;">📤 上传</button><button class="op-set-btn" data-idx="0" data-action="url" style="flex:1;padding:6px;border:1px dashed var(--border-color);border-radius:8px;background:transparent;color:var(--text-secondary);font-size:11px;cursor:pointer;">🔗 URL</button><button class="op-set-btn" data-idx="0" data-action="clear" style="padding:6px 10px;border:1px solid var(--border-color);border-radius:8px;background:var(--secondary-bg);color:#ff6b6b;font-size:11px;cursor:pointer;">清除</button></div></div>
            <div style="margin-bottom:12px;"><label style="font-size:12px;color:var(--text-secondary);display:block;margin-bottom:4px;">照片2（右/下）</label><div style="display:flex;gap:8px;"><button class="op-set-btn" data-idx="1" data-action="upload" style="flex:1;padding:6px;border:1px dashed var(--border-color);border-radius:8px;background:transparent;color:var(--text-secondary);font-size:11px;cursor:pointer;">📤 上传</button><button class="op-set-btn" data-idx="1" data-action="url" style="flex:1;padding:6px;border:1px dashed var(--border-color);border-radius:8px;background:transparent;color:var(--text-secondary);font-size:11px;cursor:pointer;">🔗 URL</button><button class="op-set-btn" data-idx="1" data-action="clear" style="padding:6px 10px;border:1px solid var(--border-color);border-radius:8px;background:var(--secondary-bg);color:#ff6b6b;font-size:11px;cursor:pointer;">清除</button></div></div>
            <div style="display:flex;gap:10px;"><button id="op-cancel" style="flex:1;padding:10px;border:1px solid var(--border-color);border-radius:12px;background:var(--secondary-bg);color:var(--text-secondary);font-size:13px;cursor:pointer;">取消</button><button id="op-save" style="flex:2;padding:10px;border:none;border-radius:12px;background:var(--accent-color);color:#fff;font-weight:700;font-size:13px;cursor:pointer;">保存</button></div>
        `;
        wrap.appendChild(inner);
        document.body.appendChild(wrap);
        var close = function() { wrap.remove(); };
        document.getElementById('op-close').onclick = close;
        document.getElementById('op-cancel').onclick = close;
        wrap.onclick = function(e) { if (e.target === wrap) close(); };
        var tempUrls = photos.map(function(p) { return p.url || ''; });
        var fileInputs = [];
        document.querySelectorAll('.op-set-btn').forEach(function(btn) {
            var idx = parseInt(btn.dataset.idx);
            var action = btn.dataset.action;
            if (action === 'upload') {
                var input = document.createElement('input');
                input.type = 'file';
                input.accept = 'image/*';
                input.style.display = 'none';
                input.onchange = function(e) {
                    var file = e.target.files[0];
                    if (!file) return;
                    var reader = new FileReader();
                    reader.onload = function(ev) { tempUrls[idx] = ev.target.result; _notify('已加载', 'success', 1000); };
                    reader.readAsDataURL(file);
                    this.value = '';
                };
                document.body.appendChild(input);
                fileInputs.push(input);
                btn.onclick = function() { input.click(); };
            } else if (action === 'url') {
                btn.onclick = function() {
                    var url = prompt('请输入图片URL：');
                    if (url && url.trim()) tempUrls[idx] = url.trim();
                };
            } else if (action === 'clear') {
                btn.onclick = function() { tempUrls[idx] = ''; };
            }
        });
        document.getElementById('op-save').onclick = function() {
            pageData.overlapPhotos = tempUrls.map(function(u) { return { url: u }; });
            _saveConfig();
            updateBeautyPage(pageIndex);
            close();
            _notify('已更新 ✨', 'success');
            fileInputs.forEach(function(f) { if (f.parentNode) f.parentNode.removeChild(f); });
        };
    }

    function openMusicSettings(pageIndex) {
        var old = document.getElementById('music-settings-modal');
        if (old) old.remove();
        var pageData = config.pages[pageIndex];
        var music = pageData.music || { cover: '', title: '未定义', subtitle: '未定义' };
        var wrap = document.createElement('div');
        wrap.id = 'music-settings-modal';
        wrap.style.cssText = 'position:fixed;inset:0;z-index:99998;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.5);backdrop-filter:blur(8px);';
        var inner = document.createElement('div');
        inner.style.cssText = 'background:var(--primary-bg);border-radius:20px;padding:24px;width:min(380px,90vw);border:1px solid var(--border-color);box-shadow:0 24px 64px rgba(0,0,0,0.3);';
        inner.innerHTML = `
            <div style="display:flex;justify-content:space-between;margin-bottom:16px;"><span style="font-size:18px;font-weight:700;color:var(--text-primary);">🎵 音乐播放器</span><button id="music-close" style="background:none;border:none;font-size:20px;color:var(--text-secondary);cursor:pointer;">✕</button></div>
            <div style="margin-bottom:10px;"><label style="font-size:12px;color:var(--text-secondary);display:block;margin-bottom:4px;">封面图片</label><div style="display:flex;gap:8px;"><button id="music-cover-upload" style="flex:1;padding:6px;border:1px dashed var(--border-color);border-radius:8px;background:transparent;color:var(--text-secondary);font-size:11px;cursor:pointer;">📤 上传</button><button id="music-cover-url" style="flex:1;padding:6px;border:1px dashed var(--border-color);border-radius:8px;background:transparent;color:var(--text-secondary);font-size:11px;cursor:pointer;">🔗 URL</button><button id="music-cover-clear" style="padding:6px 10px;border:1px solid var(--border-color);border-radius:8px;background:var(--secondary-bg);color:#ff6b6b;font-size:11px;cursor:pointer;">清除</button></div><input type="file" id="music-cover-file" accept="image/*" style="display:none;"></div>
            <div style="margin-bottom:8px;"><label style="font-size:12px;color:var(--text-secondary);display:block;margin-bottom:4px;">歌曲名</label><input id="music-title-input" type="text" value="${_esc(music.title || '未定义')}" style="width:100%;padding:8px;border:1px solid var(--border-color);border-radius:8px;background:var(--secondary-bg);color:var(--text-primary);font-size:13px;box-sizing:border-box;font-family:var(--font-family);"></div>
            <div style="margin-bottom:12px;"><label style="font-size:12px;color:var(--text-secondary);display:block;margin-bottom:4px;">歌手/备注</label><input id="music-sub-input" type="text" value="${_esc(music.subtitle || '未定义')}" style="width:100%;padding:8px;border:1px solid var(--border-color);border-radius:8px;background:var(--secondary-bg);color:var(--text-primary);font-size:13px;box-sizing:border-box;font-family:var(--font-family);"></div>
            <div style="display:flex;gap:10px;"><button id="music-cancel" style="flex:1;padding:10px;border:1px solid var(--border-color);border-radius:12px;background:var(--secondary-bg);color:var(--text-secondary);font-size:13px;cursor:pointer;">取消</button><button id="music-save" style="flex:2;padding:10px;border:none;border-radius:12px;background:var(--accent-color);color:#fff;font-weight:700;font-size:13px;cursor:pointer;">保存</button></div>
        `;
        wrap.appendChild(inner);
        document.body.appendChild(wrap);
        var close = function() { wrap.remove(); };
        document.getElementById('music-close').onclick = close;
        document.getElementById('music-cancel').onclick = close;
        wrap.onclick = function(e) { if (e.target === wrap) close(); };
        var tempCover = music.cover || '';
        document.getElementById('music-cover-upload').onclick = function() { document.getElementById('music-cover-file').click(); };
        document.getElementById('music-cover-file').onchange = function(e) {
            var file = e.target.files[0];
            if (!file) return;
            var reader = new FileReader();
            reader.onload = function(ev) { tempCover = ev.target.result; _notify('已加载', 'success', 1000); };
            reader.readAsDataURL(file);
            this.value = '';
        };
        document.getElementById('music-cover-url').onclick = function() {
            var url = prompt('请输入图片URL：');
            if (url && url.trim()) tempCover = url.trim();
        };
        document.getElementById('music-cover-clear').onclick = function() { tempCover = ''; };
        document.getElementById('music-save').onclick = function() {
            pageData.music = { cover: tempCover, title: document.getElementById('music-title-input').value.trim() || '未定义', subtitle: document.getElementById('music-sub-input').value.trim() || '未定义' };
            _saveConfig();
            updateBeautyPage(pageIndex);
            close();
            _notify('已更新 ✨', 'success');
        };
    }

    function openContactSettings(pageIndex) {
        var old = document.getElementById('contact-settings-modal');
        if (old) old.remove();
        var pageData = config.pages[pageIndex];
        var contact = pageData.contact || { avatar: '', name: '未定义', subtitle: '未定义' };
        var wrap = document.createElement('div');
        wrap.id = 'contact-settings-modal';
        wrap.style.cssText = 'position:fixed;inset:0;z-index:99998;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.5);backdrop-filter:blur(8px);';
        var inner = document.createElement('div');
        inner.style.cssText = 'background:var(--primary-bg);border-radius:20px;padding:24px;width:min(380px,90vw);border:1px solid var(--border-color);box-shadow:0 24px 64px rgba(0,0,0,0.3);';
        inner.innerHTML = `
            <div style="display:flex;justify-content:space-between;margin-bottom:16px;"><span style="font-size:18px;font-weight:700;color:var(--text-primary);">👤 联系人</span><button id="contact-close" style="background:none;border:none;font-size:20px;color:var(--text-secondary);cursor:pointer;">✕</button></div>
            <div style="margin-bottom:10px;"><label style="font-size:12px;color:var(--text-secondary);display:block;margin-bottom:4px;">头像</label><div style="display:flex;gap:8px;"><button id="contact-av-upload" style="flex:1;padding:6px;border:1px dashed var(--border-color);border-radius:8px;background:transparent;color:var(--text-secondary);font-size:11px;cursor:pointer;">📤 上传</button><button id="contact-av-url" style="flex:1;padding:6px;border:1px dashed var(--border-color);border-radius:8px;background:transparent;color:var(--text-secondary);font-size:11px;cursor:pointer;">🔗 URL</button><button id="contact-av-clear" style="padding:6px 10px;border:1px solid var(--border-color);border-radius:8px;background:var(--secondary-bg);color:#ff6b6b;font-size:11px;cursor:pointer;">清除</button></div><input type="file" id="contact-av-file" accept="image/*" style="display:none;"></div>
            <div style="margin-bottom:8px;"><label style="font-size:12px;color:var(--text-secondary);display:block;margin-bottom:4px;">名字</label><input id="contact-name-input" type="text" value="${_esc(contact.name || '未定义')}" style="width:100%;padding:8px;border:1px solid var(--border-color);border-radius:8px;background:var(--secondary-bg);color:var(--text-primary);font-size:13px;box-sizing:border-box;font-family:var(--font-family);"></div>
            <div style="margin-bottom:12px;"><label style="font-size:12px;color:var(--text-secondary);display:block;margin-bottom:4px;">副标题</label><input id="contact-sub-input" type="text" value="${_esc(contact.subtitle || '未定义')}" style="width:100%;padding:8px;border:1px solid var(--border-color);border-radius:8px;background:var(--secondary-bg);color:var(--text-primary);font-size:13px;box-sizing:border-box;font-family:var(--font-family);"></div>
            <div style="display:flex;gap:10px;"><button id="contact-cancel" style="flex:1;padding:10px;border:1px solid var(--border-color);border-radius:12px;background:var(--secondary-bg);color:var(--text-secondary);font-size:13px;cursor:pointer;">取消</button><button id="contact-save" style="flex:2;padding:10px;border:none;border-radius:12px;background:var(--accent-color);color:#fff;font-weight:700;font-size:13px;cursor:pointer;">保存</button></div>
        `;
        wrap.appendChild(inner);
        document.body.appendChild(wrap);
        var close = function() { wrap.remove(); };
        document.getElementById('contact-close').onclick = close;
        document.getElementById('contact-cancel').onclick = close;
        wrap.onclick = function(e) { if (e.target === wrap) close(); };
        var tempAv = contact.avatar || '';
        document.getElementById('contact-av-upload').onclick = function() { document.getElementById('contact-av-file').click(); };
        document.getElementById('contact-av-file').onchange = function(e) {
            var file = e.target.files[0];
            if (!file) return;
            var reader = new FileReader();
            reader.onload = function(ev) { tempAv = ev.target.result; _notify('已加载', 'success', 1000); };
            reader.readAsDataURL(file);
            this.value = '';
        };
        document.getElementById('contact-av-url').onclick = function() {
            var url = prompt('请输入图片URL：');
            if (url && url.trim()) tempAv = url.trim();
        };
        document.getElementById('contact-av-clear').onclick = function() { tempAv = ''; };
        document.getElementById('contact-save').onclick = function() {
            pageData.contact = { avatar: tempAv, name: document.getElementById('contact-name-input').value.trim() || '未定义', subtitle: document.getElementById('contact-sub-input').value.trim() || '未定义' };
            _saveConfig();
            updateBeautyPage(pageIndex);
            close();
            _notify('已更新 ✨', 'success');
        };
    }

    function openBigImageSettings(pageIndex) {
        var old = document.getElementById('bigimg-settings-modal');
        if (old) old.remove();
        var pageData = config.pages[pageIndex];
        var wrap = document.createElement('div');
        wrap.id = 'bigimg-settings-modal';
        wrap.style.cssText = 'position:fixed;inset:0;z-index:99998;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.5);backdrop-filter:blur(8px);';
        var inner = document.createElement('div');
        inner.style.cssText = 'background:var(--primary-bg);border-radius:20px;padding:24px;width:min(380px,90vw);border:1px solid var(--border-color);box-shadow:0 24px 64px rgba(0,0,0,0.3);';
        inner.innerHTML = `
            <div style="display:flex;justify-content:space-between;margin-bottom:16px;"><span style="font-size:18px;font-weight:700;color:var(--text-primary);">🖼️ 设置大图</span><button id="bigimg-close" style="background:none;border:none;font-size:20px;color:var(--text-secondary);cursor:pointer;">✕</button></div>
            <div style="margin-bottom:12px;"><div style="font-size:13px;color:var(--text-secondary);margin-bottom:6px;">选择图片</div><div style="display:flex;gap:8px;"><button id="bigimg-upload" style="flex:1;padding:10px;border:1.5px dashed var(--border-color);border-radius:8px;background:transparent;color:var(--text-secondary);font-size:13px;cursor:pointer;">📤 上传图片</button><button id="bigimg-url" style="flex:1;padding:10px;border:1.5px dashed var(--border-color);border-radius:8px;background:transparent;color:var(--text-secondary);font-size:13px;cursor:pointer;">🔗 图片URL</button><button id="bigimg-clear" style="padding:10px 14px;border:1px solid var(--border-color);border-radius:8px;background:var(--secondary-bg);color:#ff6b6b;font-size:13px;cursor:pointer;">清除</button></div><input type="file" id="bigimg-file" accept="image/*" style="display:none;"></div>
            <div style="display:flex;gap:10px;"><button id="bigimg-cancel" style="flex:1;padding:10px;border:1px solid var(--border-color);border-radius:12px;background:var(--secondary-bg);color:var(--text-secondary);font-size:13px;cursor:pointer;">取消</button><button id="bigimg-save" style="flex:2;padding:10px;border:none;border-radius:12px;background:var(--accent-color);color:#fff;font-weight:700;font-size:13px;cursor:pointer;">保存</button></div>
        `;
        wrap.appendChild(inner);
        document.body.appendChild(wrap);
        var close = function() { wrap.remove(); };
        document.getElementById('bigimg-close').onclick = close;
        document.getElementById('bigimg-cancel').onclick = close;
        wrap.onclick = function(e) { if (e.target === wrap) close(); };
        var tempUrl = pageData.bigImage || '';
        document.getElementById('bigimg-upload').onclick = function() { document.getElementById('bigimg-file').click(); };
        document.getElementById('bigimg-file').onchange = function(e) {
            var file = e.target.files[0];
            if (!file) return;
            var reader = new FileReader();
            reader.onload = function(ev) { tempUrl = ev.target.result; _notify('已加载', 'success', 1000); };
            reader.readAsDataURL(file);
            this.value = '';
        };
        document.getElementById('bigimg-url').onclick = function() {
            var url = prompt('请输入图片URL：');
            if (url && url.trim()) tempUrl = url.trim();
        };
        document.getElementById('bigimg-clear').onclick = function() { tempUrl = ''; };
        document.getElementById('bigimg-save').onclick = function() {
            pageData.bigImage = tempUrl;
            _saveConfig();
            updateBeautyPage(pageIndex);
            close();
            _notify('已更新 ✨', 'success');
        };
    }

    function openPolaroidSettings(pageIndex, photoIdx) {
        var old = document.getElementById('pol-settings-modal');
        if (old) old.remove();
        var pageData = config.pages[pageIndex];
        var photo = pageData.polaroids && pageData.polaroids[photoIdx] ? pageData.polaroids[photoIdx] : { url: '' };
        var wrap = document.createElement('div');
        wrap.id = 'pol-settings-modal';
        wrap.style.cssText = 'position:fixed;inset:0;z-index:99997;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.5);backdrop-filter:blur(8px);';
        var inner = document.createElement('div');
        inner.style.cssText = 'background:var(--primary-bg);border-radius:20px;padding:24px;width:min(380px,90vw);border:1px solid var(--border-color);box-shadow:0 24px 64px rgba(0,0,0,0.3);';
        inner.innerHTML = `
            <div style="display:flex;justify-content:space-between;margin-bottom:16px;"><span style="font-size:18px;font-weight:700;color:var(--text-primary);">📷 拍立得 ${photoIdx+1}</span><button id="pol-close" style="background:none;border:none;font-size:20px;color:var(--text-secondary);cursor:pointer;">✕</button></div>
            <div style="margin-bottom:12px;"><div style="font-size:13px;color:var(--text-secondary);margin-bottom:6px;">选择图片</div><div style="display:flex;gap:8px;"><button id="pol-upload" style="flex:1;padding:10px;border:1.5px dashed var(--border-color);border-radius:8px;background:transparent;color:var(--text-secondary);font-size:13px;cursor:pointer;">📤 上传图片</button><button id="pol-url" style="flex:1;padding:10px;border:1.5px dashed var(--border-color);border-radius:8px;background:transparent;color:var(--text-secondary);font-size:13px;cursor:pointer;">🔗 图片URL</button><button id="pol-clear" style="padding:10px 14px;border:1px solid var(--border-color);border-radius:8px;background:var(--secondary-bg);color:#ff6b6b;font-size:13px;cursor:pointer;">清除</button></div><input type="file" id="pol-file" accept="image/*" style="display:none;"></div>
            <div style="display:flex;gap:10px;"><button id="pol-cancel" style="flex:1;padding:10px;border:1px solid var(--border-color);border-radius:12px;background:var(--secondary-bg);color:var(--text-secondary);font-size:13px;cursor:pointer;">取消</button><button id="pol-save" style="flex:2;padding:10px;border:none;border-radius:12px;background:var(--accent-color);color:#fff;font-weight:700;font-size:13px;cursor:pointer;">保存</button></div>
        `;
        wrap.appendChild(inner);
        document.body.appendChild(wrap);
        var close = function() { wrap.remove(); };
        document.getElementById('pol-close').onclick = close;
        document.getElementById('pol-cancel').onclick = close;
        wrap.onclick = function(e) { if (e.target === wrap) close(); };
        var tempUrl = photo.url || '';
        document.getElementById('pol-upload').onclick = function() { document.getElementById('pol-file').click(); };
        document.getElementById('pol-file').onchange = function(e) {
            var file = e.target.files[0];
            if (!file) return;
            var reader = new FileReader();
            reader.onload = function(ev) { tempUrl = ev.target.result; _notify('已加载', 'success', 1000); };
            reader.readAsDataURL(file);
            this.value = '';
        };
        document.getElementById('pol-url').onclick = function() {
            var url = prompt('请输入图片URL：');
            if (url && url.trim()) tempUrl = url.trim();
        };
        document.getElementById('pol-clear').onclick = function() { tempUrl = ''; };
        document.getElementById('pol-save').onclick = function() {
            if (!pageData.polaroids) pageData.polaroids = [{ url: '' }, { url: '' }, { url: '' }, { url: '' }];
            pageData.polaroids[photoIdx].url = tempUrl;
            _saveConfig();
            updateBeautyPage(pageIndex);
            close();
            _notify('已更新 ✨', 'success');
        };
    }

    function openPolaroidsSettings(pageIndex) {
        openPolaroidSettings(pageIndex, 0);
    }

    // =============================================
    // 设置面板（主面板）
    // =============================================
    function openBeautySettings(pageIndex) {
        var currentPage = (pageIndex !== undefined) ? pageIndex : (config.currentIndex || 0);
        if (currentPage === 0) currentPage = 1;
        var old = document.getElementById('beauty-settings-modal');
        if (old) old.remove();
        var wrap = document.createElement('div');
        wrap.id = 'beauty-settings-modal';
        wrap.style.cssText = 'position:fixed;inset:0;z-index:99999;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.6);backdrop-filter:blur(12px);';
        var inner = document.createElement('div');
        inner.style.cssText = 'background:var(--primary-bg);border-radius:24px;padding:24px;width:min(440px,92vw);max-height:85vh;overflow-y:auto;border:1px solid var(--border-color);box-shadow:0 24px 64px rgba(0,0,0,0.3);';
        var header = document.createElement('div');
        header.style.cssText = 'display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;';
        header.innerHTML = `<span style="font-size:18px;font-weight:700;color:var(--text-primary);">🖼️ 美化页面设置</span><button id="beauty-settings-close" style="background:none;border:none;font-size:20px;color:var(--text-secondary);cursor:pointer;">✕</button>`;
        inner.appendChild(header);
        var pageSelect = document.createElement('div');
        pageSelect.style.cssText = 'display:flex;gap:8px;margin-bottom:16px;';
        var pageOptions = ['💬 聊天', '📱 个人主页1', '📱 个人主页2'];
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
            section.innerHTML = `
                <div style="font-size:13px;font-weight:600;color:var(--text-primary);margin-bottom:10px;">${pageOptions[pi]}</div>
                <div style="margin-bottom:10px;">
                    <label style="font-size:12px;color:var(--text-secondary);display:block;margin-bottom:4px;">整体背景</label>
                    <div style="display:flex;gap:8px;">
                        <button class="beauty-bg-upload" data-page="${pi}" style="flex:1;padding:8px;border:1.5px dashed var(--border-color);border-radius:8px;background:transparent;color:var(--text-secondary);font-size:12px;cursor:pointer;font-family:var(--font-family);">📤 上传</button>
                        <button class="beauty-bg-url" data-page="${pi}" style="flex:1;padding:8px;border:1.5px dashed var(--border-color);border-radius:8px;background:transparent;color:var(--text-secondary);font-size:12px;cursor:pointer;font-family:var(--font-family);">🔗 URL</button>
                        <button class="beauty-bg-clear" data-page="${pi}" style="padding:8px 12px;border:1px solid var(--border-color);border-radius:8px;background:var(--secondary-bg);color:#ff6b6b;font-size:12px;cursor:pointer;font-family:var(--font-family);">清除</button>
                    </div>
                    <input type="file" class="beauty-bg-file" data-page="${pi}" accept="image/*" style="display:none;">
                    <div class="beauty-bg-preview" data-page="${pi}" style="display:${pageData.bgImage ? 'block' : 'none'};margin-top:6px;border-radius:8px;overflow:hidden;border:1px solid var(--border-color);">
                        <img src="${pageData.bgImage || ''}" style="width:100%;max-height:60px;object-fit:cover;display:block;">
                    </div>
                </div>
                <div style="margin-bottom:10px;">
                    <label style="font-size:12px;color:var(--text-secondary);display:block;margin-bottom:4px;">头像</label>
                    <div style="display:flex;gap:8px;">
                        <button class="beauty-avatar-upload" data-page="${pi}" style="flex:1;padding:8px;border:1.5px dashed var(--border-color);border-radius:8px;background:transparent;color:var(--text-secondary);font-size:12px;cursor:pointer;font-family:var(--font-family);">📤 上传</button>
                        <button class="beauty-avatar-url" data-page="${pi}" style="flex:1;padding:8px;border:1.5px dashed var(--border-color);border-radius:8px;background:transparent;color:var(--text-secondary);font-size:12px;cursor:pointer;font-family:var(--font-family);">🔗 URL</button>
                        <button class="beauty-avatar-clear" data-page="${pi}" style="padding:8px 12px;border:1px solid var(--border-color);border-radius:8px;background:var(--secondary-bg);color:#ff6b6b;font-size:12px;cursor:pointer;font-family:var(--font-family);">清除</button>
                    </div>
                    <input type="file" class="beauty-avatar-file" data-page="${pi}" accept="image/*" style="display:none;">
                    <div class="beauty-avatar-preview" data-page="${pi}" style="display:${pageData.avatar ? 'block' : 'none'};margin-top:6px;border-radius:50%;overflow:hidden;width:44px;height:44px;border:2px solid var(--border-color);">
                        <img src="${pageData.avatar || ''}" style="width:100%;height:100%;object-fit:cover;display:block;">
                    </div>
                </div>
                <div style="margin-bottom:8px;">
                    <label style="font-size:12px;color:var(--text-secondary);display:block;margin-bottom:4px;">昵称</label>
                    <input class="beauty-title-input" data-page="${pi}" type="text" value="${_esc(pageData.nickname || '未定义')}" style="width:100%;padding:8px 10px;border:1px solid var(--border-color);border-radius:8px;background:var(--secondary-bg);color:var(--text-primary);font-size:13px;box-sizing:border-box;font-family:var(--font-family);">
                </div>
                <div style="margin-bottom:8px;">
                    <label style="font-size:12px;color:var(--text-secondary);display:block;margin-bottom:4px;">个签</label>
                    <input class="beauty-subtitle-input" data-page="${pi}" type="text" value="${_esc(pageData.signature || '')}" style="width:100%;padding:8px 10px;border:1px solid var(--border-color);border-radius:8px;background:var(--secondary-bg);color:var(--text-primary);font-size:13px;box-sizing:border-box;font-family:var(--font-family);">
                </div>
                <div style="display:flex;gap:12px;flex-wrap:wrap;margin-bottom:8px;">
                    <div style="flex:1;min-width:80px;">
                        <label style="font-size:11px;color:var(--text-secondary);display:block;margin-bottom:2px;">昵称颜色</label>
                        <input class="beauty-color-input" data-page="${pi}" data-key="textColor" type="color" value="${pageData.textColor || '#ffffff'}" style="width:100%;height:32px;border:1px solid var(--border-color);border-radius:6px;padding:2px;background:var(--secondary-bg);cursor:pointer;">
                    </div>
                    <div style="flex:1;min-width:80px;">
                        <label style="font-size:11px;color:var(--text-secondary);display:block;margin-bottom:2px;">昵称大小</label>
                        <div style="display:flex;align-items:center;gap:6px;">
                            <input class="beauty-size-input" data-page="${pi}" data-key="fontSize" type="range" min="14" max="28" value="${pageData.fontSize || 16}" style="flex:1;">
                            <span class="beauty-size-value" style="font-size:12px;color:var(--text-secondary);min-width:32px;">${pageData.fontSize || 16}px</span>
                        </div>
                    </div>
                </div>
                <div style="display:flex;gap:12px;flex-wrap:wrap;margin-bottom:12px;">
                    <div style="flex:1;min-width:80px;">
                        <label style="font-size:11px;color:var(--text-secondary);display:block;margin-bottom:2px;">个签颜色</label>
                        <input class="beauty-color-input" data-page="${pi}" data-key="subtitleColor" type="color" value="${pageData.subtitleColor || '#b3b3b3'}" style="width:100%;height:32px;border:1px solid var(--border-color);border-radius:6px;padding:2px;background:var(--secondary-bg);cursor:pointer;">
                    </div>
                    <div style="flex:1;min-width:80px;">
                        <label style="font-size:11px;color:var(--text-secondary);display:block;margin-bottom:2px;">个签大小</label>
                        <div style="display:flex;align-items:center;gap:6px;">
                            <input class="beauty-size-input" data-page="${pi}" data-key="subtitleSize" type="range" min="10" max="20" value="${pageData.subtitleSize || 13}" style="flex:1;">
                            <span class="beauty-size-value" style="font-size:12px;color:var(--text-secondary);min-width:32px;">${pageData.subtitleSize || 13}px</span>
                        </div>
                    </div>
                </div>
                <div style="margin-bottom:8px;">
                    <label style="font-size:12px;color:var(--text-secondary);display:block;margin-bottom:4px;">右侧文案（用 | 分隔）</label>
                    <input class="beauty-right-labels" data-page="${pi}" type="text" value="${pageData.rightLabels && pageData.rightLabels.length >= 2 ? _esc(pageData.rightLabels[0].value) + ' | ' + _esc(pageData.rightLabels[1].value) : ' | '}" style="width:100%;padding:8px 10px;border:1px solid var(--border-color);border-radius:8px;background:var(--secondary-bg);color:var(--text-primary);font-size:13px;box-sizing:border-box;font-family:var(--font-family);" placeholder="文案1 | 文案2">
                </div>
                <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:4px;">
                    <button class="beauty-quick-btn" data-page="${pi}" data-target="anniversary" style="flex:1;padding:8px;border:1px solid var(--border-color);border-radius:8px;background:var(--secondary-bg);color:var(--text-secondary);font-size:11px;cursor:pointer;font-family:var(--font-family);">📅 纪念日</button>
                    <button class="beauty-quick-btn" data-page="${pi}" data-target="overlap" style="flex:1;padding:8px;border:1px solid var(--border-color);border-radius:8px;background:var(--secondary-bg);color:var(--text-secondary);font-size:11px;cursor:pointer;font-family:var(--font-family);">📷 重叠拍立得</button>
                    <button class="beauty-quick-btn" data-page="${pi}" data-target="music" style="flex:1;padding:8px;border:1px solid var(--border-color);border-radius:8px;background:var(--secondary-bg);color:var(--text-secondary);font-size:11px;cursor:pointer;font-family:var(--font-family);">🎵 音乐</button>
                    <button class="beauty-quick-btn" data-page="${pi}" data-target="contact" style="flex:1;padding:8px;border:1px solid var(--border-color);border-radius:8px;background:var(--secondary-bg);color:var(--text-secondary);font-size:11px;cursor:pointer;font-family:var(--font-family);">👤 联系人</button>
                    <button class="beauty-quick-btn" data-page="${pi}" data-target="bigimg" style="flex:1;padding:8px;border:1px solid var(--border-color);border-radius:8px;background:var(--secondary-bg);color:var(--text-secondary);font-size:11px;cursor:pointer;font-family:var(--font-family);">🖼️ 大图</button>
                    <button class="beauty-quick-btn" data-page="${pi}" data-target="polaroids" style="flex:1;padding:8px;border:1px solid var(--border-color);border-radius:8px;background:var(--secondary-bg);color:var(--text-secondary);font-size:11px;cursor:pointer;font-family:var(--font-family);">📷 四张拍立得</button>
                </div>
            `;
            inner.appendChild(section);
        }
        var saveBtn = document.createElement('button');
        saveBtn.textContent = '💾 保存所有设置';
        saveBtn.style.cssText = 'width:100%;padding:12px;border:none;border-radius:12px;background:var(--accent-color);color:#fff;font-size:14px;font-weight:700;cursor:pointer;margin-top:12px;font-family:var(--font-family);';
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

    // 绑定设置事件
    function bindSettingsEvents() {
        // 背景图
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
                    if (preview && img) { img.src = data; preview.style.display = 'block'; }
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
                    if (preview && img) { img.src = url.trim(); preview.style.display = 'block'; }
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

        // 头像
        document.querySelectorAll('.beauty-avatar-upload').forEach(function(btn) {
            btn.onclick = function() {
                var page = parseInt(this.dataset.page);
                var fileInput = document.querySelector('.beauty-avatar-file[data-page="' + page + '"]');
                if (fileInput) fileInput.click();
            };
        });
        document.querySelectorAll('.beauty-avatar-file').forEach(function(input) {
            input.onchange = function(e) {
                var page = parseInt(this.dataset.page);
                var file = e.target.files[0];
                if (!file) return;
                var reader = new FileReader();
                reader.onload = function(ev) {
                    var data = ev.target.result;
                    config.pages[page].avatar = data;
                    _saveConfig();
                    updateBeautyPage(page);
                    var preview = document.querySelector('.beauty-avatar-preview[data-page="' + page + '"]');
                    var img = preview ? preview.querySelector('img') : null;
                    if (preview && img) { img.src = data; preview.style.display = 'block'; }
                    _notify('头像已加载', 'success', 1000);
                };
                reader.readAsDataURL(file);
                this.value = '';
            };
        });
        document.querySelectorAll('.beauty-avatar-url').forEach(function(btn) {
            btn.onclick = function() {
                var page = parseInt(this.dataset.page);
                var url = prompt('请输入头像图片URL地址：');
                if (url && url.trim()) {
                    config.pages[page].avatar = url.trim();
                    _saveConfig();
                    updateBeautyPage(page);
                    var preview = document.querySelector('.beauty-avatar-preview[data-page="' + page + '"]');
                    var img = preview ? preview.querySelector('img') : null;
                    if (preview && img) { img.src = url.trim(); preview.style.display = 'block'; }
                    _notify('头像已更新', 'success', 1000);
                }
            };
        });
        document.querySelectorAll('.beauty-avatar-clear').forEach(function(btn) {
            btn.onclick = function() {
                var page = parseInt(this.dataset.page);
                if (!confirm('确定清除头像吗？')) return;
                config.pages[page].avatar = '';
                _saveConfig();
                updateBeautyPage(page);
                var preview = document.querySelector('.beauty-avatar-preview[data-page="' + page + '"]');
                if (preview) preview.style.display = 'none';
                _notify('头像已清除', 'info');
            };
        });

        // 昵称、个签、右侧文案
        document.querySelectorAll('.beauty-title-input').forEach(function(input) {
            input.onchange = function() {
                var page = parseInt(this.dataset.page);
                config.pages[page].nickname = this.value.trim() || '未定义';
                _saveConfig();
                updateBeautyPage(page);
            };
        });
        document.querySelectorAll('.beauty-subtitle-input').forEach(function(input) {
            input.onchange = function() {
                var page = parseInt(this.dataset.page);
                config.pages[page].signature = this.value.trim();
                _saveConfig();
                updateBeautyPage(page);
            };
        });
        document.querySelectorAll('.beauty-right-labels').forEach(function(input) {
            input.onchange = function() {
                var page = parseInt(this.dataset.page);
                var parts = this.value.split('|').map(function(s) { return s.trim(); });
                if (!config.pages[page].rightLabels) config.pages[page].rightLabels = [{ label: '文案', value: '' }, { label: '副标', value: '' }];
                if (parts.length >= 2) {
                    config.pages[page].rightLabels[0].value = parts[0] || '';
                    config.pages[page].rightLabels[1].value = parts[1] || '';
                } else if (parts.length === 1) {
                    config.pages[page].rightLabels[0].value = parts[0] || '';
                    config.pages[page].rightLabels[1].value = '';
                }
                _saveConfig();
                updateBeautyPage(page);
            };
        });

        // 颜色/大小
        document.querySelectorAll('.beauty-color-input').forEach(function(input) {
            input.onchange = function() {
                var page = parseInt(this.dataset.page);
                var key = this.dataset.key;
                config.pages[page][key] = this.value;
                _saveConfig();
                updateBeautyPage(page);
            };
        });
        document.querySelectorAll('.beauty-size-input').forEach(function(input) {
            input.oninput = function() {
                var page = parseInt(this.dataset.page);
                var key = this.dataset.key;
                var val = parseInt(this.value);
                config.pages[page][key] = val;
                _saveConfig();
                updateBeautyPage(page);
                var valEl = this.parentElement.querySelector('.beauty-size-value');
                if (valEl) valEl.textContent = val + 'px';
            };
        });

        // 快捷按钮
        document.querySelectorAll('.beauty-quick-btn').forEach(function(btn) {
            btn.onclick = function() {
                var page = parseInt(this.dataset.page);
                var target = this.dataset.target;
                var map = {
                    'anniversary': openAnniversarySettings,
                    'overlap': openOverlapPhotosSettings,
                    'music': openMusicSettings,
                    'contact': openContactSettings,
                    'bigimg': openBigImageSettings,
                    'polaroids': openPolaroidsSettings
                };
                if (map[target]) map[target](page);
            };
        });
    }

    function saveAllSettings() {
        _saveConfig();
        refreshAllPages();
    }

    // =============================================
    // 设置入口（高级功能）
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
            if (img) { img.style.cssText = 'width:100%;height:100%;object-fit:cover;'; }
            else {
                var icon = avatarWrap.querySelector('i');
                if (icon) { icon.style.cssText = 'font-size:16px;color:var(--text-secondary);'; }
                else { avatarWrap.innerHTML = '<i class="fas fa-user" style="font-size:16px;color:var(--text-secondary);"></i>'; }
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
            if (!isLeft) { userEl.style.marginLeft = 'auto'; }
        }
        restructureUser(leftUser, true);
        restructureUser(rightUser, false);
        headerInner.style.cssText = 'display:flex;justify-content:space-between;align-items:center;padding:4px 12px;';
    }

    // =============================================
    // 初始化
    // =============================================
    function initBeautyPages() {
        config = _getConfig();
        if (document.getElementById('beauty-pages-wrapper')) return;
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
        chatPage.style.cssText = 'flex:0 0 100%;height:100%;overflow-y:auto;position:relative;';
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
        console.log('[美化页面] 已初始化（自定义个人主页布局）');
    }

    // =============================================
    // 启动
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
    console.log('[美化页面] 模块已加载（完整版）');
})();
