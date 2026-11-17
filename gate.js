/* ============================================================
   gate.js · 完整版口令门（礼貌性门槛 · 西红精算系列通用版）
   ------------------------------------------------------------
   · 作用：被引入的页面若未解锁，先遮罩正文，显示口令卡。
   · 口令发布位置：知识星球「西红精算」置顶帖
     星球入口 https://t.zsxq.com/Bs0tQ
   · 统一口令：与 cas25-guide 相同（星球置顶帖一期一口令）。
   · 解锁后写 localStorage（key: xh_vip_unlocked），同域下
     西红精算系列知识库共享，一次输入全站长期有效。
   · 诚实声明：纯前端口令只能挡住"随手翻看"，挡不住懂
     开发者工具的人；定位是"礼貌性会员标识"而非硬防线。
   · 自包含：本文件自带样式注入，不依赖各库 style.css。
   ============================================================ */
(function () {
  'use strict';

  /* 口令散列（当前口令：XHJS25 —— 更换后需重算并同步星球置顶帖与各库 premium.html） */
  var PASS_HASH = 3664108585;
  var STORE_KEY = 'xh_vip_unlocked';

  function djb2(str) {
    var h = 5381;
    for (var i = 0; i < str.length; i++) {
      h = (h * 33 + str.charCodeAt(i)) >>> 0;
    }
    return h >>> 0;
  }

  function unlocked() {
    try { return localStorage.getItem(STORE_KEY) === '1'; }
    catch (e) { return false; }
  }

  function injectCss() {
    if (document.getElementById('gate-css')) return;
    var st = document.createElement('style');
    st.id = 'gate-css';
    st.textContent =
      'body.gated .main > *:not(.gate-panel){display:none !important}' +
      '.gate-panel{max-width:640px;margin:48px auto 64px;padding:0 20px}' +
      '.gate-card{background:#fffdf7;border:1px solid #e5ddc9;border-top:4px solid #b53d2e;border-radius:12px;box-shadow:0 10px 30px rgba(43,42,38,.12);padding:40px 36px 32px;text-align:center;font-family:"PingFang SC","Microsoft YaHei",serif,sans-serif;color:#2b2a26;line-height:1.8}' +
      '.gate-lock{font-size:40px;line-height:1;margin-bottom:14px}' +
      '.gate-card h2{font-size:22px;color:#2f6b5a;margin-bottom:8px}' +
      '.gate-ch{font-size:15px;color:#6f6b63;margin-bottom:14px}' +
      '.gate-points{text-align:left;max-width:460px;margin:0 auto 22px;padding-left:20px;color:#6f6b63;font-size:14px;line-height:1.9}' +
      '.gate-input-row{display:flex;gap:10px;max-width:420px;margin:0 auto}' +
      '.gate-input{flex:1;padding:11px 14px;border:1px solid #e5ddc9;border-radius:8px;font-size:15px;outline:none;transition:border-color .15s;background:#fff}' +
      '.gate-input:focus{border-color:#2f6b5a}' +
      '.gate-input.gate-shake{animation:gate-shake .4s;border-color:#b53d2e}' +
      '@keyframes gate-shake{0%,100%{transform:translateX(0)}25%{transform:translateX(-5px)}50%{transform:translateX(5px)}75%{transform:translateX(-3px)}}' +
      '.gate-btn{padding:11px 22px;background:#2f6b5a;color:#fff;border:none;border-radius:8px;font-size:15px;font-weight:600;cursor:pointer;transition:background .15s}' +
      '.gate-btn:hover{background:#255447}' +
      '.gate-hint{font-size:12.5px;color:#8f8a80;margin-top:10px}' +
      '.gate-links{margin-top:18px;padding-top:16px;border-top:1px dashed #e5ddc9;display:flex;gap:16px;justify-content:center;font-size:14px}' +
      '.gate-links a{color:#b53d2e;text-decoration:none;font-weight:600}' +
      '.gate-links a.gate-back{color:#6f6b63;font-weight:400}' +
      '.gate-unlocked-badge{position:fixed;right:18px;bottom:18px;background:#fffdf7;border:1px solid #e5ddc9;border-radius:20px;padding:6px 14px;font-size:13px;color:#2f6b5a;box-shadow:0 4px 12px rgba(43,42,38,.15);z-index:9999}';
    document.head.appendChild(st);
  }

  function buildGate() {
    var h1 = document.querySelector('h1');
    var chapterTitle = h1 ? h1.textContent.trim() : (document.title || '本章内容');

    var gate = document.createElement('div');
    gate.className = 'gate-panel';
    gate.innerHTML =
      '<div class="gate-card">' +
        '<div class="gate-lock">🔒</div>' +
        '<h2>完整版 · 会员章节</h2>' +
        '<p class="gate-ch"><strong>' + chapterTitle + '</strong> 属于本库完整版内容。</p>' +
        '<ul class="gate-points">' +
          '<li>解锁一次，本机长期有效，西红精算系列知识库通用</li>' +
          '<li>解锁后阅读体验与免费章节完全一致</li>' +
          '<li>口令在知识星球置顶帖公布（不定期轮换）</li>' +
        '</ul>' +
        '<div class="gate-input-row">' +
          '<input type="password" id="gate-pass" class="gate-input" placeholder="输入星球公布的阅读口令" autocomplete="off">' +
          '<button id="gate-btn" class="gate-btn">解锁本章</button>' +
        '</div>' +
        '<p class="gate-hint">口令在知识星球置顶帖公布 · 解锁一次，本机长期有效</p>' +
        '<div class="gate-links">' +
          '<a href="premium.html" class="gate-cta">如何获得口令 →</a>' +
          '<a href="index.html" class="gate-back">← 回免费章节继续读</a>' +
        '</div>' +
      '</div>';

    var container = document.querySelector('.main');
    if (container) container.insertBefore(gate, container.firstChild);

    var input = gate.querySelector('#gate-pass');
    var btn = gate.querySelector('#gate-btn');

    function tryUnlock() {
      var v = (input.value || '').trim();
      if (!v) { input.focus(); return; }
      if (djb2(v) === PASS_HASH) {
        try { localStorage.setItem(STORE_KEY, '1'); } catch (e) {}
        open();
      } else {
        input.classList.add('gate-shake');
        input.value = '';
        setTimeout(function () { input.classList.remove('gate-shake'); }, 400);
        input.focus();
      }
    }

    btn.addEventListener('click', tryUnlock);
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') tryUnlock();
    });
  }

  function lock() {
    document.body.classList.add('gated');
    buildGate();
  }

  function open() {
    document.body.classList.remove('gated');
    var g = document.querySelector('.gate-panel');
    if (g) g.remove();
    var badge = document.createElement('div');
    badge.className = 'gate-unlocked-badge';
    badge.title = '完整版已解锁（口令记住在本机）';
    badge.textContent = '🔓 已解锁';
    document.body.appendChild(badge);
  }

  injectCss();

  if (unlocked()) { open(); return; }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      if (!unlocked()) lock(); else open();
    });
  } else {
    lock();
  }
})();
