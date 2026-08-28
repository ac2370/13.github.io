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
    // ⭐ 修改：图标 + 下方小字“我们在命运的两端”
    timemailTab.innerHTML = `
        <div style="display:flex;flex-direction:column;align-items:center;gap:2px;">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" style="vertical-align:middle;">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12 6 12 12 16 14"/>
            </svg>
            <span style="font-size:11px;font-weight:600;letter-spacing:0.5px;">时空来信</span>
            <span style="font-size:8px;opacity:0.6;letter-spacing:0.3px;font-weight:400;">我们在命运的两端</span>
        </div>
        <span id="env-timemail-badge" class="env-badge" style="display:none;"></span>
    `;
    
    // ⭐ 修改：按钮样式，添加内边距适应三行文字
    timemailTab.style.cssText = 'flex:1;padding:8px 4px;border:none;background:transparent;color:var(--text-secondary);font-size:12px;font-weight:600;cursor:pointer;font-family:var(--font-family);border-bottom:2px solid transparent;transition:all 0.2s;text-align:center;display:flex;flex-direction:column;align-items:center;';
    
    // 插入到收件箱后面
    inboxTab.parentNode.insertBefore(timemailTab, inboxTab.nextSibling);
    
    // 同样修改"寄出的信"和"收到的信"的样式，保持一致
    var outboxTab = document.getElementById('env-tab-outbox');
    var inboxTabExisting = document.getElementById('env-tab-inbox');
    
    [outboxTab, inboxTabExisting].forEach(function(tab) {
        if (tab) {
            // 把原有的内容包装成三行样式
            var originalText = tab.textContent.trim();
            var iconSvg = tab.querySelector('svg');
            var iconHtml = iconSvg ? iconSvg.outerHTML : '';
            var subText = '';
            if (tab.id === 'env-tab-outbox') {
                subText = 'LETTERS · SENT';
            } else if (tab.id === 'env-tab-inbox') {
                subText = 'LETTERS · RECEIVED';
            }
            tab.innerHTML = `
                <div style="display:flex;flex-direction:column;align-items:center;gap:2px;">
                    ${iconHtml}
                    <span style="font-size:11px;font-weight:600;letter-spacing:0.5px;">${tab.id === 'env-tab-outbox' ? '寄出的信' : '收到的信'}</span>
                    <span style="font-size:8px;opacity:0.6;letter-spacing:0.3px;font-weight:400;">${subText}</span>
                </div>
                <span class="env-badge" id="${tab.id}-badge" style="display:none;"></span>
            `;
            tab.style.cssText = 'flex:1;padding:8px 4px;border:none;background:transparent;color:var(--text-secondary);font-size:12px;font-weight:600;cursor:pointer;font-family:var(--font-family);border-bottom:2px solid transparent;transition:all 0.2s;text-align:center;display:flex;flex-direction:column;align-items:center;';
        }
    });
    
    // 确保激活状态正确
    var activeTab = document.querySelector('.env-tab-btn.active');
    if (activeTab) {
        activeTab.style.color = 'var(--text-primary)';
        activeTab.style.borderBottomColor = 'var(--accent-color)';
    }
    
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
