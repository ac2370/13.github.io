// beauty-pages.js - 全局美化页面（左右滑动切换，增强版布局）
(function() {
    'use strict';

    var STORAGE_KEY = 'beauty_pages_config';
    var PAGE_COUNT = 3;

    // 默认配置（包含更多内容块）
    var DEFAULT_CONFIG = {
        pages: [
            { type: 'chat', label: '聊天' },
            {
                type: 'beauty',
                label: '阿晏&小回',
                bgImage: '',
                // 头部信息
                avatar: '',
                title: '阿晏 & 小回',
                subtitle: '✨ 星河入梦，你是人间理想 ✨',
                // 标签列表
                tags: [
                    { key: '昵称', value: '小回' },
                    { key: '副文', value: '星河入梦' },
                    { key: '标签', value: '✨ 温柔' },
                    { key: '文案', value: '你是人间理想' },
                    { key: '注册', value: '2026-08-29' },
                    { key: '标题', value: '✨ 星河入梦 ✨' }
                ],
                textColor: '#ffffff',
                fontSize: 26,
                subtitleColor: 'rgba(255,255,255,0.7)',
                subtitleSize: 14,
                tagColor: 'rgba(255,255,255,0.85)',
                tagSize: 14
            },
            {
                type: 'beauty',
                label: '阿晏&66',
                bgImage: '',
                avatar: '',
                title: '阿晏 & 66',
                subtitle: '🌙 月色温柔，你是我唯一的偏爱 🌙',
                tags: [
                    { key: '昵称', value: '66' },
                    { key: '副文', value: '月色温柔' },
                    { key: '标签', value: '🌙 偏爱' },
                    { key: '文案', value: '你是我唯一的偏爱' },
                    { key: '注册', value: '2026-08-29' },
                    { key: '标题', value: '🌙 月色温柔 🌙' }
                ],
                textColor: '#ffffff',
                fontSize: 26,
                subtitleColor: 'rgba(255,255,255,0.7)',
                subtitleSize: 14,
                tagColor: 'rgba(255,255,255,0.85)',
                tagSize: 14
            }
        ],
        currentIndex: 0
    };

    var config = null;
    var isAnimating = false;

    function _getConfig() {
        try {
            var saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                var parsed = JSON.parse(saved);
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

    // =============================================
    // 更新美化页面（包含所有内容块）
    // =============================================
    function updateBeautyPage(index) {
        var pageData = config.pages[index];
        if (!pageData || pageData.type !== 'beauty') return;

        var pageEl = document.querySelector('.beauty-page-' + index);
        if (!pageEl) return;

        // 头像
        var avatarEl = pageEl.querySelector('.beauty-avatar-img');
        if (avatarEl) {
            if (pageData.avatar) {
                avatarEl.src = pageData.avatar;
                avatarEl.style.display = 'block';
            } else {
                avatarEl.src = '';
                avatarEl.style.display = 'none';
            }
        }

        // 标题
        var titleEl = pageEl.querySelector('.beauty-title');
        if (titleEl) {
            titleEl.textContent = pageData.title || '标题';
            titleEl.style.color = pageData.textColor || '#ffffff';
            titleEl.style.fontSize = (pageData.fontSize || 24) + 'px';
        }

        // 副标题
        var subtitleEl = pageEl.querySelector('.beauty-subtitle');
        if (subtitleEl) {
            subtitleEl.textContent = pageData.subtitle || '';
            subtitleEl.style.color = pageData.subtitleColor || 'rgba(255,255,255,0.7)';
            subtitleEl.style.fontSize = (pageData.subtitleSize || 14) + 'px';
        }

        // 背景
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

        // 标签列表
        var tagContainer = pageEl.querySelector('.beauty-tags');
        if (tagContainer) {
            tagContainer.innerHTML = '';
            var tags = pageData.tags || [];
            tags.forEach(function(tag) {
                var row = document.createElement('div');
                row.className = 'beauty-tag-row';
                row.style.cssText = `
                    display: flex;
                    justify-content: space-between;
                    padding: 6px 0;
                    border-bottom: 1px solid rgba(255,255,255,0.06);
                    font-size: ${pageData.tagSize || 14}px;
                    color: ${pageData.tagColor || 'rgba(255,255,255,0.85)'};
                `;
                row.innerHTML = `
                    <span style="opacity:0.6;font-weight:300;">${_esc(tag.key)}</span>
                    <span style="font-weight:400;">${_esc(tag.value)}</span>
                `;
                tagContainer.appendChild(row);
            });
        }
    }

    function refreshAllPages() {
        for (var i = 0; i < config.pages.length; i++) {
            if (config.pages[i].type === 'beauty') {
                updateBeautyPage(i);
            }
        }
    }

    // =============================================
    // 页面切换
    // =============================================
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

    // =============================================
    // 创建美化页面（增强版布局）
    // =============================================
    function createBeautyPage(index) {
        var pageData = config.pages[index];
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

        // 背景层
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
        `;
        page.appendChild(bgLayer);

        // 内容卡片
        var card = document.createElement('div');
        card.className = 'beauty-card';
        card.style.cssText = `
            position: relative;
            z-index: 1;
            background: rgba(255,255,255,0.06);
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
            border-radius: 24px;
            padding: 24px 20px;
            width: 100%;
            max-width: 360px;
            border: 1px solid rgba(255,255,255,0.08);
            box-shadow: 0 8px 32px rgba(0,0,0,0.2);
        `;

        // 头像
        var avatarWrap = document.createElement('div');
        avatarWrap.className = 'beauty-avatar-wrap';
        avatarWrap.style.cssText = 'text-align:center;margin-bottom:12px;';
        var avatarImg = document.createElement('img');
        avatarImg.className = 'beauty-avatar-img';
        avatarImg.style.cssText = `
            width: 72px;
            height: 72px;
            border-radius: 50%;
            object-fit: cover;
            border: 2px solid rgba(255,255,255,0.2);
            display: none;
            margin: 0 auto;
        `;
        avatarWrap.appendChild(avatarImg);
        card.appendChild(avatarWrap);

        // 标题
        var title = document.createElement('div');
        title.className = 'beauty-title';
        title.style.cssText = `
            font-size: 24px;
            font-weight: 700;
            color: #ffffff;
            text-shadow: 0 2px 12px rgba(0,0,0,0.3);
            text-align: center;
            margin-bottom: 4px;
            letter-spacing: 1px;
            transition: all 0.3s ease;
        `;
        card.appendChild(title);

        // 副标题
        var subtitle = document.createElement('div');
        subtitle.className = 'beauty-subtitle';
        subtitle.style.cssText = `
            font-size: 13px;
            color: rgba(255,255,255,0.7);
            text-shadow: 0 1px 8px rgba(0,0,0,0.2);
            text-align: center;
            margin-bottom: 16px;
            letter-spacing: 0.5px;
            transition: all 0.3s ease;
            line-height: 1.5;
        `;
        card.appendChild(subtitle);

        // 标签列表容器
        var tagContainer = document.createElement('div');
        tagContainer.className = 'beauty-tags';
        tagContainer.style.cssText = `
            margin-top: 4px;
            border-top: 1px solid rgba(255,255,255,0.08);
            padding-top: 12px;
        `;
        card.appendChild(tagContainer);

        page.appendChild(card);

        // 更新内容
        updateBeautyPage(index);

        return page;
    }

    // =============================================
    // 初始化滑动页面
    // =============================================
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

        // 页面0：聊天
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

        // 页面1：美化页1
        var beautyPage1 = createBeautyPage(1);
        track.appendChild(beautyPage1);

        // 页面2：美化页2
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
    // 指示器
    // =============================================
    function addIndicator(wrapper) {
        var indicator = document.createElement('div');
        indicator.id = 'beauty-indicator';
        indicator.style.cssText = `
            position: absolute;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            display: flex;
            gap: 8px;
            z-index: 100;
            background: rgba(0,0,0,0.3);
            backdrop-filter: blur(8px);
            padding: 6px 14px;
            border-radius: 20px;
            border: 1px solid rgba(255,255,255,0.08);
        `;

        var labels = ['💬 聊天', '🌸 小回', '🌙 66'];

        for (var i = 0; i < PAGE_COUNT; i++) {
            var dot = document.createElement('button');
            dot.className = 'beauty-dot';
            dot.dataset.index = i;
            dot.style.cssText = `
                width: ${i === config.currentIndex ? '18px' : '8px'};
                height: 8px;
                border-radius: ${i === config.currentIndex ? '4px' : '50%'};
                border: none;
                cursor: pointer;
                transition: all 0.3s ease;
                background: ${i === config.currentIndex ? 'var(--accent-color, #e0698a)' : 'rgba(255,255,255,0.3)'};
                padding: 0;
                flex-shrink: 0;
            `;
            dot.title = labels[i];
            dot.addEventListener('click', function() {
                var idx = parseInt(this.dataset.index);
                if (idx !== config.currentIndex) {
                    goToPage(idx, true);
                }
            });
            indicator.appendChild(dot);
        }
        wrapper.appendChild(indicator);
    }

    // =============================================
    // 触摸事件
    // =============================================
    function bindTouchEvents(wrapper, track) {
        var startX = 0, startIndex = 0, isDragging = false;

        wrapper.addEventListener('touchstart', function(e) {
            if (isAnimating) return;
            var touch = e.touches[0];
            startX = touch.clientX;
            startIndex = config.currentIndex || 0;
            isDragging = true;
            track.style.transition = 'none';
        }, { passive: true });

        wrapper.addEventListener('touchmove', function(e) {
            if (!isDragging || isAnimating) return;
            var touch = e.touches[0];
            var diff = touch.clientX - startX;
            var offset = -startIndex * 100 + (diff / wrapper.offsetWidth * 100);
            offset = Math.min(0, Math.max(offset, -(PAGE_COUNT - 1) * 100));
            track.style.transform = 'translateX(' + offset + '%)';
        }, { passive: true });

        wrapper.addEventListener('touchend', function(e) {
            if (!isDragging) return;
            isDragging = false;
            var diff = 0;
            var lastTouch = e.changedTouches[0];
            if (lastTouch) diff = lastTouch.clientX - startX;
            var threshold = 50;
            var newIndex = startIndex;
            if (diff < -threshold) newIndex = Math.min(startIndex + 1, PAGE_COUNT - 1);
            else if (diff > threshold) newIndex = Math.max(startIndex - 1, 0);
            goToPage(newIndex, true);
        }, { passive: true });

        // 鼠标支持
        var mouseDown = false, mouseStartX = 0, mouseStartIndex = 0;
        wrapper.addEventListener('mousedown', function(e) {
            if (isAnimating) return;
            if (e.button !== 0) return;
            mouseDown = true;
            mouseStartX = e.clientX;
            mouseStartIndex = config.currentIndex || 0;
            track.style.transition = 'none';
            e.preventDefault();
        });

        document.addEventListener('mousemove', function(e) {
            if (!mouseDown || isAnimating) return;
            var diff = e.clientX - mouseStartX;
            var offset = -mouseStartIndex * 100 + (diff / wrapper.offsetWidth * 100);
            offset = Math.min(0, Math.max(offset, -(PAGE_COUNT - 1) * 100));
            track.style.transform = 'translateX(' + offset + '%)';
        });

        document.addEventListener('mouseup', function(e) {
            if (!mouseDown) return;
            mouseDown = false;
            var diff = e.clientX - mouseStartX;
            var threshold = 50;
            var newIndex = mouseStartIndex;
            if (diff < -threshold) newIndex = Math.min(mouseStartIndex + 1, PAGE_COUNT - 1);
            else if (diff > threshold) newIndex = Math.max(mouseStartIndex - 1, 0);
            goToPage(newIndex, true);
        });
    }

    // =============================================
    // 设置面板（增强版）
    // =============================================
    function openBeautySettings() {
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

        // 标题
        var header = document.createElement('div');
        header.style.cssText = 'display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;';
        header.innerHTML = `
            <span style="font-size:18px;font-weight:700;color:var(--text-primary);">🖼️ 美化页面设置</span>
            <button id="beauty-settings-close" style="background:none;border:none;font-size:20px;color:var(--text-secondary);cursor:pointer;">✕</button>
        `;
        inner.appendChild(header);

        // 页面切换按钮
        var pageSelect = document.createElement('div');
        pageSelect.style.cssText = 'display:flex;gap:8px;margin-bottom:16px;';
        var pageOptions = ['💬 聊天', '🌸 阿晏&小回', '🌙 阿晏&66'];
        for (var i = 0; i < PAGE_COUNT; i++) {
            var btn = document.createElement('button');
            btn.textContent = pageOptions[i];
            btn.style.cssText = `
                flex:1; padding:8px 4px; border:2px solid ${config.currentIndex === i ? 'var(--accent-color)' : 'var(--border-color)'};
                border-radius:10px; background:${config.currentIndex === i ? 'rgba(var(--accent-color-rgb),0.1)' : 'var(--secondary-bg)'};
                color:${config.currentIndex === i ? 'var(--accent-color)' : 'var(--text-secondary)'};
                font-size:11px; font-weight:${config.currentIndex === i ? '700' : '400'};
                cursor:pointer; font-family:var(--font-family);
            `;
            btn.onclick = (function(idx) {
                return function() { goToPage(idx, true); };
            })(i);
            pageSelect.appendChild(btn);
        }
        inner.appendChild(pageSelect);

        // 设置表单（只显示当前页面的设置）
        for (var pi = 1; pi < PAGE_COUNT; pi++) {
            var pageData = config.pages[pi];
            if (pageData.type !== 'beauty') continue;

            var section = document.createElement('div');
            section.id = 'beauty-settings-section-' + pi;
            section.style.cssText = `
                padding: 12px 0;
                border-bottom: 1px solid rgba(var(--border-color-rgb),0.1);
                ${config.currentIndex !== pi ? 'display:none;' : ''}
            `;

            // 构建标签编辑HTML
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
                    <label style="font-size:12px;color:var(--text-secondary);display:block;margin-bottom:4px;">头像</label>
                    <div style="display:flex;gap:8px;">
                        <button class="beauty-avatar-upload" data-page="${pi}" style="flex:1;padding:8px;border:1.5px dashed var(--border-color);border-radius:8px;background:transparent;color:var(--text-secondary);font-size:12px;cursor:pointer;font-family:var(--font-family);">📤 上传头像</button>
                        <button class="beauty-avatar-url" data-page="${pi}" style="flex:1;padding:8px;border:1.5px dashed var(--border-color);border-radius:8px;background:transparent;color:var(--text-secondary);font-size:12px;cursor:pointer;font-family:var(--font-family);">🔗 URL</button>
                        <button class="beauty-avatar-clear" data-page="${pi}" style="padding:8px 12px;border:1px solid var(--border-color);border-radius:8px;background:var(--secondary-bg);color:#ff6b6b;font-size:12px;cursor:pointer;font-family:var(--font-family);">清除</button>
                    </div>
                    <input type="file" class="beauty-avatar-file" data-page="${pi}" accept="image/*" style="display:none;">
                    <div class="beauty-avatar-preview" data-page="${pi}" style="display:${pageData.avatar ? 'block' : 'none'};margin-top:6px;border-radius:50%;overflow:hidden;width:48px;height:48px;border:2px solid var(--border-color);">
                        <img src="${pageData.avatar || ''}" style="width:100%;height:100%;object-fit:cover;display:block;">
                    </div>
                </div>
                <div style="margin-bottom:8px;">
                    <label style="font-size:12px;color:var(--text-secondary);display:block;margin-bottom:4px;">主标题</label>
                    <input class="beauty-title-input" data-page="${pi}" type="text" value="${_esc(pageData.title || '')}" style="width:100%;padding:8px 10px;border:1px solid var(--border-color);border-radius:8px;background:var(--secondary-bg);color:var(--text-primary);font-size:13px;box-sizing:border-box;font-family:var(--font-family);">
                </div>
                <div style="margin-bottom:8px;">
                    <label style="font-size:12px;color:var(--text-secondary);display:block;margin-bottom:4px;">副标题</label>
                    <input class="beauty-subtitle-input" data-page="${pi}" type="text" value="${_esc(pageData.subtitle || '')}" style="width:100%;padding:8px 10px;border:1px solid var(--border-color);border-radius:8px;background:var(--secondary-bg);color:var(--text-primary);font-size:13px;box-sizing:border-box;font-family:var(--font-family);">
                </div>
                <div style="display:flex;gap:12px;flex-wrap:wrap;margin-bottom:8px;">
                    <div style="flex:1;min-width:80px;">
                        <label style="font-size:11px;color:var(--text-secondary);display:block;margin-bottom:2px;">标题颜色</label>
                        <input class="beauty-color-input" data-page="${pi}" data-key="textColor" type="color" value="${pageData.textColor || '#ffffff'}" style="width:100%;height:32px;border:1px solid var(--border-color);border-radius:6px;padding:2px;background:var(--secondary-bg);cursor:pointer;">
                    </div>
                    <div style="flex:1;min-width:80px;">
                        <label style="font-size:11px;color:var(--text-secondary);display:block;margin-bottom:2px;">标题大小</label>
                        <div style="display:flex;align-items:center;gap:6px;">
                            <input class="beauty-size-input" data-page="${pi}" data-key="fontSize" type="range" min="16" max="48" value="${pageData.fontSize || 24}" style="flex:1;">
                            <span class="beauty-size-value" style="font-size:12px;color:var(--text-secondary);min-width:32px;">${pageData.fontSize || 24}px</span>
                        </div>
                    </div>
                </div>
                <div style="display:flex;gap:12px;flex-wrap:wrap;margin-bottom:8px;">
                    <div style="flex:1;min-width:80px;">
                        <label style="font-size:11px;color:var(--text-secondary);display:block;margin-bottom:2px;">副标题颜色</label>
                        <input class="beauty-color-input" data-page="${pi}" data-key="subtitleColor" type="color" value="${pageData.subtitleColor || 'rgba(255,255,255,0.7)'}" style="width:100%;height:32px;border:1px solid var(--border-color);border-radius:6px;padding:2px;background:var(--secondary-bg);cursor:pointer;">
                    </div>
                    <div style="flex:1;min-width:80px;">
                        <label style="font-size:11px;color:var(--text-secondary);display:block;margin-bottom:2px;">副标题大小</label>
                        <div style="display:flex;align-items:center;gap:6px;">
                            <input class="beauty-size-input" data-page="${pi}" data-key="subtitleSize" type="range" min="10" max="24" value="${pageData.subtitleSize || 14}" style="flex:1;">
                            <span class="beauty-size-value" style="font-size:12px;color:var(--text-secondary);min-width:32px;">${pageData.subtitleSize || 14}px</span>
                        </div>
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

        // 保存按钮
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

    // =============================================
    // 绑定设置事件
    // =============================================
    function bindSettingsEvents() {
        // --- 背景图 ---
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

        // --- 头像 ---
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
                    if (preview && img) {
                        img.src = data;
                        preview.style.display = 'block';
                    }
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
                    if (preview && img) {
                        img.src = url.trim();
                        preview.style.display = 'block';
                    }
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

        // --- 标题 ---
        document.querySelectorAll('.beauty-title-input').forEach(function(input) {
            input.onchange = function() {
                var page = parseInt(this.dataset.page);
                config.pages[page].title = this.value.trim() || '标题';
                _saveConfig();
                updateBeautyPage(page);
            };
        });
        document.querySelectorAll('.beauty-subtitle-input').forEach(function(input) {
            input.onchange = function() {
                var page = parseInt(this.dataset.page);
                config.pages[page].subtitle = this.value.trim();
                _saveConfig();
                updateBeautyPage(page);
            };
        });

        // --- 颜色/大小 ---
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

        // --- 标签管理 ---
        document.querySelectorAll('.beauty-tag-add').forEach(function(btn) {
            btn.onclick = function() {
                var page = parseInt(this.dataset.page);
                var tags = config.pages[page].tags || [];
                tags.push({ key: '新标签', value: '内容' });
                config.pages[page].tags = tags;
                _saveConfig();
                // 重新渲染该页面的设置
                var section = document.getElementById('beauty-settings-section-' + page);
                if (section) {
                    // 重建标签部分（简单方法：重新生成整个section）
                    // 但我们只刷新标签列表
                    var container = document.getElementById('beauty-tags-container-' + page);
                    if (container) {
                        // 清空并重新构建
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
                        // 重新绑定事件
                        bindTagEvents();
                    }
                    updateBeautyPage(page);
                    _notify('标签已添加', 'success', 1000);
                }
            };
        });

        function bindTagEvents() {
            // 标签key/value修改
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
            // 标签删除
            document.querySelectorAll('.beauty-tag-remove').forEach(function(btn) {
                btn.onclick = function() {
                    var page = parseInt(this.dataset.page);
                    var idx = parseInt(this.dataset.idx);
                    var tags = config.pages[page].tags || [];
                    if (idx >= 0 && idx < tags.length) {
                        tags.splice(idx, 1);
                        config.pages[page].tags = tags;
                        _saveConfig();
                        // 重新渲染该页面的标签列表
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
    // 顶部栏修改（红圈位置改成红圈所示布局）
    // =============================================
    function modifyHeaderLayout() {
        // 将头部改为红圈所示样式：头像和名字更紧凑，在线状态放在名字下方或旁边
        var header = document.querySelector('.header-inner');
        if (!header) return;

        // 检查是否已经修改过
        if (header.dataset.beautyModified) return;
        header.dataset.beautyModified = 'true';

        // 获取现有的 user-info 元素
        var userInfos = header.querySelectorAll('.user-info');
        if (userInfos.length < 2) return;

        // 左侧（梦角）和右侧（我）
        var leftUser = userInfos[0];
        var rightUser = userInfos[1];

        // 重新排列：将头像放在名字上面或旁边，在线状态放在名字下方
        // 这里我们采取：将头像和名字放在同一行，在线状态放在名字右侧或下方
        // 具体根据红圈样式（猜测是头像在左，名字在右，在线状态在名字下方小字）
        // 我们重新构建布局
        function restructureUser(userEl) {
            var avatar = userEl.querySelector('.avatar-container');
            var name = userEl.querySelector('.username');
            var status = userEl.querySelector('.status');

            if (!avatar || !name || !status) return;

            // 清空原有布局
            userEl.innerHTML = '';
            userEl.style.cssText = 'display:flex;align-items:center;gap:8px;';

            // 新布局：头像 + 右边 (名字 + 状态)
            var avatarClone = avatar.cloneNode(true);
            avatarClone.style.cssText = 'width:32px;height:32px;flex-shrink:0;';
            userEl.appendChild(avatarClone);

            var infoWrap = document.createElement('div');
            infoWrap.style.cssText = 'display:flex;flex-direction:column;';

            var nameClone = name.cloneNode(true);
            nameClone.style.cssText = 'font-size:14px;font-weight:600;color:var(--text-primary);';
            infoWrap.appendChild(nameClone);

            var statusClone = status.cloneNode(true);
            statusClone.style.cssText = 'font-size:10px;color:var(--text-secondary);opacity:0.7;';
            infoWrap.appendChild(statusClone);

            userEl.appendChild(infoWrap);
        }

        restructureUser(leftUser);
        restructureUser(rightUser);

        // 调整左右间距，让整体更紧凑
        header.style.cssText = 'display:flex;justify-content:space-between;align-items:center;padding:4px 12px;';
    }

    // =============================================
    // 添加入口到设置面板
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
                setTimeout(modifyHeaderLayout, 1000);
            });
        } else {
            setTimeout(initBeautyPages, 500);
            setTimeout(addSettingsEntry, 800);
            setTimeout(modifyHeaderLayout, 1000);
        }
    }

    init();

    console.log('[美化页面] 模块已加载（增强版）');
})();
