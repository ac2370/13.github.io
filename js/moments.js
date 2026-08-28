    // =============================================
    // 朋友圈主界面（左上角返回箭头）
    // =============================================
    window.openMoments = function() {
        _generatePartnerPosts();

        var old = document.getElementById('moments-modal');
        if (old) old.remove();

        var wrap = document.createElement('div');
        wrap.id = 'moments-modal';
        wrap.style.cssText = 'position:fixed;inset:0;z-index:10010;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.7);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);';

        var inner = document.createElement('div');
        inner.style.cssText = 'background:var(--primary-bg);border-radius:24px;padding:0;width:min(480px, 94vw);max-height:85vh;display:flex;flex-direction:column;overflow:hidden;box-shadow:0 24px 64px rgba(0,0,0,0.3);border:1px solid var(--border-color);';

        // ===== 顶部封面区域 =====
        var coverUrl = _getCoverImage();
        var defaultCover = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
        var coverStyle = coverUrl ? 'url(' + coverUrl + ')' : defaultCover;

        var coverSection = document.createElement('div');
        coverSection.id = 'moments-cover';
        coverSection.style.cssText = 'position:relative;width:100%;height:160px;background:' + coverStyle + ';background-size:cover;background-position:center;flex-shrink:0;cursor:pointer;transition:background 0.3s ease;';

        var coverText = document.createElement('div');
        coverText.style.cssText = 'position:absolute;bottom:16px;left:16px;right:16px;color:rgba(255,255,255,0.9);text-shadow:0 2px 12px rgba(0,0,0,0.3);';
        coverText.innerHTML = 
            '<div style="font-size:16px;font-weight:300;letter-spacing:2px;font-style:italic;line-height:1.5;">誓言是一场有时差的雨。</div>' +
            '<div style="font-size:11px;opacity:0.7;margin-top:2px;letter-spacing:1px;font-weight:300;">— Vow is a rain with time difference.</div>';
        coverSection.appendChild(coverText);

        var coverBtnHint = document.createElement('div');
        coverBtnHint.style.cssText = 'position:absolute;top:12px;right:12px;background:rgba(0,0,0,0.5);backdrop-filter:blur(8px);padding:4px 10px;border-radius:12px;font-size:11px;color:rgba(255,255,255,0.8);pointer-events:none;';
        coverBtnHint.textContent = '📷 更换封面';
        coverSection.appendChild(coverBtnHint);

        coverSection.addEventListener('click', function() {
            showCoverSettings();
        });

        inner.appendChild(coverSection);

        // ===== 标题栏（左上角返回箭头） =====
        var header = document.createElement('div');
        header.style.cssText = 'display:flex;justify-content:space-between;align-items:center;padding:16px 20px 12px;border-bottom:1px solid var(--border-color);flex-shrink:0;';

        // 左侧：返回箭头 + 标题
        var leftSection = document.createElement('div');
        leftSection.style.cssText = 'display:flex;align-items:center;gap:10px;';
        var backBtn = document.createElement('button');
        backBtn.style.cssText = 'background:none;border:none;font-size:18px;color:var(--text-secondary);cursor:pointer;padding:4px 6px;border-radius:8px;display:flex;align-items:center;justify-content:center;';
        backBtn.innerHTML = '<i class="fas fa-arrow-left"></i>';
        backBtn.onclick = function() { wrap.remove(); };
        leftSection.appendChild(backBtn);

        var titleSpan = document.createElement('span');
        titleSpan.style.cssText = 'font-size:18px;font-weight:700;color:var(--text-primary);';
        titleSpan.textContent = '📱 朋友圈';
        leftSection.appendChild(titleSpan);
        header.appendChild(leftSection);

        // 右侧：背景图按钮
        var rightSection = document.createElement('div');
        rightSection.style.cssText = 'display:flex;gap:8px;align-items:center;';
        var bgBtn = document.createElement('button');
        bgBtn.style.cssText = 'background:none;border:none;font-size:16px;color:var(--text-secondary);cursor:pointer;padding:4px 6px;border-radius:8px;';
        bgBtn.innerHTML = '<i class="fas fa-image"></i>';
        bgBtn.title = '更换封面';
        bgBtn.onclick = function(e) {
            e.stopPropagation();
            showCoverSettings();
        };
        rightSection.appendChild(bgBtn);

        header.appendChild(rightSection);
        inner.appendChild(header);

        // ===== Tab切换 =====
        var tabBar = document.createElement('div');
        tabBar.style.cssText = 'display:flex;border-bottom:1px solid var(--border-color);flex-shrink:0;background:var(--primary-bg);';
        tabBar.innerHTML = '<button class="moments-tab active" data-tab="me" style="flex:1;padding:10px;border:none;background:var(--secondary-bg);font-weight:700;color:var(--text-primary);cursor:pointer;font-family:var(--font-family);">我的</button>' +
            '<button class="moments-tab" data-tab="partner" style="flex:1;padding:10px;border:none;background:transparent;color:var(--text-secondary);cursor:pointer;font-family:var(--font-family);">' + _getPartnerName() + '的</button>';
        inner.appendChild(tabBar);

        // ===== 内容列表 =====
        var contentContainer = document.createElement('div');
        contentContainer.id = 'moments-content';
        contentContainer.style.cssText = 'flex:1;overflow-y:auto;padding:12px 16px;background:var(--secondary-bg);';

        renderTab('me', contentContainer);
        inner.appendChild(contentContainer);

        // ===== 底部发布按钮 =====
        var footer = document.createElement('div');
        footer.style.cssText = 'display:flex;justify-content:flex-end;padding:12px 20px;border-top:1px solid var(--border-color);flex-shrink:0;background:rgba(var(--primary-bg-rgb),0.95);backdrop-filter:blur(8px);';
        var addBtn = document.createElement('button');
        addBtn.id = 'moments-add-btn';
        addBtn.style.cssText = 'width:40px;height:40px;border-radius:50%;background:#000;color:#fff;border:none;font-size:24px;cursor:pointer;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 12px rgba(0,0,0,0.2);';
        addBtn.textContent = '+';
        addBtn.title = '发布新动态';
        addBtn.onclick = function() { showPublishModal(); };
        footer.appendChild(addBtn);
        inner.appendChild(footer);

        wrap.appendChild(inner);
        document.body.appendChild(wrap);

        // ===== 事件绑定 =====
        tabBar.querySelectorAll('.moments-tab').forEach(function(btn) {
            btn.addEventListener('click', function() {
                tabBar.querySelectorAll('.moments-tab').forEach(function(b) {
                    b.classList.remove('active');
                    b.style.background = 'transparent';
                    b.style.color = 'var(--text-secondary)';
                });
                this.classList.add('active');
                this.style.background = 'var(--secondary-bg)';
                this.style.color = 'var(--text-primary)';
                var tab = this.dataset.tab;
                renderTab(tab, contentContainer);
                var addBtnEl = document.getElementById('moments-add-btn');
                if (addBtnEl) addBtnEl.style.display = tab === 'me' ? 'flex' : 'none';
            });
        });
    };
