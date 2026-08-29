// beauty-pages.js - 美化页面（拍立得照片墙）
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
                title: '阿晏',
                subtitle: '🌍 地球online',
                status: '晴天',
                photos: [
                    { id: 0, url: '' },
                    { id: 1, url: '' },
                    { id: 2, url: '' },
                    { id: 3, url: '' }
                ],
                textColor: '#ffffff',
                fontSize: 20,
                subtitleColor: '#b3b3b3',
                subtitleSize: 14
            },
            {
                type: 'beauty',
                label: '阿晏&66',
                bgImage: '',
                avatar: '',
                title: '阿晏',
                subtitle: '🌙 月色温柔',
                status: '66',
                photos: [
                    { id: 0, url: '' },
                    { id: 1, url: '' },
                    { id: 2, url: '' },
                    { id: 3, url: '' }
                ],
                textColor: '#ffffff',
                fontSize: 20,
                subtitleColor: '#b3b3b3',
                subtitleSize: 14
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
                    if (!parsed.pages[i].photos || !Array.isArray(parsed.pages[i].photos)) {
                        parsed.pages[i].photos = [
                            { id: 0, url: '' },
                            { id: 1, url: '' },
                            { id: 2, url: '' },
                            { id: 3, url: '' }
                        ];
                    }
                    parsed.pages[i].photos.forEach(function(p, idx) {
                        if (p.id === undefined) p.id = idx;
                        if (p.url === undefined) p.url = '';
                    });
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
    // 更新美化页面（拍立得照片墙）
    // =============================================
    function updateBeautyPage(index) {
        var pageData = config.pages[index];
        if (!pageData || pageData.type !== 'beauty') return;

        var pageEl = document.querySelector('.beauty-page-' + index);
        if (!pageEl) return;

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

        // 头像
        var avatarImg = pageEl.querySelector('.beauty-avatar-img');
        var defaultIcon = pageEl.querySelector('.beauty-avatar-default');
        if (avatarImg && defaultIcon) {
            if (pageData.avatar) {
                avatarImg.src = pageData.avatar;
                avatarImg.style.display = 'block';
                defaultIcon.style.display = 'none';
            } else {
                avatarImg.style.display = 'none';
                defaultIcon.style.display = 'block';
            }
        }

        // 名字
        var titleEl = pageEl.querySelector('.beauty-title');
        if (titleEl) {
            titleEl.textContent = pageData.title || '未定义';
            titleEl.style.color = pageData.textColor || '#ffffff';
            titleEl.style.fontSize = (pageData.fontSize || 20) + 'px';
        }

        // 状态标签
        var statusEl = pageEl.querySelector('.beauty-status');
        if (statusEl) {
            statusEl.textContent = pageData.status || '';
            statusEl.style.display = pageData.status ? 'inline-block' : 'none';
        }

        // 副标题
        var subtitleEl = pageEl.querySelector('.beauty-subtitle');
        if (subtitleEl) {
            subtitleEl.textContent = pageData.subtitle || '';
            subtitleEl.style.color = pageData.subtitleColor || '#b3b3b3';
            subtitleEl.style.fontSize = (pageData.subtitleSize || 14) + 'px';
        }

        // ---- 四张照片 ----
        var photoGrid = pageEl.querySelector('.beauty-photo-grid');
        if (photoGrid) {
            var photos = pageData.photos || [];
            var photoItems = photoGrid.querySelectorAll('.beauty-photo-item');
            photoItems.forEach(function(item, idx) {
                var img = item.querySelector('img');
                var placeholder = item.querySelector('.beauty-photo-placeholder');
                var url = photos[idx] && photos[idx].url ? photos[idx].url : '';
                if (url) {
                    img.src = url;
                    img.style.display = 'block';
                    if (placeholder) placeholder.style.display = 'none';
                } else {
                    img.style.display = 'none';
                    if (placeholder) placeholder.style.display = 'flex';
                }
            });
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
    // 创建美化页面（拍立得照片墙）
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
            padding: 16px;
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
            cursor: pointer;
        `;
        bgLayer.addEventListener('click', function(e) {
            e.stopPropagation();
            openBeautySettings(index);
        });
        page.appendChild(bgLayer);

        // 卡片
        var card = document.createElement('div');
        card.className = 'beauty-card';
        card.style.cssText = `
            position: relative;
            z-index: 1;
            background: rgba(255,255,255,0.04);
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
            border-radius: 16px;
            padding: 16px 14px 18px;
            width: 100%;
            max-width: 360px;
            border: 1px solid rgba(255,255,255,0.06);
            box-shadow: 0 4px 20px rgba(0,0,0,0.15);
        `;

        // ---- 顶部：头像 + 名字 + 状态 ----
        var header = document.createElement('div');
        header.className = 'beauty-header';
        header.style.cssText = `
            display: flex;
            align-items: center;
            gap: 10px;
            margin-bottom: 8px;
            cursor: pointer;
        `;
        header.addEventListener('click', function(e) {
            e.stopPropagation();
            openBeautySettings(index);
        });

        // 头像
        var avatarWrap = document.createElement('div');
        avatarWrap.className = 'beauty-avatar-wrap';
        avatarWrap.style.cssText = `
            width: 36px;
            height: 36px;
            border-radius: 50%;
            overflow: hidden;
            border: 2px solid rgba(255,255,255,0.15);
            flex-shrink: 0;
            background: rgba(255,255,255,0.05);
            display: flex;
            align-items: center;
            justify-content: center;
            position: relative;
        `;
        var avatarImg = document.createElement('img');
        avatarImg.className = 'beauty-avatar-img';
        avatarImg.style.cssText = 'width:100%;height:100%;object-fit:cover;display:none;';
        avatarWrap.appendChild(avatarImg);
        var defaultIcon = document.createElement('i');
        defaultIcon.className = 'beauty-avatar-default fas fa-user';
        defaultIcon.style.cssText = 'font-size:16px;color:rgba(255,255,255,0.3);';
        avatarWrap.appendChild(defaultIcon);
        header.appendChild(avatarWrap);

        // 名字和状态
        var infoWrap = document.createElement('div');
        infoWrap.className = 'beauty-header-info';
        infoWrap.style.cssText = 'display:flex;flex-direction:column;flex:1;min-width:0;';

        var nameStatusRow = document.createElement('div');
        nameStatusRow.style.cssText = 'display:flex;align-items:center;gap:6px;flex-wrap:wrap;';

        var titleEl = document.createElement('span');
        titleEl.className = 'beauty-title';
        titleEl.style.cssText = 'font-size:18px;font-weight:700;color:#ffffff;text-shadow:0 2px 8px rgba(0,0,0,0.2);letter-spacing:0.5px;';
        nameStatusRow.appendChild(titleEl);

        var statusEl = document.createElement('span');
        statusEl.className = 'beauty-status';
        statusEl.style.cssText = `
            font-size: 12px;
            font-weight: 400;
            color: rgba(255,255,255,0.7);
            background: rgba(255,255,255,0.08);
            padding: 2px 8px;
            border-radius: 10px;
            border: 1px solid rgba(255,255,255,0.06);
            letter-spacing: 0.3px;
            display: none;
        `;
        nameStatusRow.appendChild(statusEl);

        infoWrap.appendChild(nameStatusRow);

        var subtitleEl = document.createElement('div');
        subtitleEl.className = 'beauty-subtitle';
        subtitleEl.style.cssText = 'font-size:12px;color:rgba(255,255,255,0.5);text-shadow:0 1px 4px rgba(0,0,0,0.15);margin-top:1px;letter-spacing:0.3px;line-height:1.3;';
        infoWrap.appendChild(subtitleEl);

        header.appendChild(infoWrap);
        card.appendChild(header);

        // ---- 照片网格 (2x2) ----
        var grid = document.createElement('div');
        grid.className = 'beauty-photo-grid';
        grid.style.cssText = 'display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:4px;';

        for (var i = 0; i < 4; i++) {
            var item = document.createElement('div');
            item.className = 'beauty-photo-item';
            item.dataset.photoIndex = i;
            item.style.cssText = `
                position: relative;
                aspect-ratio: 1 / 1;
                border-radius: 8px;
                overflow: hidden;
                background: rgba(255,255,255,0.03);
                border: 2px solid rgba(255,255,255,0.06);
                cursor: pointer;
                transition: border 0.2s, transform 0.2s;
                display: flex;
                align-items: center;
                justify-content: center;
            `;
            item.addEventListener('mouseenter', function() {
                this.style.border = '2px solid rgba(255,255,255,0.2)';
                this.style.transform = 'scale(1.02)';
            });
            item.addEventListener('mouseleave', function() {
                this.style.border = '2px solid rgba(255,255,255,0.06)';
                this.style.transform = 'scale(1)';
            });
            item.addEventListener('click', function(e) {
                e.stopPropagation();
                var idx = parseInt(this.dataset.photoIndex);
                openPhotoSettings(index, idx);
            });

            var img = document.createElement('img');
            img.style.cssText = 'width:100%;height:100%;object-fit:cover;display:none;';
            img.alt = '照片 ' + (i+1);
            item.appendChild(img);

            var placeholder = document.createElement('div');
            placeholder.className = 'beauty-photo-placeholder';
            placeholder.style.cssText = `
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                color: rgba(255,255,255,0.2);
                font-size: 12px;
                gap: 2px;
                pointer-events: none;
            `;
            placeholder.innerHTML = '<span style="font-size:24px;line-height:1;">+</span><span style="font-size:9px;opacity:0.5;">点击设置</span>';
            item.appendChild(placeholder);

            grid.appendChild(item);
        }

        card.appendChild(grid);
        page.appendChild(card);

        // 强制立即更新
        setTimeout(function() {
            updateBeautyPage(index);
        }, 50);

        return page;
    }

    // =============================================
    // 单独设置某张照片
    // =============================================
    function openPhotoSettings(pageIndex, photoIndex) {
        var old = document.getElementById('photo-settings-modal');
        if (old) old.remove();

        var pageData = config.pages[pageIndex];
        var photo = pageData.photos[photoIndex] || { url: '' };

        var wrap = document.createElement('div');
        wrap.id = 'photo-settings-modal';
        wrap.style.cssText = `
            position: fixed; inset: 0; z-index: 99998;
            display: flex; align-items: center; justify-content: center;
            background: rgba(0,0,0,0.5);
            backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px);
        `;

        var inner = document.createElement('div');
        inner.style.cssText = `
            background: var(--primary-bg);
            border-radius: 20px; padding: 24px;
            width: min(380px, 90vw);
            border: 1px solid var(--border-color);
            box-shadow: 0 24px 64px rgba(0,0,0,0.3);
        `;

        inner.innerHTML = `
            <div style="display:flex;justify-content:space-between;margin-bottom:16px;">
                <span style="font-size:18px;font-weight:700;color:var(--text-primary);">📷 设置照片 ${photoIndex+1}</span>
                <button id="photo-settings-close" style="background:none;border:none;font-size:20px;color:var(--text-secondary);cursor:pointer;">✕</button>
            </div>
            <div style="margin-bottom:12px;">
                <div style="font-size:13px;color:var(--text-secondary);margin-bottom:6px;">当前照片预览</div>
                <div style="width:100%;aspect-ratio:1/1;border-radius:12px;overflow:hidden;border:1px solid var(--border-color);background:var(--secondary-bg);display:flex;align-items:center;justify-content:center;">
                    <img id="photo-preview-img" src="${photo.url || ''}" style="width:100%;height:100%;object-fit:cover;display:${photo.url ? 'block' : 'none'};">
                    <span id="photo-preview-empty" style="color:var(--text-secondary);font-size:13px;${photo.url ? 'display:none;' : ''}">暂无图片</span>
                </div>
            </div>
            <div style="margin-bottom:12px;">
                <div style="display:flex;gap:8px;flex-wrap:wrap;">
                    <button id="photo-upload-btn" style="flex:1;padding:10px;border:1.5px dashed var(--border-color);border-radius:10px;background:transparent;color:var(--text-secondary);font-size:13px;cursor:pointer;font-family:var(--font-family);">📤 上传图片</button>
                    <button id="photo-url-btn" style="flex:1;padding:10px;border:1.5px dashed var(--border-color);border-radius:10px;background:transparent;color:var(--text-secondary);font-size:13px;cursor:pointer;font-family:var(--font-family);">🔗 图片URL</button>
                    <button id="photo-clear-btn" style="padding:10px 14px;border:1px solid var(--border-color);border-radius:10px;background:var(--secondary-bg);color:#ff6b6b;font-size:13px;cursor:pointer;font-family:var(--font-family);">清除</button>
                </div>
                <input type="file" id="photo-file-input" accept="image/*" style="display:none;">
            </div>
            <div style="display:flex;gap:10px;">
                <button id="photo-cancel" style="flex:1;padding:10px;border:1px solid var(--border-color);border-radius:12px;background:var(--secondary-bg);color:var(--text-secondary);font-size:13px;cursor:pointer;">取消</button>
                <button id="photo-save" style="flex:2;padding:10px;border:none;border-radius:12px;background:var(--accent-color);color:#fff;font-weight:700;font-size:13px;cursor:pointer;">保存</button>
            </div>
        `;

        wrap.appendChild(inner);
        document.body.appendChild(wrap);

        var tempUrl = photo.url || '';

        document.getElementById('photo-settings-close').onclick = function() { wrap.remove(); };
        document.getElementById('photo-cancel').onclick = function() { wrap.remove(); };
        wrap.onclick = function(e) { if (e.target === wrap) wrap.remove(); };

        function updatePreview(url) {
            var img = document.getElementById('photo-preview-img');
            var empty = document.getElementById('photo-preview-empty');
            if (url) {
                img.src = url;
                img.style.display = 'block';
                if (empty) empty.style.display = 'none';
                tempUrl = url;
            } else {
                img.style.display = 'none';
                if (empty) empty.style.display = 'block';
                tempUrl = '';
            }
        }

        document.getElementById('photo-upload-btn').onclick = function() {
            document.getElementById('photo-file-input').click();
        };
        document.getElementById('photo-file-input').onchange = function(e) {
            var file = e.target.files[0];
            if (!file) return;
            var reader = new FileReader();
            reader.onload = function(ev) {
                var data = ev.target.result;
                updatePreview(data);
                _notify('图片已加载', 'success', 1000);
            };
            reader.readAsDataURL(file);
            this.value = '';
        };

        document.getElementById('photo-url-btn').onclick = function() {
            var url = prompt('请输入图片URL地址：');
            if (url && url.trim()) {
                updatePreview(url.trim());
                _notify('图片已加载', 'success', 1000);
            }
        };

        document.getElementById('photo-clear-btn').onclick = function() {
            if (confirm('确定清除这张照片吗？')) {
                updatePreview('');
                _notify('已清除', 'info');
            }
        };

        document.getElementById('photo-save').onclick = function() {
            pageData.photos[photoIndex].url = tempUrl;
            _saveConfig();
            updateBeautyPage(pageIndex);
            wrap.remove();
            _notify('照片已更新 ✨', 'success');
        };

        if (photo.url) {
            updatePreview(photo.url);
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

        var lastClickTime = 0;
        indicator.addEventListener('click', function(e) {
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
                var rect = indicator.getBoundingClientRect();
                saveIndicatorPosition(rect.left, rect.top);
                indicatorDragging = false;
                indicator.style.cursor = 'grab';
            }
            isPressed = false;
            if (e.cancelable) e.preventDefault();
        }

        indicator.addEventListener('mousedown', startPress);
        document.addEventListener('mousemove', movePress);
        document.addEventListener('mouseup', endPress);

        indicator.addEventListener('touchstart', startPress, { passive: false });
        document.addEventListener('touchmove', movePress, { passive: false });
        document.addEventListener('touchend', endPress, { passive: false });

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
    // 初始化
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
                    <label style="font-size:12px;color:var(--text-secondary);display:block;margin-bottom:4px;">名字</label>
                    <input class="beauty-title-input" data-page="${pi}" type="text" value="${_esc(pageData.title || '未定义')}" style="width:100%;padding:8px 10px;border:1px solid var(--border-color);border-radius:8px;background:var(--secondary-bg);color:var(--text-primary);font-size:13px;box-sizing:border-box;font-family:var(--font-family);">
                </div>
                <div style="margin-bottom:8px;">
                    <label style="font-size:12px;color:var(--text-secondary);display:block;margin-bottom:4px;">状态标签</label>
                    <input class="beauty-status-input" data-page="${pi}" type="text" value="${_esc(pageData.status || '')}" placeholder="如：晴天" style="width:100%;padding:8px 10px;border:1px solid var(--border-color);border-radius:8px;background:var(--secondary-bg);color:var(--text-primary);font-size:13px;box-sizing:border-box;font-family:var(--font-family);">
                </div>
                <div style="margin-bottom:8px;">
                    <label style="font-size:12px;color:var(--text-secondary);display:block;margin-bottom:4px;">副标题</label>
                    <input class="beauty-subtitle-input" data-page="${pi}" type="text" value="${_esc(pageData.subtitle || '')}" placeholder="如：🌍 地球online" style="width:100%;padding:8px 10px;border:1px solid var(--border-color);border-radius:8px;background:var(--secondary-bg);color:var(--text-primary);font-size:13px;box-sizing:border-box;font-family:var(--font-family);">
                </div>
                <div style="display:flex;gap:12px;flex-wrap:wrap;margin-bottom:8px;">
                    <div style="flex:1;min-width:80px;">
                        <label style="font-size:11px;color:var(--text-secondary);display:block;margin-bottom:2px;">名字颜色</label>
                        <input class="beauty-color-input" data-page="${pi}" data-key="textColor" type="color" value="${pageData.textColor || '#ffffff'}" style="width:100%;height:32px;border:1px solid var(--border-color);border-radius:6px;padding:2px;background:var(--secondary-bg);cursor:pointer;">
                    </div>
                    <div style="flex:1;min-width:80px;">
                        <label style="font-size:11px;color:var(--text-secondary);display:block;margin-bottom:2px;">名字大小</label>
                        <div style="display:flex;align-items:center;gap:6px;">
                            <input class="beauty-size-input" data-page="${pi}" data-key="fontSize" type="range" min="16" max="48" value="${pageData.fontSize || 20}" style="flex:1;">
                            <span class="beauty-size-value" style="font-size:12px;color:var(--text-secondary);min-width:32px;">${pageData.fontSize || 20}px</span>
                        </div>
                    </div>
                </div>
                <div style="display:flex;gap:12px;flex-wrap:wrap;margin-bottom:8px;">
                    <div style="flex:1;min-width:80px;">
                        <label style="font-size:11px;color:var(--text-secondary);display:block;margin-bottom:2px;">副标题颜色</label>
                        <input class="beauty-color-input" data-page="${pi}" data-key="subtitleColor" type="color" value="${pageData.subtitleColor || '#b3b3b3'}" style="width:100%;height:32px;border:1px solid var(--border-color);border-radius:6px;padding:2px;background:var(--secondary-bg);cursor:pointer;">
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
                    <label style="font-size:12px;color:var(--text-secondary);display:block;margin-bottom:4px;">四张照片</label>
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;">
                        <button class="beauty-photo-set" data-page="${pi}" data-photo="0" style="padding:8px;border:1px solid var(--border-color);border-radius:8px;background:var(--secondary-bg);color:var(--text-secondary);font-size:11px;cursor:pointer;font-family:var(--font-family);">📷 照片1 ${pageData.photos && pageData.photos[0] && pageData.photos[0].url ? '✅' : ''}</button>
                        <button class="beauty-photo-set" data-page="${pi}" data-photo="1" style="padding:8px;border:1px solid var(--border-color);border-radius:8px;background:var(--secondary-bg);color:var(--text-secondary);font-size:11px;cursor:pointer;font-family:var(--font-family);">📷 照片2 ${pageData.photos && pageData.photos[1] && pageData.photos[1].url ? '✅' : ''}</button>
                        <button class="beauty-photo-set" data-page="${pi}" data-photo="2" style="padding:8px;border:1px solid var(--border-color);border-radius:8px;background:var(--secondary-bg);color:var(--text-secondary);font-size:11px;cursor:pointer;font-family:var(--font-family);">📷 照片3 ${pageData.photos && pageData.photos[2] && pageData.photos[2].url ? '✅' : ''}</button>
                        <button class="beauty-photo-set" data-page="${pi}" data-photo="3" style="padding:8px;border:1px solid var(--border-color);border-radius:8px;background:var(--secondary-bg);color:var(--text-secondary);font-size:11px;cursor:pointer;font-family:var(--font-family);">📷 照片4 ${pageData.photos && pageData.photos[3] && pageData.photos[3].url ? '✅' : ''}</button>
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

    // =============================================
    // 绑定设置事件
    // =============================================
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

        // 名字
        document.querySelectorAll('.beauty-title-input').forEach(function(input) {
            input.onchange = function() {
                var page = parseInt(this.dataset.page);
                config.pages[page].title = this.value.trim() || '未定义';
                _saveConfig();
                updateBeautyPage(page);
            };
        });

        // 状态
        document.querySelectorAll('.beauty-status-input').forEach(function(input) {
            input.onchange = function() {
                var page = parseInt(this.dataset.page);
                config.pages[page].status = this.value.trim();
                _saveConfig();
                updateBeautyPage(page);
            };
        });

        // 副标题
        document.querySelectorAll('.beauty-subtitle-input').forEach(function(input) {
            input.onchange = function() {
                var page = parseInt(this.dataset.page);
                config.pages[page].subtitle = this.value.trim();
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

        // 照片设置
        document.querySelectorAll('.beauty-photo-set').forEach(function(btn) {
            btn.onclick = function() {
                var page = parseInt(this.dataset.page);
                var photo = parseInt(this.dataset.photo);
                openPhotoSettings(page, photo);
            };
        });
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

    console.log('[美化页面] 模块已加载（拍立得照片墙）');
})();
