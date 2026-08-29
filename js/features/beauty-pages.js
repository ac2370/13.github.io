// beauty-pages.js – 将原有聊天区域与两个新页面组合成水平滑动布局（不覆盖原有元素）
(function() {
    'use strict';

    // 等待 DOM 完全加载
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    function init() {
        // ----- 获取原有聊天区域的关键元素 -----
        const header = document.querySelector('.header');            // 顶部栏
        const mainChat = document.querySelector('.main-chat-area');  // 聊天消息区
        const inputWrapper = document.querySelector('.input-area-wrapper'); // 输入区
        const typingIndicator = document.getElementById('typing-indicator-wrapper');
        // 可能还有其他兄弟元素（如 empty-state 等），它们都在 mainChat 内部或同级

        // 如果找不到必要元素，则放弃执行
        if (!mainChat || !inputWrapper) {
            console.warn('beauty-pages: 未找到 main-chat-area 或 input-area-wrapper，跳过初始化');
            return;
        }

        // 将输入区从原位置移除（稍后会放入滑动容器）
        // 但为了不破坏原有事件，我们将其移动，而不是复制
        // 注意：inputWrapper 可能包含事件监听，移动后仍有效

        // 创建一个滑动容器，包裹 mainChat 和 inputWrapper，以及两个新页面
        const sliderContainer = document.createElement('div');
        sliderContainer.className = 'beauty-slider-container';
        // 样式在下方定义

        // 创建三个页面 (page-chat, page-xiaohui, page-66)
        const pageChat = document.createElement('div');
        pageChat.className = 'beauty-page beauty-page-chat';
        // 将 mainChat 和 inputWrapper 移入 pageChat
        // 先保存它们的父节点引用，以便移动
        const chatParent = mainChat.parentNode;
        const inputParent = inputWrapper.parentNode;

        // 把 mainChat 和 inputWrapper 从原位置移除（保留所有子元素和事件）
        chatParent.removeChild(mainChat);
        inputParent.removeChild(inputWrapper);
        // 如果 typingIndicator 存在，也移动
        if (typingIndicator && typingIndicator.parentNode) {
            typingIndicator.parentNode.removeChild(typingIndicator);
        }

        // 将 mainChat, typingIndicator, inputWrapper 按原顺序放入 pageChat
        pageChat.appendChild(mainChat);
        if (typingIndicator) {
            pageChat.appendChild(typingIndicator);
        }
        pageChat.appendChild(inputWrapper);

        // 确保 mainChat 和 inputWrapper 的样式适应新容器
        // 它们原本是块级元素，在 flex 列中会正常显示

        // 创建页面2（阿晏&小回）
        const pageXiaohui = createPage2();

        // 创建页面3（阿晏&66）
        const page66 = createPage3();

        // 将三个页面加入滑动容器
        sliderContainer.appendChild(pageChat);
        sliderContainer.appendChild(pageXiaohui);
        sliderContainer.appendChild(page66);

        // 将滑动容器插入到 header 之后，body 中
        if (header && header.nextSibling) {
            header.parentNode.insertBefore(sliderContainer, header.nextSibling);
        } else {
            document.body.appendChild(sliderContainer);
        }

        // 调整样式：让滑动容器占据除 header 外的剩余高度
        // 因为 header 是块级，我们将容器设为 flex:1 并设置高度为 calc(100vh - header高度)
        // 但 header 高度不固定，用 flex 布局更稳妥：将 body 设为 flex 列，header 固定，容器 flex:1
        // 但 body 原本不是 flex，我们动态修改 body 样式
        document.body.style.display = 'flex';
        document.body.style.flexDirection = 'column';
        document.body.style.height = '100vh';
        document.body.style.overflow = 'hidden'; // 防止整体滚动

        if (header) {
            header.style.flexShrink = '0'; // 不压缩
        }
        sliderContainer.style.flex = '1';
        sliderContainer.style.overflow = 'hidden'; // 滑动容器内部滚动

        // 应用滑动容器的样式（在 CSS 中定义，但为了保险，动态注入）
        injectStyles();

        // 初始化纪念日等功能（在页面2中）
        initPage2Features();
        // 初始化页面3功能（如有）
        initPage3Features();

        // 聊天发送等功能已经在原有脚本中，无需重复绑定

        console.log('🌸 页面美化已加载（整合模式）· 阿晏 & 小回 & 66');
    }

    // ----- 创建页面2（阿晏&小回）的内容 -----
    function createPage2() {
        const page = document.createElement('div');
        page.className = 'beauty-page beauty-page-xiaohui';
        // 内容与之前全屏版的页面2一致
        page.innerHTML = `
            <div class="beauty-card">
                <div class="p2-top">
                    <div class="p2-left">
                        <div class="p2-avatar-lg"><img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Ccircle cx='50' cy='50' r='50' fill='%23d4a5a5'/%3E%3C/svg%3E" alt="avatar"></div>
                        <div class="p2-info">
                            <div class="p2-name" contenteditable="true">阿晏</div>
                            <div class="p2-sig" contenteditable="true">✨ 晴天 · 小回</div>
                        </div>
                    </div>
                    <div class="p2-right">
                        <div class="p2-item"><div class="p2-main" contenteditable="true">地球online</div><div class="p2-sub" contenteditable="true">主标</div></div>
                        <span class="p2-divider">|</span>
                        <div class="p2-item"><div class="p2-main" contenteditable="true">未定义</div><div class="p2-sub" contenteditable="true">副标</div></div>
                    </div>
                </div>
            </div>
            <div class="beauty-card">
                <div class="p2-memorial">
                    <div class="p2-mem-left">
                        <div class="p2-badge" contenteditable="true">🌸 初遇</div>
                        <div class="p2-avatars">
                            <div class="p2-av"><img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Ccircle cx='50' cy='50' r='50' fill='%23d4a5a5'/%3E%3C/svg%3E" alt="av1"></div>
                            <div class="p2-av"><img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Ccircle cx='50' cy='50' r='50' fill='%23b8a09c'/%3E%3C/svg%3E" alt="av2"></div>
                        </div>
                        <div class="p2-days" id="days-count">0 <small>天</small></div>
                        <input type="date" id="memorial-date" style="font-size:11px;padding:4px 8px;border-radius:12px;border:1px solid #e8ddd6;background:transparent;margin-top:4px;width:140px;text-align:center;color:var(--text);font-family:var(--font);">
                    </div>
                    <div class="p2-mem-right">
                        <div class="p2-polaroid"><img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect width='100' height='100' fill='%23e8ddd6'/%3E%3C/svg%3E" alt="pol1"></div>
                        <div class="p2-polaroid"><img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect width='100' height='100' fill='%23dccbc2'/%3E%3C/svg%3E" alt="pol2"></div>
                    </div>
                </div>
            </div>
            <div class="beauty-card">
                <div class="p2-music">
                    <div class="p2-music-cover"><img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Ccircle cx='50' cy='50' r='50' fill='%23d4a5a5'/%3E%3C/svg%3E" alt="music"></div>
                    <div class="p2-music-info">
                        <div class="p2-music-title" contenteditable="true">🎵 喜欢</div>
                        <div class="p2-music-sub" contenteditable="true">阿晏 · 小回</div>
                    </div>
                    <button class="p2-play-btn" id="p2-play-btn">▶</button>
                </div>
            </div>
            <div class="beauty-card">
                <div class="p2-profile">
                    <div class="p2-profile-av"><img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Ccircle cx='50' cy='50' r='50' fill='%23d4a5a5'/%3E%3C/svg%3E" alt="profile"></div>
                    <div class="p2-profile-info">
                        <div class="p2-profile-name" contenteditable="true">小回</div>
                        <div class="p2-profile-sub" contenteditable="true">✨ 被疼爱</div>
                    </div>
                    <div class="p2-dots" contenteditable="true">⋯</div>
                </div>
            </div>
            <div class="beauty-card" style="padding:12px;">
                <div class="p2-bigimg">
                    <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='225'%3E%3Crect width='400' height='225' fill='%23e8ddd6'/%3E%3Ctext x='200' y='118' text-anchor='middle' fill='%239a8a86' font-size='14' font-family='sans-serif'%3E✨ 自定义大图 ✨%3C/text%3E%3C/svg%3E" alt="big" id="p2-bigimg-img">
                </div>
            </div>
            <div class="beauty-card" style="padding:12px;">
                <div class="p2-polaroids-grid">
                    <div class="p2-pol"><img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='133'%3E%3Crect width='100' height='133' fill='%23f0e8e2'/%3E%3C/svg%3E" alt="pol"></div>
                    <div class="p2-pol"><img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='133'%3E%3Crect width='100' height='133' fill='%23e8ddd6'/%3E%3C/svg%3E" alt="pol"></div>
                    <div class="p2-pol"><img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='133'%3E%3Crect width='100' height='133' fill='%23dccbc2'/%3E%3C/svg%3E" alt="pol"></div>
                    <div class="p2-pol"><img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='133'%3E%3Crect width='100' height='133' fill='%23f5efe9'/%3E%3C/svg%3E" alt="pol"></div>
                </div>
            </div>
            <div class="beauty-kaomoji">♡ (˘▽˘)っ♡  (￣▽￣)ノ  ✧*。</div>
        `;
        return page;
    }

    // ----- 创建页面3（阿晏&66）的内容 -----
    function createPage3() {
        const page = document.createElement('div');
        page.className = 'beauty-page beauty-page-66';
        page.innerHTML = `
            <div class="p3-banner">
                <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='200'%3E%3Crect width='600' height='200' fill='%23dccbc2'/%3E%3Ctext x='300' y='110' text-anchor='middle' fill='%239a8a86' font-size='18' font-family='sans-serif'%3E🌸 阿晏 &amp; 66 🌸%3C/text%3E%3C/svg%3E" alt="banner" id="p3-banner-img">
                <div class="p3-avatar-overlay"><img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Ccircle cx='50' cy='50' r='50' fill='%23d4a5a5'/%3E%3C/svg%3E" alt="av"></div>
            </div>
            <div class="p3-title-area">
                <div class="p3-main-title" contenteditable="true">阿晏 &amp; 66</div>
                <div class="p3-kaomoji" contenteditable="true">(◕‿◕)♡ (｡♥‿♥｡)</div>
                <div class="p3-sub-title" contenteditable="true">✨ 红线的两端是你我 · 一杯美式 一杯拿铁</div>
            </div>
            <div class="beauty-card" style="padding:14px 12px;">
                <div class="p3-stats">
                    <div class="p3-stat"><div class="p3-num" contenteditable="true">365</div><div class="p3-label" contenteditable="true">Days</div></div>
                    <div class="p3-stat"><div class="p3-num" contenteditable="true">∞</div><div class="p3-label" contenteditable="true">Love</div></div>
                    <div class="p3-stat"><div class="p3-num" contenteditable="true">66</div><div class="p3-label" contenteditable="true">Moments</div></div>
                </div>
            </div>
            <div class="p3-search">
                <span class="p3-search-icon">🔍</span>
                <input type="text" placeholder="搜索回忆..." id="p3-search-input" value="未定义">
            </div>
            <div class="beauty-card" style="padding:14px 14px 18px;position:relative;overflow:visible;">
                <div class="p3-chat-area">
                    <div class="p3-chat-flow">
                        <div class="p3-cmsg">
                            <div class="p3-cav"><img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Ccircle cx='50' cy='50' r='50' fill='%23d4a5a5'/%3E%3C/svg%3E" alt="cav"></div>
                            <div class="p3-cbubble" contenteditable="true">你今天好嘛 🌷</div>
                        </div>
                        <div class="p3-cmsg right">
                            <div class="p3-cav"><img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Ccircle cx='50' cy='50' r='50' fill='%23b8a09c'/%3E%3C/svg%3E" alt="cav"></div>
                            <div class="p3-cbubble" contenteditable="true">想你啦 💕</div>
                        </div>
                        <div class="p3-cmsg">
                            <div class="p3-cav"><img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Ccircle cx='50' cy='50' r='50' fill='%23d4a5a5'/%3E%3C/svg%3E" alt="cav"></div>
                            <div class="p3-cbubble" contenteditable="true">一起去看星星吗 ✨</div>
                        </div>
                    </div>
                    <div class="p3-float-illus">
                        <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='267'%3E%3Crect width='200' height='267' fill='%23dccbc2'/%3E%3Ctext x='100' y='130' text-anchor='middle' fill='%239a8a86' font-size='14' font-family='sans-serif'%3E🌙 双人插画%3C/text%3E%3C/svg%3E" alt="illus" id="p3-illus-img">
                    </div>
                </div>
            </div>
            <div class="p3-post">
                <div class="p3-quote" contenteditable="true">宇宙在你沉睡时消失不见，但爱是秩序外的一瞬间</div>
                <div class="p3-actions">
                    <span contenteditable="true">❤️ 66</span>
                    <span contenteditable="true">💬 33</span>
                </div>
            </div>
            <div class="p3-footer">
                <div class="p3-footer-av"><img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Ccircle cx='50' cy='50' r='50' fill='%23d4a5a5'/%3E%3C/svg%3E" alt="footer"></div>
                <input class="p3-footer-input" placeholder="输入你的心意..." id="p3-footer-input" value="未定义">
            </div>
            <div class="beauty-kaomoji">(｡♡‿♡｡)  ✧  (◕‿◕)  ♡  (˘▽˘)っ</div>
        `;
        return page;
    }

    // ----- 注入样式（只包含新增滑动容器和两个新页面的样式，避免冲突） -----
    function injectStyles() {
        const styleText = `
            /* ===== 滑动容器 ===== */
            .beauty-slider-container {
                display: flex;
                overflow-x: auto;
                overflow-y: hidden;
                scroll-snap-type: x mandatory;
                scroll-behavior: smooth;
                -webkit-overflow-scrolling: touch;
                scrollbar-width: none;
                width: 100%;
                height: 100%;
                background: var(--bg, #f5efe9);
            }
            .beauty-slider-container::-webkit-scrollbar {
                display: none;
            }
            .beauty-page {
                flex: 0 0 100%;
                height: 100%;
                overflow-y: auto;
                overflow-x: hidden;
                scroll-snap-align: start;
                padding: 12px 16px 20px;
                box-sizing: border-box;
                background: var(--bg, #f5efe9);
            }
            .beauty-page::-webkit-scrollbar {
                width: 3px;
            }
            .beauty-page::-webkit-scrollbar-thumb {
                background: #d4a5a5;
                border-radius: 10px;
            }

            /* ===== 卡片样式（与原有风格统一） ===== */
            .beauty-card {
                background: rgba(255, 248, 242, 0.85);
                backdrop-filter: blur(8px);
                border-radius: 28px;
                padding: 18px 20px;
                box-shadow: 0 12px 40px rgba(60,40,35,0.10);
                border: 1px solid rgba(255,255,255,0.4);
                margin-bottom: 14px;
                transition: background 0.3s, border-color 0.3s;
            }

            /* ===== 页面2 样式 ===== */
            .p2-top { display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:10px; }
            .p2-left { display:flex; align-items:center; gap:12px; }
            .p2-avatar-lg { width:52px; height:52px; border-radius:50%; overflow:hidden; border:3px solid rgba(255,255,255,0.7); flex-shrink:0; background:#e8ddd6; }
            .p2-avatar-lg img { width:100%; height:100%; object-fit:cover; }
            .p2-info .p2-name { font-weight:600; font-size:16px; }
            .p2-info .p2-sig { font-size:12px; color:var(--text-light, #7a6a66); opacity:0.7; }
            .p2-right { display:flex; gap:14px; flex-wrap:wrap; }
            .p2-item { text-align:center; }
            .p2-item .p2-main { font-weight:600; font-size:14px; }
            .p2-item .p2-sub { font-size:11px; color:var(--text-light, #7a6a66); opacity:0.6; }
            .p2-divider { color:var(--text-light, #7a6a66); opacity:0.25; font-weight:200; align-self:center; }

            .p2-memorial { display:flex; align-items:center; gap:16px; flex-wrap:wrap; }
            .p2-mem-left { display:flex; flex-direction:column; align-items:center; flex:1 1 0; min-width:100px; }
            .p2-mem-left .p2-avatars { display:flex; align-items:center; position:relative; width:80px; height:60px; }
            .p2-mem-left .p2-av { width:52px; height:52px; border-radius:50%; overflow:hidden; border:3px solid rgba(255,255,255,0.8); position:absolute; background:#e8ddd6; flex-shrink:0; box-shadow:0 4px 12px rgba(0,0,0,0.06); }
            .p2-mem-left .p2-av:first-child { left:0; z-index:2; }
            .p2-mem-left .p2-av:last-child { left:28px; z-index:1; }
            .p2-mem-left .p2-av img { width:100%; height:100%; object-fit:cover; }
            .p2-badge { background:rgba(212,165,165,0.25); backdrop-filter:blur(4px); padding:2px 14px; border-radius:30px; font-size:12px; font-weight:500; color:#8a6a6a; border:1px solid rgba(255,255,255,0.4); margin-bottom:4px; white-space:nowrap; }
            .p2-days { font-size:24px; font-weight:700; color:var(--text, #3d2c2a); letter-spacing:1px; line-height:1.2; }
            .p2-days small { font-size:13px; font-weight:400; color:var(--text-light, #7a6a66); opacity:0.6; margin-left:4px; }
            .p2-mem-right { display:flex; gap:6px; flex:1 1 0; min-width:80px; justify-content:flex-end; }
            .p2-polaroid { width:64px; height:72px; background:#fff; border-radius:6px 6px 12px 12px; box-shadow:0 4px 16px rgba(0,0,0,0.06); padding:5px 5px 10px 5px; transform:rotate(-2deg); transition:0.3s; overflow:hidden; border:1px solid rgba(255,255,255,0.5); }
            .p2-polaroid:last-child { transform:rotate(4deg); margin-left:-12px; }
            .p2-polaroid img { width:100%; height:100%; object-fit:cover; border-radius:2px; }

            .p2-music { display:flex; align-items:center; gap:14px; }
            .p2-music-cover { width:48px; height:48px; border-radius:50%; overflow:hidden; flex-shrink:0; border:2px solid rgba(255,255,255,0.6); background:#e8ddd6; }
            .p2-music-cover img { width:100%; height:100%; object-fit:cover; }
            .p2-music-info { flex:1; min-width:0; }
            .p2-music-title { font-weight:600; font-size:14px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
            .p2-music-sub { font-size:11px; color:var(--text-light, #7a6a66); opacity:0.6; }
            .p2-play-btn { width:40px; height:40px; border-radius:50%; border:none; background:rgba(212,165,165,0.20); backdrop-filter:blur(4px); font-size:18px; color:var(--text, #3d2c2a); cursor:pointer; transition:0.25s; display:flex; align-items:center; justify-content:center; flex-shrink:0; border:1px solid rgba(255,255,255,0.3); }
            .p2-play-btn:hover { background:rgba(212,165,165,0.35); transform:scale(1.04); }

            .p2-profile { display:flex; align-items:center; gap:14px; }
            .p2-profile-av { width:44px; height:44px; border-radius:50%; overflow:hidden; flex-shrink:0; border:2px solid rgba(255,255,255,0.6); background:#e8ddd6; }
            .p2-profile-av img { width:100%; height:100%; object-fit:cover; }
            .p2-profile-info .p2-profile-name { font-weight:600; font-size:15px; }
            .p2-profile-info .p2-profile-sub { font-size:12px; color:var(--text-light, #7a6a66); opacity:0.6; }
            .p2-dots { font-size:20px; letter-spacing:2px; opacity:0.5; margin-left:auto; align-self:center; }

            .p2-bigimg { width:100%; aspect-ratio:16/9; border-radius:16px; overflow:hidden; background:#e8ddd6; border:1px solid rgba(255,255,255,0.3); position:relative; }
            .p2-bigimg img { width:100%; height:100%; object-fit:cover; }

            .p2-polaroids-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:8px; }
            .p2-pol { aspect-ratio:3/4; background:#fff; border-radius:4px 4px 10px 10px; padding:4px 4px 10px 4px; box-shadow:0 2px 12px rgba(0,0,0,0.05); overflow:hidden; border:1px solid rgba(255,255,255,0.4); }
            .p2-pol img { width:100%; height:100%; object-fit:cover; border-radius:2px; }

            /* ===== 页面3 样式 ===== */
            .p3-banner { position:relative; width:100%; aspect-ratio:16/6; border-radius:28px; overflow:hidden; background:linear-gradient(145deg,#e8ddd6,#dccbc2); margin-bottom:8px; border:1px solid rgba(255,255,255,0.3); }
            .p3-banner img { width:100%; height:100%; object-fit:cover; }
            .p3-avatar-overlay { position:absolute; bottom:-20px; left:50%; transform:translateX(-50%); width:70px; height:70px; border-radius:50%; overflow:hidden; border:4px solid rgba(255,255,255,0.9); box-shadow:0 4px 20px rgba(0,0,0,0.08); background:#e8ddd6; }
            .p3-avatar-overlay img { width:100%; height:100%; object-fit:cover; }

            .p3-title-area { text-align:center; padding:18px 0 6px; }
            .p3-main-title { font-size:22px; font-weight:700; letter-spacing:1px; }
            .p3-kaomoji { font-size:14px; opacity:0.5; margin:2px 0; letter-spacing:2px; }
            .p3-sub-title { font-size:13px; color:var(--text-light, #7a6a66); opacity:0.6; }

            .p3-stats { display:grid; grid-template-columns:repeat(3,1fr); gap:10px; text-align:center; }
            .p3-stat { background:rgba(255,248,242,0.4); backdrop-filter:blur(4px); border-radius:20px; padding:14px 6px; border:1px solid rgba(255,255,255,0.3); }
            .p3-stat .p3-num { font-size:20px; font-weight:700; }
            .p3-stat .p3-label { font-size:11px; color:var(--text-light, #7a6a66); opacity:0.6; margin-top:2px; }

            .p3-search { display:flex; align-items:center; gap:10px; background:rgba(255,248,242,0.5); backdrop-filter:blur(4px); border-radius:40px; padding:10px 18px; border:1px solid rgba(255,255,255,0.3); transition:0.25s; margin-bottom:14px; }
            .p3-search:focus-within { border-color:#d4a5a5; box-shadow:0 0 0 4px rgba(212,165,165,0.08); }
            .p3-search-icon { font-size:18px; opacity:0.4; }
            .p3-search input { flex:1; border:none; background:transparent; font-size:14px; font-family:inherit; color:var(--text, #3d2c2a); outline:none; min-width:0; }
            .p3-search input::placeholder { color:var(--text-light, #7a6a66); opacity:0.4; }

            .p3-chat-area { position:relative; padding:6px 0; }
            .p3-chat-flow { display:flex; flex-direction:column; gap:10px; }
            .p3-cmsg { display:flex; align-items:flex-start; gap:8px; max-width:78%; }
            .p3-cmsg.right { flex-direction:row-reverse; align-self:flex-end; }
            .p3-cav { width:32px; height:32px; border-radius:50%; overflow:hidden; flex-shrink:0; border:2px solid rgba(255,255,255,0.5); background:#e8ddd6; }
            .p3-cav img { width:100%; height:100%; object-fit:cover; }
            .p3-cbubble { background:rgba(255,248,242,0.6); backdrop-filter:blur(4px); padding:8px 14px; border-radius:18px 18px 18px 4px; font-size:13px; line-height:1.5; border:1px solid rgba(255,255,255,0.3); }
            .p3-cmsg.right .p3-cbubble { border-radius:18px 18px 4px 18px; background:rgba(212,165,165,0.18); }
            .p3-float-illus { position:absolute; right:0; top:20%; width:38%; aspect-ratio:3/4; border-radius:24px; overflow:hidden; box-shadow:0 12px 40px rgba(0,0,0,0.08); border:3px solid rgba(255,255,255,0.6); background:#e8ddd6; transform:translateX(6px); }
            .p3-float-illus img { width:100%; height:100%; object-fit:cover; }

            .p3-post { padding:14px 16px; background:rgba(255,248,242,0.4); backdrop-filter:blur(4px); border-radius:24px; border:1px solid rgba(255,255,255,0.3); margin-bottom:14px; }
            .p3-quote { font-size:14px; line-height:1.6; padding:4px 0 8px; font-style:italic; color:var(--text, #3d2c2a); }
            .p3-quote::before { content:'"'; font-size:20px; opacity:0.3; margin-right:2px; }
            .p3-quote::after { content:'"'; font-size:20px; opacity:0.3; margin-left:2px; }
            .p3-actions { display:flex; gap:18px; font-size:13px; color:var(--text-light, #7a6a66); opacity:0.6; padding-top:4px; border-top:1px solid rgba(0,0,0,0.04); }
            .p3-actions span { display:flex; align-items:center; gap:4px; }

            .p3-footer { display:flex; align-items:center; gap:10px; padding:4px 0 2px; }
            .p3-footer-av { width:36px; height:36px; border-radius:50%; overflow:hidden; flex-shrink:0; border:2px solid rgba(255,255,255,0.4); background:#e8ddd6; }
            .p3-footer-av img { width:100%; height:100%; object-fit:cover; }
            .p3-footer-input { flex:1; padding:10px 16px; border-radius:30px; border:1px solid #e8ddd6; background:rgba(255,248,242,0.4); backdrop-filter:blur(4px); font-size:13px; font-family:inherit; color:var(--text, #3d2c2a); outline:none; transition:0.25s; }
            .p3-footer-input:focus { border-color:#d4a5a5; box-shadow:0 0 0 4px rgba(212,165,165,0.08); }

            .beauty-kaomoji { font-size:12px; opacity:0.15; letter-spacing:3px; text-align:center; padding:4px 0; pointer-events:none; user-select:none; line-height:1.6; }

            /* 移动端适配 */
            @media (max-width: 480px) {
                .beauty-page { padding: 8px 10px 16px; }
                .beauty-card { padding: 14px 16px; border-radius: 22px; }
                .p2-mem-right .p2-polaroid { width:52px; height:60px; }
                .p2-avatar-lg { width:42px; height:42px; }
                .p2-mem-left .p2-av { width:42px; height:42px; }
                .p2-mem-left .p2-av:last-child { left:22px; }
                .p2-days { font-size:20px; }
                .p3-avatar-overlay { width:56px; height:56px; bottom:-16px; }
                .p3-main-title { font-size:18px; }
                .p3-stat .p3-num { font-size:17px; }
                .p3-float-illus { width:30%; top:30%; }
            }
            @media (max-width: 380px) {
                .p2-polaroids-grid { gap:5px; }
                .p2-right .p2-item .p2-main { font-size:12px; }
                .p2-right .p2-item .p2-sub { font-size:10px; }
            }
        `;
        const styleEl = document.createElement('style');
        styleEl.textContent = styleText;
        document.head.appendChild(styleEl);
    }

    // ----- 初始化页面2的功能（纪念日、音乐播放） -----
    function initPage2Features() {
        // 纪念日
        const memorialInput = document.getElementById('memorial-date');
        const daysDisplay = document.getElementById('days-count');
        if (memorialInput && daysDisplay) {
            function updateDays() {
                const val = memorialInput.value;
                if (!val) { daysDisplay.innerHTML = '0 <small>天</small>'; return; }
                const start = new Date(val);
                const now = new Date();
                const diff = Math.floor((now - start) / (1000 * 60 * 60 * 24));
                const display = diff > 0 ? diff : 0;
                daysDisplay.innerHTML = display + ' <small>天</small>';
                localStorage.setItem('memorial-date', val);
            }
            const saved = localStorage.getItem('memorial-date');
            if (saved) {
                memorialInput.value = saved;
            } else {
                const d = new Date();
                d.setFullYear(d.getFullYear() - 1);
                memorialInput.value = d.toISOString().slice(0, 10);
            }
            updateDays();
            memorialInput.addEventListener('change', updateDays);
        }

        // 音乐播放
        const playBtn = document.getElementById('p2-play-btn');
        if (playBtn) {
            let isPlaying = false;
            let audioCtx = null, oscillator = null, gainNode = null;
            playBtn.addEventListener('click', function() {
                if (!audioCtx) {
                    audioCtx = new(window.AudioContext || window.webkitAudioContext)();
                }
                if (isPlaying) {
                    if (oscillator) { oscillator.stop(); oscillator = null; }
                    if (gainNode) { gainNode.disconnect(); gainNode = null; }
                    playBtn.textContent = '▶';
                    isPlaying = false;
                } else {
                    try {
                        oscillator = audioCtx.createOscillator();
                        gainNode = audioCtx.createGain();
                        oscillator.type = 'sine';
                        oscillator.frequency.value = 440;
                        gainNode.gain.value = 0.12;
                        oscillator.connect(gainNode);
                        gainNode.connect(audioCtx.destination);
                        oscillator.start();
                        playBtn.textContent = '⏹';
                        isPlaying = true;
                        setTimeout(() => {
                            if (isPlaying) {
                                if (oscillator) { oscillator.stop(); oscillator = null; }
                                if (gainNode) { gainNode.disconnect(); gainNode = null; }
                                playBtn.textContent = '▶';
                                isPlaying = false;
                            }
                        }, 5000);
                    } catch (e) {
                        playBtn.textContent = '▶';
                        isPlaying = false;
                        alert('需要用户交互才能播放音频，点击页面任意位置后重试～');
                    }
                }
            });
        }
    }

    // ----- 初始化页面3的功能（如果有） -----
    function initPage3Features() {
        // 目前页面3无特殊交互，留空
    }

})();
