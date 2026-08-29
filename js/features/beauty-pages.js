// beauty-pages.js – 纯 JavaScript 模块，动态生成三页滑动界面 + 全局美化面板
(function() {
    'use strict';

    // ----- 样式（所有 CSS 都包含在此） -----
    const styles = `
        /* ===== 全局重置 & 基础 ===== */
        #beauty-pages-app * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        #beauty-pages-app {
            --bg: #f5efe9;
            --card-bg: rgba(255, 248, 242, 0.85);
            --text: #3d2c2a;
            --text-light: #7a6a66;
            --accent: #d4a5a5;
            --shadow: 0 12px 40px rgba(60, 40, 35, 0.10);
            --radius: 28px;
            --font: 'PingFang SC', 'Helvetica Neue', system-ui, -apple-system, sans-serif;
            --transition: 0.45s cubic-bezier(0.22, 0.68, 0, 1);
            width: 100%;
            height: 100vh;
            overflow: hidden;
            font-family: var(--font);
            background: var(--bg);
            color: var(--text);
            user-select: none;
            -webkit-tap-highlight-color: transparent;
            position: fixed;
            top: 0;
            left: 0;
            z-index: 99999;
            pointer-events: auto;
        }
        #beauty-pages-app .slider {
            display: flex;
            height: 100vh;
            width: 100vw;
            overflow-x: auto;
            overflow-y: hidden;
            scroll-snap-type: x mandatory;
            scroll-behavior: smooth;
            -webkit-overflow-scrolling: touch;
            scrollbar-width: none;
        }
        #beauty-pages-app .slider::-webkit-scrollbar {
            display: none;
        }
        #beauty-pages-app .page {
            flex: 0 0 100vw;
            height: 100vh;
            scroll-snap-align: start;
            overflow-y: auto;
            overflow-x: hidden;
            padding: 0 16px 20px;
            background: var(--bg);
            transition: background var(--transition);
            position: relative;
        }
        #beauty-pages-app .page::-webkit-scrollbar {
            width: 3px;
        }
        #beauty-pages-app .page::-webkit-scrollbar-thumb {
            background: #d4a5a5;
            border-radius: 10px;
        }
        #beauty-pages-app .card {
            background: var(--card-bg);
            backdrop-filter: blur(8px);
            border-radius: var(--radius);
            padding: 18px 20px;
            box-shadow: var(--shadow);
            border: 1px solid rgba(255, 255, 255, 0.4);
            margin-bottom: 14px;
            transition: background 0.3s, border-color 0.3s;
        }
        #beauty-pages-app .card-title {
            font-size: 12px;
            font-weight: 500;
            color: var(--text-light);
            letter-spacing: 0.5px;
            margin-bottom: 10px;
            opacity: 0.7;
        }
        #beauty-pages-app .chat-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 12px 0 6px;
        }
        #beauty-pages-app .chat-header .back {
            font-size: 22px;
            opacity: 0.5;
            cursor: default;
        }
        #beauty-pages-app .chat-header .title {
            font-weight: 600;
            font-size: 18px;
            letter-spacing: 0.5px;
        }
        #beauty-pages-app .chat-header .more {
            font-size: 20px;
            opacity: 0.5;
        }
        #beauty-pages-app .chat-msgs {
            display: flex;
            flex-direction: column;
            gap: 12px;
            padding: 6px 0 12px;
        }
        #beauty-pages-app .msg {
            display: flex;
            align-items: flex-start;
            gap: 10px;
            max-width: 82%;
        }
        #beauty-pages-app .msg.right {
            flex-direction: row-reverse;
            align-self: flex-end;
        }
        #beauty-pages-app .msg .avatar {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            background: #e8ddd6;
            flex-shrink: 0;
            overflow: hidden;
            border: 2px solid rgba(255, 255, 255, 0.6);
        }
        #beauty-pages-app .msg .avatar img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }
        #beauty-pages-app .msg .bubble {
            background: rgba(255, 248, 242, 0.7);
            backdrop-filter: blur(4px);
            padding: 10px 16px;
            border-radius: 20px 20px 20px 6px;
            font-size: 14px;
            line-height: 1.6;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
            border: 1px solid rgba(255, 255, 255, 0.4);
            word-break: break-word;
        }
        #beauty-pages-app .msg.right .bubble {
            border-radius: 20px 20px 6px 20px;
            background: rgba(212, 165, 165, 0.20);
        }
        #beauty-pages-app .msg .time {
            font-size: 10px;
            color: var(--text-light);
            opacity: 0.6;
            margin-top: 4px;
            padding: 0 4px;
        }
        #beauty-pages-app .chat-input {
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 6px 0 2px;
        }
        #beauty-pages-app .chat-input .input-field {
            flex: 1;
            padding: 12px 18px;
            border-radius: 30px;
            border: 1px solid #e8ddd6;
            background: rgba(255, 248, 242, 0.5);
            backdrop-filter: blur(4px);
            font-size: 14px;
            font-family: var(--font);
            color: var(--text);
            outline: none;
            transition: 0.25s;
        }
        #beauty-pages-app .chat-input .input-field:focus {
            border-color: #d4a5a5;
            box-shadow: 0 0 0 4px rgba(212, 165, 165, 0.10);
        }
        #beauty-pages-app .chat-input .send-btn {
            width: 44px;
            height: 44px;
            border-radius: 50%;
            border: none;
            background: #d4a5a5;
            color: #fff;
            font-size: 18px;
            cursor: pointer;
            transition: 0.25s;
            flex-shrink: 0;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        #beauty-pages-app .chat-input .send-btn:hover {
            transform: scale(1.04);
            background: #c49494;
        }
        #beauty-pages-app .page1-deco {
            text-align: center;
            font-size: 12px;
            color: var(--text-light);
            opacity: 0.4;
            padding: 8px 0 2px;
            letter-spacing: 1px;
        }
        #beauty-pages-app .p2-top {
            display: flex;
            align-items: center;
            justify-content: space-between;
            flex-wrap: wrap;
            gap: 10px;
        }
        #beauty-pages-app .p2-top .left {
            display: flex;
            align-items: center;
            gap: 12px;
        }
        #beauty-pages-app .p2-top .left .avatar-lg {
            width: 52px;
            height: 52px;
            border-radius: 50%;
            overflow: hidden;
            border: 3px solid rgba(255, 255, 255, 0.7);
            flex-shrink: 0;
            background: #e8ddd6;
        }
        #beauty-pages-app .p2-top .left .avatar-lg img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }
        #beauty-pages-app .p2-top .left .info .name {
            font-weight: 600;
            font-size: 16px;
        }
        #beauty-pages-app .p2-top .left .info .sig {
            font-size: 12px;
            color: var(--text-light);
            opacity: 0.7;
        }
        #beauty-pages-app .p2-top .right {
            display: flex;
            gap: 14px;
            flex-wrap: wrap;
        }
        #beauty-pages-app .p2-top .right .item {
            text-align: center;
        }
        #beauty-pages-app .p2-top .right .item .main {
            font-weight: 600;
            font-size: 14px;
        }
        #beauty-pages-app .p2-top .right .item .sub {
            font-size: 11px;
            color: var(--text-light);
            opacity: 0.6;
        }
        #beauty-pages-app .p2-top .right .divider {
            color: var(--text-light);
            opacity: 0.25;
            font-weight: 200;
            align-self: center;
        }
        #beauty-pages-app .p2-memorial {
            display: flex;
            align-items: center;
            gap: 16px;
            flex-wrap: wrap;
        }
        #beauty-pages-app .p2-memorial .left {
            display: flex;
            flex-direction: column;
            align-items: center;
            flex: 1 1 0;
            min-width: 100px;
        }
        #beauty-pages-app .p2-memorial .left .avatars {
            display: flex;
            align-items: center;
            position: relative;
            width: 80px;
            height: 60px;
        }
        #beauty-pages-app .p2-memorial .left .avatars .av {
            width: 52px;
            height: 52px;
            border-radius: 50%;
            overflow: hidden;
            border: 3px solid rgba(255, 255, 255, 0.8);
            position: absolute;
            background: #e8ddd6;
            flex-shrink: 0;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
        }
        #beauty-pages-app .p2-memorial .left .avatars .av:first-child {
            left: 0;
            z-index: 2;
        }
        #beauty-pages-app .p2-memorial .left .avatars .av:last-child {
            left: 28px;
            z-index: 1;
        }
        #beauty-pages-app .p2-memorial .left .avatars .av img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }
        #beauty-pages-app .p2-memorial .left .badge {
            background: rgba(212, 165, 165, 0.25);
            backdrop-filter: blur(4px);
            padding: 2px 14px;
            border-radius: 30px;
            font-size: 12px;
            font-weight: 500;
            color: #8a6a6a;
            border: 1px solid rgba(255, 255, 255, 0.4);
            margin-bottom: 4px;
            white-space: nowrap;
        }
        #beauty-pages-app .p2-memorial .left .days {
            font-size: 24px;
            font-weight: 700;
            color: var(--text);
            letter-spacing: 1px;
            line-height: 1.2;
        }
        #beauty-pages-app .p2-memorial .left .days small {
            font-size: 13px;
            font-weight: 400;
            color: var(--text-light);
            opacity: 0.6;
            margin-left: 4px;
        }
        #beauty-pages-app .p2-memorial .right {
            display: flex;
            gap: 6px;
            flex: 1 1 0;
            min-width: 80px;
            justify-content: flex-end;
        }
        #beauty-pages-app .p2-memorial .right .polaroid {
            width: 64px;
            height: 72px;
            background: #fff;
            border-radius: 6px 6px 12px 12px;
            box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
            padding: 5px 5px 10px 5px;
            transform: rotate(-2deg);
            transition: 0.3s;
            overflow: hidden;
            border: 1px solid rgba(255, 255, 255, 0.5);
        }
        #beauty-pages-app .p2-memorial .right .polaroid:last-child {
            transform: rotate(4deg);
            margin-left: -12px;
        }
        #beauty-pages-app .p2-memorial .right .polaroid img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            border-radius: 2px;
        }
        #beauty-pages-app .p2-music {
            display: flex;
            align-items: center;
            gap: 14px;
        }
        #beauty-pages-app .p2-music .cover {
            width: 48px;
            height: 48px;
            border-radius: 50%;
            overflow: hidden;
            flex-shrink: 0;
            border: 2px solid rgba(255, 255, 255, 0.6);
            background: #e8ddd6;
        }
        #beauty-pages-app .p2-music .cover img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }
        #beauty-pages-app .p2-music .info {
            flex: 1;
            min-width: 0;
        }
        #beauty-pages-app .p2-music .info .title {
            font-weight: 600;
            font-size: 14px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }
        #beauty-pages-app .p2-music .info .sub {
            font-size: 11px;
            color: var(--text-light);
            opacity: 0.6;
        }
        #beauty-pages-app .p2-music .play-btn {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            border: none;
            background: rgba(212, 165, 165, 0.20);
            backdrop-filter: blur(4px);
            font-size: 18px;
            color: var(--text);
            cursor: pointer;
            transition: 0.25s;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
            border: 1px solid rgba(255, 255, 255, 0.3);
        }
        #beauty-pages-app .p2-music .play-btn:hover {
            background: rgba(212, 165, 165, 0.35);
            transform: scale(1.04);
        }
        #beauty-pages-app .p2-profile {
            display: flex;
            align-items: center;
            gap: 14px;
        }
        #beauty-pages-app .p2-profile .av {
            width: 44px;
            height: 44px;
            border-radius: 50%;
            overflow: hidden;
            flex-shrink: 0;
            border: 2px solid rgba(255, 255, 255, 0.6);
            background: #e8ddd6;
        }
        #beauty-pages-app .p2-profile .av img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }
        #beauty-pages-app .p2-profile .info .name {
            font-weight: 600;
            font-size: 15px;
        }
        #beauty-pages-app .p2-profile .info .sub {
            font-size: 12px;
            color: var(--text-light);
            opacity: 0.6;
        }
        #beauty-pages-app .p2-profile .dots {
            font-size: 20px;
            letter-spacing: 2px;
            opacity: 0.5;
            margin-left: auto;
            align-self: center;
        }
        #beauty-pages-app .p2-bigimg {
            width: 100%;
            aspect-ratio: 16/9;
            border-radius: 16px;
            overflow: hidden;
            background: #e8ddd6;
            border: 1px solid rgba(255, 255, 255, 0.3);
            position: relative;
        }
        #beauty-pages-app .p2-bigimg img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }
        #beauty-pages-app .p2-bigimg .empty-hint {
            position: absolute;
            inset: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            color: var(--text-light);
            opacity: 0.4;
            font-size: 13px;
            letter-spacing: 0.5px;
        }
        #beauty-pages-app .p2-polaroids {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 8px;
        }
        #beauty-pages-app .p2-polaroids .pol {
            aspect-ratio: 3/4;
            background: #fff;
            border-radius: 4px 4px 10px 10px;
            padding: 4px 4px 10px 4px;
            box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
            overflow: hidden;
            border: 1px solid rgba(255, 255, 255, 0.4);
            transition: 0.3s;
        }
        #beauty-pages-app .p2-polaroids .pol img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            border-radius: 2px;
        }
        #beauty-pages-app .p3-banner {
            position: relative;
            width: 100%;
            aspect-ratio: 16/6;
            border-radius: var(--radius);
            overflow: hidden;
            background: linear-gradient(145deg, #e8ddd6, #dccbc2);
            margin-bottom: 8px;
            border: 1px solid rgba(255, 255, 255, 0.3);
        }
        #beauty-pages-app .p3-banner img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }
        #beauty-pages-app .p3-banner .avatar-overlay {
            position: absolute;
            bottom: -20px;
            left: 50%;
            transform: translateX(-50%);
            width: 70px;
            height: 70px;
            border-radius: 50%;
            overflow: hidden;
            border: 4px solid rgba(255, 255, 255, 0.9);
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
            background: #e8ddd6;
        }
        #beauty-pages-app .p3-banner .avatar-overlay img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }
        #beauty-pages-app .p3-title-area {
            text-align: center;
            padding: 18px 0 6px;
        }
        #beauty-pages-app .p3-title-area .main-title {
            font-size: 22px;
            font-weight: 700;
            letter-spacing: 1px;
        }
        #beauty-pages-app .p3-title-area .kaomoji {
            font-size: 14px;
            opacity: 0.5;
            margin: 2px 0;
            letter-spacing: 2px;
        }
        #beauty-pages-app .p3-title-area .sub-title {
            font-size: 13px;
            color: var(--text-light);
            opacity: 0.6;
        }
        #beauty-pages-app .p3-stats {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 10px;
            text-align: center;
        }
        #beauty-pages-app .p3-stats .stat {
            background: rgba(255, 248, 242, 0.4);
            backdrop-filter: blur(4px);
            border-radius: 20px;
            padding: 14px 6px;
            border: 1px solid rgba(255, 255, 255, 0.3);
        }
        #beauty-pages-app .p3-stats .stat .num {
            font-size: 20px;
            font-weight: 700;
        }
        #beauty-pages-app .p3-stats .stat .label {
            font-size: 11px;
            color: var(--text-light);
            opacity: 0.6;
            margin-top: 2px;
        }
        #beauty-pages-app .p3-search {
            display: flex;
            align-items: center;
            gap: 10px;
            background: rgba(255, 248, 242, 0.5);
            backdrop-filter: blur(4px);
            border-radius: 40px;
            padding: 10px 18px;
            border: 1px solid rgba(255, 255, 255, 0.3);
            transition: 0.25s;
        }
        #beauty-pages-app .p3-search:focus-within {
            border-color: #d4a5a5;
            box-shadow: 0 0 0 4px rgba(212, 165, 165, 0.08);
        }
        #beauty-pages-app .p3-search .icon {
            font-size: 18px;
            opacity: 0.4;
        }
        #beauty-pages-app .p3-search input {
            flex: 1;
            border: none;
            background: transparent;
            font-size: 14px;
            font-family: var(--font);
            color: var(--text);
            outline: none;
            min-width: 0;
        }
        #beauty-pages-app .p3-search input::placeholder {
            color: var(--text-light);
            opacity: 0.4;
        }
        #beauty-pages-app .p3-chat-area {
            position: relative;
            padding: 6px 0;
        }
        #beauty-pages-app .p3-chat-area .chat-flow {
            display: flex;
            flex-direction: column;
            gap: 10px;
        }
        #beauty-pages-app .p3-chat-area .chat-flow .cmsg {
            display: flex;
            align-items: flex-start;
            gap: 8px;
            max-width: 78%;
        }
        #beauty-pages-app .p3-chat-area .chat-flow .cmsg.right {
            flex-direction: row-reverse;
            align-self: flex-end;
        }
        #beauty-pages-app .p3-chat-area .chat-flow .cmsg .cav {
            width: 32px;
            height: 32px;
            border-radius: 50%;
            overflow: hidden;
            flex-shrink: 0;
            border: 2px solid rgba(255, 255, 255, 0.5);
            background: #e8ddd6;
        }
        #beauty-pages-app .p3-chat-area .chat-flow .cmsg .cav img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }
        #beauty-pages-app .p3-chat-area .chat-flow .cmsg .cbubble {
            background: rgba(255, 248, 242, 0.6);
            backdrop-filter: blur(4px);
            padding: 8px 14px;
            border-radius: 18px 18px 18px 4px;
            font-size: 13px;
            line-height: 1.5;
            border: 1px solid rgba(255, 255, 255, 0.3);
        }
        #beauty-pages-app .p3-chat-area .chat-flow .cmsg.right .cbubble {
            border-radius: 18px 18px 4px 18px;
            background: rgba(212, 165, 165, 0.18);
        }
        #beauty-pages-app .p3-chat-area .float-illus {
            position: absolute;
            right: 0;
            top: 20%;
            width: 38%;
            aspect-ratio: 3/4;
            border-radius: 24px;
            overflow: hidden;
            box-shadow: 0 12px 40px rgba(0, 0, 0, 0.08);
            border: 3px solid rgba(255, 255, 255, 0.6);
            background: #e8ddd6;
            transform: translateX(6px);
        }
        #beauty-pages-app .p3-chat-area .float-illus img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }
        #beauty-pages-app .p3-post {
            padding: 14px 16px;
            background: rgba(255, 248, 242, 0.4);
            backdrop-filter: blur(4px);
            border-radius: 24px;
            border: 1px solid rgba(255, 255, 255, 0.3);
        }
        #beauty-pages-app .p3-post .quote {
            font-size: 14px;
            line-height: 1.6;
            padding: 4px 0 8px;
            font-style: italic;
            color: var(--text);
        }
        #beauty-pages-app .p3-post .quote::before {
            content: '"';
            font-size: 20px;
            opacity: 0.3;
            margin-right: 2px;
        }
        #beauty-pages-app .p3-post .quote::after {
            content: '"';
            font-size: 20px;
            opacity: 0.3;
            margin-left: 2px;
        }
        #beauty-pages-app .p3-post .actions {
            display: flex;
            gap: 18px;
            font-size: 13px;
            color: var(--text-light);
            opacity: 0.6;
            padding-top: 4px;
            border-top: 1px solid rgba(0, 0, 0, 0.04);
        }
        #beauty-pages-app .p3-post .actions span {
            display: flex;
            align-items: center;
            gap: 4px;
        }
        #beauty-pages-app .p3-footer {
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 4px 0 2px;
        }
        #beauty-pages-app .p3-footer .fav {
            width: 36px;
            height: 36px;
            border-radius: 50%;
            overflow: hidden;
            flex-shrink: 0;
            border: 2px solid rgba(255, 255, 255, 0.4);
            background: #e8ddd6;
        }
        #beauty-pages-app .p3-footer .fav img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }
        #beauty-pages-app .p3-footer .finp {
            flex: 1;
            padding: 10px 16px;
            border-radius: 30px;
            border: 1px solid #e8ddd6;
            background: rgba(255, 248, 242, 0.4);
            backdrop-filter: blur(4px);
            font-size: 13px;
            font-family: var(--font);
            color: var(--text);
            outline: none;
            transition: 0.25s;
        }
        #beauty-pages-app .p3-footer .finp:focus {
            border-color: #d4a5a5;
            box-shadow: 0 0 0 4px rgba(212, 165, 165, 0.08);
        }
        #beauty-pages-app .kaomoji-deco {
            font-size: 12px;
            opacity: 0.15;
            letter-spacing: 3px;
            text-align: center;
            padding: 4px 0;
            pointer-events: none;
            user-select: none;
            line-height: 1.6;
        }
        /* 设置面板 */
        #beauty-pages-app #settings-toggle {
            position: fixed;
            bottom: 28px;
            right: 28px;
            z-index: 9999;
            width: 54px;
            height: 54px;
            border-radius: 50%;
            border: none;
            background: rgba(255, 255, 255, 0.7);
            backdrop-filter: blur(12px);
            box-shadow: 0 6px 24px rgba(0, 0, 0, 0.08);
            font-size: 24px;
            cursor: pointer;
            transition: 0.3s;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #3d2c2a;
        }
        #beauty-pages-app #settings-toggle:hover {
            transform: scale(1.06);
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.14);
        }
        #beauty-pages-app #settings-panel {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 9998;
            background: rgba(0, 0, 0, 0.35);
            backdrop-filter: blur(6px);
            display: none;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }
        #beauty-pages-app #settings-panel.open {
            display: flex;
        }
        #beauty-pages-app .settings-box {
            background: rgba(255, 252, 248, 0.96);
            backdrop-filter: blur(20px);
            border-radius: 40px;
            padding: 32px 28px 28px;
            max-width: 420px;
            width: 100%;
            max-height: 80vh;
            overflow-y: auto;
            box-shadow: 0 30px 80px rgba(0, 0, 0, 0.20);
            border: 1px solid rgba(255, 255, 255, 0.3);
        }
        #beauty-pages-app .settings-box h2 {
            font-size: 18px;
            font-weight: 600;
            margin-bottom: 20px;
            letter-spacing: 0.3px;
            color: #3d2c2a;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        #beauty-pages-app .settings-box h2 span {
            font-size: 22px;
        }
        #beauty-pages-app .setting-group {
            margin-bottom: 18px;
        }
        #beauty-pages-app .setting-group label {
            display: block;
            font-size: 13px;
            font-weight: 500;
            color: #7a6a66;
            margin-bottom: 5px;
            letter-spacing: 0.3px;
        }
        #beauty-pages-app .setting-group input[type="color"],
        #beauty-pages-app .setting-group input[type="text"],
        #beauty-pages-app .setting-group input[type="file"] {
            width: 100%;
            padding: 10px 14px;
            border-radius: 16px;
            border: 1px solid #e8ddd6;
            background: rgba(255, 248, 242, 0.6);
            font-size: 14px;
            font-family: var(--font);
            color: #3d2c2a;
            transition: 0.25s;
            outline: none;
        }
        #beauty-pages-app .setting-group input[type="color"] {
            height: 44px;
            padding: 4px;
            cursor: pointer;
        }
        #beauty-pages-app .setting-group input:focus {
            border-color: #d4a5a5;
            box-shadow: 0 0 0 4px rgba(212, 165, 165, 0.15);
        }
        #beauty-pages-app .setting-group .file-wrap {
            display: flex;
            gap: 10px;
            align-items: center;
        }
        #beauty-pages-app .setting-group .file-wrap input[type="file"] {
            flex: 1;
            padding: 8px 10px;
        }
        #beauty-pages-app .setting-group .file-wrap button {
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
        #beauty-pages-app .setting-group .file-wrap button:hover {
            background: #c49494;
        }
        #beauty-pages-app .settings-close {
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
        #beauty-pages-app .settings-close:hover {
            background: #2d1f1d;
        }
        #beauty-pages-app .settings-box::-webkit-scrollbar {
            width: 4px;
        }
        #beauty-pages-app .settings-box::-webkit-scrollbar-thumb {
            background: #d4a5a5;
            border-radius: 10px;
        }
        @media (max-width: 480px) {
            #beauty-pages-app .page {
                padding: 0 10px 16px;
            }
            #beauty-pages-app .card {
                padding: 14px 16px;
                border-radius: 22px;
            }
            #beauty-pages-app .p2-memorial .right .polaroid {
                width: 52px;
                height: 60px;
            }
            #beauty-pages-app .p2-top .left .avatar-lg {
                width: 42px;
                height: 42px;
            }
            #beauty-pages-app .p2-memorial .left .avatars .av {
                width: 42px;
                height: 42px;
            }
            #beauty-pages-app .p2-memorial .left .avatars .av:last-child {
                left: 22px;
            }
            #beauty-pages-app .p2-memorial .left .days {
                font-size: 20px;
            }
            #beauty-pages-app .p3-banner .avatar-overlay {
                width: 56px;
                height: 56px;
                bottom: -16px;
            }
            #beauty-pages-app .p3-title-area .main-title {
                font-size: 18px;
            }
            #beauty-pages-app .p3-stats .stat .num {
                font-size: 17px;
            }
            #beauty-pages-app .p3-chat-area .float-illus {
                width: 30%;
                top: 30%;
            }
            #beauty-pages-app .settings-box {
                padding: 24px 18px 20px;
            }
        }
        @media (max-width: 380px) {
            #beauty-pages-app .p2-polaroids {
                gap: 5px;
            }
            #beauty-pages-app .p2-top .right .item .main {
                font-size: 12px;
            }
            #beauty-pages-app .p2-top .right .item .sub {
                font-size: 10px;
            }
        }
    `;

    // ----- HTML 结构（所有页面内容） -----
    const html = `
        <!-- 设置面板 -->
        <button id="settings-toggle" aria-label="全局设置">⚙</button>
        <div id="settings-panel">
            <div class="settings-box">
                <h2><span>🎨</span> 全局美化</h2>
                <div class="setting-group">
                    <label>🌄 背景图片 (URL)</label>
                    <input type="text" id="bg-url" placeholder="输入图片链接" value="">
                </div>
                <div class="setting-group">
                    <label>🎨 背景颜色</label>
                    <input type="color" id="bg-color" value="#f5efe9">
                </div>
                <div class="setting-group">
                    <label>📝 文字颜色</label>
                    <input type="color" id="text-color" value="#3d2c2a">
                </div>
                <div class="setting-group">
                    <label>📦 卡片透明度</label>
                    <input type="text" id="card-opacity" placeholder="0.6 ~ 1.0" value="0.85">
                </div>
                <div class="setting-group">
                    <label>🖼️ 上传自定义图片 (用于任意位置)</label>
                    <div class="file-wrap">
                        <input type="file" id="custom-file" accept="image/*">
                        <button id="apply-file-btn">应用</button>
                    </div>
                </div>
                <div style="font-size:12px;color:var(--text-light);opacity:0.5;margin:-6px 0 14px 0;padding-left:4px;">
                    💡 点击页面中的文字可直接编辑 (contenteditable)
                </div>
                <button class="settings-close" id="settings-close">✨ 完成</button>
            </div>
        </div>

        <!-- 滑动容器 -->
        <div class="slider" id="slider">

            <!-- 页面1: 聊天 -->
            <div class="page" id="page1" style="background:var(--bg);">
                <div class="chat-header">
                    <span class="back">‹</span>
                    <span class="title">💬 地球online</span>
                    <span class="more">⋯</span>
                </div>
                <div class="card" style="padding-bottom:10px;">
                    <div class="chat-msgs" id="chat-msgs">
                        <div class="msg">
                            <div class="avatar"><img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Ccircle cx='50' cy='50' r='50' fill='%23d4a5a5'/%3E%3C/svg%3E" alt="avatar"></div>
                            <div><div class="bubble" contenteditable="true">遇见你的每一天都是 晴天 ☀️</div><div class="time">15:25</div></div>
                        </div>
                        <div class="msg right">
                            <div class="avatar"><img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Ccircle cx='50' cy='50' r='50' fill='%23b8a09c'/%3E%3C/svg%3E" alt="avatar"></div>
                            <div><div class="bubble" contenteditable="true">未定义 · the name</div><div class="time">15:26</div></div>
                        </div>
                        <div class="msg">
                            <div class="avatar"><img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Ccircle cx='50' cy='50' r='50' fill='%23d4a5a5'/%3E%3C/svg%3E" alt="avatar"></div>
                            <div><div class="bubble" contenteditable="true">是被疼爱 💕</div><div class="time">15:27</div></div>
                        </div>
                        <div class="msg right">
                            <div class="avatar"><img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Ccircle cx='50' cy='50' r='50' fill='%23b8a09c'/%3E%3C/svg%3E" alt="avatar"></div>
                            <div><div class="bubble" contenteditable="true">我觉得还星 🌟</div><div class="time">15:28</div></div>
                        </div>
                        <div class="msg">
                            <div class="avatar"><img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Ccircle cx='50' cy='50' r='50' fill='%23d4a5a5'/%3E%3C/svg%3E" alt="avatar"></div>
                            <div><div class="bubble" contenteditable="true">宇宙在你沉睡时消失不见 ✨</div><div class="time">15:29</div></div>
                        </div>
                        <div class="msg right">
                            <div class="avatar"><img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Ccircle cx='50' cy='50' r='50' fill='%23b8a09c'/%3E%3C/svg%3E" alt="avatar"></div>
                            <div><div class="bubble" contenteditable="true">你有什喵事 🐱</div><div class="time">15:30</div></div>
                        </div>
                        <div class="msg">
                            <div class="avatar"><img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Ccircle cx='50' cy='50' r='50' fill='%23d4a5a5'/%3E%3C/svg%3E" alt="avatar"></div>
                            <div><div class="bubble" contenteditable="true">喜欢 💗</div><div class="time">15:31</div></div>
                        </div>
                        <div class="msg right">
                            <div class="avatar"><img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Ccircle cx='50' cy='50' r='50' fill='%23b8a09c'/%3E%3C/svg%3E" alt="avatar"></div>
                            <div><div class="bubble" contenteditable="true">爱是秩序外的一瞬间 🌙</div><div class="time">15:32</div></div>
                        </div>
                        <div class="msg">
                            <div class="avatar"><img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Ccircle cx='50' cy='50' r='50' fill='%23d4a5a5'/%3E%3C/svg%3E" alt="avatar"></div>
                            <div><div class="bubble" contenteditable="true">一起去乌鲁鲁星吧.. 🚀</div><div class="time">15:33</div></div>
                        </div>
                        <div class="msg right">
                            <div class="avatar"><img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Ccircle cx='50' cy='50' r='50' fill='%23b8a09c'/%3E%3C/svg%3E" alt="avatar"></div>
                            <div><div class="bubble" contenteditable="true">在一起 🤍</div><div class="time">15:34</div></div>
                        </div>
                    </div>
                    <div class="chat-input">
                        <input class="input-field" placeholder="输入消息..." id="chat-input-field">
                        <button class="send-btn" id="chat-send">➤</button>
                    </div>
                    <div class="page1-deco">小回 &amp; 阿晏 · ∞</div>
                </div>
                <div class="kaomoji-deco">( ˘ ³˘)♥  (◕‿◕)  ✧  (｡♡‿♡｡)</div>
            </div>

            <!-- 页面2: 阿晏&小回 -->
            <div class="page" id="page2" style="background:var(--bg);">
                <div class="card">
                    <div class="p2-top">
                        <div class="left">
                            <div class="avatar-lg"><img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Ccircle cx='50' cy='50' r='50' fill='%23d4a5a5'/%3E%3C/svg%3E" alt="avatar" id="p2-avatar1"></div>
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
                <div class="card">
                    <div class="p2-memorial">
                        <div class="left">
                            <div class="badge" contenteditable="true">🌸 初遇</div>
                            <div class="avatars">
                                <div class="av"><img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Ccircle cx='50' cy='50' r='50' fill='%23d4a5a5'/%3E%3C/svg%3E" alt="av1"></div>
                                <div class="av"><img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Ccircle cx='50' cy='50' r='50' fill='%23b8a09c'/%3E%3C/svg%3E" alt="av2"></div>
                            </div>
                            <div class="days" id="days-count">0 <small>天</small></div>
                            <input type="date" id="memorial-date" style="font-size:11px;padding:4px 8px;border-radius:12px;border:1px solid #e8ddd6;background:transparent;margin-top:4px;width:140px;text-align:center;color:var(--text);font-family:var(--font);">
                        </div>
                        <div class="right">
                            <div class="polaroid"><img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect width='100' height='100' fill='%23e8ddd6'/%3E%3C/svg%3E" alt="polaroid1" id="p2-pol1"></div>
                            <div class="polaroid"><img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect width='100' height='100' fill='%23dccbc2'/%3E%3C/svg%3E" alt="polaroid2" id="p2-pol2"></div>
                        </div>
                    </div>
                </div>
                <div class="card">
                    <div class="p2-music">
                        <div class="cover"><img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Ccircle cx='50' cy='50' r='50' fill='%23d4a5a5'/%3E%3C/svg%3E" alt="music cover" id="p2-music-cover"></div>
                        <div class="info">
                            <div class="title" contenteditable="true">🎵 喜欢</div>
                            <div class="sub" contenteditable="true">阿晏 · 小回</div>
                        </div>
                        <button class="play-btn" id="p2-play-btn">▶</button>
                    </div>
                </div>
                <div class="card">
                    <div class="p2-profile">
                        <div class="av"><img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Ccircle cx='50' cy='50' r='50' fill='%23d4a5a5'/%3E%3C/svg%3E" alt="profile av" id="p2-profile-av"></div>
                        <div class="info">
                            <div class="name" contenteditable="true">小回</div>
                            <div class="sub" contenteditable="true">✨ 被疼爱</div>
                        </div>
                        <div class="dots" contenteditable="true">⋯</div>
                    </div>
                </div>
                <div class="card" style="padding:12px;">
                    <div class="p2-bigimg" id="p2-bigimg">
                        <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='225'%3E%3Crect width='400' height='225' fill='%23e8ddd6'/%3E%3Ctext x='200' y='118' text-anchor='middle' fill='%239a8a86' font-size='14' font-family='sans-serif'%3E✨ 自定义大图 ✨%3C/text%3E%3C/svg%3E" alt="big image" id="p2-bigimg-img">
                        <div class="empty-hint" style="display:none;">点击上方⚙上传</div>
                    </div>
                </div>
                <div class="card" style="padding:12px;">
                    <div class="p2-polaroids">
                        <div class="pol"><img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='133'%3E%3Crect width='100' height='133' fill='%23f0e8e2'/%3E%3C/svg%3E" alt="pol1" id="p2-pol-grid-1"></div>
                        <div class="pol"><img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='133'%3E%3Crect width='100' height='133' fill='%23e8ddd6'/%3E%3C/svg%3E" alt="pol2" id="p2-pol-grid-2"></div>
                        <div class="pol"><img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='133'%3E%3Crect width='100' height='133' fill='%23dccbc2'/%3E%3C/svg%3E" alt="pol3" id="p2-pol-grid-3"></div>
                        <div class="pol"><img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='133'%3E%3Crect width='100' height='133' fill='%23f5efe9'/%3E%3C/svg%3E" alt="pol4" id="p2-pol-grid-4"></div>
                    </div>
                </div>
                <div class="kaomoji-deco">♡ (˘▽˘)っ♡  (￣▽￣)ノ  ✧*。</div>
            </div>

            <!-- 页面3: 阿晏&66 -->
            <div class="page" id="page3" style="background:var(--bg);">
                <div class="p3-banner" id="p3-banner">
                    <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='200'%3E%3Crect width='600' height='200' fill='%23dccbc2'/%3E%3Ctext x='300' y='110' text-anchor='middle' fill='%239a8a86' font-size='18' font-family='sans-serif'%3E🌸 阿晏 &amp; 66 🌸%3C/text%3E%3C/svg%3E" alt="banner" id="p3-banner-img">
                    <div class="avatar-overlay"><img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Ccircle cx='50' cy='50' r='50' fill='%23d4a5a5'/%3E%3C/svg%3E" alt="banner av" id="p3-banner-av"></div>
                </div>
                <div class="p3-title-area">
                    <div class="main-title" contenteditable="true">阿晏 &amp; 66</div>
                    <div class="kaomoji" contenteditable="true">(◕‿◕)♡ (｡♥‿♥｡)</div>
                    <div class="sub-title" contenteditable="true">✨ 红线的两端是你我 · 一杯美式 一杯拿铁</div>
                </div>
                <div class="card" style="padding:14px 12px;">
                    <div class="p3-stats">
                        <div class="stat"><div class="num" contenteditable="true">365</div><div class="label" contenteditable="true">Days</div></div>
                        <div class="stat"><div class="num" contenteditable="true">∞</div><div class="label" contenteditable="true">Love</div></div>
                        <div class="stat"><div class="num" contenteditable="true">66</div><div class="label" contenteditable="true">Moments</div></div>
                    </div>
                </div>
                <div class="p3-search">
                    <span class="icon">🔍</span>
                    <input type="text" placeholder="搜索回忆..." id="p3-search-input" value="未定义">
                </div>
                <div class="card" style="padding:14px 14px 18px;position:relative;overflow:visible;">
                    <div class="p3-chat-area">
                        <div class="chat-flow">
                            <div class="cmsg">
                                <div class="cav"><img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Ccircle cx='50' cy='50' r='50' fill='%23d4a5a5'/%3E%3C/svg%3E" alt="cav1" id="p3-cav1"></div>
                                <div class="cbubble" contenteditable="true">你今天好嘛 🌷</div>
                            </div>
                            <div class="cmsg right">
                                <div class="cav"><img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Ccircle cx='50' cy='50' r='50' fill='%23b8a09c'/%3E%3C/svg%3E" alt="cav2" id="p3-cav2"></div>
                                <div class="cbubble" contenteditable="true">想你啦 💕</div>
                            </div>
                            <div class="cmsg">
                                <div class="cav"><img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Ccircle cx='50' cy='50' r='50' fill='%23d4a5a5'/%3E%3C/svg%3E" alt="cav1"></div>
                                <div class="cbubble" contenteditable="true">一起去看星星吗 ✨</div>
                            </div>
                        </div>
                        <div class="float-illus" id="p3-float-illus">
                            <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='267'%3E%3Crect width='200' height='267' fill='%23dccbc2'/%3E%3Ctext x='100' y='130' text-anchor='middle' fill='%239a8a86' font-size='14' font-family='sans-serif'%3E🌙 双人插画%3C/text%3E%3C/svg%3E" alt="illus" id="p3-illus-img">
                        </div>
                    </div>
                </div>
                <div class="p3-post">
                    <div class="quote" contenteditable="true">宇宙在你沉睡时消失不见，但爱是秩序外的一瞬间</div>
                    <div class="actions">
                        <span contenteditable="true">❤️ 66</span>
                        <span contenteditable="true">💬 33</span>
                    </div>
                </div>
                <div class="p3-footer">
                    <div class="fav"><img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Ccircle cx='50' cy='50' r='50' fill='%23d4a5a5'/%3E%3C/svg%3E" alt="footer av" id="p3-footer-av"></div>
                    <input class="finp" placeholder="输入你的心意..." id="p3-footer-input" value="未定义">
                </div>
                <div class="kaomoji-deco">(｡♡‿♡｡)  ✧  (◕‿◕)  ♡  (˘▽˘)っ</div>
            </div>

        </div>
    `;

    // ----- 初始化函数（包含所有 JS 逻辑） -----
    function initBeautyPages() {
        // 创建容器
        const app = document.createElement('div');
        app.id = 'beauty-pages-app';
        app.innerHTML = html;
        document.body.appendChild(app);

        // 注入样式
        const styleEl = document.createElement('style');
        styleEl.textContent = styles;
        document.head.appendChild(styleEl);

        // ---- 以下为原 <script> 逻辑，已适配新容器 ----
        const container = app;

        // DOM 引用（在 app 内查找）
        const slider = container.querySelector('#slider');
        const pages = container.querySelectorAll('.page');
        const settingsToggle = container.querySelector('#settings-toggle');
        const settingsPanel = container.querySelector('#settings-panel');
        const settingsClose = container.querySelector('#settings-close');
        const bgColorInput = container.querySelector('#bg-color');
        const bgUrlInput = container.querySelector('#bg-url');
        const textColorInput = container.querySelector('#text-color');
        const cardOpacityInput = container.querySelector('#card-opacity');
        const customFileInput = container.querySelector('#custom-file');
        const applyFileBtn = container.querySelector('#apply-file-btn');

        const memorialDateInput = container.querySelector('#memorial-date');
        const daysCount = container.querySelector('#days-count');

        const playBtn = container.querySelector('#p2-play-btn');
        let isPlaying = false;

        const chatInput = container.querySelector('#chat-input-field');
        const chatSend = container.querySelector('#chat-send');
        const chatMsgs = container.querySelector('#chat-msgs');

        // 纪念日
        function initMemorial() {
            const saved = localStorage.getItem('memorial-date');
            if (saved) {
                memorialDateInput.value = saved;
            } else {
                const d = new Date();
                d.setFullYear(d.getFullYear() - 1);
                const val = d.toISOString().slice(0, 10);
                memorialDateInput.value = val;
                localStorage.setItem('memorial-date', val);
            }
            updateDays();
        }

        function updateDays() {
            const val = memorialDateInput.value;
            if (!val) { daysCount.innerHTML = '0 <small>天</small>'; return; }
            const start = new Date(val);
            const now = new Date();
            const diff = Math.floor((now - start) / (1000 * 60 * 60 * 24));
            const display = diff > 0 ? diff : 0;
            daysCount.innerHTML = display + ' <small>天</small>';
            localStorage.setItem('memorial-date', val);
        }
        if (memorialDateInput) {
            memorialDateInput.addEventListener('change', updateDays);
        }

        // 音乐播放
        let audioCtx = null;
        let oscillator = null;
        let gainNode = null;

        if (playBtn) {
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

        // 聊天发送
        function sendMessage() {
            if (!chatInput || !chatMsgs) return;
            const text = chatInput.value.trim();
            if (!text) return;
            const msgDiv = document.createElement('div');
            msgDiv.className = 'msg right';
            const avatarHtml =
                `<div class="avatar"><img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Ccircle cx='50' cy='50' r='50' fill='%23b8a09c'/%3E%3C/svg%3E" alt="avatar"></div>`;
            const bubbleHtml =
                `<div><div class="bubble" contenteditable="true">${text}</div><div class="time">${new Date().toLocaleTimeString('zh-CN', {hour:'2-digit',minute:'2-digit'})}</div></div>`;
            msgDiv.innerHTML = avatarHtml + bubbleHtml;
            chatMsgs.appendChild(msgDiv);
            chatInput.value = '';
            chatMsgs.scrollTop = chatMsgs.scrollHeight;
            setTimeout(() => {
                const replies = ['🌸 收到～', '💕 真好', '✨ 想你啦', '🌙 晚安', '☀️ 早安', '🎵 一起听歌吧'];
                const reply = replies[Math.floor(Math.random() * replies.length)];
                const rDiv = document.createElement('div');
                rDiv.className = 'msg';
                rDiv.innerHTML =
                    `<div class="avatar"><img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Ccircle cx='50' cy='50' r='50' fill='%23d4a5a5'/%3E%3C/svg%3E" alt="avatar"></div><div><div class="bubble" contenteditable="true">${reply}</div><div class="time">${new Date().toLocaleTimeString('zh-CN', {hour:'2-digit',minute:'2-digit'})}</div></div>`;
                chatMsgs.appendChild(rDiv);
                chatMsgs.scrollTop = chatMsgs.scrollHeight;
            }, 600 + Math.random() * 900);
        }
        if (chatSend) chatSend.addEventListener('click', sendMessage);
        if (chatInput) {
            chatInput.addEventListener('keydown', function(e) {
                if (e.key === 'Enter') { e.preventDefault(); sendMessage(); }
            });
        }

        // 全局设置
        function applySettings() {
            const bgColor = bgColorInput.value;
            const bgUrl = bgUrlInput.value.trim();
            const textColor = textColorInput.value;
            const opacity = parseFloat(cardOpacityInput.value) || 0.85;

            document.documentElement.style.setProperty('--bg', bgColor);
            document.documentElement.style.setProperty('--text', textColor);
            document.documentElement.style.setProperty('--card-bg', `rgba(255,248,242,${Math.min(opacity,1)})`);

            if (bgUrl) {
                container.querySelectorAll('.page').forEach(p => {
                    p.style.backgroundImage = `url(${bgUrl})`;
                    p.style.backgroundSize = 'cover';
                    p.style.backgroundPosition = 'center';
                    p.style.backgroundAttachment = 'fixed';
                });
            } else {
                container.querySelectorAll('.page').forEach(p => {
                    p.style.backgroundImage = 'none';
                    p.style.backgroundSize = 'auto';
                });
            }

            localStorage.setItem('settings-bg-color', bgColor);
            localStorage.setItem('settings-bg-url', bgUrl);
            localStorage.setItem('settings-text-color', textColor);
            localStorage.setItem('settings-card-opacity', String(opacity));
        }

        function loadSettings() {
            const bgColor = localStorage.getItem('settings-bg-color') || '#f5efe9';
            const bgUrl = localStorage.getItem('settings-bg-url') || '';
            const textColor = localStorage.getItem('settings-text-color') || '#3d2c2a';
            const opacity = localStorage.getItem('settings-card-opacity') || '0.85';

            bgColorInput.value = bgColor;
            bgUrlInput.value = bgUrl;
            textColorInput.value = textColor;
            cardOpacityInput.value = opacity;
            applySettings();
        }

        if (settingsToggle && settingsPanel) {
            settingsToggle.addEventListener('click', function() {
                settingsPanel.classList.toggle('open');
                bgColorInput.value = getComputedStyle(document.documentElement).getPropertyValue('--bg').trim() || '#f5efe9';
                bgUrlInput.value = localStorage.getItem('settings-bg-url') || '';
                textColorInput.value = getComputedStyle(document.documentElement).getPropertyValue('--text').trim() ||
                    '#3d2c2a';
                const curOp = getComputedStyle(document.documentElement).getPropertyValue('--card-bg').trim();
                const match = curOp.match(/[\d.]+/);
                if (match) cardOpacityInput.value = match[0];
            });
        }

        if (settingsClose) {
            settingsClose.addEventListener('click', function() {
                applySettings();
                settingsPanel.classList.remove('open');
            });
        }

        [bgColorInput, bgUrlInput, textColorInput, cardOpacityInput].forEach(el => {
            if (el) {
                el.addEventListener('input', applySettings);
                el.addEventListener('change', applySettings);
            }
        });

        // 自定义图片上传
        let uploadedImageData = null;
        if (customFileInput) {
            customFileInput.addEventListener('change', function(e) {
                const file = e.target.files[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = function(ev) {
                    uploadedImageData = ev.target.result;
                    alert('✅ 图片已加载！点击下方「应用」可替换当前页面的图片占位。');
                };
                reader.readAsDataURL(file);
            });
        }
        if (applyFileBtn) {
            applyFileBtn.addEventListener('click', function() {
                if (!uploadedImageData) {
                    alert('请先选择一张图片上传～');
                    return;
                }
                const imgs = container.querySelectorAll('img');
                let count = 0;
                imgs.forEach(img => {
                    const src = img.src || '';
                    if (src.includes('data:image/svg+xml') || src.includes('svg')) {
                        img.src = uploadedImageData;
                        count++;
                    }
                });
                const bigImg = container.querySelector('#p2-bigimg-img');
                if (bigImg && bigImg.src.includes('svg')) {
                    bigImg.src = uploadedImageData;
                    count++;
                }
                alert(`✨ 已替换 ${count} 个图片占位！你可以继续在设置中调整。`);
            });
        }

        // 可编辑内容失焦保存（仅示意）
        container.querySelectorAll('[contenteditable="true"]').forEach(el => {
            el.addEventListener('blur', function() { /* 可存 localStorage */ });
        });

        // 加载设置和纪念日
        loadSettings();
        initMemorial();

        // 页面切换停止音乐
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) {
                    if (isPlaying) {
                        if (oscillator) { oscillator.stop(); oscillator = null; }
                        if (gainNode) { gainNode.disconnect(); gainNode = null; }
                        if (playBtn) playBtn.textContent = '▶';
                        isPlaying = false;
                    }
                }
            });
        }, { threshold: 0.5 });
        container.querySelectorAll('.page').forEach(p => observer.observe(p));

        // 点击页面1空白聚焦输入
        const page1 = container.querySelector('#page1');
        if (page1 && chatInput) {
            page1.addEventListener('click', function(e) {
                if (e.target === this || e.target.closest('.chat-msgs') || e.target.closest('.chat-input')) {
                    chatInput.focus();
                }
            });
        }

        console.log('🌸 字卡美化已加载 · 阿晏 & 小回 & 66');
        console.log('💡 点击任意文字即可编辑，设置面板可全局美化。');
    }

    // ----- 执行初始化（等待 DOM 就绪） -----
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initBeautyPages);
    } else {
        initBeautyPages();
    }
})();
