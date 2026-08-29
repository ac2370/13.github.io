// beauty-pages.js – 聊天框为第一页，右滑新增两页（阿晏&小回 / 阿晏&66），独立背景图，入口在高级功能
(function() {
    'use strict';

    // ----- 样式（仅作用于滑动容器及新增页面） -----
    const styles = `
        /* 滑动容器 */
        #beauty-slider-wrapper {
            display: flex;
            width: 100vw;
            height: 100vh;
            overflow-x: auto;
            overflow-y: hidden;
            scroll-snap-type: x mandatory;
            scroll-behavior: smooth;
            -webkit-overflow-scrolling: touch;
            scrollbar-width: none;
            background: var(--beauty-bg, #f5efe9);
            position: relative;
        }
        #beauty-slider-wrapper::-webkit-scrollbar {
            display: none;
        }
        .beauty-page {
            flex: 0 0 100vw;
            height: 100vh;
            scroll-snap-align: start;
            overflow-y: auto;
            overflow-x: hidden;
            background: var(--beauty-bg, #f5efe9);
            box-sizing: border-box;
        }
        .beauty-page::-webkit-scrollbar {
            width: 3px;
        }
        .beauty-page::-webkit-scrollbar-thumb {
            background: #d4a5a5;
            border-radius: 10px;
        }

        /* 聊天页（第一页）无内边距，保持原有聊天框样式 */
        #beauty-page-chat {
            padding: 0 !important;
        }
        #beauty-page-chat .header,
        #beauty-page-chat .main-chat-area {
            width: 100% !important;
            max-width: 100% !important;
        }

        /* 卡片样式（新增页面使用） */
        .beauty-card {
            background: rgba(255, 248, 242, 0.85);
            backdrop-filter: blur(8px);
            border-radius: 28px;
            padding: 18px 20px;
            box-shadow: 0 12px 40px rgba(60, 40, 35, 0.10);
            border: 1px solid rgba(255, 255, 255, 0.4);
            margin-bottom: 14px;
            transition: background 0.3s;
        }

        /* 页面2 样式 */
        .p2-top {
            display: flex;
            align-items: center;
            justify-content: space-between;
            flex-wrap: wrap;
            gap: 10px;
        }
        .p2-top .left {
            display: flex;
            align-items: center;
            gap: 12px;
        }
        .p2-top .left .avatar-lg {
            width: 52px;
            height: 52px;
            border-radius: 50%;
            overflow: hidden;
            border: 3px solid rgba(255, 255, 255, 0.7);
            flex-shrink: 0;
            background: #e8ddd6;
        }
        .p2-top .left .avatar-lg img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }
        .p2-top .left .info .name {
            font-weight: 600;
            font-size: 16px;
        }
        .p2-top .left .info .sig {
            font-size: 12px;
            color: #7a6a66;
            opacity: 0.7;
        }
        .p2-top .right {
            display: flex;
            gap: 14px;
            flex-wrap: wrap;
        }
        .p2-top .right .item {
            text-align: center;
        }
        .p2-top .right .item .main {
            font-weight: 600;
            font-size: 14px;
        }
        .p2-top .right .item .sub {
            font-size: 11px;
            color: #7a6a66;
            opacity: 0.6;
        }
        .p2-top .right .divider {
            color: #7a6a66;
            opacity: 0.25;
            font-weight: 200;
            align-self: center;
        }
        .p2-memorial {
            display: flex;
            align-items: center;
            gap: 16px;
            flex-wrap: wrap;
        }
        .p2-memorial .left {
            display: flex;
            flex-direction: column;
            align-items: center;
            flex: 1 1 0;
            min-width: 100px;
        }
        .p2-memorial .left .avatars {
            display: flex;
            align-items: center;
            position: relative;
            width: 80px;
            height: 60px;
        }
        .p2-memorial .left .avatars .av {
            width: 52px;
            height: 52px;
            border-radius: 50%;
            overflow: hidden;
            border: 3px solid rgba(255, 255, 255, 0.8);
            position: absolute;
            background: #e8ddd6;
            flex-shrink: 0;
            box-shadow: 0 4px 12px rgba(0,0,0,0.06);
        }
        .p2-memorial .left .avatars .av:first-child {
            left: 0;
            z-index: 2;
        }
        .p2-memorial .left .avatars .av:last-child {
            left: 28px;
            z-index: 1;
        }
        .p2-memorial .left .avatars .av img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }
        .p2-memorial .left .badge {
            background: rgba(212, 165, 165, 0.25);
            backdrop-filter: blur(4px);
            padding: 2px 14px;
            border-radius: 30px;
            font-size: 12px;
            font-weight: 500;
            color: #8a6a6a;
            border: 1px solid rgba(255,255,255,0.4);
            margin-bottom: 4px;
            white-space: nowrap;
        }
        .p2-memorial .left .days {
            font-size: 24px;
            font-weight: 700;
            color: #3d2c2a;
            letter-spacing: 1px;
            line-height: 1.2;
        }
        .p2-memorial .left .days small {
            font-size: 13px;
            font-weight: 400;
            color: #7a6a66;
            opacity: 0.6;
            margin-left: 4px;
        }
        .p2-memorial .right {
            display: flex;
            gap: 6px;
            flex: 1 1 0;
            min-width: 80px;
            justify-content: flex-end;
        }
        .p2-memorial .right .polaroid {
            width: 64px;
            height: 72px;
            background: #fff;
            border-radius: 6px 6px 12px 12px;
            box-shadow: 0 4px 16px rgba(0,0,0,0.06);
            padding: 5px 5px 10px 5px;
            transform: rotate(-2deg);
            transition: 0.3s;
            overflow: hidden;
            border: 1px solid rgba(255,255,255,0.5);
        }
        .p2-memorial .right .polaroid:last-child {
            transform: rotate(4deg);
            margin-left: -12px;
        }
        .p2-memorial .right .polaroid img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            border-radius: 2px;
        }
        .p2-music {
            display: flex;
            align-items: center;
            gap: 14px;
        }
        .p2-music .cover {
            width: 48px;
            height: 48px;
            border-radius: 50%;
            overflow: hidden;
            flex-shrink: 0;
            border: 2px solid rgba(255,255,255,0.6);
            background: #e8ddd6;
        }
        .p2-music .cover img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }
        .p2-music .info {
            flex: 1;
            min-width: 0;
        }
        .p2-music .info .title {
            font-weight: 600;
            font-size: 14px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }
        .p2-music .info .sub {
            font-size: 11px;
            color: #7a6a66;
            opacity: 0.6;
        }
        .p2-music .play-btn {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            border: none;
            background: rgba(212, 165, 165, 0.20);
            backdrop-filter: blur(4px);
            font-size: 18px;
            color: #3d2c2a;
            cursor: pointer;
            transition: 0.25s;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
            border: 1px solid rgba(255,255,255,0.3);
        }
        .p2-music .play-btn:hover {
            background: rgba(212, 165, 165, 0.35);
            transform: scale(1.04);
        }
        .p2-profile {
            display: flex;
            align-items: center;
            gap: 14px;
        }
        .p2-profile .av {
            width: 44px;
            height: 44px;
            border-radius: 50%;
            overflow: hidden;
            flex-shrink: 0;
            border: 2px solid rgba(255,255,255,0.6);
            background: #e8ddd6;
        }
        .p2-profile .av img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }
        .p2-profile .info .name {
            font-weight: 600;
            font-size: 15px;
        }
        .p2-profile .info .sub {
            font-size: 12px;
            color: #7a6a66;
            opacity: 0.6;
        }
        .p2-profile .dots {
            font-size: 20px;
            letter-spacing: 2px;
            opacity: 0.5;
            margin-left: auto;
            align-self: center;
        }
        /* 缩短大矩形宽度，居中 */
        .p2-bigimg-wrapper {
            display: flex;
            justify-content: center;
        }
        .p2-bigimg {
            width: 85%;
            max-width: 400px;
            aspect-ratio: 16/9;
            border-radius: 16px;
            overflow: hidden;
            background: #e8ddd6;
            border: 1px solid rgba(255,255,255,0.3);
            position: relative;
        }
        .p2-bigimg img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }
        .p2-polaroids {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 8px;
        }
        .p2-polaroids .pol {
            aspect-ratio: 3/4;
            background: #fff;
            border-radius: 4px 4px 10px 10px;
            padding: 4px 4px 10px 4px;
            box-shadow: 0 2px 12px rgba(0,0,0,0.05);
            overflow: hidden;
            border: 1px solid rgba(255,255,255,0.4);
        }
        .p2-polaroids .pol img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            border-radius: 2px;
        }

        /* 页面3 样式 */
        .p3-banner {
            position: relative;
            width: 100%;
            aspect-ratio: 16/6;
            border-radius: 28px;
            overflow: hidden;
            background: linear-gradient(145deg, #e8ddd6, #dccbc2);
            margin-bottom: 8px;
            border: 1px solid rgba(255,255,255,0.3);
        }
        .p3-banner img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }
        .p3-banner .avatar-overlay {
            position: absolute;
            bottom: -20px;
            left: 50%;
            transform: translateX(-50%);
            width: 70px;
            height: 70px;
            border-radius: 50%;
            overflow: hidden;
            border: 4px solid rgba(255,255,255,0.9);
            box-shadow: 0 4px 20px rgba(0,0,0,0.08);
            background: #e8ddd6;
        }
        .p3-banner .avatar-overlay img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }
        .p3-title-area {
            text-align: center;
            padding: 18px 0 6px;
        }
        .p3-title-area .main-title {
            font-size: 22px;
            font-weight: 700;
            letter-spacing: 1px;
        }
        .p3-title-area .kaomoji {
            font-size: 14px;
            opacity: 0.5;
            margin: 2px 0;
            letter-spacing: 2px;
        }
        /* 加长个签矩形气泡 */
        .p3-title-area .sub-title {
            font-size: 13px;
            color: #7a6a66;
            opacity: 0.6;
            padding: 8px 20px;
            background: rgba(255, 255, 255, 0.3);
            border-radius: 20px;
            display: inline-block;
            max-width: 90%;
            margin: 6px auto;
            backdrop-filter: blur(4px);
            border: 1px solid rgba(255,255,255,0.2);
        }
        .p3-stats {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 10px;
            text-align: center;
        }
        .p3-stats .stat {
            background: rgba(255, 248, 242, 0.4);
            backdrop-filter: blur(4px);
            border-radius: 20px;
            padding: 14px 6px;
            border: 1px solid rgba(255,255,255,0.3);
        }
        .p3-stats .stat .num {
            font-size: 20px;
            font-weight: 700;
        }
        .p3-stats .stat .label {
            font-size: 11px;
            color: #7a6a66;
            opacity: 0.6;
            margin-top: 2px;
        }
        /* 搜索栏已删除，不再需要样式 */
        .p3-chat-area {
            position: relative;
            padding: 6px 0;
        }
        .p3-chat-area .chat-flow {
            display: flex;
            flex-direction: column;
            gap: 10px;
        }
        .p3-chat-area .chat-flow .cmsg {
            display: flex;
            align-items: flex-start;
            gap: 8px;
            max-width: 78%;
        }
        .p3-chat-area .chat-flow .cmsg.right {
            flex-direction: row-reverse;
            align-self: flex-end;
        }
        .p3-chat-area .chat-flow .cmsg .cav {
            width: 32px;
            height: 32px;
            border-radius: 50%;
            overflow: hidden;
            flex-shrink: 0;
            border: 2px solid rgba(255,255,255,0.5);
            background: #e8ddd6;
        }
        .p3-chat-area .chat-flow .cmsg .cav img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }
        .p3-chat-area .chat-flow .cmsg .cbubble {
            background: rgba(255, 248, 242, 0.6);
            backdrop-filter: blur(4px);
            padding: 8px 14px;
            border-radius: 18px 18px 18px 4px;
            font-size: 13px;
            line-height: 1.5;
            border: 1px solid rgba(255,255,255,0.3);
        }
        .p3-chat-area .chat-flow .cmsg.right .cbubble {
            border-radius: 18px 18px 4px 18px;
            background: rgba(212, 165, 165, 0.18);
        }
        .p3-chat-area .float-illus {
            position: absolute;
            right: 0;
            top: 20%;
            width: 38%;
            aspect-ratio: 3/4;
            border-radius: 24px;
            overflow: hidden;
            box-shadow: 0 12px 40px rgba(0,0,0,0.08);
            border: 3px solid rgba(255,255,255,0.6);
            background: #e8ddd6;
            transform: translateX(6px);
        }
        .p3-chat-area .float-illus img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }
        .p3-post {
            padding: 14px 16px;
            background: rgba(255, 248, 242, 0.4);
            backdrop-filter: blur(4px);
            border-radius: 24px;
            border: 1px solid rgba(255,255,255,0.3);
            margin-bottom: 14px;
        }
        .p3-post .quote {
            font-size: 14px;
            line-height: 1.6;
            padding: 4px 0 8px;
            font-style: italic;
            color: #3d2c2a;
        }
        .p3-post .quote::before {
            content: '"';
            font-size: 20px;
            opacity: 0.3;
            margin-right: 2px;
        }
        .p3-post .quote::after {
            content: '"';
            font-size: 20px;
            opacity: 0.3;
            margin-left: 2px;
        }
        .p3-post .actions {
            display: flex;
            gap: 18px;
            font-size: 13px;
            color: #7a6a66;
            opacity: 0.6;
            padding-top: 4px;
            border-top: 1px solid rgba(0,0,0,0.04);
        }
        .p3-post .actions span {
            display: flex;
            align-items: center;
            gap: 4px;
        }
        .p3-footer {
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 4px 0 2px;
        }
        .p3-footer .fav {
            width: 36px;
            height: 36px;
            border-radius: 50%;
            overflow: hidden;
            flex-shrink: 0;
            border: 2px solid rgba(255,255,255,0.4);
            background: #e8ddd6;
        }
        .p3-footer .fav img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }
        .p3-footer .finp {
            flex: 1;
            padding: 10px 16px;
            border-radius: 30px;
            border: 1px solid #e8ddd6;
            background: rgba(255, 248, 242, 0.4);
            backdrop-filter: blur(4px);
            font-size: 13px;
            font-family: inherit;
            color: #3d2c2a;
            outline: none;
            transition: 0.25s;
        }
        .p3-footer .finp:focus {
            border-color: #d4a5a5;
            box-shadow: 0 0 0 4px rgba(212,165,165,0.08);
        }
        .beauty-kaomoji-deco {
            font-size: 12px;
            opacity: 0.15;
            letter-spacing: 3px;
            text-align: center;
            padding: 4px 0;
            pointer-events: none;
            user-select: none;
            line-height: 1.6;
        }

        /* 响应式微调 */
        @media (max-width: 480px) {
            .beauty-page {
                padding: 0 10px 16px;
            }
            #beauty-page-chat {
                padding: 0 !important;
            }
            .beauty-card {
                padding: 14px 16px;
                border-radius: 22px;
            }
            .p2-memorial .right .polaroid {
                width: 52px;
                height: 60px;
            }
            .p2-top .left .avatar-lg {
                width: 42px;
                height: 42px;
            }
            .p2-memorial .left .avatars .av {
                width: 42px;
                height: 42px;
            }
            .p2-memorial .left .avatars .av:last-child {
                left: 22px;
            }
            .p2-memorial .left .days {
                font-size: 20px;
            }
            .p3-banner .avatar-overlay {
                width: 56px;
                height: 56px;
                bottom: -16px;
            }
            .p3-title-area .main-title {
                font-size: 18px;
            }
            .p3-stats .stat .num {
                font-size: 17px;
            }
            .p3-chat-area .float-illus {
                width: 30%;
                top: 30%;
            }
            .p2-bigimg {
                width: 95%;
            }
        }
        @media (max-width: 380px) {
            .p2-polaroids {
                gap: 5px;
            }
            .p2-top .right .item .main {
                font-size: 12px;
            }
            .p2-top .right .item .sub {
                font-size: 10px;
            }
        }

        /* 美化面板（独立于原有设置） */
        #beauty-settings-panel {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 99999;
            background: rgba(0,0,0,0.35);
            backdrop-filter: blur(6px);
            display: none;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }
        #beauty-settings-panel.open {
            display: flex;
        }
        .beauty-settings-box {
            background: rgba(255, 252, 248, 0.96);
            backdrop-filter: blur(20px);
            border-radius: 40px;
            padding: 32px 28px 28px;
            max-width: 420px;
            width: 100%;
            max-height: 80vh;
            overflow-y: auto;
            box-shadow: 0 30px 80px rgba(0,0,0,0.20);
            border: 1px solid rgba(255,255,255,0.3);
        }
        .beauty-settings-box h2 {
            font-size: 18px;
            font-weight: 600;
            margin-bottom: 20px;
            letter-spacing: 0.3px;
            color: #3d2c2a;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        .beauty-settings-box h2 span {
            font-size: 22px;
        }
        .beauty-setting-group {
            margin-bottom: 18px;
        }
        .beauty-setting-group label {
            display: block;
            font-size: 13px;
            font-weight: 500;
            color: #7a6a66;
            margin-bottom: 5px;
            letter-spacing: 0.3px;
        }
        .beauty-setting-group input[type="color"],
        .beauty-setting-group input[type="text"],
        .beauty-setting-group input[type="file"] {
            width: 100%;
            padding: 10px 14px;
            border-radius: 16px;
            border: 1px solid #e8ddd6;
            background: rgba(255, 248, 242, 0.6);
            font-size: 14px;
            font-family: inherit;
            color: #3d2c2a;
            transition: 0.25s;
            outline: none;
        }
        .beauty-setting-group input[type="color"] {
            height: 44px;
            padding: 4px;
            cursor: pointer;
        }
        .beauty-setting-group input:focus {
            border-color: #d4a5a5;
            box-shadow: 0 0 0 4px rgba(212,165,165,0.15);
        }
        .beauty-setting-group .file-wrap {
            display: flex;
            gap: 10px;
            align-items: center;
        }
        .beauty-setting-group .file-wrap input[type="file"] {
            flex: 1;
            padding: 8px 10px;
        }
        .beauty-setting-group .file-wrap button {
            padding: 8px 18px;
            border-radius: 16px;
            border: none;
            background: #d4a5a5;
            color: #fff;
            font-weight: 500;
            font-size: 13px;
            cursor: pointer;
            transition: 0.25s;
            white-space: nowrap;
        }
        .beauty-setting-group .file-wrap button:hover {
            background: #c49494;
        }
        .beauty-settings-close {
            width: 100%;
            padding: 12px;
            border-radius: 20px;
            border: none;
            background: #3d2c2a;
            color: #fff;
            font-size: 15px;
            font-weight: 500;
            cursor: pointer;
            margin-top: 6px;
            transition: 0.25s;
        }
        .beauty-settings-close:hover {
            background: #2d1f1d;
        }
        .beauty-settings-box::-webkit-scrollbar {
            width: 4px;
        }
        .beauty-settings-box::-webkit-scrollbar-thumb {
            background: #d4a5a5;
            border-radius: 10px;
        }
    `;

    // ----- HTML 内容（页面2 & 页面3） -----
    const page2HTML = `
        <div style="padding-top:10px;">
            <!-- 顶部气泡 -->
            <div class="beauty-card">
                <div class="p2-top">
                    <div class="left">
                        <div class="avatar-lg"><img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Ccircle cx='50' cy='50' r='50' fill='%23d4a5a5'/%3E%3C/svg%3E" alt="avatar"></div>
                        <div class="info">
                            <div class="name" contenteditable="true">阿晏</div>
                            <div class="sig" contenteditable="true">✨ 晴天 · 小回</div>
                        </div>
                    </div>
                    <div class="right">
                        <div class="item"><div class="main" contenteditable="true">地球online</div><div class="sub" contenteditable="true">主标</div></div>
                        <span class="divider">|</span>
                        <div class="item"><div class="main" contenteditable="true">未定义</div><div class="sub" contenteditable="true">副标</div></div>
                    </div>
                </div>
            </div>

            <!-- 纪念日 -->
            <div class="beauty-card">
                <div class="p2-memorial">
                    <div class="left">
                        <div class="badge" contenteditable="true">🌸 初遇</div>
                        <div class="avatars">
                            <div class="av"><img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Ccircle cx='50' cy='50' r='50' fill='%23d4a5a5'/%3E%3C/svg%3E" alt="av1"></div>
                            <div class="av"><img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Ccircle cx='50' cy='50' r='50' fill='%23b8a09c'/%3E%3C/svg%3E" alt="av2"></div>
                        </div>
                        <div class="days" id="p2-days-count">0 <small>天</small></div>
                        <input type="date" id="p2-memorial-date" style="font-size:11px;padding:4px 8px;border-radius:12px;border:1px solid #e8ddd6;background:transparent;margin-top:4px;width:140px;text-align:center;color:#3d2c2a;font-family:inherit;">
                    </div>
                    <div class="right">
                        <div class="polaroid"><img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect width='100' height='100' fill='%23e8ddd6'/%3E%3C/svg%3E" alt="polaroid1"></div>
                        <div class="polaroid"><img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect width='100' height='100' fill='%23dccbc2'/%3E%3C/svg%3E" alt="polaroid2"></div>
                    </div>
                </div>
            </div>

            <!-- 音乐播放器 -->
            <div class="beauty-card">
                <div class="p2-music">
                    <div class="cover"><img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Ccircle cx='50' cy='50' r='50' fill='%23d4a5a5'/%3E%3C/svg%3E" alt="music cover"></div>
                    <div class="info">
                        <div class="title" contenteditable="true">🎵 喜欢</div>
                        <div class="sub" contenteditable="true">阿晏 · 小回</div>
                    </div>
                    <button class="play-btn" id="p2-play-btn-2">▶</button>
                </div>
            </div>

            <!-- 头像+昵称+... -->
            <div class="beauty-card">
                <div class="p2-profile">
                    <div class="av"><img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Ccircle cx='50' cy='50' r='50' fill='%23d4a5a5'/%3E%3C/svg%3E" alt="profile av"></div>
                    <div class="info">
                        <div class="name" contenteditable="true">小回</div>
                        <div class="sub" contenteditable="true">✨ 被疼爱</div>
                    </div>
                    <div class="dots" contenteditable="true">⋯</div>
                </div>
            </div>

            <!-- 大矩形图片（已缩短） -->
            <div class="beauty-card" style="padding:12px;">
                <div class="p2-bigimg-wrapper">
                    <div class="p2-bigimg">
                        <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='225'%3E%3Crect width='400' height='225' fill='%23e8ddd6'/%3E%3Ctext x='200' y='118' text-anchor='middle' fill='%239a8a86' font-size='14' font-family='sans-serif'%3E✨ 自定义大图 ✨%3C/text%3E%3C/svg%3E" alt="big image">
                    </div>
                </div>
            </div>

            <!-- 四张拍立得 -->
            <div class="beauty-card" style="padding:12px;">
                <div class="p2-polaroids">
                    <div class="pol"><img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='133'%3E%3Crect width='100' height='133' fill='%23f0e8e2'/%3E%3C/svg%3E" alt="pol1"></div>
                    <div class="pol"><img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='133'%3E%3Crect width='100' height='133' fill='%23e8ddd6'/%3E%3C/svg%3E" alt="pol2"></div>
                    <div class="pol"><img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='133'%3E%3Crect width='100' height='133' fill='%23dccbc2'/%3E%3C/svg%3E" alt="pol3"></div>
                    <div class="pol"><img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='133'%3E%3Crect width='100' height='133' fill='%23f5efe9'/%3E%3C/svg%3E" alt="pol4"></div>
                </div>
            </div>
            <div class="beauty-kaomoji-deco">♡ (˘▽˘)っ♡  (￣▽￣)ノ  ✧*。</div>
        </div>
    `;

    const page3HTML = `
        <div style="padding-top:10px;">
            <!-- 横幅 + 头像 -->
            <div class="p3-banner">
                <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='200'%3E%3Crect width='600' height='200' fill='%23dccbc2'/%3E%3Ctext x='300' y='110' text-anchor='middle' fill='%239a8a86' font-size='18' font-family='sans-serif'%3E🌸 阿晏 &amp; 66 🌸%3C/text%3E%3C/svg%3E" alt="banner">
                <div class="avatar-overlay"><img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Ccircle cx='50' cy='50' r='50' fill='%23d4a5a5'/%3E%3C/svg%3E" alt="banner av"></div>
            </div>

            <!-- 标题区（个签已加长） -->
            <div class="p3-title-area">
                <div class="main-title" contenteditable="true">阿晏 &amp; 66</div>
                <div class="kaomoji" contenteditable="true">(◕‿◕)♡ (｡♥‿♥｡)</div>
                <div class="sub-title" contenteditable="true">✨ 红线的两端是你我 · 一杯美式 一杯拿铁</div>
            </div>

            <!-- 三栏统计 -->
            <div class="beauty-card" style="padding:14px 12px;">
                <div class="p3-stats">
                    <div class="stat"><div class="num" contenteditable="true">365</div><div class="label" contenteditable="true">Days</div></div>
                    <div class="stat"><div class="num" contenteditable="true">∞</div><div class="label" contenteditable="true">Love</div></div>
                    <div class="stat"><div class="num" contenteditable="true">66</div><div class="label" contenteditable="true">Moments</div></div>
                </div>
            </div>

            <!-- 搜索栏已删除 -->

            <!-- 聊天对话区 -->
            <div class="beauty-card" style="padding:14px 14px 18px;position:relative;overflow:visible;">
                <div class="p3-chat-area">
                    <div class="chat-flow">
                        <div class="cmsg">
                            <div class="cav"><img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Ccircle cx='50' cy='50' r='50' fill='%23d4a5a5'/%3E%3C/svg%3E" alt="cav1"></div>
                            <div class="cbubble" contenteditable="true">你今天好嘛 🌷</div>
                        </div>
                        <div class="cmsg right">
                            <div class="cav"><img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Ccircle cx='50' cy='50' r='50' fill='%23b8a09c'/%3E%3C/svg%3E" alt="cav2"></div>
                            <div class="cbubble" contenteditable="true">想你啦 💕</div>
                        </div>
                        <div class="cmsg">
                            <div class="cav"><img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Ccircle cx='50' cy='50' r='50' fill='%23d4a5a5'/%3E%3C/svg%3E" alt="cav1"></div>
                            <div class="cbubble" contenteditable="true">一起去看星星吗 ✨</div>
                        </div>
                    </div>
                    <div class="float-illus">
                        <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='267'%3E%3Crect width='200' height='267' fill='%23dccbc2'/%3E%3Ctext x='100' y='130' text-anchor='middle' fill='%239a8a86' font-size='14' font-family='sans-serif'%3E🌙 双人插画%3C/text%3E%3C/svg%3E" alt="illus">
                    </div>
                </div>
            </div>

            <!-- 帖子卡片 -->
            <div class="p3-post">
                <div class="quote" contenteditable="true">宇宙在你沉睡时消失不见，但爱是秩序外的一瞬间</div>
                <div class="actions">
                    <span contenteditable="true">❤️ 66</span>
                    <span contenteditable="true">💬 33</span>
                </div>
            </div>

            <!-- 底部输入栏 -->
            <div class="p3-footer">
                <div class="fav"><img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Ccircle cx='50' cy='50' r='50' fill='%23d4a5a5'/%3E%3C/svg%3E" alt="footer av"></div>
                <input class="finp" placeholder="输入你的心意..." value="未定义">
            </div>
            <div class="beauty-kaomoji-deco">(｡♡‿♡｡)  ✧  (◕‿◕)  ♡  (˘▽˘)っ</div>
        </div>
    `;

    // ----- 初始化主函数 -----
    function initBeautyPages() {
        // 检查是否已存在滑动容器，避免重复执行
        if (document.getElementById('beauty-slider-wrapper')) return;

        // 获取原有聊天界面的关键元素
        const header = document.querySelector('.header');
        const mainChat = document.querySelector('.main-chat-area');
        if (!header || !mainChat) {
            console.warn('未找到 .header 或 .main-chat-area，无法构建滑动页面');
            return;
        }

        // 创建滑动容器
        const wrapper = document.createElement('div');
        wrapper.id = 'beauty-slider-wrapper';

        // 创建三个页面
        const page1 = document.createElement('div');
        page1.className = 'beauty-page';
        page1.id = 'beauty-page-chat';
        // 将 header 和 mainChat 移入 page1（保持原有样式）
        const parent = header.parentNode;
        const headerClone = header;
        const mainChatClone = mainChat;
        parent.removeChild(headerClone);
        parent.removeChild(mainChatClone);
        page1.appendChild(headerClone);
        page1.appendChild(mainChatClone);

        // 创建页面2
        const page2 = document.createElement('div');
        page2.className = 'beauty-page';
        page2.id = 'beauty-page-xiaohui';
        page2.innerHTML = page2HTML;

        // 创建页面3
        const page3 = document.createElement('div');
        page3.className = 'beauty-page';
        page3.id = 'beauty-page-66';
        page3.innerHTML = page3HTML;

        wrapper.appendChild(page1);
        wrapper.appendChild(page2);
        wrapper.appendChild(page3);

        parent.insertBefore(wrapper, parent.firstChild);

        // 注入样式
        const styleEl = document.createElement('style');
        styleEl.textContent = styles;
        document.head.appendChild(styleEl);

        // ----- 绑定新增页面的交互功能 -----

        // 页面2 纪念日
        const memorialInput = document.getElementById('p2-memorial-date');
        const daysDisplay = document.getElementById('p2-days-count');
        if (memorialInput && daysDisplay) {
            function updateP2Days() {
                const val = memorialInput.value;
                if (!val) { daysDisplay.innerHTML = '0 <small>天</small>'; return; }
                const start = new Date(val);
                const now = new Date();
                const diff = Math.floor((now - start) / (1000 * 60 * 60 * 24));
                const display = diff > 0 ? diff : 0;
                daysDisplay.innerHTML = display + ' <small>天</small>';
                localStorage.setItem('p2-memorial-date', val);
            }
            const saved = localStorage.getItem('p2-memorial-date');
            if (saved) {
                memorialInput.value = saved;
            } else {
                const d = new Date();
                d.setFullYear(d.getFullYear() - 1);
                memorialInput.value = d.toISOString().slice(0, 10);
            }
            updateP2Days();
            memorialInput.addEventListener('change', updateP2Days);
        }

        // 页面2 音乐播放
        const playBtn2 = document.getElementById('p2-play-btn-2');
        let isPlaying2 = false;
        let audioCtx2 = null, osc2 = null, gain2 = null;
        if (playBtn2) {
            playBtn2.addEventListener('click', function() {
                if (!audioCtx2) {
                    audioCtx2 = new(window.AudioContext || window.webkitAudioContext)();
                }
                if (isPlaying2) {
                    if (osc2) { osc2.stop(); osc2 = null; }
                    if (gain2) { gain2.disconnect(); gain2 = null; }
                    playBtn2.textContent = '▶';
                    isPlaying2 = false;
                } else {
                    try {
                        osc2 = audioCtx2.createOscillator();
                        gain2 = audioCtx2.createGain();
                        osc2.type = 'sine';
                        osc2.frequency.value = 440;
                        gain2.gain.value = 0.12;
                        osc2.connect(gain2);
                        gain2.connect(audioCtx2.destination);
                        osc2.start();
                        playBtn2.textContent = '⏹';
                        isPlaying2 = true;
                        setTimeout(() => {
                            if (isPlaying2) {
                                if (osc2) { osc2.stop(); osc2 = null; }
                                if (gain2) { gain2.disconnect(); gain2 = null; }
                                playBtn2.textContent = '▶';
                                isPlaying2 = false;
                            }
                        }, 5000);
                    } catch (e) {
                        playBtn2.textContent = '▶';
                        isPlaying2 = false;
                        alert('需要用户交互才能播放音频，点击页面任意位置后重试～');
                    }
                }
            });
        }

        // ----- 全局美化面板（独立，通过高级功能打开） -----
        // 创建面板（不创建按钮）
        const panel = document.createElement('div');
        panel.id = 'beauty-settings-panel';
        panel.innerHTML = `
            <div class="beauty-settings-box">
                <h2><span>🎨</span> 全局美化</h2>
                <div class="beauty-setting-group">
                    <label>🎨 背景颜色</label>
                    <input type="color" id="beauty-bg-color" value="#f5efe9">
                </div>
                <div class="beauty-setting-group">
                    <label>📝 文字颜色</label>
                    <input type="color" id="beauty-text-color" value="#3d2c2a">
                </div>
                <div class="beauty-setting-group">
                    <label>📦 卡片透明度</label>
                    <input type="text" id="beauty-card-opacity" placeholder="0.6 ~ 1.0" value="0.85">
                </div>
                <div class="beauty-setting-group">
                    <label>🖼️ 页面2 背景图 (URL)</label>
                    <input type="text" id="beauty-bg-url-page2" placeholder="页面2背景图链接" value="">
                </div>
                <div class="beauty-setting-group">
                    <label>🖼️ 页面3 背景图 (URL)</label>
                    <input type="text" id="beauty-bg-url-page3" placeholder="页面3背景图链接" value="">
                </div>
                <div class="beauty-setting-group">
                    <label>📂 上传自定义图片 (用于任意位置)</label>
                    <div class="file-wrap">
                        <input type="file" id="beauty-custom-file" accept="image/*">
                        <button id="beauty-apply-file-btn">应用</button>
                    </div>
                </div>
                <div style="font-size:12px;color:#7a6a66;opacity:0.5;margin:-6px 0 14px 0;padding-left:4px;">
                    💡 点击页面中的文字可直接编辑 (contenteditable)
                </div>
                <button class="beauty-settings-close" id="beauty-settings-close">✨ 完成</button>
            </div>
        `;
        document.body.appendChild(panel);

        // 绑定面板事件
        const panelEl = document.getElementById('beauty-settings-panel');
        const closeBtn = document.getElementById('beauty-settings-close');
        const bgColorInput = document.getElementById('beauty-bg-color');
        const textColorInput = document.getElementById('beauty-text-color');
        const cardOpacityInput = document.getElementById('beauty-card-opacity');
        const bgUrlPage2 = document.getElementById('beauty-bg-url-page2');
        const bgUrlPage3 = document.getElementById('beauty-bg-url-page3');
        const customFileInput = document.getElementById('beauty-custom-file');
        const applyFileBtn = document.getElementById('beauty-apply-file-btn');

        function applyBeautySettings() {
            const bgColor = bgColorInput.value;
            const textColor = textColorInput.value;
            const opacity = parseFloat(cardOpacityInput.value) || 0.85;
            const bg2 = bgUrlPage2.value.trim();
            const bg3 = bgUrlPage3.value.trim();

            // 应用到所有页面
            document.querySelectorAll('.beauty-page').forEach(page => {
                page.style.setProperty('--beauty-bg', bgColor);
                page.style.setProperty('--text', textColor);
                page.style.setProperty('--card-bg', `rgba(255,248,242,${Math.min(opacity,1)})`);
            });

            // 页面2 背景
            const p2 = document.getElementById('beauty-page-xiaohui');
            if (p2) {
                if (bg2) {
                    p2.style.backgroundImage = `url(${bg2})`;
                    p2.style.backgroundSize = 'cover';
                    p2.style.backgroundPosition = 'center';
                    p2.style.backgroundAttachment = 'fixed';
                } else {
                    p2.style.backgroundImage = 'none';
                    p2.style.backgroundSize = 'auto';
                }
            }

            // 页面3 背景
            const p3 = document.getElementById('beauty-page-66');
            if (p3) {
                if (bg3) {
                    p3.style.backgroundImage = `url(${bg3})`;
                    p3.style.backgroundSize = 'cover';
                    p3.style.backgroundPosition = 'center';
                    p3.style.backgroundAttachment = 'fixed';
                } else {
                    p3.style.backgroundImage = 'none';
                    p3.style.backgroundSize = 'auto';
                }
            }

            // 保存
            localStorage.setItem('beauty-bg-color', bgColor);
            localStorage.setItem('beauty-text-color', textColor);
            localStorage.setItem('beauty-card-opacity', String(opacity));
            localStorage.setItem('beauty-bg-url-page2', bg2);
            localStorage.setItem('beauty-bg-url-page3', bg3);
        }

        function loadBeautySettings() {
            const bgColor = localStorage.getItem('beauty-bg-color') || '#f5efe9';
            const textColor = localStorage.getItem('beauty-text-color') || '#3d2c2a';
            const opacity = localStorage.getItem('beauty-card-opacity') || '0.85';
            const bg2 = localStorage.getItem('beauty-bg-url-page2') || '';
            const bg3 = localStorage.getItem('beauty-bg-url-page3') || '';
            bgColorInput.value = bgColor;
            textColorInput.value = textColor;
            cardOpacityInput.value = opacity;
            bgUrlPage2.value = bg2;
            bgUrlPage3.value = bg3;
            applyBeautySettings();
        }

        closeBtn.addEventListener('click', function() {
            applyBeautySettings();
            panelEl.classList.remove('open');
        });

        [bgColorInput, textColorInput, cardOpacityInput, bgUrlPage2, bgUrlPage3].forEach(el => {
            el.addEventListener('input', applyBeautySettings);
            el.addEventListener('change', applyBeautySettings);
        });

        // 自定义图片上传
        let uploadedData = null;
        customFileInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = function(ev) {
                uploadedData = ev.target.result;
                alert('✅ 图片已加载！点击「应用」替换当前页面的图片占位。');
            };
            reader.readAsDataURL(file);
        });

        applyFileBtn.addEventListener('click', function() {
            if (!uploadedData) {
                alert('请先选择一张图片上传～');
                return;
            }
            const imgs = document.querySelectorAll('#beauty-slider-wrapper img');
            let count = 0;
            imgs.forEach(img => {
                const src = img.src || '';
                if (src.includes('data:image/svg+xml') || src.includes('svg')) {
                    img.src = uploadedData;
                    count++;
                }
            });
            alert(`✨ 已替换 ${count} 个图片占位！`);
        });

        // 加载设置
        loadBeautySettings();

        // ----- 在高级功能面板中添加“页面美化”入口 -----
        function addBeautyEntryToAdvanced() {
            const advancedModal = document.getElementById('advanced-modal');
            if (!advancedModal) {
                // 如果高级功能面板还没加载，稍后重试
                setTimeout(addBeautyEntryToAdvanced, 500);
                return;
            }
            const list = advancedModal.querySelector('.settings-item-list');
            if (!list) {
                setTimeout(addBeautyEntryToAdvanced, 500);
                return;
            }
            // 检查是否已添加
            if (list.querySelector('.beauty-entry-item')) return;
            const item = document.createElement('div');
            item.className = 'settings-item beauty-entry-item';
            item.style.cursor = 'pointer';
            item.innerHTML = `<i class="fas fa-palette"></i><span>页面美化</span>`;
            item.addEventListener('click', function() {
                // 关闭高级功能面板（可选）
                const advModal = document.getElementById('advanced-modal');
                if (advModal && typeof hideModal === 'function') {
                    hideModal(advModal);
                }
                // 打开美化面板
                const panel = document.getElementById('beauty-settings-panel');
                if (panel) panel.classList.add('open');
            });
            list.appendChild(item);
        }

        // 尝试添加
        setTimeout(addBeautyEntryToAdvanced, 300);

        console.log('🌸 聊天框已嵌入滑动容器，右滑可查看“阿晏&小回”和“阿晏&66”页面');
        console.log('💡 页面美化入口已添加到高级功能中。');
    }

    // ----- 执行初始化 -----
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initBeautyPages);
    } else {
        initBeautyPages();
    }
})();
