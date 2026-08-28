let envelopeData = { outbox: [], inbox: [] }; 
let currentEnvTab = 'outbox';
let editingEnvId = null; 
let editingEnvSection = null; 

// =============================================
// 时空来信数据
// =============================================
var TIMEMAIL_KEY = 'timemail_data';
var TIMEMAIL_ENABLED_KEY = 'timemail_enabled';

function _getTimemailData() {
    try {
        return JSON.parse(localStorage.getItem(TIMEMAIL_KEY)) || { letters: [], lastSendDate: '' };
    } catch { return { letters: [], lastSendDate: '' }; }
}

function _setTimemailData(data) {
    localStorage.setItem(TIMEMAIL_KEY, JSON.stringify(data));
}

function _getReplyCardsForTimemail() {
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

function _generateTimemail() {
    var cards = _getReplyCardsForTimemail();
    if (cards.length < 2) {
        cards = ['早安', '晚安', '想你', '抱抱', '亲亲', '开心', '好梦', '今天超棒', '别担心', '有我在'];
    }
    var shuffled = cards.slice();
    for (var si = shuffled.length - 1; si > 0; si--) {
        var sj = Math.floor(Math.random() * (si + 1));
        var st = shuffled[si];
        shuffled[si] = shuffled[sj];
        shuffled[sj] = st;
    }
    var count = 4 + Math.floor(Math.random() * 3);
    var picked = shuffled.slice(0, Math.min(count, shuffled.length));
    return picked;
}

function _sendTimemail() {
    var letters = _generateTimemail();
    var content = letters.join('。') + '。';
    
    var data = _getTimemailData();
    var letter = {
        id: 'timemail_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
        content: content,
        sentences: letters,
        timestamp: new Date().toISOString(),
        read: false
    };
    data.letters.unshift(letter);
    data.lastSendDate = new Date().toDateString();
    _setTimemailData(data);
    
    var pName = (typeof settings !== 'undefined' && settings.partnerName) ? settings.partnerName : '梦角';
    if (typeof addMessage === 'function') {
        addMessage({
            id: Date.now() + Math.random(),
            sender: 'user',
            text: '✉️ ' + pName + ' 给你寄来了一封时空来信 💌',
            timestamp: new Date(),
            type: 'system',
            status: 'sent'
        });
        if (typeof playSound === 'function') playSound('send');
    }
    
    updateTimemailBadge();
    renderTimemailList();
    return letter;
}

function _autoSendTimemail() {
    var enabled = localStorage.getItem(TIMEMAIL_ENABLED_KEY) === 'true';
    if (!enabled) return;
    
    var data = _getTimemailData();
    var today = new Date().toDateString();
    
    var todayLetters = data.letters.filter(function(l) {
        return new Date(l.timestamp).toDateString() === today;
    });
    if (todayLetters.length >= 3) return;
    
    if (Math.random() > 0.3) return;
    
    _sendTimemail();
}

function renderTimemailList() {
    var container = document.getElementById('env-timemail-list');
    var empty = document.getElementById('env-timemail-empty');
    if (!container) return;
    
    var data = _getTimemailData();
    var letters = data.letters;
    
    if (letters.length === 0) {
        if (empty) empty.style.display = 'block';
        container.innerHTML = '';
        return;
    }
    if (empty) empty.style.display = 'none';
    
    var html = '';
    for (var i = 0; i < letters.length; i++) {
        var l = letters[i];
        var date = new Date(l.timestamp);
        var dateStr = date.getFullYear() + '/' + 
            String(date.getMonth() + 1).padStart(2, '0') + '/' + 
            String(date.getDate()).padStart(2, '0') + ' ' +
            String(date.getHours()).padStart(2, '0') + ':' +
            String(date.getMinutes()).padStart(2, '0');
        var statusText = l.read ? '已读' : '未读';
        var statusColor = l.read ? 'var(--text-secondary)' : 'var(--accent-color)';
        var pName = (typeof settings !== 'undefined' && settings.partnerName) ? settings.partnerName : '梦角';
        var preview = l.content.length > 40 ? l.content.substring(0, 40) + '…' : l.content;
        
        html += '<div class="timemail-item" data-id="' + l.id + '" style="background:var(--secondary-bg);border-radius:16px;padding:14px 16px;margin-bottom:12px;border:1px solid var(--border-color);cursor:pointer;transition:all 0.2s;" onclick="viewTimemail(\'' + l.id + '\')">' +
            '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">' +
                '<span style="font-weight:600;color:var(--text-primary);font-size:14px;">✉️ 来自 ' + _escHtml(pName) + '</span>' +
                '<span style="font-size:11px;color:' + statusColor + ';">' + statusText + '</span>' +
            '</div>' +
            '<div style="font-size:13px;color:var(--text-secondary);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:100%;">' + _escHtml(preview) + '</div>' +
            '<div style="font-size:10px;color:var(--text-secondary);opacity:0.6;margin-top:4px;">' + dateStr + '</div>' +
        '</div>';
    }
    container.innerHTML = html;
}

function updateTimemailBadge() {
    var data = _getTimemailData();
    var unread = data.letters.filter(function(l) { return !l.read; }).length;
    var badge = document.getElementById('env-timemail-badge');
    if (badge) {
        if (unread > 0) {
            badge.style.display = 'inline-block';
            badge.textContent = unread;
        } else {
            badge.style.display = 'none';
        }
    }
}

window.viewTimemail = function(id) {
    var data = _getTimemailData();
    var letter = null;
    for (var i = 0; i < data.letters.length; i++) {
        if (data.letters[i].id === id) {
            letter = data.letters[i];
            break;
        }
    }
    if (!letter) { 
        if (typeof showNotification === 'function') showNotification('信件不存在', 'error');
        return; 
    }
    
    letter.read = true;
    _setTimemailData(data);
    updateTimemailBadge();
    renderTimemailList();
    
    var old = document.getElementById('timemail-view-modal');
    if (old) old.remove();
    
    var wrap = document.createElement('div');
    wrap.id = 'timemail-view-modal';
    wrap.style.cssText = 'position:fixed;inset:0;z-index:10060;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.6);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);';
    
    var inner = document.createElement('div');
    inner.style.cssText = 'background:var(--primary-bg);border-radius:20px;padding:28px 24px;width:min(400px, 90vw);max-height:70vh;overflow-y:auto;border:1px solid var(--border-color);';
    
    var pName = (typeof settings !== 'undefined' && settings.partnerName) ? settings.partnerName : '梦角';
    var date = new Date(letter.timestamp);
    var dateStr = date.getFullYear() + '年' + 
        String(date.getMonth() + 1).padStart(2, '0') + '月' + 
        String(date.getDate()).padStart(2, '0') + '日 ' +
        String(date.getHours()).padStart(2, '0') + ':' +
        String(date.getMinutes()).padStart(2, '0');
    
    var sentencesHtml = '';
    for (var si = 0; si < letter.sentences.length; si++) {
        sentencesHtml += '<div style="padding:6px 0;border-bottom:1px solid rgba(var(--border-color-rgb,0,0,0),0.06);">' +
            '<span style="font-size:14px;color:var(--text-primary);">✦ ' + _escHtml(letter.sentences[si]) + '</span>' +
        '</div>';
    }
    
    inner.innerHTML = 
        '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">' +
            '<span style="font-size:20px;font-weight:700;color:var(--text-primary);">⏳ 时空来信</span>' +
            '<button id="timemail-view-close" style="background:none;border:none;font-size:22px;color:var(--text-secondary);cursor:pointer;">✕</button>' +
        '</div>' +
        '<div style="text-align:center;padding:8px 0 16px;border-bottom:1px dashed var(--border-color);margin-bottom:12px;">' +
            '<span style="font-size:13px;color:var(--text-secondary);">✉️ 来自 ' + _escHtml(pName) + '</span>' +
            '<span style="display:block;font-size:11px;color:var(--text-secondary);opacity:0.6;margin-top:2px;">' + dateStr + '</span>' +
        '</div>' +
        '<div style="margin-bottom:12px;">' + sentencesHtml + '</div>' +
        '<div style="text-align:center;padding-top:12px;border-top:1px dashed var(--border-color);">' +
            '<span style="font-size:12px;color:var(--text-secondary);opacity:0.6;">— 跨越时空的思念 —</span>' +
        '</div>';
    
    wrap.appendChild(inner);
    document.body.appendChild(wrap);
    
    document.getElementById('timemail-view-close').onclick = function() { wrap.remove(); };
    wrap.onclick = function(e) { if (e.target === wrap) wrap.remove(); };
};

window.toggleTimemailAuto = function() {
    var current = localStorage.getItem(TIMEMAIL_ENABLED_KEY) === 'true';
    var next = !current;
    localStorage.setItem(TIMEMAIL_ENABLED_KEY, String(next));
    if (typeof showNotification === 'function') {
        showNotification(next ? '时空来信已开启 ✨ 对方会随机给你写信' : '时空来信已关闭', 'info');
    }
    var toggle = document.getElementById('timemail-toggle');
    if (toggle) toggle.classList.toggle('active', next);
    var knob = document.querySelector('#timemail-toggle .setting-pill-knob');
    if (knob) {
        knob.style.transform = next ? 'translateX(20px)' : 'translateX(0)';
    }
    var switchEl = document.querySelector('#timemail-toggle .setting-pill-switch');
    if (switchEl) {
        switchEl.style.background = next ? 'var(--accent-color)' : 'var(--border-color)';
    }
    return next;
};

window.renderTimemailList = renderTimemailList;
window.updateTimemailBadge = updateTimemailBadge;

function _escHtml(s) {
    return String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// =============================================
// 原信封投递代码
// =============================================

async function loadEnvelopeData() {
    const saved = await localforage.getItem(getStorageKey('envelopeData'));
    if (saved) envelopeData = saved;
    const oldPending = await localforage.getItem(getStorageKey('pending_envelope'));
    if (oldPending && envelopeData.outbox.length === 0) {
        envelopeData.outbox.push({
            id: 'legacy_' + Date.now(),
            content: '（历史寄出的信件）',
            sentTime: oldPending.sentTime,
            replyTime: oldPending.replyTime,
            status: 'pending'
        });
        await localforage.removeItem(getStorageKey('pending_envelope'));
        saveEnvelopeData();
    }
}

function saveEnvelopeData() {
    localforage.setItem(getStorageKey('envelopeData'), envelopeData);
}

async function checkEnvelopeStatus() {
    await loadEnvelopeData();
    const now = Date.now();
    let changed = false;
    let newReplyLetter = null;
    envelopeData.outbox.forEach(letter => {
        if (letter.status === 'pending' && now >= letter.replyTime) {
            letter.status = 'replied';
            const replyContent = generateEnvelopeReplyText();
            const replyId = 'reply_' + Date.now() + '_' + Math.random().toString(36).substr(2,4);
            const inboxLetter = {
                id: replyId,
                refId: letter.id,
                originalContent: letter.content,
                content: replyContent,
                receivedTime: Date.now(),
                isNew: true
            };
            envelopeData.inbox.push(inboxLetter);
            newReplyLetter = inboxLetter;
            changed = true;
            playSound('message');
        }
    });
    if (changed) {
        saveEnvelopeData();
        if (newReplyLetter) showEnvelopeReplyPopup(newReplyLetter);
    }
}

function showEnvelopeReplyPopup(letter) {
    const existing = document.getElementById('envelope-reply-popup');
    if (existing) existing.remove();
    const popup = document.createElement('div');
    popup.id = 'envelope-reply-popup';
    popup.style.cssText = 'position:fixed;bottom:80px;left:50%;transform:translateX(-50%);background:var(--secondary-bg);border:1px solid var(--border-color);border-radius:20px;padding:18px 20px;z-index:8000;max-width:320px;width:88%;box-shadow:0 8px 32px rgba(0,0,0,0.18);display:flex;flex-direction:column;gap:12px;animation:slideUpNotif 0.4s cubic-bezier(0.22,1,0.36,1);';
    popup.innerHTML = `
        <style>@keyframes slideUpNotif{from{opacity:0;transform:translateX(-50%) translateY(24px) scale(0.9)}60%{transform:translateX(-50%) translateY(-4px) scale(1.02)}to{opacity:1;transform:translateX(-50%) translateY(0) scale(1)}}</style>
        <div style="display:flex;align-items:center;gap:10px;">
            <span style="font-size:26px;">💌</span>
            <div>
                <div style="font-size:14px;font-weight:700;color:var(--text-primary);">收到了一封回信</div>
                <div style="font-size:11px;color:var(--text-secondary);margin-top:2px;opacity:0.8;">Ta 给你写了回信，快去看看吧~</div>
            </div>
        </div>
        <div style="display:flex;gap:8px;">
            <button onclick="document.getElementById('envelope-reply-popup').remove();" style="flex:1;padding:8px 0;border-radius:12px;border:1px solid var(--border-color);background:var(--primary-bg);color:var(--text-secondary);font-size:13px;cursor:pointer;">稍后查看</button>
            <button onclick="openEnvelopeAndViewReply('${letter.id}');" style="flex:2;padding:8px 0;border-radius:12px;border:none;background:var(--accent-color);color:#fff;font-size:13px;font-weight:600;cursor:pointer;">立即阅读 ✉</button>
        </div>`;
    document.body.appendChild(popup);
    setTimeout(() => { if (popup.parentNode) popup.remove(); }, 8000);
}

const APPEARANCE_PANEL_TITLES = {
    'theme': '主题配色', 'font': '字体设置', 'background': '聊天背景',
    'bubble': '气泡样式', 'avatar': '聊天头像', 'css': '自定义CSS',
    'font-bg': '背景 & 字体', 'bubble-css': '气泡 & CSS'
};
window.showAppearancePanel = function(panel) {
    const panelMap = {
        'font-bg': ['font', 'background'],
        'bubble-css': ['bubble', 'css']
    };
    document.getElementById('appearance-nav-grid').style.display = 'none';
    var unBtn = document.getElementById('update-notice-btn');
    if (unBtn) unBtn.style.display = 'none';
    var galleryBanner = document.getElementById('gallery-banner-entry');
    if (galleryBanner) galleryBanner.style.display = 'none';
    document.getElementById('appearance-panel-container').style.display = 'block';
    document.getElementById('appearance-panel-title').textContent = APPEARANCE_PANEL_TITLES[panel] || panel;
    document.querySelectorAll('.appearance-sub-panel').forEach(p => p.style.display = 'none');
    if (panelMap[panel]) {
        panelMap[panel].forEach(sub => {
            const target = document.getElementById('appearance-panel-' + sub);
            if (target) target.style.display = 'block';
        });
    } else {
        const target = document.getElementById('appearance-panel-' + panel);
        if (target) target.style.display = 'block';
    }
    if (panel === 'bubble' || panel === 'bubble-css') { setTimeout(() => { if (typeof window.updateBubblePreviewFn === 'function') window.updateBubblePreviewFn(); }, 50); }
};
window.hideAppearancePanel = function() {
    document.getElementById('appearance-nav-grid').style.display = 'grid';
    document.getElementById('appearance-panel-container').style.display = 'none';
    document.querySelectorAll('.appearance-sub-panel').forEach(p => p.style.display = 'none');
    var unBtn = document.getElementById('update-notice-btn');
    if (unBtn) unBtn.style.display = 'flex';
    var galleryBanner = document.getElementById('gallery-banner-entry');
    if (galleryBanner) galleryBanner.style.display = 'flex';
};

window.openEnvelopeAndViewReply = function(replyId) {
    const popup = document.getElementById('envelope-reply-popup');
    if (popup) popup.remove();
    const envelopeModal = document.getElementById('envelope-modal');
    showModal(envelopeModal);
    setTimeout(() => {
        switchEnvTab('inbox');
        viewEnvLetter('inbox', replyId);
    }, 200);
};

function generateEnvelopeReplyText() {
    const sourcePool = [...customReplies];
    const sentenceCount = Math.floor(Math.random() * (12 - 8 + 1)) + 8;
    let replyContent = "";
    for (let i = 0; i < sentenceCount; i++) {
        const randomSentence = sourcePool[Math.floor(Math.random() * sourcePool.length)];
        const punctuation = Math.random() < 0.2 ? "！" : (Math.random() < 0.2 ? "..." : "。");
        replyContent += randomSentence + punctuation;
    }
    return replyContent;
}

// =============================================
// switchEnvTab - 添加了 timemail 支持
// =============================================
window.switchEnvTab = function(tab) {
    currentEnvTab = tab;
    var outboxBtn = document.getElementById('env-tab-outbox');
    var inboxBtn = document.getElementById('env-tab-inbox');
    var timemailBtn = document.getElementById('env-tab-timemail');
    
    if (outboxBtn) outboxBtn.classList.toggle('active', tab === 'outbox');
    if (inboxBtn) inboxBtn.classList.toggle('active', tab === 'inbox');
    if (timemailBtn) timemailBtn.classList.toggle('active', tab === 'timemail');
    
    var outboxSection = document.getElementById('env-outbox-section');
    var inboxSection = document.getElementById('env-inbox-section');
    var timemailSection = document.getElementById('env-timemail-section');
    var composeForm = document.getElementById('env-compose-form');
    var mainCloseBtn = document.getElementById('env-main-close-btn');
    
    if (outboxSection) outboxSection.style.display = tab === 'outbox' ? 'block' : 'none';
    if (inboxSection) inboxSection.style.display = tab === 'inbox' ? 'block' : 'none';
    if (timemailSection) timemailSection.style.display = tab === 'timemail' ? 'block' : 'none';
    if (composeForm) composeForm.style.display = 'none';
    if (mainCloseBtn) mainCloseBtn.style.display = 'flex';
    
    if (tab === 'timemail') {
        renderTimemailList();
        updateTimemailBadge();
    } else {
        renderEnvelopeLists();
    }
};

function renderEnvelopeLists() {
    renderOutboxList();
    renderInboxList();
    const pendingCount = envelopeData.outbox.filter(l => l.status === 'pending').length;
    const newInboxCount = envelopeData.inbox.filter(l => l.isNew).length;
    const outboxBadge = document.getElementById('env-outbox-badge');
    const inboxBadge = document.getElementById('env-inbox-badge');
    if (outboxBadge) { outboxBadge.textContent = pendingCount; outboxBadge.style.display = pendingCount > 0 ? 'inline-block' : 'none'; }
    if (inboxBadge) { inboxBadge.textContent = newInboxCount; inboxBadge.style.display = newInboxCount > 0 ? 'inline-block' : 'none'; }
    const envelopeEntryBadge = document.getElementById('env-entry-badge');
    if (envelopeEntryBadge) { envelopeEntryBadge.style.display = newInboxCount > 0 ? 'inline-block' : 'none'; }
}

function renderOutboxList() {
    const list = document.getElementById('env-outbox-list');
    if (!list) return;
    if (envelopeData.outbox.length === 0) {
        list.innerHTML = `<div class="env-empty">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M22 7l-10 7L2 7"/></svg>
            <div style="font-size:14px;font-weight:500;margin-top:4px;">还没有寄出任何信件</div>
            <div style="font-size:12px;margin-top:6px;opacity:0.6;">提笔写下心意，寄送给Ta吧~</div>
        </div>`;
        return;
    }
    list.innerHTML = envelopeData.outbox.slice().reverse().map(letter => {
        const date = new Date(letter.sentTime).toLocaleDateString('zh-CN', {month:'numeric', day:'numeric', hour:'2-digit', minute:'2-digit'});
        const isPending = letter.status === 'pending';
        const replyTime = isPending ? new Date(letter.replyTime).toLocaleDateString('zh-CN', {month:'numeric', day:'numeric', hour:'2-digit', minute:'2-digit'}) : '';
        const statusIcon = isPending
            ? `<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`
            : `<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>`;
        const statusText = isPending ? `${statusIcon} 预计 ${replyTime} 回信` : `${statusIcon} 已收到回信`;
        const preview = letter.content.length > 38 ? letter.content.substring(0, 38) + '…' : letter.content;
        return `
        <div class="env-letter-item" onclick="viewEnvLetter('outbox','${letter.id}')">
            <div class="env-letter-header">
                <div class="env-letter-header-from">
                    <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align:-1px;margin-right:3px;"><path d="M22 2L11 13"/><path d="M22 2L15 22 11 13 2 9l20-7z"/></svg>
                    寄出 · ${date}
                </div>
                <div class="env-stamp">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.8)" stroke-width="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                </div>
            </div>
            <div class="env-letter-body">
                <div class="env-letter-preview">${preview}</div>
                <div class="env-letter-status">${statusText}</div>
            </div>
            <button class="env-letter-delete-btn" onclick="deleteEnvLetter(event,'outbox','${letter.id}')">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
        </div>`;
    }).join('');
}

function renderInboxList() {
    const list = document.getElementById('env-inbox-list');
    if (!list) return;
    if (envelopeData.inbox.length === 0) {
        list.innerHTML = `<div class="env-empty">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M22 7l-10 7L2 7"/><polyline points="22 13 12 13"/><path d="M19 16l-5-3-5 3"/></svg>
            <div style="font-size:14px;font-weight:500;margin-top:4px;">还没有收到回信</div>
            <div style="font-size:12px;margin-top:6px;opacity:0.6;">对方正在认真回复中，请稍候~</div>
        </div>`;
        return;
    }
    list.innerHTML = envelopeData.inbox.slice().reverse().map(letter => {
        const date = new Date(letter.receivedTime).toLocaleDateString('zh-CN', {month:'numeric', day:'numeric', hour:'2-digit', minute:'2-digit'});
        const preview = letter.content.length > 50 ? letter.content.substring(0, 50) + '…' : letter.content;
        const isNew = letter.isNew;
        const origPreview = letter.originalContent ? (letter.originalContent.length > 32 ? letter.originalContent.substring(0, 32) + '…' : letter.originalContent) : '';
        return `
        <div class="env-letter-item reply ${isNew ? 'env-letter-new' : ''}" onclick="viewEnvLetter('inbox','${letter.id}')">
            <div class="env-letter-header">
                <div class="env-letter-header-from">
                    <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align:-1px;margin-right:3px;"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M22 7l-10 7L2 7"/></svg>
                    收到 · ${date}
                    ${isNew ? '<span style="background:rgba(255,255,255,0.3);color:#fff;font-size:9px;padding:1px 5px;border-radius:6px;margin-left:6px;">新</span>' : ''}
                </div>
                <div class="env-stamp">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.8)" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                </div>
            </div>
            ${origPreview ? `<div style="padding:6px 12px 0;display:flex;align-items:flex-start;gap:6px;"><div style="width:2px;border-radius:2px;background:rgba(var(--accent-color-rgb),0.4);flex-shrink:0;align-self:stretch;min-height:14px;margin-top:1px;"></div><div style="font-size:11px;color:var(--text-secondary);font-style:italic;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:calc(100% - 14px);opacity:0.75;">原信: ${origPreview}</div></div>` : ''}
            <div class="env-letter-body">
                <div class="env-letter-preview">${preview}</div>
            </div>
            <button class="env-letter-delete-btn" onclick="deleteEnvLetter(event,'inbox','${letter.id}')">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
        </div>`;
    }).join('');
}

window.viewEnvLetter = function(section, id) {
    const letters = section === 'outbox' ? envelopeData.outbox : envelopeData.inbox;
    const letter = letters.find(l => l.id === id);
    if (!letter) return;
    if (section === 'inbox' && letter.isNew) {
        letter.isNew = false;
        saveEnvelopeData();
        renderEnvelopeLists();
    }
    editingEnvId = id;
    editingEnvSection = section;

    document.getElementById('env-view-title').textContent = section === 'outbox' ? '寄出的信' : '收到的回信';

    const dateObj = letter.timestamp ? new Date(letter.timestamp) : new Date();
    const y = dateObj.getFullYear();
    const mo = String(dateObj.getMonth()+1).padStart(2,'0');
    const d = String(dateObj.getDate()).padStart(2,'0');
    const dateStr = `${y}/${mo}/${d}`;
    const weekdays = ['日','一','二','三','四','五','六'];
    const fullDateStr = dateStr + ' 星期' + weekdays[dateObj.getDay()];

    const stampEl = document.getElementById('env-view-stamp-date');
    if (stampEl) stampEl.textContent = `${mo}/${d}`;

    const dateLine = document.getElementById('env-view-date-line');
    if (dateLine) dateLine.textContent = fullDateStr;

    const toLine = document.getElementById('env-view-to-line');
    const greetingLine = document.getElementById('env-view-greeting-line');
    if (section === 'outbox') {
        const partnerName = (typeof settings !== 'undefined' && settings.partnerName) || '亲爱的';
        if (toLine) toLine.textContent = `致 ${partnerName}：`;
        if (greetingLine) greetingLine.textContent = '见字如面，望君安好。';
    } else {
        const myName = (typeof settings !== 'undefined' && settings.myName) || '你';
        if (toLine) toLine.textContent = `致 ${myName}：`;
        if (greetingLine) greetingLine.textContent = '见字如面，一切皆好。';
    }

    const textEl = document.getElementById('env-view-text');
    if (textEl) textEl.textContent = letter.content;

    const signDateEl = document.getElementById('env-view-sign-date');
    const signNameEl = document.getElementById('env-view-sign-name');
    if (signDateEl) signDateEl.textContent = fullDateStr;
    if (section === 'outbox') {
        const myName = (typeof settings !== 'undefined' && settings.myName) || '你';
        if (signNameEl) signNameEl.textContent = myName;
    } else {
        const partnerName = (typeof settings !== 'undefined' && settings.partnerName) || '对方';
        if (signNameEl) signNameEl.textContent = partnerName;
    }

    document.getElementById('env-edit-input').value = letter.content;
    document.getElementById('env-view-content').style.display = 'block';
    document.getElementById('env-view-edit').style.display = 'none';
    document.getElementById('env-view-edit-btn').style.display = 'inline-flex';
    document.getElementById('env-view-save-btn').style.display = 'none';
    const origCtx = document.getElementById('env-view-original-ctx');
    const origText = document.getElementById('env-view-original-text');
    const origExpand = document.getElementById('env-view-original-expand');
    if (origCtx && origText) {
        if (section === 'inbox' && letter.originalContent) {
            origText.textContent = letter.originalContent;
            origText.style.maxHeight = '80px';
            origCtx.style.display = 'block';
            if (origExpand) {
                origExpand.style.display = letter.originalContent.length > 120 ? 'block' : 'none';
                origExpand.textContent = '展开查看全文';
            }
        } else {
            origCtx.style.display = 'none';
        }
    }
    showModal(document.getElementById('envelope-view-modal'));
};

window.toggleEnvEdit = function() {
    const contentEl = document.getElementById('env-view-content');
    const editEl = document.getElementById('env-view-edit');
    const editBtn = document.getElementById('env-view-edit-btn');
    const saveBtn = document.getElementById('env-view-save-btn');
    const isEditing = editEl.style.display !== 'none';
    if (isEditing) {
        contentEl.style.display = 'block';
        editEl.style.display = 'none';
        editBtn.textContent = '编辑';
        saveBtn.style.display = 'none';
    } else {
        contentEl.style.display = 'none';
        editEl.style.display = 'block';
        editBtn.textContent = '取消';
        saveBtn.style.display = 'inline-flex';
    }
};

window.saveEnvEdit = function() {
    const newContent = document.getElementById('env-edit-input').value.trim();
    if (!newContent) { showNotification('内容不能为空', 'warning'); return; }
    const letters = editingEnvSection === 'outbox' ? envelopeData.outbox : envelopeData.inbox;
    const letter = letters.find(l => l.id === editingEnvId);
    if (letter) {
        letter.content = newContent;
        saveEnvelopeData();
        const textEl = document.getElementById('env-view-text');
        if (textEl) textEl.textContent = newContent;
        showNotification('已保存修改', 'success');
        toggleEnvEdit();
    }
};

window.closeEnvViewModal = function() {
    hideModal(document.getElementById('envelope-view-modal'));
};

window.deleteEnvLetter = function(event, section, id) {
    event.stopPropagation();
    if (!confirm('确定要删除这封信吗？')) return;
    if (section === 'outbox') {
        envelopeData.outbox = envelopeData.outbox.filter(l => l.id !== id);
    } else {
        envelopeData.inbox = envelopeData.inbox.filter(l => l.id !== id);
    }
    saveEnvelopeData();
    renderEnvelopeLists();
    showNotification('已删除', 'success');
};

window.openNewEnvelopeForm = function() {
    document.getElementById('env-outbox-section').style.display = 'none';
    document.getElementById('env-inbox-section').style.display = 'none';
    document.getElementById('env-main-close-btn').style.display = 'none';
    document.getElementById('env-compose-title').textContent = '写一封信';
    document.getElementById('envelope-input').value = '';
    document.getElementById('env-send-to-chat').checked = false;
    document.getElementById('env-compose-form').style.display = 'block';
};

window.cancelEnvelopeCompose = function() {
    document.getElementById('env-compose-form').style.display = 'none';
    document.getElementById('env-main-close-btn').style.display = 'flex';
    if (currentEnvTab === 'outbox') {
        document.getElementById('env-outbox-section').style.display = 'block';
    } else {
        document.getElementById('env-inbox-section').style.display = 'block';
    }
};

function handleSendEnvelope() {
    const text = document.getElementById('envelope-input').value.trim();
    if (!text) { showNotification('信件内容不能为空', 'warning'); return; }

    const sendToChat = document.getElementById('env-send-to-chat').checked;
    if (sendToChat) {
        addMessage({ id: Date.now(), sender: 'user', text: `【寄出的信】\n${text}`, timestamp: new Date(), status: 'sent', type: 'normal' });
    }

    const minHours = 10, maxHours = 24;
    const randomHours = Math.random() * (maxHours - minHours) + minHours;
    const replyTime = Date.now() + randomHours * 60 * 60 * 1000;
    const newId = 'env_' + Date.now() + '_' + Math.random().toString(36).substr(2,4);
    envelopeData.outbox.push({
        id: newId, content: text,
        sentTime: Date.now(), replyTime,
        status: 'pending'
    });
    saveEnvelopeData();

    cancelEnvelopeCompose();
    switchEnvTab('outbox');
    showNotification(`信件已寄出，预计 ${Math.floor(randomHours)} 小时后收到回信 ✉️`, 'success');
}

// =============================================
// 注入时空来信 HTML 和 设置开关
// =============================================

function _injectTimemailHTML() {
    if (document.getElementById('env-tab-timemail')) return;
    
    var tabBar = document.querySelector('.env-tab-bar');
    if (!tabBar) return;
    
    var inboxTab = document.getElementById('env-tab-inbox');
    if (!inboxTab) return;
    
    var timemailTab = document.createElement('button');
    timemailTab.id = 'env-tab-timemail';
    timemailTab.className = 'env-tab-btn';
    timemailTab.setAttribute('onclick', "switchEnvTab('timemail')");
    timemailTab.innerHTML = `
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align:-1px;margin-right:4px;">
            <circle cx="12" cy="12" r="10"/>
            <polyline points="12 6 12 12 16 14"/>
        </svg>
        时空来信
        <span id="env-timemail-badge" class="env-badge" style="display:none;"></span>
    `;
    
    inboxTab.parentNode.insertBefore(timemailTab, inboxTab.nextSibling);
    
    var inboxSection = document.getElementById('env-inbox-section');
    if (!inboxSection) return;
    
    var timemailSection = document.createElement('div');
    timemailSection.id = 'env-timemail-section';
    timemailSection.style.cssText = 'display:none;padding:0 0 8px;';
    timemailSection.innerHTML = `
        <div id="env-timemail-list" style="padding:12px 4px;min-height:200px;"></div>
        <div id="env-timemail-empty" style="text-align:center;padding:40px 20px;color:var(--text-secondary);">
            <div style="font-size:48px;margin-bottom:12px;">⏳</div>
            <div style="font-size:15px;font-weight:600;">还没有时空来信</div>
            <div style="font-size:13px;opacity:0.7;margin-top:4px;">开启"主动给我写信"后，系统会随机给你写信~</div>
        </div>
    `;
    
    inboxSection.parentNode.insertBefore(timemailSection, inboxSection.nextSibling);
}

function _injectTimemailToggle() {
    var autoSendToggle = document.getElementById('auto-send-toggle');
    if (!autoSendToggle) return;
    if (document.getElementById('timemail-toggle')) return;
    
    var isEnabled = localStorage.getItem(TIMEMAIL_ENABLED_KEY) === 'true';
    
    var timemailRow = document.createElement('div');
    timemailRow.id = 'timemail-toggle';
    timemailRow.className = 'setting-pill-row';
    timemailRow.style.cssText = 'border-top:1px solid var(--border-color);cursor:pointer;';
    timemailRow.setAttribute('onclick', 'toggleTimemailAuto()');
    
    timemailRow.innerHTML = `
        <span class="setting-pill-icon"><i class="fas fa-clock"></i></span>
        <span class="setting-pill-label">时空来信 <span style="font-size:11px;color:var(--text-secondary);font-weight:400;">开启后对方会随机给你写信</span></span>
        <div class="setting-pill-switch" style="background:${isEnabled ? 'var(--accent-color)' : 'var(--border-color)'};">
            <div class="setting-pill-knob" style="transform:${isEnabled ? 'translateX(20px)' : 'translateX(0)'};"></div>
        </div>
    `;
    
    autoSendToggle.parentNode.insertBefore(timemailRow, autoSendToggle.nextSibling);
}

// =============================================
// 页面初始化
// =============================================

document.addEventListener('DOMContentLoaded', function() {
    setTimeout(function() {
        _injectTimemailHTML();
        _injectTimemailToggle();
        renderTimemailList();
        updateTimemailBadge();
        _autoSendTimemail();
        setInterval(function() {
            _autoSendTimemail();
        }, 300000);
    }, 500);
});

console.log('[信封投递] 时空来信功能已加载');
