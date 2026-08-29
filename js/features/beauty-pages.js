<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>字卡 · 阿晏</title>
    <style>
        /* ===== 全局重置 & 基础 ===== */
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        :root {
            --bg: #f5efe9;
            --card-bg: rgba(255, 248, 242, 0.85);
            --text: #3d2c2a;
            --text-light: #7a6a66;
            --accent: #d4a5a5;
            --shadow: 0 12px 40px rgba(60, 40, 35, 0.10);
            --radius: 28px;
            --font: 'PingFang SC', 'Helvetica Neue', system-ui, -apple-system, sans-serif;
            --transition: 0.45s cubic-bezier(0.22, 0.68, 0, 1);
        }
        html,
        body {
            width: 100%;
            height: 100%;
            overflow: hidden;
            font-family: var(--font);
            background: var(--bg);
            color: var(--text);
            user-select: none;
            -webkit-tap-highlight-color: transparent;
        }
        /* ===== 设置面板 ===== */
        #settings-toggle {
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
        #settings-toggle:hover {
            transform: scale(1.06);
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.14);
        }
        #settings-panel {
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
        #settings-panel.open {
            display: flex;
        }
        .settings-box {
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
        .settings-box h2 {
            font-size: 18px;
            font-weight: 600;
            margin-bottom: 20px;
            letter-spacing: 0.3px;
            color: #3d2c2a;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        .settings-box h2 span {
            font-size: 22px;
        }
        .setting-group {
            margin-bottom: 18px;
        }
        .setting-group label {
            display: block;
            font-size: 13px;
            font-weight: 500;
            color: #7a6a66;
            margin-bottom: 5px;
            letter-spacing: 0.3px;
        }
        .setting-group input[type="color"],
        .setting-group input[type="text"],
        .setting-group input[type="file"] {
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
        .setting-group input[type="color"] {
            height: 44px;
            padding: 4px;
            cursor: pointer;
        }
        .setting-group input:focus {
            border-color: #d4a5a5;
            box-shadow: 0 0 0 4px rgba(212, 165, 165, 0.15);
        }
        .setting-group .file-wrap {
            display: flex;
            gap: 10px;
            align-items: center;
        }
        .setting-group .file-wrap input[type="file"] {
            flex: 1;
            padding: 8px 10px;
        }
        .setting-group .file-wrap button {
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
        .setting-group .file-wrap button:hover {
            background: #c49494;
        }
        .settings-close {
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
        .settings-close:hover {
            background: #2d1f1d;
        }
        .settings-box::-webkit-scrollbar {
            width: 4px;
        }
        .settings-box::-webkit-scrollbar-thumb {
            background: #d4a5a5;
            border-radius: 10px;
        }

        /* ===== 滑动容器 ===== */
        .slider {
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
        .slider::-webkit-scrollbar {
            display: none;
        }
        .page {
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
        .page::-webkit-scrollbar {
            width: 3px;
        }
        .page::-webkit-scrollbar-thumb {
            background: #d4a5a5;
            border-radius: 10px;
        }

        /* ===== 页面通用卡片 ===== */
        .card {
            background: var(--card-bg);
            backdrop-filter: blur(8px);
            border-radius: var(--radius);
            padding: 18px 20px;
            box-shadow: var(--shadow);
            border: 1px solid rgba(255, 255, 255, 0.4);
            margin-bottom: 14px;
            transition: background 0.3s, border-color 0.3s;
        }
        .card-title {
            font-size: 12px;
            font-weight: 500;
            color: var(--text-light);
            letter-spacing: 0.5px;
            margin-bottom: 10px;
            opacity: 0.7;
        }

        /* ===== 页面1: 聊天页 ===== */
        .chat-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 12px 0 6px;
        }
        .chat-header .back {
            font-size: 22px;
            opacity: 0.5;
            cursor: default;
        }
        .chat-header .title {
            font-weight: 600;
            font-size: 18px;
            letter-spacing: 0.5px;
        }
        .chat-header .more {
            font-size: 20px;
            opacity: 0.5;
        }
        .chat-msgs {
            display: flex;
            flex-direction: column;
            gap: 12px;
            padding: 6px 0 12px;
        }
        .msg {
            display: flex;
            align-items: flex-start;
            gap: 10px;
            max-width: 82%;
        }
        .msg.right {
            flex-direction: row-reverse;
            align-self: flex-end;
        }
        .msg .avatar {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            background: #e8ddd6;
            flex-shrink: 0;
            overflow: hidden;
            border: 2px solid rgba(255, 255, 255, 0.6);
        }
        .msg .avatar img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }
        .msg .bubble {
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
        .msg.right .bubble {
            border-radius: 20px 20px 6px 20px;
            background: rgba(212, 165, 165, 0.20);
        }
        .msg .time {
            font-size: 10px;
            color: var(--text-light);
            opacity: 0.6;
            margin-top: 4px;
            padding: 0 4px;
        }
        .chat-input {
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 6px 0 2px;
        }
        .chat-input .input-field {
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
        .chat-input .input-field:focus {
            border-color: #d4a5a5;
            box-shadow: 0 0 0 4px rgba(212, 165, 165, 0.10);
        }
        .chat-input .send-btn {
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
        .chat-input .send-btn:hover {
            transform: scale(1.04);
            background: #c49494;
        }
        .page1-deco {
            text-align: center;
            font-size: 12px;
            color: var(--text-light);
            opacity: 0.4;
            padding: 8px 0 2px;
            letter-spacing: 1px;
        }

        /* ===== 页面2: 阿晏&小回 ===== */
        /* 顶部气泡 */
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
            color: var(--text-light);
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
            color: var(--text-light);
            opacity: 0.6;
        }
        .p2-top .right .divider {
            color: var(--text-light);
            opacity: 0.25;
            font-weight: 200;
            align-self: center;
        }

        /* 纪念日行 */
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
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
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
            border: 1px solid rgba(255, 255, 255, 0.4);
            margin-bottom: 4px;
            white-space: nowrap;
        }
        .p2-memorial .left .days {
            font-size: 24px;
            font-weight: 700;
            color: var(--text);
            letter-spacing: 1px;
            line-height: 1.2;
        }
        .p2-memorial .left .days small {
            font-size: 13px;
            font-weight: 400;
            color: var(--text-light);
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
            box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
            padding: 5px 5px 10px 5px;
            transform: rotate(-2deg);
            transition: 0.3s;
            overflow: hidden;
            border: 1px solid rgba(255, 255, 255, 0.5);
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

        /* 音乐播放器 */
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
            border: 2px solid rgba(255, 255, 255, 0.6);
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
            color: var(--text-light);
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
            color: var(--text);
            cursor: pointer;
            transition: 0.25s;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
            border: 1px solid rgba(255, 255, 255, 0.3);
        }
        .p2-music .play-btn:hover {
            background: rgba(212, 165, 165, 0.35);
            transform: scale(1.04);
        }

        /* 头像+昵称+... */
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
            border: 2px solid rgba(255, 255, 255, 0.6);
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
            color: var(--text-light);
            opacity: 0.6;
        }
        .p2-profile .dots {
            font-size: 20px;
            letter-spacing: 2px;
            opacity: 0.5;
            margin-left: auto;
            align-self: center;
        }

        /* 大矩形图片 */
        .p2-bigimg {
            width: 100%;
            aspect-ratio: 16/9;
            border-radius: 16px;
            overflow: hidden;
            background: #e8ddd6;
            border: 1px solid rgba(255, 255, 255, 0.3);
            position: relative;
        }
        .p2-bigimg img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }
        .p2-bigimg .empty-hint {
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

        /* 四张拍立得 */
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
            box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
            overflow: hidden;
            border: 1px solid rgba(255, 255, 255, 0.4);
            transition: 0.3s;
        }
        .p2-polaroids .pol img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            border-radius: 2px;
        }
        .p2-polaroids .pol .empty-hint {
            width: 100%;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: var(--text-light);
            opacity: 0.25;
            font-size: 10px;
            background: #f5efe9;
        }

        /* ===== 页面3: 阿晏&66 ===== */
        /* 顶部横幅 */
        .p3-banner {
            position: relative;
            width: 100%;
            aspect-ratio: 16/6;
            border-radius: var(--radius);
            overflow: hidden;
            background: linear-gradient(145deg, #e8ddd6, #dccbc2);
            margin-bottom: 8px;
            border: 1px solid rgba(255, 255, 255, 0.3);
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
            border: 4px solid rgba(255, 255, 255, 0.9);
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
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
        .p3-title-area .sub-title {
            font-size: 13px;
            color: var(--text-light);
            opacity: 0.6;
        }

        /* 三栏统计 */
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
            border: 1px solid rgba(255, 255, 255, 0.3);
        }
        .p3-stats .stat .num {
            font-size: 20px;
            font-weight: 700;
        }
        .p3-stats .stat .label {
            font-size: 11px;
            color: var(--text-light);
            opacity: 0.6;
            margin-top: 2px;
        }

        /* 搜索框 */
        .p3-search {
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
        .p3-search:focus-within {
            border-color: #d4a5a5;
            box-shadow: 0 0 0 4px rgba(212, 165, 165, 0.08);
        }
        .p3-search .icon {
            font-size: 18px;
            opacity: 0.4;
        }
        .p3-search input {
            flex: 1;
            border: none;
            background: transparent;
            font-size: 14px;
            font-family: var(--font);
            color: var(--text);
            outline: none;
            min-width: 0;
        }
        .p3-search input::placeholder {
            color: var(--text-light);
            opacity: 0.4;
        }

        /* 聊天对话区 */
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
            border: 2px solid rgba(255, 255, 255, 0.5);
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
            border: 1px solid rgba(255, 255, 255, 0.3);
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
            box-shadow: 0 12px 40px rgba(0, 0, 0, 0.08);
            border: 3px solid rgba(255, 255, 255, 0.6);
            background: #e8ddd6;
            transform: translateX(6px);
        }
        .p3-chat-area .float-illus img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }

        /* 帖子卡片 */
        .p3-post {
            padding: 14px 16px;
            background: rgba(255, 248, 242, 0.4);
            backdrop-filter: blur(4px);
            border-radius: 24px;
            border: 1px solid rgba(255, 255, 255, 0.3);
        }
        .p3-post .quote {
            font-size: 14px;
            line-height: 1.6;
            padding: 4px 0 8px;
            font-style: italic;
            color: var(--text);
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
            color: var(--text-light);
            opacity: 0.6;
            padding-top: 4px;
            border-top: 1px solid rgba(0, 0, 0, 0.04);
        }
        .p3-post .actions span {
            display: flex;
            align-items: center;
            gap: 4px;
        }

        /* 底部输入栏 */
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
            border: 2px solid rgba(255, 255, 255, 0.4);
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
            font-family: var(--font);
            color: var(--text);
            outline: none;
            transition: 0.25s;
        }
        .p3-footer .finp:focus {
            border-color: #d4a5a5;
            box-shadow: 0 0 0 4px rgba(212, 165, 165, 0.08);
        }

        /* 颜文字装饰 */
        .kaomoji-deco {
            font-size: 12px;
            opacity: 0.15;
            letter-spacing: 3px;
            text-align: center;
            padding: 4px 0;
            pointer-events: none;
            user-select: none;
            line-height: 1.6;
        }

        /* ===== 响应式微调 ===== */
        @media (max-width: 480px) {
            .page {
                padding: 0 10px 16px;
            }
            .card {
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
            .settings-box {
                padding: 24px 18px 20px;
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

        /* ===== 工具类 ===== */
        .flex-center {
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .gap-2 {
            gap: 6px;
        }
        .mt-1 {
            margin-top: 6px;
        }
        .mb-1 {
            margin-bottom: 6px;
        }
        .op-4 {
            opacity: 0.4;
        }
        .text-sm {
            font-size: 12px;
        }
        .text-xs {
            font-size: 10px;
        }
    </style>
</head>
<body>

    <!-- ===== 设置面板 ===== -->
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

    <!-- ===== 滑动容器 ===== -->
    <div class="slider" id="slider">

        <!-- ==================== 页面1: 聊天 ==================== -->
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

        <!-- ==================== 页面2: 阿晏&小回 ==================== -->
        <div class="page" id="page2" style="background:var(--bg);">
            <!-- 顶部气泡 -->
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

            <!-- 纪念日 -->
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

            <!-- 音乐播放器 -->
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

            <!-- 头像+昵称+... -->
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

            <!-- 大矩形图片 -->
            <div class="card" style="padding:12px;">
                <div class="p2-bigimg" id="p2-bigimg">
                    <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='225'%3E%3Crect width='400' height='225' fill='%23e8ddd6'/%3E%3Ctext x='200' y='118' text-anchor='middle' fill='%239a8a86' font-size='14' font-family='sans-serif'%3E✨ 自定义大图 ✨%3C/text%3E%3C/svg%3E" alt="big image" id="p2-bigimg-img">
                    <div class="empty-hint" style="display:none;">点击上方⚙上传</div>
                </div>
            </div>

            <!-- 四张拍立得 -->
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

        <!-- ==================== 页面3: 阿晏&66 ==================== -->
        <div class="page" id="page3" style="background:var(--bg);">
            <!-- 横幅 + 头像 -->
            <div class="p3-banner" id="p3-banner">
                <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='200'%3E%3Crect width='600' height='200' fill='%23dccbc2'/%3E%3Ctext x='300' y='110' text-anchor='middle' fill='%239a8a86' font-size='18' font-family='sans-serif'%3E🌸 阿晏 &amp; 66 🌸%3C/text%3E%3C/svg%3E" alt="banner" id="p3-banner-img">
                <div class="avatar-overlay"><img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Ccircle cx='50' cy='50' r='50' fill='%23d4a5a5'/%3E%3C/svg%3E" alt="banner av" id="p3-banner-av"></div>
            </div>

            <!-- 标题区 -->
            <div class="p3-title-area">
                <div class="main-title" contenteditable="true">阿晏 &amp; 66</div>
                <div class="kaomoji" contenteditable="true">(◕‿◕)♡ (｡♥‿♥｡)</div>
                <div class="sub-title" contenteditable="true">✨ 红线的两端是你我 · 一杯美式 一杯拿铁</div>
            </div>

            <!-- 三栏统计 -->
            <div class="card" style="padding:14px 12px;">
                <div class="p3-stats">
                    <div class="stat"><div class="num" contenteditable="true">365</div><div class="label" contenteditable="true">Days</div></div>
                    <div class="stat"><div class="num" contenteditable="true">∞</div><div class="label" contenteditable="true">Love</div></div>
                    <div class="stat"><div class="num" contenteditable="true">66</div><div class="label" contenteditable="true">Moments</div></div>
                </div>
            </div>

            <!-- 搜索框 -->
            <div class="p3-search">
                <span class="icon">🔍</span>
                <input type="text" placeholder="搜索回忆..." id="p3-search-input" value="未定义">
            </div>

            <!-- 聊天对话区 -->
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
                <div class="fav"><img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Ccircle cx='50' cy='50' r='50' fill='%23d4a5a5'/%3E%3C/svg%3E" alt="footer av" id="p3-footer-av"></div>
                <input class="finp" placeholder="输入你的心意..." id="p3-footer-input" value="未定义">
            </div>
            <div class="kaomoji-deco">(｡♡‿♡｡)  ✧  (◕‿◕)  ♡  (˘▽˘)っ</div>
        </div>

    </div>

    <script>
        (function() {
            'use strict';

            // ========== DOM 引用 ==========
            const slider = document.getElementById('slider');
            const pages = document.querySelectorAll('.page');
            const settingsToggle = document.getElementById('settings-toggle');
            const settingsPanel = document.getElementById('settings-panel');
            const settingsClose = document.getElementById('settings-close');
            const bgColorInput = document.getElementById('bg-color');
            const bgUrlInput = document.getElementById('bg-url');
            const textColorInput = document.getElementById('text-color');
            const cardOpacityInput = document.getElementById('card-opacity');
            const customFileInput = document.getElementById('custom-file');
            const applyFileBtn = document.getElementById('apply-file-btn');

            // 页面2 纪念日
            const memorialDateInput = document.getElementById('memorial-date');
            const daysCount = document.getElementById('days-count');

            // 页面2 音乐播放
            const playBtn = document.getElementById('p2-play-btn');
            let isPlaying = false;

            // 页面1 聊天发送
            const chatInput = document.getElementById('chat-input-field');
            const chatSend = document.getElementById('chat-send');
            const chatMsgs = document.getElementById('chat-msgs');

            // ========== 初始化纪念日 ==========
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
            memorialDateInput.addEventListener('change', updateDays);

            // ========== 音乐播放 ==========
            let audioCtx = null;
            let oscillator = null;
            let gainNode = null;

            playBtn.addEventListener('click', function() {
                if (!audioCtx) {
                    audioCtx = new(window.AudioContext || window.webkitAudioContext)();
                }
                if (isPlaying) {
                    // stop
                    if (oscillator) {
                        oscillator.stop();
                        oscillator = null;
                    }
                    if (gainNode) {
                        gainNode.disconnect();
                        gainNode = null;
                    }
                    playBtn.textContent = '▶';
                    isPlaying = false;
                } else {
                    // start simple tone
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
                        // auto stop after 5s for demo
                        setTimeout(() => {
                            if (isPlaying) {
                                if (oscillator) { oscillator.stop();
                                    oscillator = null; }
                                if (gainNode) { gainNode.disconnect();
                                    gainNode = null; }
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

            // ========== 聊天发送 ==========
            function sendMessage() {
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
                // 自动回复
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
            chatSend.addEventListener('click', sendMessage);
            chatInput.addEventListener('keydown', function(e) {
                if (e.key === 'Enter') { e.preventDefault();
                    sendMessage(); }
            });

            // ========== 全局设置 ==========
            function applySettings() {
                const bgColor = bgColorInput.value;
                const bgUrl = bgUrlInput.value.trim();
                const textColor = textColorInput.value;
                const opacity = parseFloat(cardOpacityInput.value) || 0.85;

                document.documentElement.style.setProperty('--bg', bgColor);
                document.documentElement.style.setProperty('--text', textColor);
                document.documentElement.style.setProperty('--card-bg', `rgba(255,248,242,${Math.min(opacity,1)})`);

                // 背景图
                if (bgUrl) {
                    document.querySelectorAll('.page').forEach(p => {
                        p.style.backgroundImage = `url(${bgUrl})`;
                        p.style.backgroundSize = 'cover';
                        p.style.backgroundPosition = 'center';
                        p.style.backgroundAttachment = 'fixed';
                    });
                } else {
                    document.querySelectorAll('.page').forEach(p => {
                        p.style.backgroundImage = 'none';
                        p.style.backgroundSize = 'auto';
                    });
                }

                // 保存
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

            // 设置面板开关
            settingsToggle.addEventListener('click', function() {
                settingsPanel.classList.toggle('open');
                // 读取当前值到面板
                bgColorInput.value = getComputedStyle(document.documentElement).getPropertyValue('--bg').trim() || '#f5efe9';
                bgUrlInput.value = localStorage.getItem('settings-bg-url') || '';
                textColorInput.value = getComputedStyle(document.documentElement).getPropertyValue('--text').trim() ||
                '#3d2c2a';
                const curOp = getComputedStyle(document.documentElement).getPropertyValue('--card-bg').trim();
                const match = curOp.match(/[\d.]+/);
                if (match) cardOpacityInput.value = match[0];
            });

            settingsClose.addEventListener('click', function() {
                applySettings();
                settingsPanel.classList.remove('open');
            });

            // 实时预览
            [bgColorInput, bgUrlInput, textColorInput, cardOpacityInput].forEach(el => {
                el.addEventListener('input', applySettings);
                el.addEventListener('change', applySettings);
            });

            // 自定义图片上传
            let uploadedImageData = null;
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

            applyFileBtn.addEventListener('click', function() {
                if (!uploadedImageData) {
                    alert('请先选择一张图片上传～');
                    return;
                }
                // 替换页面中所有 img 的 src (占位图)，但保留用户已手动设置的?
                // 简单实现：替换所有 SVG 占位图
                const imgs = document.querySelectorAll('img');
                let count = 0;
                imgs.forEach(img => {
                    const src = img.src || '';
                    if (src.includes('data:image/svg+xml') || src.includes('svg')) {
                        img.src = uploadedImageData;
                        count++;
                    }
                });
                // 也替换大图
                const bigImg = document.getElementById('p2-bigimg-img');
                if (bigImg && bigImg.src.includes('svg')) {
                    bigImg.src = uploadedImageData;
                    count++;
                }
                alert(`✨ 已替换 ${count} 个图片占位！你可以继续在设置中调整。`);
            });

            // ========== 滑动指示 (隐藏滑动键) ==========
            // 通过 CSS 已经隐藏了滚动条

            // ========== 页面内可编辑内容保存 ==========
            document.querySelectorAll('[contenteditable="true"]').forEach(el => {
                el.addEventListener('blur', function() {
                    // 可保存到 localStorage，但这里只做简单提醒
                });
            });

            // ========== 加载已保存的设置 ==========
            loadSettings();
            initMemorial();

            // ========== 页面切换时重置音频状态 ==========
            // 使用 IntersectionObserver 检测页面可见性
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (!entry.isIntersecting) {
                        // 离开页面时停止音乐
                        if (isPlaying) {
                            if (oscillator) { oscillator.stop();
                                oscillator = null; }
                            if (gainNode) { gainNode.disconnect();
                                gainNode = null; }
                            playBtn.textContent = '▶';
                            isPlaying = false;
                        }
                    }
                });
            }, { threshold: 0.5 });

            document.querySelectorAll('.page').forEach(p => observer.observe(p));

            // ========== 点击页面空白处聚焦聊天输入 ==========
            document.getElementById('page1').addEventListener('click', function(e) {
                if (e.target === this || e.target.closest('.chat-msgs') || e.target.closest('.chat-input')) {
                    chatInput.focus();
                }
            });

            console.log('🌸 字卡网站已加载 · 阿晏 & 小回 & 66');
            console.log('💡 点击任意文字即可编辑，设置面板可全局美化。');
        })();
    </script>
</body>
</html>
