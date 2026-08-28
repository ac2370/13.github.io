// moments.js - 朋友圈功能（含背景图设置）
(function() {
    'use strict';

    // =============================================
    // 1. 配置与工具
    // =============================================
    const STORAGE_KEY = 'moments_data';
    const BG_KEY = 'moments_bg_image';
    const MAX_POSTS = 100;

    // 获取字卡库
    function _getReplyCards() {
        let cards = [];
        if (window.customReplies && Array.isArray(window.customReplies)) {
            cards = window.customReplies.map(c => typeof c === 'string' ? c : (c.text || c.label || ''));
        }
        try {
            const stored = localStorage.getItem('customReplies');
            if (stored) {
                const parsed = JSON.parse(stored);
                if (Array.isArray(parsed)) {
                    cards = parsed.map(c => typeof c === 'string' ? c : (c.text || c.label || ''));
                }
            }
        } catch(e) {}
        if (cards.length === 0) {
            cards = ['早安', '晚安', '想你', '抱抱', '亲亲', '开心', '好梦', '今天超棒', '别担心', '有我在'];
        }
        return [...new Set(cards.filter(c => c && c.trim()))];
    }

    function _getPartnerName() {
        return (typeof settings !== 'undefined' && settings.partnerName) ? settings.partnerName : '梦角';
    }
    function _getMyName() {
        return (typeof settings !== 'undefined' && settings.myName) ? settings.myName : '我';
    }

    function _notify(msg, type='info', duration=2000) {
        if (typeof showNotification === 'function') {
            showNotification(msg, type, duration);
        } else {
            alert(msg);
        }
    }

    function _esc(s) {
        return String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
    }

    function _randomPick(arr) {
        return arr[Math.floor(Math.random() * arr.length)];
    }

    function _generateId() {
        return Date.now() + '_' + Math.random().toString(36).substr(2, 6);
    }

    function _sendAsMessage(text, isSystem = false) {
        if (typeof addMessage === 'function') {
            addMessage({
                id: Date.now() + Math.random(),
                sender: 'user',
                text: text,
                timestamp: new Date(),
                type: isSystem ? 'system' : 'normal',
                status: 'sent'
            });
            if (typeof playSound === 'function') playSound('send');
        } else {
            console.warn('[朋友圈] addMessage 未定义，但已记录:', text);
        }
    }

    // ---- 背景图管理 ----
    function _getBgImage() {
        try {
            return localStorage.getItem(BG_KEY) || '';
        } catch { return ''; }
    }
    function _setBgImage(data) {
        localStorage.setItem(BG_KEY, data);
    }
    function _clearBgImage() {
        localStorage.removeItem(BG_KEY);
    }

    // =============================================
    // 2. 数据管理
    // =============================================
    function _getData() {
        try {
            return JSON.parse(localStorage.getItem(STORAGE_KEY)) || { posts: [], lastGenerateDate: '' };
        } catch { return { posts: [], lastGenerateDate: '' }; }
    }

    function _setData(data) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }

    function _getPosts() {
        const data = _getData();
        return data.posts.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    }

    function _addPost(author, text, timestamp) {
        const data = _getData();
        const post = {
            id: _generateId(),
            author: author,
            text: text.trim(),
            timestamp: timestamp || new Date().toISOString(),
            likes: 0,
            likedByMe: false,
            comments: []
        };
        data.posts.unshift(post);
        if (data.posts.length > MAX_POSTS) {
            data.posts = data.posts.slice(0, MAX_POSTS);
        }
        _setData(data);
        return post;
    }

    function _deletePost(postId) {
        const data = _getData();
        data.posts = data.posts.filter(p => p.id !== postId);
        _setData(data);
    }

    function _toggleLike(postId) {
        const data = _getData();
        const post = data.posts.find(p => p.id === postId);
        if (!post) return;
        if (post.likedByMe) {
            post.likes -= 1;
            post.likedByMe = false;
        } else {
            post.likes += 1;
            post.likedByMe = true;
        }
        _setData(data);
    }

    function _addComment(postId, author, text) {
        const data = _getData();
        const post = data.posts.find(p => p.id === postId);
        if (!post) return null;
        const comment = {
            id: _generateId(),
            author: author,
            text: text.trim(),
            timestamp: new Date().toISOString(),
            reply: null
        };
        post.comments.push(comment);
        _setData(data);
        return comment;
    }

    function _addReplyToComment(postId, commentId, replyText) {
        const data = _getData();
        const post = data.posts.find(p => p.id === postId);
        if (!post) return;
        const comment = post.comments.find(c => c.id === commentId);
        if (!comment) return;
        comment.reply = {
            text: replyText,
            timestamp: new Date().toISOString()
        };
        _setData(data);
    }

    // =============================================
    // 3. 自动生成梦角的动态
    // =============================================
    const PARTNER_POST_TEMPLATES = [
        '今天的阳光像你一样温暖。',
        '做了一个很长的梦，醒来只记得你的名字。',
        '刚泡了一杯咖啡，想起你第一次给我冲的那杯。',
        '窗外的雨声很好听，像在说悄悄话。',
        '发现一首好歌，歌词里藏着我们的故事。',
        '突然很想吃你做的菜，哪怕只是煮一碗面。',
        '今天学会了新的技能，第一个想分享给你。',
        '巷口那只流浪猫又来了，它好像认识我。',
        '读了一本书，其中一句话让我愣了好久。',
        '天空很蓝，像你那天穿的那件衬衫。',
        '收到一朵小花，别在衣角，像你在身边。',
        '傍晚的云像你的微笑，淡淡的却让我沉醉。',
        '夜深了，城市的灯火，有一盏是我在等你。',
        '今天有点想哭，但想到你就笑了。',
        '你上次说的话，我今天才真正懂。'
    ];

    function _generatePartnerPosts() {
        const data = _getData();
        const today = new Date().toDateString();
        if (data.lastGenerateDate === today) return;
        const count = 2 + Math.floor(Math.random() * 3);
        const templates = [...PARTNER_POST_TEMPLATES];
        for (let i = templates.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [templates[i], templates[j]] = [templates[j], templates[i]];
        }
        const selected = templates.slice(0, count);
        const now = new Date();
        selected.forEach(text => {
            const hours = Math.random() * 24;
            const minutes = Math.random() * 60;
            const ts = new Date(now);
            ts.setHours(Math.floor(hours), Math.floor(minutes), Math.floor(Math.random() * 60), 0);
            _addPost('partner', text, ts.toISOString());
        });
        data.lastGenerateDate = today;
        _setData(data);
        const pName = _getPartnerName();
        selected.forEach(text => {
            _sendAsMessage(`📱 ${pName} 发了一条新动态：${text}`, true);
        });
    }

    // =============================================
    // 4. 朋友圈主界面
    // =============================================
    window.openMoments = function() {
        _generatePartnerPosts();

        const old = document.getElementById('moments-modal');
        if (old) old.remove();

        const wrap = document.createElement('div');
        wrap.id = 'moments-modal';
        wrap.style.cssText = `
            position:fixed;inset:0;z-index:10010;
            display:flex;align-items:center;justify-content:center;
            background:rgba(0,0,0,0.7);backdrop-filter:blur(12px);
            -webkit-backdrop-filter:blur(12px);
        `;

        const inner = document.createElement('div');
        inner.style.cssText = `
            background:var(--primary-bg);
            border-radius:24px;padding:0;
            width:min(480px, 94vw);
            max-height:85vh;
            display:flex;
            flex-direction:column;
            overflow:hidden;
            box-shadow:0 24px 64px rgba(0,0,0,0.3);
            border:1px solid var(--border-color);
        `;

        // ---- 标题栏（含背景图设置按钮） ----
        const header = document.createElement('div');
        header.style.cssText = `
            display:flex;justify-content:space-between;align-items:center;
            padding:16px 20px 12px;
            border-bottom:1px solid var(--border-color);
            flex-shrink:0;
        `;
        header.innerHTML = `
            <span style="font-size:20px;font-weight:700;color:var(--text-primary);">📱 朋友圈</span>
            <div style="display:flex;gap:8px;align-items:center;">
                <button id="moments-bg-btn" style="background:none;border:none;font-size:16px;color:var(--text-secondary);cursor:pointer;padding:4px 6px;border-radius:8px;" title="更换聊天背景">
                    <i class="fas fa-image"></i>
                </button>
                <button id="moments-close" style="background:none;border:none;font-size:22px;color:var(--text-secondary);cursor:pointer;">✕</button>
            </div>
        `;
        inner.appendChild(header);

        // ---- Tab切换 ----
        const tabBar = document.createElement('div');
        tabBar.style.cssText = `
            display:flex;border-bottom:1px solid var(--border-color);
            flex-shrink:0;
        `;
        tabBar.innerHTML = `
            <button class="moments-tab active" data-tab="me" style="flex:1;padding:10px;border:none;background:var(--secondary-bg);font-weight:700;color:var(--text-primary);cursor:pointer;font-family:var(--font-family);">我的</button>
            <button class="moments-tab" data-tab="partner" style="flex:1;padding:10px;border:none;background:transparent;color:var(--text-secondary);cursor:pointer;font-family:var(--font-family);">${_getPartnerName()}的</button>
        `;
        inner.appendChild(tabBar);

        // ---- 内容容器（应用背景图） ----
        const contentContainer = document.createElement('div');
        contentContainer.id = 'moments-content';
        contentContainer.style.cssText = `
            flex:1;overflow-y:auto;padding:12px 16px;
            background-image: url('${_getBgImage()}');
            background-size: cover;
            background-position: center;
            background-repeat: no-repeat;
            transition: background-image 0.3s ease;
        `;
        // 如果没有背景图，加一个纯色背景
        if (!_getBgImage()) {
            contentContainer.style.background = 'var(--secondary-bg)';
        }

        renderTab('me', contentContainer);
        inner.appendChild(contentContainer);

        // ---- 底部操作 ----
        const footer = document.createElement('div');
        footer.id = 'moments-footer';
        footer.style.cssText = `
            display:flex;justify-content:flex-end;padding:12px 20px;
            border-top:1px solid var(--border-color);
            flex-shrink:0;
            background:rgba(var(--primary-bg-rgb),0.95);
            backdrop-filter:blur(8px);
        `;
        const addBtn = document.createElement('button');
        addBtn.id = 'moments-add-btn';
        addBtn.style.cssText = `
            width:40px;height:40px;border-radius:50%;
            background:#000;color:#fff;border:none;
            font-size:24px;cursor:pointer;
            display:flex;align-items:center;justify-content:center;
            box-shadow:0 4px 12px rgba(0,0,0,0.2);
        `;
        addBtn.textContent = '+';
        addBtn.title = '发布新动态';
        addBtn.onclick = function() {
            showPublishModal();
        };
        footer.appendChild(addBtn);
        inner.appendChild(footer);

        wrap.appendChild(inner);
        document.body.appendChild(wrap);

        // ---- 事件绑定 ----
        document.getElementById('moments-close').onclick = () => wrap.remove();
        wrap.addEventListener('click', (e) => { if (e.target === wrap) wrap.remove(); });

        // 背景图设置按钮
        document.getElementById('moments-bg-btn').onclick = function(e) {
            e.stopPropagation();
            showBgSettings();
        };

        // Tab切换
        tabBar.querySelectorAll('.moments-tab').forEach(btn => {
            btn.addEventListener('click', function() {
                tabBar.querySelectorAll('.moments-tab').forEach(b => {
                    b.classList.remove('active');
                    b.style.background = 'transparent';
                    b.style.color = 'var(--text-secondary)';
                });
                this.classList.add('active');
                this.style.background = 'var(--secondary-bg)';
                this.style.color = 'var(--text-primary)';

                const tab = this.dataset.tab;
                renderTab(tab, contentContainer);
                const addBtnEl = document.getElementById('moments-add-btn');
                if (addBtnEl) {
                    addBtnEl.style.display = tab === 'me' ? 'flex' : 'none';
                }
            });
            if (btn.dataset.tab === 'me') {
                btn.style.background = 'var(--secondary-bg)';
                btn.style.color = 'var(--text-primary)';
            }
        });

        const addBtnInit = document.getElementById('moments-add-btn');
        if (addBtnInit) addBtnInit.style.display = 'flex';
    };

    // =============================================
    // 5. 背景图设置
    // =============================================
    function showBgSettings() {
        const old = document.getElementById('moments-bg-modal');
        if (old) old.remove();

        const wrap = document.createElement('div');
        wrap.id = 'moments-bg-modal';
        wrap.style.cssText = `
            position:fixed;inset:0;z-index:10050;
            display:flex;align-items:center;justify-content:center;
            background:rgba(0,0,0,0.5);
        `;

        const inner = document.createElement('div');
        inner.style.cssText = `
            background:var(--primary-bg);
            border-radius:20px;padding:24px;
            width:min(380px, 90vw);
            border:1px solid var(--border-color);
        `;
        inner.innerHTML = `
            <div style="display:flex;justify-content:space-between;margin-bottom:14px;">
                <span style="font-size:18px;font-weight:700;">🖼️ 聊天背景</span>
                <button id="bg-close" style="background:none;border:none;font-size:20px;cursor:pointer;">✕</button>
            </div>
            <div style="margin-bottom:12px;">
                <div style="font-size:13px;color:var(--text-secondary);margin-bottom:8px;">选择一张图片作为朋友圈聊天背景</div>
                <div style="display:flex;gap:10px;flex-wrap:wrap;">
                    <button id="bg-upload-btn" style="flex:1;padding:10px;border:1.5px dashed var(--border-color);border-radius:12px;background:transparent;color:var(--text-secondary);cursor:pointer;font-size:13px;font-family:var(--font-family);">
                        📤 上传图片
                    </button>
                    <button id="bg-url-btn" style="flex:1;padding:10px;border:1.5px dashed var(--border-color);border-radius:12px;background:transparent;color:var(--text-secondary);cursor:pointer;font-size:13px;font-family:var(--font-family);">
                        🔗 图片URL
                    </button>
                    <button id="bg-reset-btn" style="flex:1;padding:10px;border:1px solid var(--border-color);border-radius:12px;background:var(--secondary-bg);color:#ff6b6b;cursor:pointer;font-size:13px;font-family:var(--font-family);">
                        🗑️ 恢复默认
                    </button>
                </div>
                <input type="file" id="bg-file-input" accept="image/*" style="display:none;">
            </div>
            <div id="bg-preview-wrap" style="display:${_getBgImage() ? 'block' : 'none'};margin-bottom:12px;border-radius:12px;overflow:hidden;border:1px solid var(--border-color);">
                <img id="bg-preview-img" src="${_getBgImage()}" style="width:100%;max-height:150px;object-fit:cover;display:block;">
                <div style="padding:6px 10px;font-size:11px;color:var(--text-secondary);text-align:center;background:rgba(var(--primary-bg-rgb),0.6);">当前背景预览</div>
            </div>
            <div style="display:flex;gap:10px;">
                <button id="bg-cancel" style="flex:1;padding:10px;border:1px solid var(--border-color);border-radius:12px;background:var(--secondary-bg);color:var(--text-secondary);cursor:pointer;">关闭</button>
                <button id="bg-apply" style="flex:2;padding:10px;border:none;border-radius:12px;background:var(--accent-color);color:#fff;font-weight:700;cursor:pointer;">应用到朋友圈</button>
            </div>
        `;
        wrap.appendChild(inner);
        document.body.appendChild(wrap);

        const close = () => wrap.remove();
        document.getElementById('bg-close').onclick = close;
        document.getElementById('bg-cancel').onclick = close;
        wrap.onclick = (e) => { if (e.target === wrap) close(); };

        // 上传图片
        document.getElementById('bg-upload-btn').onclick = function() {
            document.getElementById('bg-file-input').click();
        };
        document.getElementById('bg-file-input').onchange = function(e) {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = function(ev) {
                const data = ev.target.result;
                const preview = document.getElementById('bg-preview-img');
                const wrap2 = document.getElementById('bg-preview-wrap');
                if (preview) preview.src = data;
                if (wrap2) wrap2.style.display = 'block';
                // 保存到临时变量，等点击"应用"时再保存
                window._tempBgData = data;
                _notify('图片已加载，点击"应用到朋友圈"生效', 'success', 2000);
            };
            reader.readAsDataURL(file);
        };

        // URL方式
        document.getElementById('bg-url-btn').onclick = function() {
            const url = prompt('请输入图片URL地址（支持 https://...）');
            if (url && url.trim()) {
                const preview = document.getElementById('bg-preview-img');
                const wrap2 = document.getElementById('bg-preview-wrap');
                if (preview) preview.src = url.trim();
                if (wrap2) wrap2.style.display = 'block';
                window._tempBgData = url.trim();
                _notify('图片已加载，点击"应用到朋友圈"生效', 'success', 2000);
            }
        };

        // 恢复默认
        document.getElementById('bg-reset-btn').onclick = function() {
            if (confirm('确定恢复默认背景吗？')) {
                _clearBgImage();
                const preview = document.getElementById('bg-preview-img');
                const wrap2 = document.getElementById('bg-preview-wrap');
                if (preview) preview.src = '';
                if (wrap2) wrap2.style.display = 'none';
                window._tempBgData = null;
                _notify('已恢复默认背景', 'info');
            }
        };

        // 应用
        document.getElementById('bg-apply').onclick = function() {
            const data = window._tempBgData;
            if (data) {
                _setBgImage(data);
            } else {
                // 如果用户没有新上传，但预览区有图片，可能是之前已有的
                const preview = document.getElementById('bg-preview-img');
                if (preview && preview.src && preview.src !== '') {
                    _setBgImage(preview.src);
                } else {
                    _notify('请先上传或输入图片', 'warning');
                    return;
                }
            }
            // 更新朋友圈内容容器背景
            const content = document.getElementById('moments-content');
            if (content) {
                const bg = _getBgImage();
                if (bg) {
                    content.style.backgroundImage = `url('${bg}')`;
                    content.style.backgroundSize = 'cover';
                    content.style.backgroundPosition = 'center';
                    content.style.backgroundRepeat = 'no-repeat';
                } else {
                    content.style.backgroundImage = '';
                    content.style.background = 'var(--secondary-bg)';
                }
            }
            close();
            _notify('背景已更新 ✨', 'success');
        };

        // 如果已经有背景图，自动显示预览
        const existingBg = _getBgImage();
        if (existingBg) {
            const preview = document.getElementById('bg-preview-img');
            const wrap2 = document.getElementById('bg-preview-wrap');
            if (preview) preview.src = existingBg;
            if (wrap2) wrap2.style.display = 'block';
            window._tempBgData = existingBg;
        }
    }

    // =============================================
    // 6. 渲染Tab内容
    // =============================================
    function renderTab(tab, container) {
        const posts = _getPosts();
        const filtered = posts.filter(p => p.author === tab);
        if (filtered.length === 0) {
            container.innerHTML = `
                <div style="text-align:center;padding:40px 20px;color:var(--text-secondary);background:rgba(var(--primary-bg-rgb),0.6);border-radius:16px;backdrop-filter:blur(4px);">
                    <div style="font-size:48px;margin-bottom:12px;">📭</div>
                    <div style="font-size:15px;font-weight:600;">还没有动态</div>
                    <div style="font-size:13px;opacity:0.7;">${tab === 'me' ? '点击右下角 + 发布你的第一条吧' : _getPartnerName() + ' 还没有发过动态哦'}</div>
                </div>
            `;
            return;
        }

        let html = '';
        filtered.forEach(post => {
            const isMe = post.author === 'me';
            const avatarIcon = isMe ? '👤' : '🌸';
            const name = isMe ? _getMyName() : _getPartnerName();
            const time = formatTime(post.timestamp);
            const likeText = post.likes > 0 ? `❤️ ${post.likes}` : '❤️ 0';
            const commentCount = post.comments.length;

            html += `
                <div class="moments-post" data-id="${post.id}" style="background:rgba(var(--secondary-bg-rgb,255,255,255),0.85);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);border-radius:16px;padding:14px 16px;margin-bottom:14px;border:1px solid rgba(var(--border-color-rgb,0,0,0),0.08);box-shadow:0 2px 8px rgba(0,0,0,0.04);">
                    <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;">
                        <span style="font-size:18px;">${avatarIcon}</span>
                        <span style="font-weight:600;color:var(--text-primary);">${_esc(name)}</span>
                        <span style="font-size:11px;color:var(--text-secondary);margin-left:auto;">${time}</span>
                    </div>
                    <div style="font-size:15px;color:var(--text-primary);margin:4px 0 8px;word-wrap:break-word;">${_esc(post.text)}</div>
                    <div style="display:flex;gap:12px;align-items:center;flex-wrap:wrap;">
                        <button class="moments-like-btn" data-id="${post.id}" style="background:none;border:none;color:${post.likedByMe ? 'var(--accent-color)' : 'var(--text-secondary)'};font-size:13px;cursor:pointer;padding:2px 8px;border-radius:12px;${post.likedByMe ? 'background:rgba(var(--accent-color-rgb),0.1);' : ''}">
                            ${post.likedByMe ? '❤️' : '🤍'} ${post.likes}
                        </button>
                        <button class="moments-comment-btn" data-id="${post.id}" style="background:none;border:none;color:var(--text-secondary);font-size:13px;cursor:pointer;padding:2px 8px;border-radius:12px;">
                            💬 ${commentCount}
                        </button>
                        ${isMe ? `<button class="moments-delete-btn" data-id="${post.id}" style="background:none;border:none;color:#ff6b6b;font-size:13px;cursor:pointer;padding:2px 8px;border-radius:12px;">🗑️</button>` : ''}
                    </div>
                    ${post.comments.length > 0 ? `<div style="margin-top:10px;padding-top:8px;border-top:1px dashed rgba(var(--border-color-rgb,0,0,0),0.15);">` : ''}
                    ${post.comments.map(c => {
                        const cName = c.author === 'me' ? _getMyName() : _getPartnerName();
                        const cAvatar = c.author === 'me' ? '👤' : '🌸';
                        let replyHtml = '';
                        if (c.reply) {
                            replyHtml = `
                                <div style="margin-left:24px;margin-top:4px;padding:4px 8px;background:rgba(var(--accent-color-rgb),0.06);border-radius:8px;">
                                    <span style="font-weight:500;font-size:12px;">🌸 ${_getPartnerName()}</span>
                                    <span style="font-size:12px;color:var(--text-primary);">${_esc(c.reply.text)}</span>
                                    <span style="font-size:10px;color:var(--text-secondary);margin-left:6px;">${formatTime(c.reply.timestamp)}</span>
                                </div>
                            `;
                        }
                        return `
                            <div style="margin-bottom:4px;font-size:13px;">
                                <span style="font-weight:500;">${cAvatar} ${_esc(cName)}</span>
                                <span style="color:var(--text-primary);">${_esc(c.text)}</span>
                                <span style="font-size:10px;color:var(--text-secondary);margin-left:6px;">${formatTime(c.timestamp)}</span>
                                ${replyHtml}
                            </div>
                        `;
                    }).join('')}
                    ${post.comments.length > 0 ? `</div>` : ''}
                </div>
            `;
        });

        container.innerHTML = html;

        // 绑定事件
        container.querySelectorAll('.moments-like-btn').forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.stopPropagation();
                const id = this.dataset.id;
                _toggleLike(id);
                renderTab(tab, container);
            });
        });

        container.querySelectorAll('.moments-comment-btn').forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.stopPropagation();
                const postId = this.dataset.id;
                showCommentModal(postId, tab);
            });
        });

        container.querySelectorAll('.moments-delete-btn').forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.stopPropagation();
                const id = this.dataset.id;
                if (confirm('确定要删除这条动态吗？')) {
                    _deletePost(id);
                    renderTab(tab, container);
                    _notify('已删除', 'info');
                }
            });
        });
    }

    // =============================================
    // 7. 发布新动态
    // =============================================
    function showPublishModal() {
        const old = document.getElementById('publish-modal');
        if (old) old.remove();

        const wrap = document.createElement('div');
        wrap.id = 'publish-modal';
        wrap.style.cssText = `
            position:fixed;inset:0;z-index:10020;
            display:flex;align-items:center;justify-content:center;
            background:rgba(0,0,0,0.5);
        `;
        const inner = document.createElement('div');
        inner.style.cssText = `
            background:var(--primary-bg);
            border-radius:20px;padding:24px;
            width:min(380px, 90vw);
            border:1px solid var(--border-color);
        `;
        inner.innerHTML = `
            <div style="display:flex;justify-content:space-between;margin-bottom:14px;">
                <span style="font-size:18px;font-weight:700;">📝 发布新动态</span>
                <button id="publish-close" style="background:none;border:none;font-size:20px;cursor:pointer;">✕</button>
            </div>
            <textarea id="publish-text" rows="4" placeholder="此刻的想法..." style="width:100%;padding:10px;border:1px solid var(--border-color);border-radius:12px;background:var(--secondary-bg);color:var(--text-primary);font-size:14px;resize:vertical;box-sizing:border-box;font-family:var(--font-family);"></textarea>
            <div style="display:flex;gap:10px;margin-top:12px;">
                <button id="publish-cancel" style="flex:1;padding:10px;border:1px solid var(--border-color);border-radius:12px;background:var(--secondary-bg);color:var(--text-secondary);cursor:pointer;">取消</button>
                <button id="publish-submit" style="flex:2;padding:10px;border:none;border-radius:12px;background:var(--accent-color);color:#fff;font-weight:700;cursor:pointer;">发布</button>
            </div>
        `;
        wrap.appendChild(inner);
        document.body.appendChild(wrap);

        const close = () => wrap.remove();
        document.getElementById('publish-close').onclick = close;
        document.getElementById('publish-cancel').onclick = close;
        wrap.onclick = (e) => { if (e.target === wrap) close(); };

        document.getElementById('publish-submit').onclick = function() {
            const text = document.getElementById('publish-text').value.trim();
            if (!text) { _notify('请输入内容', 'warning'); return; }
            _addPost('me', text);
            close();
            const container = document.getElementById('moments-content');
            const activeTab = document.querySelector('.moments-tab.active');
            if (container && activeTab) {
                renderTab(activeTab.dataset.tab, container);
            }
            _notify('发布成功 ✨', 'success');
            _sendAsMessage(`📱 我发了一条新动态：${text}`, true);
        };
    }

    // =============================================
    // 8. 评论/回复模态框
    // =============================================
    function showCommentModal(postId, currentTab) {
        const old = document.getElementById('comment-modal');
        if (old) old.remove();

        const wrap = document.createElement('div');
        wrap.id = 'comment-modal';
        wrap.style.cssText = `
            position:fixed;inset:0;z-index:10030;
            display:flex;align-items:center;justify-content:center;
            background:rgba(0,0,0,0.5);
        `;
        const inner = document.createElement('div');
        inner.style.cssText = `
            background:var(--primary-bg);
            border-radius:20px;padding:24px;
            width:min(380px, 90vw);
            border:1px solid var(--border-color);
        `;
        inner.innerHTML = `
            <div style="display:flex;justify-content:space-between;margin-bottom:14px;">
                <span style="font-size:18px;font-weight:700;">💬 评论</span>
                <button id="comment-close" style="background:none;border:none;font-size:20px;cursor:pointer;">✕</button>
            </div>
            <textarea id="comment-text" rows="3" placeholder="写下你的评论..." style="width:100%;padding:10px;border:1px solid var(--border-color);border-radius:12px;background:var(--secondary-bg);color:var(--text-primary);font-size:14px;resize:vertical;box-sizing:border-box;font-family:var(--font-family);"></textarea>
            <div style="display:flex;gap:10px;margin-top:12px;">
                <button id="comment-cancel" style="flex:1;padding:10px;border:1px solid var(--border-color);border-radius:12px;background:var(--secondary-bg);color:var(--text-secondary);cursor:pointer;">取消</button>
                <button id="comment-submit" style="flex:2;padding:10px;border:none;border-radius:12px;background:var(--accent-color);color:#fff;font-weight:700;cursor:pointer;">发送</button>
            </div>
        `;
        wrap.appendChild(inner);
        document.body.appendChild(wrap);

        const close = () => wrap.remove();
        document.getElementById('comment-close').onclick = close;
        document.getElementById('comment-cancel').onclick = close;
        wrap.onclick = (e) => { if (e.target === wrap) close(); };

        document.getElementById('comment-submit').onclick = function() {
            const text = document.getElementById('comment-text').value.trim();
            if (!text) { _notify('请输入评论', 'warning'); return; }

            const posts = _getPosts();
            const post = posts.find(p => p.id === postId);
            if
