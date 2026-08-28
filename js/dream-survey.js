// dream-survey.js - 梦向问卷系统（完整版）
(function() {
    'use strict';

    // =============================================
    // 1. 配置与常量
    // =============================================
    const DAILY_KEY = 'dreamSurvey_daily';
    const CUSTOM_KEY = 'dreamSurvey_custom_list';
    const REPLY_KEY = 'dreamSurvey_reply_cache';

    // 内置恋爱向每日问题池（可自由增删改）
    const DEFAULT_QUESTIONS = [
        { q: '你最喜欢我身上哪个小习惯？', type: 'choice', options: ['笑容', '声音', '走路姿势', '说话语气'] },
        { q: '我们第一次约会时，你心里在想什么？', type: 'choice', options: ['好紧张', 'TA好可爱', '时间过快点', '想牵TA的手'] },
        { q: '你希望我们下次旅行去哪里？', type: 'choice', options: ['海边', '雪山', '古镇', '游乐园'] },
        { q: '我做过最让你心动的一件事是什么？', type: 'text' },
        { q: '如果只能用3个词形容我们的关系，你会选哪3个？', type: 'text' },
        { q: '你更喜欢清晨醒来看到我，还是夜晚睡前抱着我？', type: 'choice', options: ['清晨', '夜晚', '都要！', '听你的'] },
        { q: '你觉得我像什么动物？为什么？', type: 'text' },
        { q: '如果我们一起养宠物，你想养什么？', type: 'choice', options: ['狗', '猫', '兔子', '仓鼠'] },
        { q: '你最近一次偷偷想我是什么时候？', type: 'text' },
        { q: '你更喜欢拥抱还是亲吻？', type: 'choice', options: ['拥抱', '亲吻', '击掌', '都超爱'] },
        { q: '你觉得我们之间最默契的一件事是什么？', type: 'text' },
        { q: '如果明天是世界末日，你今天最想和我做什么？', type: 'choice', options: ['吃大餐', '看电影', '聊天到天亮', '紧紧抱着'] },
        { q: '我的哪句话曾让你瞬间破防？', type: 'text' },
        { q: '你觉得我们十年后会在哪里？', type: 'choice', options: ['还是老地方', '环游世界', '有了自己的家', '只要有彼此就行'] },
        { q: '今天想对我说的一句悄悄话是？', type: 'text' }
    ];

    // =============================================
    // 2. 工具函数
    // =============================================
    function _getCustomList() {
        try {
            return JSON.parse(localStorage.getItem(CUSTOM_KEY)) || [];
        } catch { return []; }
    }
    function _setCustomList(list) {
        localStorage.setItem(CUSTOM_KEY, JSON.stringify(list));
    }
    function _getDailyRecord() {
        try {
            return JSON.parse(localStorage.getItem(DAILY_KEY)) || {};
        } catch { return {}; }
    }
    function _setDailyRecord(rec) {
        localStorage.setItem(DAILY_KEY, JSON.stringify(rec));
    }

    // 获取所有可用问题（内置 + 自定义）
    function _getAllQuestions() {
        const customs = _getCustomList();
        return [...DEFAULT_QUESTIONS, ...customs];
    }

    // 获取自定义回复库（字卡）
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
        return (typeof settings !== 'undefined' && settings.partnerName) ? settings.partnerName : '亲爱的';
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
            console.warn('[梦向问卷] addMessage 未定义，但已记录答案:', text);
            try {
                let log = JSON.parse(localStorage.getItem('dreamSurvey_log') || '[]');
                log.push({ time: new Date().toISOString(), text });
                localStorage.setItem('dreamSurvey_log', JSON.stringify(log));
            } catch(e) {}
        }
    }

    // =============================================
    // 3. 每日随机弹出逻辑
    // =============================================
    function _checkDailyPopup() {
        const today = new Date().toDateString();
        const record = _getDailyRecord();
        if (record.lastDate === today) return;
        const PROBABILITY = 0.4;
        if (Math.random() > PROBABILITY) return;
        const allQ = _getAllQuestions();
        if (allQ.length === 0) return;
        const question = _randomPick(allQ);
        record.lastDate = today;
        _setDailyRecord(record);
        _showSurveyModal(question, true);
    }

    // =============================================
    // 4. 问卷弹窗渲染（通用：每日随机 / 自定义创建）
    // =============================================
    function _showSurveyModal(question, isDaily = false) {
        const old = document.getElementById('dream-survey-modal');
        if (old) old.remove();

        const wrap = document.createElement('div');
        wrap.id = 'dream-survey-modal';
        wrap.style.cssText = `
            position:fixed;inset:0;z-index:10000;
            display:flex;align-items:center;justify-content:center;
            background:rgba(0,0,0,0.6);backdrop-filter:blur(12px);
            -webkit-backdrop-filter:blur(12px);
            animation: fadeIn 0.3s ease;
        `;

        const inner = document.createElement('div');
        inner.style.cssText = `
            background:var(--primary-bg);
            border-radius:24px;padding:28px 24px;
            width:min(440px, 92vw);
            max-height:80vh;
            overflow-y:auto;
            box-shadow:0 24px 64px rgba(0,0,0,0.3);
            border:1px solid var(--border-color);
            position:relative;
        `;

        // 标题
        const header = document.createElement('div');
        header.style.cssText = 'display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;';
        const titleSpan = document.createElement('span');
        titleSpan.style.cssText = 'font-size:20px;font-weight:700;color:var(--text-primary);';
        titleSpan.textContent = isDaily ? '💕 梦向小问卷' : '📝 自定义梦向问卷';
        header.appendChild(titleSpan);
        const closeBtn = document.createElement('button');
        closeBtn.textContent = '✕';
        closeBtn.style.cssText = 'background:none;border:none;font-size:22px;color:var(--text-secondary);cursor:pointer;padding:0 6px;';
        closeBtn.onclick = () => wrap.remove();
        header.appendChild(closeBtn);
        inner.appendChild(header);

        // 问题内容
        const qDiv = document.createElement('div');
        qDiv.style.cssText = 'font-size:17px;font-weight:600;color:var(--text-primary);margin-bottom:18px;line-height:1.6;padding:12px 16px;background:rgba(var(--accent-color-rgb),0.06);border-radius:16px;border-left:4px solid var(--accent-color);';
        qDiv.textContent = question.q;
        inner.appendChild(qDiv);

        // 答题区域
        const answerArea = document.createElement('div');
        answerArea.id = 'dream-answer-area';
        answerArea.style.cssText = 'margin-bottom:16px;';

        let selectedValue = null;
        let selectedCards = [];

        if (question.type === 'choice' && question.options && question.options.length > 0) {
            const optWrap = document.createElement('div');
            optWrap.style.cssText = 'display:flex;flex-direction:column;gap:8px;';
            question.options.forEach(opt => {
                const btn = document.createElement('button');
                btn.textContent = opt;
                btn.style.cssText = `
                    padding:12px 16px;
                    background:var(--secondary-bg);
                    border:2px solid var(--border-color);
                    border-radius:12px;
                    color:var(--text-primary);
                    font-size:14px;
                    cursor:pointer;
                    text-align:left;
                    transition:all 0.2s;
                    font-family:var(--font-family);
                `;
                btn.onmouseover = () => { btn.style.borderColor = 'var(--accent-color)'; };
                btn.onmouseout = () => { if (!btn.classList.contains('active')) btn.style.borderColor = 'var(--border-color)'; };
                btn.onclick = () => {
                    document.querySelectorAll('#dream-answer-area .opt-btn').forEach(b => {
                        b.classList.remove('active');
                        b.style.borderColor = 'var(--border-color)';
                        b.style.background = 'var(--secondary-bg)';
                    });
                    btn.classList.add('active');
                    btn.style.borderColor = 'var(--accent-color)';
                    btn.style.background = 'rgba(var(--accent-color-rgb),0.12)';
                    selectedValue = opt;
                };
                btn.className = 'opt-btn';
                optWrap.appendChild(btn);
            });
            answerArea.appendChild(optWrap);
        } else {
            // 解答题：字卡拼凑
            const cards = _getReplyCards();
            if (cards.length === 0) {
                const emptyHint = document.createElement('div');
                emptyHint.style.cssText = 'color:var(--text-secondary);font-size:14px;padding:10px;text-align:center;';
                emptyHint.textContent = '⚠️ 字卡库为空，请在自定义回复库中添加字卡。';
                answerArea.appendChild(emptyHint);
            } else {
                const tip = document.createElement('div');
                tip.style.cssText = 'font-size:13px;color:var(--text-secondary);margin-bottom:10px;';
                tip.textContent = '✏️ 请从下方选择 1~3 张字卡，拼成一句回答（点击即可添加）：';
                answerArea.appendChild(tip);

                const selectedWrap = document.createElement('div');
                selectedWrap.id = 'selected-cards-display';
                selectedWrap.style.cssText = `
                    display:flex;flex-wrap:wrap;gap:6px;
                    background:rgba(var(--accent-color-rgb),0.05);
                    border-radius:12px;padding:10px 12px;
                    min-height:44px;
                    margin-bottom:12px;
                    border:1px dashed var(--border-color);
                    align-items:center;
                `;
                selectedWrap.innerHTML = '<span style="color:var(--text-secondary);font-size:12px;">点击下方字卡添加到此处...</span>';
                answerArea.appendChild(selectedWrap);

                const cardGrid = document.createElement('div');
                cardGrid.style.cssText = 'display:flex;flex-wrap:wrap;gap:8px;max-height:160px;overflow-y:auto;padding:4px 0;';
                cards.forEach(cardText => {
                    const cardBtn = document.createElement('button');
                    cardBtn.textContent = cardText;
                    cardBtn.style.cssText = `
                        padding:6px 14px;
                        background:var(--secondary-bg);
                        border:1.5px solid var(--border-color);
                        border-radius:20px;
                        color:var(--text-primary);
                        font-size:13px;
                        cursor:pointer;
                        transition:all 0.2s;
                        font-family:var(--font-family);
                        white-space:nowrap;
                    `;
                    cardBtn.onmouseover = () => { cardBtn.style.borderColor = 'var(--accent-color)'; };
                    cardBtn.onmouseout = () => { if (!cardBtn.classList.contains('selected')) cardBtn.style.borderColor = 'var(--border-color)'; };
                    cardBtn.onclick = () => {
                        const isSelected = cardBtn.classList.contains('selected');
                        if (isSelected) {
                            cardBtn.classList.remove('selected');
                            cardBtn.style.borderColor = 'var(--border-color)';
                            cardBtn.style.background = 'var(--secondary-bg)';
                            const idx = selectedCards.indexOf(cardText);
                            if (idx > -1) selectedCards.splice(idx, 1);
                        } else {
                            if (selectedCards.length >= 3) {
                                _notify('最多只能选3张字卡哦！', 'warning', 1500);
                                return;
                            }
                            cardBtn.classList.add('selected');
                            cardBtn.style.borderColor = 'var(--accent-color)';
                            cardBtn.style.background = 'rgba(var(--accent-color-rgb),0.15)';
                            selectedCards.push(cardText);
                        }
                        const display = document.getElementById('selected-cards-display');
                        if (display) {
                            if (selectedCards.length === 0) {
                                display.innerHTML = '<span style="color:var(--text-secondary);font-size:12px;">点击下方字卡添加到此处...</span>';
                            } else {
                                display.innerHTML = selectedCards.map(t => 
                                    `<span style="background:var(--accent-color);color:#fff;padding:4px 12px;border-radius:16px;font-size:13px;">${_esc(t)}</span>`
                                ).join(' ');
                            }
                        }
                    };
                    cardBtn.className = 'card-grid-btn';
                    cardGrid.appendChild(cardBtn);
                });
                answerArea.appendChild(cardGrid);

                const clearBtn = document.createElement('button');
                clearBtn.textContent = '清空所选';
                clearBtn.style.cssText = `
                    margin-top:8px;padding:4px 12px;background:none;border:none;
                    color:var(--text-secondary);font-size:12px;cursor:pointer;text-decoration:underline;
                `;
                clearBtn.onclick = () => {
                    selectedCards = [];
                    document.querySelectorAll('#dream-answer-area .card-grid-btn').forEach(b => {
                        b.classList.remove('selected');
                        b.style.borderColor = 'var(--border-color)';
                        b.style.background = 'var(--secondary-bg)';
                    });
                    const display = document.getElementById('selected-cards-display');
                    if (display) display.innerHTML = '<span style="color:var(--text-secondary);font-size:12px;">点击下方字卡添加到此处...</span>';
                };
                answerArea.appendChild(clearBtn);
            }
        }

        inner.appendChild(answerArea);

        // 底部按钮
        const btnGroup = document.createElement('div');
        btnGroup.style.cssText = 'display:flex;gap:10px;margin-top:8px;';
        const cancelBtn = document.createElement('button');
        cancelBtn.textContent = '关闭';
        cancelBtn.style.cssText = 'flex:1;padding:11px;border:1px solid var(--border-color);border-radius:12px;background:var(--secondary-bg);color:var(--text-secondary);font-size:14px;cursor:pointer;';
        cancelBtn.onclick = () => wrap.remove();

        const submitBtn = document.createElement('button');
        submitBtn.textContent = isDaily ? '💌 发送回答' : '✅ 提交问卷';
        submitBtn.style.cssText = 'flex:2;padding:11px;border:none;border-radius:12px;background:var(--accent-color);color:#fff;font-size:14px;font-weight:700;cursor:pointer;';
        submitBtn.onclick = () => {
            let finalAnswer = '';
            let isValid = false;

            if (question.type === 'choice') {
                if (selectedValue) {
                    finalAnswer = selectedValue;
                    isValid = true;
                } else {
                    _notify('请先选择一个选项哦', 'warning');
                    return;
                }
            } else {
                if (selectedCards.length === 0) {
                    _notify('请至少选择1张字卡组成回答', 'warning');
                    return;
                }
                finalAnswer = selectedCards.join('');
                isValid = true;
            }

            if (!isValid) return;

            const pName = _getPartnerName();
            const myName = _getMyName();
            const prefix = isDaily ? '✨ 今日梦向回答' : '📝 问卷回答';
            const fullMsg = `${prefix}：${question.q}\n→ ${finalAnswer}`;
            _sendAsMessage(fullMsg, true);

            try {
                let history = JSON.parse(localStorage.getItem('dreamSurvey_history') || '[]');
                history.push({
                    date: new Date().toISOString(),
                    question: question.q,
                    answer: finalAnswer,
                    type: question.type
                });
                localStorage.setItem('dreamSurvey_history', JSON.stringify(history));
            } catch(e) {}

            _notify('💕 回答已发送！', 'success', 1800);
            wrap.remove();

            if (isDaily && typeof simulateReply === 'function') {
                setTimeout(() => {
                    const reactions = ['💕 收到你的回答啦，好甜~', '🥰 这是今天最棒的惊喜！', '❤️ 我会好好珍藏这个回答'];
                    _sendAsMessage(_randomPick(reactions), true);
                }, 1200);
            }
        };

        btnGroup.appendChild(cancelBtn);
        btnGroup.appendChild(submitBtn);
        inner.appendChild(btnGroup);

        wrap.appendChild(inner);
        document.body.appendChild(wrap);

        if (!document.getElementById('dream-survey-style')) {
            const style = document.createElement('style');
            style.id = 'dream-survey-style';
            style.textContent = `
                @keyframes fadeIn {
                    from { opacity: 0; transform: scale(0.95); }
                    to { opacity: 1; transform: scale(1); }
                }
            `;
            document.head.appendChild(style);
        }
    }

    // =============================================
    // 5. 创建问卷表单（保留原有）
    // =============================================
    window.openDreamSurveyBuilder = function() {
        const old = document.getElementById('dream-builder-modal');
        if (old) old.remove();

        const wrap = document.createElement('div');
        wrap.id = 'dream-builder-modal';
        wrap.style.cssText = `
            position:fixed;inset:0;z-index:10001;
            display:flex;align-items:center;justify-content:center;
            background:rgba(0,0,0,0.6);backdrop-filter:blur(12px);
            -webkit-backdrop-filter:blur(12px);
        `;

        const inner = document.createElement('div');
        inner.style.cssText = `
            background:var(--primary-bg);
            border-radius:24px;padding:28px 24px;
            width:min(460px, 92vw);
            max-height:85vh;
            overflow-y:auto;
            box-shadow:0 24px 64px rgba(0,0,0,0.3);
            border:1px solid var(--border-color);
        `;

        inner.innerHTML = `
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;">
                <span style="font-size:20px;font-weight:700;color:var(--text-primary);">🧸 创建梦向问卷</span>
                <button id="dream-builder-close" style="background:none;border:none;font-size:22px;color:var(--text-secondary);cursor:pointer;">✕</button>
            </div>
            <div style="margin-bottom:14px;">
                <label style="font-weight:600;color:var(--text-primary);font-size:14px;">问题内容 *</label>
                <input id="dream-q-input" type="text" placeholder="例如：你今天最想和我分享什么？" style="width:100%;padding:10px;border:1.5px solid var(--border-color);border-radius:10px;background:var(--secondary-bg);color:var(--text-primary);font-size:14px;margin-top:4px;box-sizing:border-box;font-family:var(--font-family);">
            </div>
            <div style="margin-bottom:14px;">
                <label style="font-weight:600;color:var(--text-primary);font-size:14px;">题型</label>
                <select id="dream-type-select" style="width:100%;padding:10px;border:1.5px solid var(--border-color);border-radius:10px;background:var(--secondary-bg);color:var(--text-primary);font-size:14px;margin-top:4px;font-family:var(--font-family);">
                    <option value="choice">选择题（单选）</option>
                    <option value="text">解答题（字卡拼凑）</option>
                </select>
            </div>
            <div id="dream-options-wrap" style="margin-bottom:16px;">
                <label style="font-weight:600;color:var(--text-primary);font-size:14px;">选项（仅选择题需要，用英文逗号分隔）</label>
                <input id="dream-options-input" type="text" placeholder="例如：选项A, 选项B, 选项C" style="width:100%;padding:10px;border:1.5px solid var(--border-color);border-radius:10px;background:var(--secondary-bg);color:var(--text-primary);font-size:14px;margin-top:4px;box-sizing:border-box;font-family:var(--font-family);">
            </div>
            <div style="display:flex;gap:10px;margin-top:8px;">
                <button id="dream-builder-cancel" style="flex:1;padding:11px;border:1px solid var(--border-color);border-radius:12px;background:var(--secondary-bg);color:var(--text-secondary);font-size:14px;cursor:pointer;">取消</button>
                <button id="dream-builder-save" style="flex:2;padding:11px;border:none;border-radius:12px;background:var(--accent-color);color:#fff;font-size:14px;font-weight:700;cursor:pointer;">保存到问卷池</button>
            </div>
        `;

        wrap.appendChild(inner);
        document.body.appendChild(wrap);

        const close = () => wrap.remove();
        document.getElementById('dream-builder-close').onclick = close;
        document.getElementById('dream-builder-cancel').onclick = close;
        wrap.onclick = (e) => { if (e.target === wrap) close(); };

        const typeSelect = document.getElementById('dream-type-select');
        const optWrap = document.getElementById('dream-options-wrap');
        typeSelect.onchange = () => {
            optWrap.style.display = typeSelect.value === 'choice' ? 'block' : 'none';
        };

        document.getElementById('dream-builder-save').onclick = () => {
            const q = document.getElementById('dream-q-input').value.trim();
            if (!q) {
                _notify('请输入问题内容', 'warning');
                return;
            }
            const type = typeSelect.value;
            let options = [];
            if (type === 'choice') {
                const raw = document.getElementById('dream-options-input').value.trim();
                options = raw.split(',').map(s => s.trim()).filter(Boolean);
                if (options.length < 2) {
                    _notify('选择题至少需要2个选项', 'warning');
                    return;
                }
            }

            const list = _getCustomList();
            list.push({ q, type, options });
            _setCustomList(list);
            close();
            _notify(`✅ 问卷已添加！当前共 ${list.length + DEFAULT_QUESTIONS.length} 个问题`, 'success');
        };
    };

    // =============================================
    // 6. 问卷管理主界面（列表 + 创建入口）
    // =============================================
    window.openDreamSurveyManager = function() {
        const old = document.getElementById('dream-manager-modal');
        if (old) old.remove();

        const wrap = document.createElement('div');
        wrap.id = 'dream-manager-modal';
        wrap.style.cssText = `
            position:fixed;inset:0;z-index:10001;
            display:flex;align-items:center;justify-content:center;
            background:rgba(0,0,0,0.6);backdrop-filter:blur(12px);
            -webkit-backdrop-filter:blur(12px);
            animation:fadeIn 0.3s ease;
        `;

        const inner = document.createElement('div');
        inner.style.cssText = `
            background:var(--primary-bg);
            border-radius:24px;padding:24px 20px;
            width:min(460px, 92vw);
            max-height:80vh;
            overflow-y:auto;
            box-shadow:0 24px 64px rgba(0,0,0,0.3);
            border:1px solid var(--border-color);
            display:flex;
            flex-direction:column;
        `;

        // 标题
        const header = document.createElement('div');
        header.style.cssText = 'display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;';
        header.innerHTML = `
            <span style="font-size:20px;font-weight:700;color:var(--text-primary);">🧸 梦向问卷</span>
            <button id="dream-manager-close" style="background:none;border:none;font-size:22px;color:var(--text-secondary);cursor:pointer;">✕</button>
        `;
        inner.appendChild(header);

        // 问卷列表
        const listContainer = document.createElement('div');
        listContainer.id = 'dream-manager-list';
        listContainer.style.cssText = 'flex:1;overflow-y:auto;margin-bottom:16px;';

        const allQuestions = _getAllQuestions();
        const customList = _getCustomList();

        if (allQuestions.length === 0) {
            listContainer.innerHTML = `
                <div style="text-align:center;padding:40px 20px;color:var(--text-secondary);">
                    <div style="font-size:48px;margin-bottom:12px;">📋</div>
                    <div style="font-size:16px;font-weight:600;margin-bottom:6px;">还没有问卷</div>
                    <div style="font-size:13px;opacity:0.7;">点击“创建新问卷”开始吧~</div>
                </div>
            `;
        } else {
            let html = `<div style="display:flex;flex-direction:column;gap:10px;">`;
            allQuestions.forEach((q, index) => {
                // 判断是否为自定义（通过内容匹配，也可用id）
                const isCustom = customList.some(c => c.q === q.q && c.type === q.type);
                const typeLabel = q.type === 'choice' ? '选择题' : '解答题';
                const deleteBtn = isCustom ? 
                    `<button class="dream-delete-btn" data-index="${index}" style="background:none;border:none;color:#ff6b6b;cursor:pointer;font-size:14px;padding:0 4px;" title="删除此问卷">✕</button>` : 
                    '';
                html += `
                    <div style="display:flex;align-items:center;justify-content:space-between;padding:12px 14px;background:var(--secondary-bg);border-radius:12px;border:1px solid var(--border-color);">
                        <div style="flex:1;min-width:0;">
                            <div style="font-size:14px;font-weight:500;color:var(--text-primary);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${_esc(q.q)}</div>
                            <div style="font-size:11px;color:var(--text-secondary);margin-top:4px;">
                                <span style="background:rgba(var(--accent-color-rgb),0.12);padding:2px 8px;border-radius:10px;">${typeLabel}</span>
                                ${isCustom ? '<span style="margin-left:6px;opacity:0.6;">(自定义)</span>' : ''}
                            </div>
                        </div>
                        ${deleteBtn}
                    </div>
                `;
            });
            html += `</div>`;
            listContainer.innerHTML = html;

            // 绑定删除事件
            listContainer.querySelectorAll('.dream-delete-btn').forEach(btn => {
                btn.addEventListener('click', function(e) {
                    e.stopPropagation();
                    const index = parseInt(this.dataset.index);
                    const all = _getAllQuestions();
                    const target = all[index];
                    if (!target) return;
                    if (!confirm(`确定要删除问卷：「${target.q}」吗？`)) return;
                    let custom = _getCustomList();
                    custom = custom.filter(c => !(c.q === target.q && c.type === target.type));
                    _setCustomList(custom);
                    // 刷新管理界面
                    openDreamSurveyManager();
                    _notify('问卷已删除', 'info', 1500);
                });
            });
        }

        inner.appendChild(listContainer);

        // 底部按钮
        const btnGroup = document.createElement('div');
        btnGroup.style.cssText = 'display:flex;gap:10px;';
        const createBtn = document.createElement('button');
        createBtn.textContent = '➕ 创建新问卷';
        createBtn.style.cssText = 'flex:2;padding:12px;border:none;border-radius:12px;background:var(--accent-color);color:#fff;font-size:14px;font-weight:700;cursor:pointer;';
        createBtn.onclick = function() {
            wrap.remove();
            window.openDreamSurveyBuilder();
        };
        const closeBtn = document.createElement('button');
        closeBtn.textContent = '关闭';
        closeBtn.style.cssText = 'flex:1;padding:12px;border:1px solid var(--border-color);border-radius:12px;background:var(--secondary-bg);color:var(--text-secondary);font-size:14px;cursor:pointer;';
        closeBtn.onclick = () => wrap.remove();
        btnGroup.appendChild(createBtn);
        btnGroup.appendChild(closeBtn);
        inner.appendChild(btnGroup);

        wrap.appendChild(inner);
        document.body.appendChild(wrap);

        // 点击背景关闭
        wrap.addEventListener('click', function(e) {
            if (e.target === wrap) wrap.remove();
        });

        document.getElementById('dream-manager-close').addEventListener('click', () => wrap.remove());
    };

    // =============================================
    // 7. 初始化：每日弹出
    // =============================================
    function _init() {
        setTimeout(() => {
            _checkDailyPopup();
        }, 2500);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', _init);
    } else {
        _init();
    }

    // 暴露调试方法
    window.forceCheckDailySurvey = _checkDailyPopup;
    window.viewDreamHistory = function() {
        try {
            const h = JSON.parse(localStorage.getItem('dreamSurvey_history') || '[]');
            if (h.length === 0) {
                _notify('暂无问卷回答记录', 'info');
                return;
            }
            const last = h.slice(-5).reverse();
            let msg = '📜 最近5条问卷记录：\n';
            last.forEach(item => {
                const date = new Date(item.date).toLocaleString();
                msg += `\n[${date}] ${item.question}\n→ ${item.answer}\n`;
            });
            alert(msg);
        } catch(e) {
            alert('读取记录失败');
        }
    };

    console.log('[梦向问卷] 系统已加载。每日随机问卷已启动，高级功能中可点击“梦向问卷”管理。');
})();
