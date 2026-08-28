// moments.js - 朋友圈功能（完整版）
(function() {
    'use strict';

    var STORAGE_KEY = 'moments_data';
    var COVER_KEY = 'moments_cover_image';
    var MAX_POSTS = 100;

    // =============================================
    // 工具函数
    // =============================================
    function _getReplyCards() {
        var cards = [];
        if (window.customReplies && Array.isArray(window.customReplies)) {
            cards = window.customReplies.map(function(c) {
                return typeof c === 'string' ? c : (c.text || c.label || '');
            });
        }
        try {
            var stored = localStorage.getItem('customReplies');
            if (stored) {
                var parsed = JSON.parse(stored);
                if (Array.isArray(parsed)) {
                    cards = parsed.map(function(c) {
                        return typeof c === 'string' ? c : (c.text || c.label || '');
                    });
                }
            }
        } catch(e) {}
        if (cards.length === 0) {
            cards = ['早安', '晚安', '想你', '抱抱', '亲亲', '开心', '好梦', '今天超棒', '别担心', '有我在'];
        }
        var result = [];
        for (var i = 0; i < cards.length; i++) {
            var c = cards[i];
            if (c && c.trim()) {
                if (result.indexOf(c) === -1) result.push(c);
            }
        }
        return result;
    }

    function _getPartnerName() {
        return (typeof settings !== 'undefined' && settings.partnerName) ? settings.partnerName : '梦角';
    }
    function _getMyName() {
        return (typeof settings !== 'undefined' && settings.myName) ? settings.myName : '我';
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

    function _esc(s) {
        return String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
    }

    function _randomPick(arr) {
        return arr[Math.floor(Math.random() * arr.length)];
    }

    function _generateId() {
        return Date.now() + '_' + Math.random().toString(36).substr(2, 6);
    }

    function _sendAsMessage(text, isSystem) {
        isSystem = isSystem || false;
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
            console.warn('[朋友圈] addMessage 未定义:', text);
        }
    }

    function _getCoverImage() {
        try { return localStorage.getItem(COVER_KEY) || ''; } catch { return ''; }
    }
    function _setCoverImage(data) { localStorage.setItem(COVER_KEY, data); }
    function _clearCoverImage() { localStorage.removeItem(COVER_KEY); }

    function _getData() {
        try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || { posts: [], lastGenerateDate: '' }; } catch { return { posts: [], lastGenerateDate: '' }; }
    }
    function _setData(data) { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); }

    function _getPosts() {
        var data = _getData();
        return data.posts.sort(function(a, b) {
            return new Date(b.timestamp) - new Date(a.timestamp);
        });
    }

    function _addPost(author, text, timestamp) {
        var data = _getData();
        var post = {
            id: _generateId(),
            author: author,
            text: text.trim(),
            timestamp: timestamp || new Date().toISOString(),
            likes: 0,
            likedByMe: false,
            comments: []
        };
        data.posts.unshift(post);
        if (data.posts.length > MAX_POSTS) data.posts = data.posts.slice(0, MAX_POSTS);
        _setData(data);
        return post;
    }

    function _deletePost(postId) {
        var data = _getData();
        data.posts = data.posts.filter(function(p) { return p.id !== postId; });
        _setData(data);
    }

    function _toggleLike(postId) {
        var data = _getData();
        var post = data.posts.find(function(p) { return p.id === postId; });
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
        var data = _getData();
        var post = data.posts.find(function(p) { return p.id === postId; });
        if (!post) return null;
        var comment = {
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
        var data = _getData();
        var post = data.posts.find(function(p) { return p.id === postId; });
        if (!post) return;
        var comment = post.comments.find(function(c) { return c.id === commentId; });
        if (!comment) return;
        comment.reply = {
            text: replyText,
            timestamp: new Date().toISOString()
        };
        _setData(data);
    }

    // 梦角动态模板
    var PARTNER_POST_TEMPLATES = [
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
        var data = _getData();
        var today = new Date().toDateString();
        if (data.lastGenerateDate === today) return;
        var count = 2 + Math.floor(Math.random() * 3);
        var templates = PARTNER_POST_TEMPLATES.slice();
        for (var i = templates.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            var temp = templates[i];
            templates[i] = templates[j];
            templates[j] = temp;
        }
        var selected = templates.slice(0, count);
        var now = new Date();
        for (var idx = 0; idx < selected.length; idx++) {
            var text = selected[idx];
            var hours = Math.random() * 24;
            var minutes = Math.random() * 60;
            var ts = new Date(now);
            ts.setHours(Math.floor(hours), Math.floor(minutes), Math.floor(Math.random() * 60), 0);
            _addPost('partner', text, ts.toISOString());
        }
        data.lastGenerateDate = today;
        _setData(data);
        var pName = _getPartnerName();
        for (var idx2 = 0; idx2 < selected.length; idx2++) {
            _sendAsMessage('📱 ' + pName + ' 发了一条新动态：' + selected[idx2], true);
        }
    }

    function formatTime(iso) {
        var date = new Date(iso);
        var now = new Date();
        var diff = (now - date) / 1000;
        if (diff < 60) return '刚刚';
        if (diff < 3600) return Math.floor(diff / 60) + '分钟前';
        if (diff < 86400) return Math.floor(diff / 3600) + '小时前';
        if (diff < 172800) return '昨天 ' + date.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'});
        return date.toLocaleDateString([], {month:'short', day:'numeric'}) + ' ' + date.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'});
    }

    // 封面设置弹窗
    function showCoverSettings() {
        var old = document.getElementById('cover-settings-modal');
        if (old) old.remove();

        var wrap = document.createElement('div');
        wrap.id = 'cover-settings-modal';
        wrap.style.cssText = 'position:fixed;inset:0;z-index:10050;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.5);';

        var inner = document.createElement('div');
        inner.style.cssText = 'background:var(--primary-bg);border-radius:20px;padding:24px;width:min(380px, 90vw);border:1px solid var(--border-color);';
        inner.innerHTML = '<div style="display:flex;justify-content:space-between;margin-bottom:14px;">' +
            '<span style="font-size:18px;font-weight:700;">🖼️ 更换封面</span>' +
            '<button id="cover-close" style="background:none;border:none;font-size:20px;cursor:pointer;">✕</button>' +
            '</div>' +
            '<div style="margin-bottom:12px;">' +
            '<div style="font-size:13px;color:var(--text-secondary);margin-bottom:8px;">选择一张图片作为朋友圈封面</div>' +
            '<div style="display:flex;gap:10px;flex-wrap:wrap;">' +
            '<button id="cover-upload-btn" style="flex:1;padding:10px;border:1.5px dashed var(--border-color);border-radius:12px;background:transparent;color:var(--text-secondary);cursor:pointer;font-size:13px;font-family:var(--font-family);">📤 上传图片</button>' +
            '<button id="cover-url-btn" style="flex:1;padding:10px;border:1.5px dashed var(--border-color);border-radius:12px;background:transparent;color:var(--text-secondary);cursor:pointer;font-size:13px;font-family:var(--font-family);">🔗 图片URL</button>' +
            '<button id="cover-reset-btn" style="flex:1;padding:10px;border:1px solid var(--border-color);border-radius:12px;background:var(--secondary-bg);color:#ff6b6b;cursor:pointer;font-size:13px;font-family:var(--font-family);">🗑️ 恢复默认</button>' +
            '</div>' +
            '<input type="file" id="cover-file-input" accept="image/*" style="display:none;">' +
            '</div>' +
            '<div id="cover-preview-wrap" style="display:' + (_getCoverImage() ? 'block' : 'none') + ';margin-bottom:12px;border-radius:12px;overflow:hidden;border:1px solid var(--border-color);">' +
            '<img id="cover-preview-img" src="' + _getCoverImage() + '" style="width:100%;max-height:150px;object-fit:cover;display:block;">' +
            '<div style="padding:6px 10px;font-size:11px;color:var(--text-secondary);text-align:center;background:rgba(var(--primary-bg-rgb),0.6);">当前封面预览</div>' +
            '</div>' +
            '<div style="display:flex;gap:10px;">' +
            '<button id="cover-cancel" style="flex:1;padding:10px;border:1px solid var(--border-color);border-radius:12px;background:var(--secondary-bg);color:var(--text-secondary);cursor:pointer;">关闭</button>' +
            '<button id="cover-apply" style="flex:2;padding:10px;border:none;border-radius:12px;background:var(--accent-color);color:#fff;font-weight:700;cursor:pointer;">应用到封面</button>' +
            '</div>';
        wrap.appendChild(inner);
        document.body.appendChild(wrap);

        var close = function() { wrap.remove(); };
        document.getElementById('cover-close').onclick = close;
        document.getElementById('cover-cancel').onclick = close;
        wrap.onclick = function(e) { if (e.target === wrap) close(); };

        document.getElementById('cover-upload-btn').onclick = function() {
            document.getElementById('cover-file-input').click();
        };
        document.getElementById('cover-file-input').onchange = function(e) {
            var file = e.target.files[0];
            if (!file) return;
            var reader = new FileReader();
            reader.onload = function(ev) {
                var data = ev.target.result;
                var preview = document.getElementById('cover-preview-img');
                var wrap2 = document.getElementById('cover-preview-wrap');
                if (preview) preview.src = data;
                if (wrap2) wrap2.style.display = 'block';
                window._tempCoverData = data;
                _notify('图片已加载，点击"应用到封面"生效', 'success', 2000);
            };
            reader.readAsDataURL(file);
        };

        document.getElementById('cover-url-btn').onclick = function() {
            var url = prompt('请输入图片URL地址（支持 https://...）');
            if (url && url.trim()) {
                var preview = document.getElementById('cover-preview-img');
                var wrap2 = document.getElementById('cover-preview-wrap');
                if (preview) preview.src = url.trim();
                if (wrap2) wrap2.style.display = 'block';
                window._tempCoverData = url.trim();
                _notify('图片已加载，点击"应用到封面"生效', 'success', 2000);
            }
        };

        document.getElementById('cover-reset-btn').onclick = function() {
            if (confirm('确定恢复默认封面吗？')) {
                _clearCoverImage();
                var preview = document.getElementById('cover-preview-img');
                var wrap2 = document.getElementById('cover-preview-wrap');
                if (preview) preview.src = '';
                if (wrap2) wrap2.style.display = 'none';
                window._tempCoverData = null;
                _notify('已恢复默认封面', 'info');
            }
        };

        document.getElementById('cover-apply').onclick = function() {
            var data = window._tempCoverData;
            if (data) {
                _setCoverImage(data);
            } else {
                var preview = document.getElementById('cover-preview-img');
                if (preview && preview.src && preview.src !== '') {
                    _setCoverImage(preview.src);
                } else {
                    _notify('请先上传或输入图片', 'warning');
                    return;
                }
            }
            var coverEl = document.getElementById('moments-cover');
            if (coverEl) {
                var bg = _getCoverImage();
                if (bg) {
                    coverEl.style.backgroundImage = 'url(' + bg + ')';
                    coverEl.style.backgroundSize = 'cover';
                    coverEl.style.backgroundPosition = 'center';
                }
            }
            close();
            _notify('封面已更新 ✨', 'success');
        };

        var existingCover = _getCoverImage();
        if (existingCover) {
            var preview = document.getElementById('cover-preview-img');
            var wrap2 = document.getElementById('cover-preview-wrap');
            if (preview) preview.src = existingCover;
            if (wrap2) wrap2.style.display = 'block';
            window._tempCoverData = existingCover;
        }
    }

    // 渲染Tab内容
    function renderTab(tab, container) {
        var posts = _getPosts();
        var filtered = [];
        for (var i = 0; i < posts.length; i++) {
            if (posts[i].author === tab) filtered.push(posts[i]);
        }
        if (filtered.length === 0) {
            container.innerHTML = '<div style="text-align:center;padding:40px 20px;color:var(--text-secondary);background:rgba(var(--primary-bg-rgb),0.6);border-radius:16px;backdrop-filter:blur(4px);">' +
                '<div style="font-size:48px;margin-bottom:12px;">📭</div>' +
                '<div style="font-size:15px;font-weight:600;">还没有动态</div>' +
                '<div style="font-size:13px;opacity:0.7;">' + (tab === 'me' ? '点击右下角 + 发布你的第一条吧' : _getPartnerName() + ' 还没有发过动态哦') + '</div>' +
                '</div>';
            return;
        }

        var html = '';
        for (var pi = 0; pi < filtered.length; pi++) {
            var post = filtered[pi];
            var isMe = post.author === 'me';
            var avatarIcon = isMe ? '👤' : '🌸';
            var name = isMe ? _getMyName() : _getPartnerName();
            var time = formatTime(post.timestamp);
            var commentCount = post.comments.length;

            html += '<div class="moments-post" data-id="' + post.id + '" style="background:rgba(var(--secondary-bg-rgb,255,255,255),0.85);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);border-radius:16px;padding:14px 16px;margin-bottom:14px;border:1px solid rgba(var(--border-color-rgb,0,0,0),0.08);box-shadow:0 2px 8px rgba(0,0,0,0.04);">' +
                '<div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;">' +
                    '<span style="font-size:18px;">' + avatarIcon + '</span>' +
                    '<span style="font-weight:600;color:var(--text-primary);">' + _esc(name) + '</span>' +
                    '<span style="font-size:11px;color:var(--text-secondary);margin-left:auto;">' + time + '</span>' +
                '</div>' +
                '<div style="font-size:15px;color:var(--text-primary);margin:4px 0 8px;word-wrap:break-word;">' + _esc(post.text) + '</div>' +
                '<div style="display:flex;gap:12px;align-items:center;flex-wrap:wrap;">' +
                    '<button class="moments-like-btn" data-id="' + post.id + '" style="background:none;border:none;color:' + (post.likedByMe ? 'var(--accent-color)' : 'var(--text-secondary)') + ';font-size:13px;cursor:pointer;padding:2px 8px;border-radius:12px;' + (post.likedByMe ? 'background:rgba(var(--accent-color-rgb),0.1);' : '') + '">' +
                        (post.likedByMe ? '❤️' : '🤍') + ' ' + post.likes +
                    '</button>' +
                    '<button class="moments-comment-btn" data-id="' + post.id + '" style="background:none;border:none;color:var(--text-secondary);font-size:13px;cursor:pointer;padding:2px 8px;border-radius:12px;">' +
                        '💬 ' + commentCount +
                    '</button>' +
                    (isMe ? '<button class="moments-delete-btn" data-id="' + post.id + '" style="background:none;border:none;color:#ff6b6b;font-size:13px;cursor:pointer;padding:2px 8px;border-radius:12px;">🗑️</button>' : '') +
                '</div>';

            if (post.comments.length > 0) {
                html += '<div style="margin-top:10px;padding-top:8px;border-top:1px dashed rgba(var(--border-color-rgb,0,0,0),0.15);">';
                for (var ci = 0; ci < post.comments.length; ci++) {
                    var c = post.comments[ci];
                    var cName = c.author === 'me' ? _getMyName() : _getPartnerName();
                    var cAvatar = c.author === 'me' ? '👤' : '🌸';
                    html += '<div style="margin-bottom:4px;font-size:13px;">' +
                        '<span style="font-weight:500;">' + cAvatar + ' ' + _esc(cName) + '</span>' +
                        '<span style="color:var(--text-primary);">' + _esc(c.text) + '</span>' +
                        '<span style="font-size:10px;color:var(--text-secondary);margin-left:6px;">' + formatTime(c.timestamp) + '</span>';
                    if (c.reply) {
                        html += '<div style="margin-left:24px;margin-top:4px;padding:4px 8px;background:rgba(var(--accent-color-rgb),0.06);border-radius:8px;">' +
                            '<span style="font-weight:500;font-size:12px;">🌸 ' + _getPartnerName() + '</span>' +
                            '<span style="font-size:12px;color:var(--text-primary);">' + _esc(c.reply.text) + '</span>' +
                            '<span style="font-size:10px;color:var(--text-secondary);margin-left:6px;">' + formatTime(c.reply.timestamp) + '</span>' +
                            '</div>';
                    }
                    html += '</div>';
                }
                html += '</div>';
            }
            html += '</div>';
        }

        container.innerHTML = html;

        var likeBtns = container.querySelectorAll('.moments-like-btn');
        for (var lb = 0; lb < likeBtns.length; lb++) {
            (function(btn) {
                btn.addEventListener('click', function(e) {
                    e.stopPropagation();
                    var id = this.dataset.id;
                    _toggleLike(id);
                    var activeTab = document.querySelector('.moments-tab.active');
                    if (activeTab) renderTab(activeTab.dataset.tab, container);
                });
            })(likeBtns[lb]);
        }

        var commentBtns = container.querySelectorAll('.moments-comment-btn');
        for (var cb = 0; cb < commentBtns.length; cb++) {
            (function(btn) {
                btn.addEventListener('click', function(e) {
                    e.stopPropagation();
                    var postId = this.dataset.id;
                    showCommentModal(postId);
                });
            })(commentBtns[cb]);
        }

        var deleteBtns = container.querySelectorAll('.moments-delete-btn');
        for (var db = 0; db < deleteBtns.length; db++) {
            (function(btn) {
                btn.addEventListener('click', function(e) {
                    e.stopPropagation();
                    var id = this.dataset.id;
                    if (confirm('确定要删除这条动态吗？')) {
                        _deletePost(id);
                        var activeTab = document.querySelector('.moments-tab.active');
                        if (activeTab) renderTab(activeTab.dataset.tab, container);
                        _notify('已删除', 'info');
                    }
                });
            })(deleteBtns[db]);
        }
    }

    // 发布新动态
    function showPublishModal() {
        var old = document.getElementById('publish-modal');
        if (old) old.remove();

        var wrap = document.createElement('div');
        wrap.id = 'publish-modal';
        wrap.style.cssText = 'position:fixed;inset:0;z-index:10020;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.5);';
        var inner = document.createElement('div');
        inner.style.cssText = 'background:var(--primary-bg);border-radius:20px;padding:24px;width:min(380px, 90vw);border:1px solid var(--border-color);';
        inner.innerHTML = '<div style="display:flex;justify-content:space-between;margin-bottom:14px;">' +
            '<span style="font-size:18px;font-weight:700;">📝 发布新动态</span>' +
            '<button id="publish-close" style="background:none;border:none;font-size:20px;cursor:pointer;">✕</button>' +
            '</div>' +
            '<textarea id="publish-text" rows="4" placeholder="此刻的想法..." style="width:100%;padding:10px;border:1px solid var(--border-color);border-radius:12px;background:var(--secondary-bg);color:var(--text-primary);font-size:14px;resize:vertical;box-sizing:border-box;font-family:var(--font-family);"></textarea>' +
            '<div style="display:flex;gap:10px;margin-top:12px;">' +
            '<button id="publish-cancel" style="flex:1;padding:10px;border:1px solid var(--border-color);border-radius:12px;background:var(--secondary-bg);color:var(--text-secondary);cursor:pointer;">取消</button>' +
            '<button id="publish-submit" style="flex:2;padding:10px;border:none;border-radius:12px;background:var(--accent-color);color:#fff;font-weight:700;cursor:pointer;">发布</button>' +
            '</div>';
        wrap.appendChild(inner);
        document.body.appendChild(wrap);

        var close = function() { wrap.remove(); };
        document.getElementById('publish-close').onclick = close;
        document.getElementById('publish-cancel').onclick = close;
        wrap.onclick = function(e) { if (e.target === wrap) close(); };

        document.getElementById('publish-submit').onclick = function() {
            var text = document.getElementById('publish-text').value.trim();
            if (!text) { _notify('请输入内容', 'warning'); return; }
            _addPost('me', text);
            close();
            var container = document.getElementById('moments-content');
            var activeTab = document.querySelector('.moments-tab.active');
            if (container && activeTab) renderTab(activeTab.dataset.tab, container);
            _notify('发布成功 ✨', 'success');
            _sendAsMessage('📱 我发了一条新动态：' + text, true);
        };
    }

    // 评论
    function showCommentModal(postId) {
        var old = document.getElementById('comment-modal');
        if (old) old.remove();

        var wrap = document.createElement('div');
        wrap.id = 'comment-modal';
        wrap.style.cssText = 'position:fixed;inset:0;z-index:10030;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.5);';
        var inner = document.createElement('div');
        inner.style.cssText = 'background:var(--primary-bg);border-radius:20px;padding:24px;width:min(380px, 90vw);border:1px solid var(--border-color);';
        inner.innerHTML = '<div style="display:flex;justify-content:space-between;margin-bottom:14px;">' +
            '<span style="font-size:18px;font-weight:700;">💬 评论</span>' +
            '<button id="comment-close" style="background:none;border:none;font-size:20px;cursor:pointer;">✕</button>' +
            '</div>' +
            '<textarea id="comment-text" rows="3" placeholder="写下你的评论..." style="width:100%;padding:10px;border:1px solid var(--border-color);border-radius:12px;background:var(--secondary-bg);color:var(--text-primary);font-size:14px;resize:vertical;box-sizing:border-box;font-family:var(--font-family);"></textarea>' +
            '<div style="display:flex;gap:10px;margin-top:12px;">' +
            '<button id="comment-cancel" style="flex:1;padding:10px;border:1px solid var(--border-color);border-radius:12px;background:var(--secondary-bg);color:var(--text-secondary);cursor:pointer;">取消</button>' +
            '<button id="comment-submit" style="flex:2;padding:10px;border:none;border-radius:12px;background:var(--accent-color);color:#fff;font-weight:700;cursor:pointer;">发送</button>' +
            '</div>';
        wrap.appendChild(inner);
        document.body.appendChild(wrap);

        var close = function() { wrap.remove(); };
        document.getElementById('comment-close').onclick = close;
        document.getElementById('comment-cancel').onclick = close;
        wrap.onclick = function(e) { if (e.target === wrap) close(); };

        document.getElementById('comment-submit').onclick = function() {
            var text = document.getElementById('comment-text').value.trim();
            if (!text) { _notify('请输入评论', 'warning'); return; }

            var posts = _getPosts();
            var post = null;
            for (var i = 0; i < posts.length; i++) {
                if (posts[i].id === postId) { post = posts[i]; break; }
            }
            if (!post) { _notify('帖子不存在', 'error'); return; }

            var comment = _addComment(postId, 'me', text);
            if (!comment) { _notify('评论失败', 'error'); return; }

            close();
            var container = document.getElementById('moments-content');
            var activeTab = document.querySelector('.moments-tab.active');
            if (container && activeTab) renderTab(activeTab.dataset.tab, container);
            _notify('评论已发送', 'success');

            if (post.author === 'partner') {
                var delay = 60000 + Math.random() * 540000;
                setTimeout(function() {
                    var freshPosts = _getPosts();
                    var freshPost = null;
                    for (var fi = 0; fi < freshPosts.length; fi++) {
                        if (freshPosts[fi].id === postId) { freshPost = freshPosts[fi]; break; }
                    }
                    if (!freshPost) return;
                    var latestComment = freshPost.comments[freshPost.comments.length - 1];
                    if (latestComment && latestComment.author === 'me' && !latestComment.reply) {
                        var cards = _getReplyCards();
                        var count = 1 + Math.floor(Math.random() * 3);
                        var shuffled = cards.slice();
                        for (var si = shuffled.length - 1; si > 0; si--) {
                            var sj = Math.floor(Math.random() * (si + 1));
                            var st = shuffled[si];
                            shuffled[si] = shuffled[sj];
                            shuffled[sj] = st;
                        }
                        var picked = shuffled.slice(0, count);
                        var replyText = picked.join('');
                        _addReplyToComment(postId, latestComment.id, replyText);
                        _sendAsMessage('💬 ' + _getPartnerName() + ' 回复了你的评论：' + replyText, true);
                        _notify(_getPartnerName() + ' 回复了你的评论', 'info', 3000);
                        var container2 = document.getElementById('moments-content');
                        var activeTab2 = document.querySelector('.moments-tab.active');
                        if (container2 && activeTab2) renderTab(activeTab2.dataset.tab, container2);
                    }
                }, delay);
            }
        };
    }

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

    console.log('[朋友圈] 模块已加载（含封面设置）');
})();
