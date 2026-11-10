/* 长凳投资学 · 知识库 进度脚本：已读打卡（localStorage） */
(function () {
  var KEY = 'changdeng-kb-v1';
  var TOTAL = 30; // 00-28 共 29 篇 + 心法地图
  var id = document.body.getAttribute('data-id');

  function load() {
    try { return JSON.parse(localStorage.getItem(KEY) || '[]'); }
    catch (e) { return []; }
  }
  function save(a) {
    try { localStorage.setItem(KEY, JSON.stringify(a)); } catch (e) {}
  }
  var done = load();
  var count = Math.min(done.length, TOTAL);

  var bar = document.createElement('div');
  bar.className = 'kb-bar';

  if (id) {
    var isDone = done.indexOf(id) !== -1;
    var btn = document.createElement('button');
    btn.textContent = isDone ? '✓ 已读' : '标记已读';
    if (isDone) btn.className = 'done';
    btn.addEventListener('click', function () {
      var a = load();
      var i = a.indexOf(id);
      if (i === -1) { a.push(id); btn.textContent = '✓ 已读'; btn.className = 'done'; }
      else { a.splice(i, 1); btn.textContent = '标记已读'; btn.className = ''; }
      save(a);
      cnt.textContent = '已读 ' + Math.min(a.length, TOTAL) + ' / ' + TOTAL;
    });
    bar.appendChild(btn);
  }
  var cnt = document.createElement('span');
  cnt.className = 'kb-count';
  cnt.textContent = '已读 ' + count + ' / ' + TOTAL;
  bar.appendChild(cnt);
  document.body.appendChild(bar);

  var mini = document.getElementById('kb-mini');
  if (mini) mini.textContent = count + ' / ' + TOTAL;

  // 移动端目录开关
  var tgl = document.getElementById('navtgl');
  var side = document.querySelector('.side');
  var navbtn = document.querySelector('.navbtn');
  if (navbtn && side) {
    navbtn.addEventListener('click', function () { side.classList.toggle('open'); });
    side.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') side.classList.remove('open');
    });
  }
})();
