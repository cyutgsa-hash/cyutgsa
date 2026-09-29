/* 畢聯會背景音樂＋歌詞（所有頁面共用）
 * 網站外框 index.html 負責播放音樂，各頁面（home.html、fee.html、booking.html…）在框裡切換，
 * 換頁時音樂不會中斷。每個頁面的 </body> 前都要有：<script src="music.js"></script>
 * 音檔：music/bgm.mp3
 */
(function () {
  const FRAME_ID = "page";
  const inShell = (() => { try { return window.parent !== window && !!window.parent.document.getElementById(FRAME_ID); } catch (e) { return false; } })();
  const isShell = !!document.getElementById(FRAME_ID);

  // 0) 外框被載入到自己的框裡（例如舊連結指向 index.html）：直接改載入要去的頁面，避免畫面空白
  if (inShell && isShell) {
    const want = decodeURIComponent(location.hash.slice(1));
    location.replace(/^[\w-]+\.html/.test(want) ? want : "home.html");
    return;
  }

  // 1) 在外框裡的頁面：不放播放器，只留出底部空間，點擊時通知外框開始播放
  if (inShell) {
    const st = document.createElement("style");
    st.textContent = "body{padding-bottom:96px}";
    document.head.appendChild(st);
    ["pointerdown", "keydown", "touchstart"].forEach(ev => addEventListener(ev, () => {
      try { window.parent.__bgmKick && window.parent.__bgmKick({}); } catch (e) {}
    }, { capture: true, passive: true }));
    return;
  }

  // 2) 直接打開某個頁面（例如別人分享 booking.html 的連結）：轉到外框，音樂才能跨頁接續
  if (!isShell) {
    const file = location.pathname.split("/").pop() || "home.html";
    location.replace("index.html#" + file + location.search.replace(/^\?/, "?") + location.hash.replace(/^#/, "#"));
    return;
  }

  // 3) 外框本身：放播放器和歌詞
  const frame = document.getElementById(FRAME_ID);
  const SAFE = /^([\w-]+\.html)(\?[\w=&%-]*)?(#[\w-]*)?$/;
  const start = decodeURIComponent(location.hash.slice(1));
  frame.src = SAFE.test(start) && !/^index\.html/.test(start) ? start : "home.html";
  frame.addEventListener("load", () => {
    try {
      const w = frame.contentWindow, loc = w.location;
      const path = loc.pathname.split("/").pop() + loc.search + loc.hash;
      history.replaceState(null, "", "#" + path);
      document.title = w.document.title;
    } catch (e) {}
  });

  initPlayer();

  function initPlayer() {

(function () {
  if (document.getElementById("player")) return;
  const style = document.createElement("style");
  style.textContent = ".player,dialog.lyrics{--ink:#221C17;--ground:#F5EFE4;--accent:#9A3B28;--paper:#FFFFFF;--line:#DCD2C2;--muted:#6B5F52;--no-bg:#F9E6E0;--serif:\"Noto Serif TC\",\"Songti TC\",serif;font-family:\"Noto Sans TC\",\"PingFang TC\",\"Microsoft JhengHei\",sans-serif;line-height:1.7;box-sizing:border-box}\n.player *,dialog.lyrics *{box-sizing:border-box}\n.player b,.player span{margin:0}\ndialog.lyrics h2,dialog.lyrics h3,dialog.lyrics .ly-head p{margin:0}\ndialog.lyrics .ly-sec p{margin:0 0 14px;font-size:17px;line-height:1.9}\ndialog.lyrics .ly-sec h3{font-size:13px}\nbody.has-player{padding-bottom:96px}\n/* music player */\n.player{position:fixed;left:clamp(12px,3vw,32px);bottom:clamp(12px,3vw,32px);z-index:20;display:flex;align-items:center;gap:12px;background:var(--ink);color:var(--ground);border-radius:999px;padding:8px 18px 8px 8px;box-shadow:0 8px 24px rgba(34,28,23,.25)}\n.player[hidden]{display:none}\n.player button{flex:none;width:44px;height:44px;border-radius:50%;border:none;cursor:pointer;display:grid;place-items:center;background:var(--accent);color:#fff}\n.player button.mute{background:transparent;color:var(--ground);width:36px;height:44px}\n.player .info{display:flex;flex-direction:column;line-height:1.3;min-width:0}\n.player .info b{font-size:14px;white-space:nowrap}.player{position:fixed}.player button.skip{width:32px;height:44px;background:transparent;color:var(--ground)}.player button.skip[hidden],.player .lyr-btn[hidden]{display:none}.player .queue{position:absolute;left:0;bottom:calc(100% + 10px);min-width:260px;max-width:min(360px,calc(100vw - 24px));max-height:50vh;overflow:auto;margin:0;padding:8px;list-style:none;background:var(--ink);border-radius:16px;box-shadow:0 12px 32px rgba(34,28,23,.35)}.player .queue[hidden]{display:none}.player .queue button{width:100%;height:auto;min-height:44px;border-radius:10px;background:transparent;color:var(--ground);display:flex;align-items:center;gap:10px;padding:8px 12px;font:inherit;font-size:14px;text-align:left}.player .queue button:hover{background:rgba(255,255,255,.08)}.player .queue button[aria-current=true]{background:rgba(227,164,143,.18);color:#F3C6B6;font-weight:700}.player .queue .n{width:1.5em;flex:none;color:#CDBFA9;font-variant-numeric:tabular-nums}.player .seek-row{display:flex;align-items:center;gap:8px;margin-top:2px}.player input.seek[type=range]{width:150px;height:18px;margin:0;accent-color:#E3A48F;cursor:pointer}.player input.seek::-webkit-slider-runnable-track{height:4px}.player input.seek::-webkit-slider-thumb{margin-top:-5px}\n.player .info span{font-size:12px;color:#CDBFA9;font-variant-numeric:tabular-nums}\n.player input[type=range]{width:96px;accent-color:#E3A48F;cursor:pointer}\n.player.playing .eq i{animation:eq 1s ease-in-out infinite}\n.eq{display:flex;align-items:flex-end;gap:2px;height:14px}\n.eq i{width:3px;height:4px;background:#E3A48F;border-radius:1px}\n.eq i:nth-child(2){animation-delay:.2s!important}.eq i:nth-child(3){animation-delay:.4s!important}\n@keyframes eq{0%,100%{height:4px}50%{height:14px}}\n@media (prefers-reduced-motion:reduce){.player.playing .eq i{animation:none;height:10px}}\n@media (max-width:560px){.player #mvol{display:none}.player .lyr-btn{padding:0 10px}.player .info b{display:block;max-width:104px;overflow:hidden;text-overflow:ellipsis}.player{gap:6px!important;padding-right:10px}.player input.seek[type=range]{width:84px}.player button.skip{width:26px}.player .info span,.player .mute,.player .eq{display:none}.player input[type=range]{width:64px}.player{gap:8px}}\n\n/* lyrics */\n.player .lyr-btn{width:auto;height:36px;padding:0 14px;border-radius:999px;background:rgba(255,255,255,.12);color:var(--ground);font:inherit;font-size:14px;font-weight:700}\ndialog.lyrics{width:min(560px,calc(100% - 24px));max-height:min(86vh,900px);padding:0;border:none;border-radius:20px;background:var(--paper);color:var(--ink);box-shadow:0 20px 60px rgba(34,28,23,.35)}\ndialog.lyrics::backdrop{background:rgba(34,28,23,.55)}\n.ly-head{position:sticky;top:0;z-index:1;display:flex;align-items:center;justify-content:space-between;gap:16px;padding:20px 24px;background:var(--paper);border-bottom:1px solid var(--line)}\n.ly-head h2{font-family:var(--serif);font-weight:900;font-size:24px;line-height:1.3}\n.ly-head p{font-size:13px;color:var(--muted)}\n.ly-close{flex:none;width:44px;height:44px;border-radius:50%;border:1.5px solid var(--line);background:none;font-size:22px;cursor:pointer;color:var(--ink)}\n.ly-body{padding:8px 24px 32px;text-align:center}\n.ly-legend{display:flex;justify-content:center;flex-wrap:wrap;gap:8px;margin:16px 0 4px}\n.ly-sec{padding:24px 0;border-bottom:1px dashed var(--line)}\n.ly-sec:last-child{border-bottom:none}\n.ly-sec h3{font-size:13px;letter-spacing:.18em;color:var(--accent);text-transform:uppercase;margin-bottom:14px;display:flex;justify-content:center;align-items:center;gap:8px}\n.ly-sec h3 small{letter-spacing:.05em;color:var(--muted);font-weight:500}\n.ly-sec p{margin:0 0 14px;font-size:17px;line-height:1.9}\n.ly-v{display:block;width:max-content;margin:0 auto 4px;font-size:11px;font-weight:700;padding:1px 10px;border-radius:999px;letter-spacing:.1em}\n.ly-v.ly-m{background:#E4ECF3;color:#28445C}\n.ly-v.ly-f{background:var(--no-bg,#F9E6E0);color:var(--accent)}\n.ly-v.ly-duet{background:#FFF3C4;color:#7A5A12}\n.ly-v.ly-all{background:var(--ink);color:var(--ground)}\np.ly-all,p.ly-duet{font-weight:700}\n\n/* lyrics sync */\n.ly-body.synced p[class^=\"ly-\"]{opacity:.38;transition:opacity .35s,transform .35s;cursor:pointer;transform-origin:center}\n.ly-body.synced p.on{opacity:1;transform:scale(1.06);color:var(--ink)}\n.ly-body.synced p.done{opacity:.6}\n.ly-play{flex:none;width:44px;height:44px;border-radius:50%;border:none;background:var(--accent);color:#fff;cursor:pointer;display:grid;place-items:center}\n.ly-tools{display:flex;gap:8px}\n.timing{position:sticky;bottom:0;z-index:1;display:flex;flex-direction:column;gap:10px;padding:14px 24px 18px;background:var(--ground);border-top:1px solid var(--line)}\n.timing[hidden]{display:none}\n.timing .row{display:flex;gap:8px;flex-wrap:wrap;align-items:center}\n.timing button{font:inherit;font-weight:700;min-height:44px;padding:0 18px;border-radius:999px;border:1.5px solid var(--ink);background:none;color:var(--ink);cursor:pointer}\n.timing button.main{background:var(--accent);border-color:var(--accent);color:#fff;flex:1}\n.timing textarea{width:100%;min-height:90px;font:12px/1.5 ui-monospace,monospace;border:1px solid var(--line);border-radius:8px;padding:8px}\n.timing small{color:var(--muted)}\n@media (prefers-reduced-motion:reduce){.ly-body.synced p.on{transform:none}}";
  document.head.appendChild(style);
  const wrap = document.createElement("div");
  wrap.innerHTML = "<div class=\"player\" id=\"player\" hidden>\n  <button class=\"skip\" id=\"mprev\" type=\"button\" aria-label=\"上一首\" hidden><svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"currentColor\" aria-hidden=\"true\"><rect x=\"5\" y=\"5\" width=\"2.5\" height=\"14\" rx=\"1\"/><path d=\"M19 5v14L8.5 12z\"/></svg></button>\n  <button id=\"mplay\" type=\"button\" aria-label=\"播放音樂\">\n    <svg id=\"icon-play\" width=\"18\" height=\"18\" viewBox=\"0 0 24 24\" fill=\"currentColor\" aria-hidden=\"true\"><path d=\"M7 4.5v15l13-7.5z\"/></svg>\n    <svg id=\"icon-pause\" width=\"18\" height=\"18\" viewBox=\"0 0 24 24\" fill=\"currentColor\" aria-hidden=\"true\" style=\"display:none\"><rect x=\"6\" y=\"4.5\" width=\"4\" height=\"15\" rx=\"1\"/><rect x=\"14\" y=\"4.5\" width=\"4\" height=\"15\" rx=\"1\"/></svg>\n  </button>\n  <button class=\"skip\" id=\"mnext\" type=\"button\" aria-label=\"下一首\" hidden><svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"currentColor\" aria-hidden=\"true\"><rect x=\"16.5\" y=\"5\" width=\"2.5\" height=\"14\" rx=\"1\"/><path d=\"M5 5v14l10.5-7z\"/></svg></button>\n  <div class=\"info\">\n    <b id=\"mtitle\">32 逐光</b>\n    <div class=\"seek-row\"><input id=\"mseek\" class=\"seek\" type=\"range\" min=\"0\" max=\"1000\" value=\"0\" step=\"1\" aria-label=\"播放進度\"><span id=\"mtime\">0:00</span></div>\n  </div>\n  <span class=\"eq\" aria-hidden=\"true\"><i></i><i></i><i></i></span>\n  <button class=\"mute\" id=\"mmute\" type=\"button\" aria-label=\"靜音\">\n    <svg id=\"icon-vol\" width=\"20\" height=\"20\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M4 9v6h4l5 4V5L8 9z\"/><path d=\"M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12\"/></svg>\n    <svg id=\"icon-muted\" width=\"20\" height=\"20\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\" style=\"display:none\"><path d=\"M4 9v6h4l5 4V5L8 9z\"/><path d=\"M17 9l5 6M22 9l-5 6\"/></svg>\n  </button>\n  <button class=\"lyr-btn\" id=\"mlist\" type=\"button\" aria-haspopup=\"true\" aria-expanded=\"false\" aria-controls=\"mqueue\" hidden>歌單</button>\n  <button class=\"lyr-btn\" id=\"mlyr\" type=\"button\" aria-haspopup=\"dialog\">歌詞</button>\n  <input id=\"mvol\" type=\"range\" min=\"0\" max=\"100\" value=\"50\" aria-label=\"音量\">\n  <audio id=\"bgm\" preload=\"metadata\"></audio>\n  <ol class=\"queue\" id=\"mqueue\" hidden></ol>\n</div>" + "<dialog class=\"lyrics\" id=\"lyrics\" aria-labelledby=\"ly-title\">\n  <div class=\"ly-head\">\n    <div><h2 id=\"ly-title\">32屆逐光畢聯會</h2><p>畢聯會主題曲・歌詞</p></div>\n    <div class=\"ly-tools\">\n      <button class=\"ly-play\" id=\"ly-play\" type=\"button\" aria-label=\"播放音樂\"><svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"currentColor\" aria-hidden=\"true\"><path d=\"M7 4.5v15l13-7.5z\"/></svg></button>\n      <button class=\"ly-close\" id=\"ly-close\" type=\"button\" aria-label=\"關閉歌詞\">×</button>\n    </div>\n  </div>\n  <div class=\"ly-body\">\n    <div class=\"ly-legend\"><span class=\"ly-v ly-m\">男</span><span class=\"ly-v ly-f\">女</span><span class=\"ly-v ly-duet\">男女</span><span class=\"ly-v ly-all\">全員</span></div>\n<section class=\"ly-sec\"><h3>Intro<small>男聲</small></h3>\n<p class=\"ly-m\"><span class=\"ly-v ly-m\">男</span>Hey！</p>\n<p class=\"ly-m\">誰說站在台前<br>才叫做主角？</p>\n<p class=\"ly-f\"><span class=\"ly-v ly-f\">女</span>有些故事<br>總要有人在背後<br>把它變得更精彩。</p>\n<p class=\"ly-duet\"><span class=\"ly-v ly-duet\">男女</span>32<br>逐光畢聯會！</p>\n</section>\n<section class=\"ly-sec\"><h3>Verse 1<small>男聲</small></h3>\n<p class=\"ly-m\"><span class=\"ly-v ly-m\">男</span>一個想法<br>從一句「要不要試試看」</p>\n<p class=\"ly-m\">變成一場活動<br>再變成大家期待的那一天</p>\n<p class=\"ly-f\"><span class=\"ly-v ly-f\">女</span>一通電話<br>一個訊息<br>一張張行程表</p>\n<p class=\"ly-f\">有人找場地<br>有人想企劃<br>有人忙到手機都沒電啦</p>\n<p class=\"ly-m\"><span class=\"ly-v ly-m\">男</span>有人負責衝<br>有人負責想</p>\n<p class=\"ly-f\"><span class=\"ly-v ly-f\">女</span>有人在大家看不到的地方<br>把細節一項一項補上</p>\n<p class=\"ly-duet\"><span class=\"ly-v ly-duet\">男女</span>我們不是為了站在聚光燈下<br>我們只是想把事情做好啊</p>\n</section>\n<section class=\"ly-sec\"><h3>Pre-Chorus<small>女聲</small></h3>\n<p class=\"ly-f\"><span class=\"ly-v ly-f\">女</span>你說想要一場<br>值得記住的活動</p>\n<p class=\"ly-m\"><span class=\"ly-v ly-m\">男</span>那我們就想辦法<br>把它變成真的</p>\n<p class=\"ly-f\"><span class=\"ly-v ly-f\">女</span>你說還差一點</p>\n<p class=\"ly-m\"><span class=\"ly-v ly-m\">男</span>那我們再改一遍</p>\n<p class=\"ly-duet\"><span class=\"ly-v ly-duet\">男女</span>因為你們的期待<br>就是我們前進的理由</p>\n</section>\n<section class=\"ly-sec\"><h3>Chorus<small>男女</small></h3>\n<p class=\"ly-m\"><span class=\"ly-v ly-m\">男</span>32！</p>\n<p class=\"ly-f\"><span class=\"ly-v ly-f\">女</span>逐光！</p>\n<p class=\"ly-duet\"><span class=\"ly-v ly-duet\">男女</span>畢聯會！</p>\n<p class=\"ly-duet\">我們把每個想法<br>變成看得見的畫面</p>\n<p class=\"ly-duet\">32！</p>\n<p class=\"ly-duet\">逐光！</p>\n<p class=\"ly-duet\">畢聯會！</p>\n<p class=\"ly-duet\">不只是三個字<br>是我們一起完成的每一天</p>\n<p class=\"ly-f\"><span class=\"ly-v ly-f\">女</span>你們負責享受這一刻</p>\n<p class=\"ly-m\"><span class=\"ly-v ly-m\">男</span>我們負責把細節準備好</p>\n<p class=\"ly-duet\"><span class=\"ly-v ly-duet\">男女</span>不用記得我們的名字</p>\n<p class=\"ly-duet\">只要記得<br>這一刻真的很好</p>\n</section>\n<section class=\"ly-sec\"><h3>Verse 2<small>女聲</small></h3>\n<p class=\"ly-f\"><span class=\"ly-v ly-f\">女</span>有人問<br>「你們到底在忙什麼？」</p>\n<p class=\"ly-m\"><span class=\"ly-v ly-m\">男</span>其實也沒什麼<br>就是想讓每件事更好一點</p>\n<p class=\"ly-f\"><span class=\"ly-v ly-f\">女</span>一個活動<br>一份服務<br>一個小小的驚喜</p>\n<p class=\"ly-m\"><span class=\"ly-v ly-m\">男</span>看起來只是幾分鐘</p>\n<p class=\"ly-m\">但背後可能<br>準備了好幾個星期</p>\n<p class=\"ly-f\"><span class=\"ly-v ly-f\">女</span>有時候累<br>有時候真的很想放棄</p>\n<p class=\"ly-m\"><span class=\"ly-v ly-m\">男</span>但看到大家玩得開心</p>\n<p class=\"ly-duet\"><span class=\"ly-v ly-duet\">男女</span>就知道<br>這一切都值得繼續</p>\n</section>\n<section class=\"ly-sec\"><h3>Pre-Chorus<small>男女</small></h3>\n<p class=\"ly-f\"><span class=\"ly-v ly-f\">女</span>我們不需要掌聲</p>\n<p class=\"ly-m\"><span class=\"ly-v ly-m\">男</span>也不用站在最前面</p>\n<p class=\"ly-f\"><span class=\"ly-v ly-f\">女</span>只要事情順利</p>\n<p class=\"ly-m\"><span class=\"ly-v ly-m\">男</span>只要大家開心</p>\n<p class=\"ly-duet\"><span class=\"ly-v ly-duet\">男女</span>那就是我們<br>最想看到的畫面</p>\n</section>\n<section class=\"ly-sec\"><h3>Chorus<small>男女</small></h3>\n<p class=\"ly-m\"><span class=\"ly-v ly-m\">男</span>32！</p>\n<p class=\"ly-f\"><span class=\"ly-v ly-f\">女</span>逐光！</p>\n<p class=\"ly-duet\"><span class=\"ly-v ly-duet\">男女</span>畢聯會！</p>\n<p class=\"ly-duet\">我們把每個想法<br>變成看得見的畫面</p>\n<p class=\"ly-duet\">32！</p>\n<p class=\"ly-duet\">逐光！</p>\n<p class=\"ly-duet\">畢聯會！</p>\n<p class=\"ly-duet\">這一次<br>讓我們一起把故事寫得更精彩</p>\n<p class=\"ly-f\"><span class=\"ly-v ly-f\">女</span>你們往前走</p>\n<p class=\"ly-m\"><span class=\"ly-v ly-m\">男</span>我們負責在後面</p>\n<p class=\"ly-duet\"><span class=\"ly-v ly-duet\">男女</span>把每一個需要<br>接住一點</p>\n</section>\n<section class=\"ly-sec\"><h3>Bridge<small>R&amp;B</small></h3>\n<p class=\"ly-f\"><span class=\"ly-v ly-f\">女</span>也許你不知道<br>誰準備了這一場</p>\n<p class=\"ly-m\"><span class=\"ly-v ly-m\">男</span>也許你不知道<br>誰改了多少遍方案</p>\n<p class=\"ly-f\"><span class=\"ly-v ly-f\">女</span>但沒關係</p>\n<p class=\"ly-m\"><span class=\"ly-v ly-m\">男</span>真的沒關係</p>\n<p class=\"ly-duet\"><span class=\"ly-v ly-duet\">男女</span>因為我們知道<br>為什麼要做這一切</p>\n<p class=\"ly-f\"><span class=\"ly-v ly-f\">女</span>不是為了成為主角</p>\n<p class=\"ly-m\"><span class=\"ly-v ly-m\">男</span>而是讓每個主角<br>都有一個精彩的舞台</p>\n</section>\n<section class=\"ly-sec\"><h3>Final Chorus<small>男女＋全員</small></h3>\n<p class=\"ly-duet\"><span class=\"ly-v ly-duet\">男女</span>32！</p>\n<p class=\"ly-duet\">逐光！</p>\n<p class=\"ly-duet\">畢聯會！</p>\n<p class=\"ly-duet\">把每一份期待<br>都變成最好的安排</p>\n<p class=\"ly-duet\">32！</p>\n<p class=\"ly-duet\">逐光！</p>\n<p class=\"ly-duet\">畢聯會！</p>\n<p class=\"ly-duet\">我們一起<br>把每個瞬間點亮起來</p>\n<p class=\"ly-f\"><span class=\"ly-v ly-f\">女</span>你們負責發光</p>\n<p class=\"ly-m\"><span class=\"ly-v ly-m\">男</span>我們負責逐光</p>\n<p class=\"ly-duet\"><span class=\"ly-v ly-duet\">男女</span>一起把想做的事情<br>做到最好！</p>\n<p class=\"ly-all\"><span class=\"ly-v ly-all\">全員</span>32！</p>\n<p class=\"ly-all\">逐光！</p>\n<p class=\"ly-all\">畢聯會！</p>\n<p class=\"ly-all\">32！</p>\n<p class=\"ly-all\">逐光！</p>\n<p class=\"ly-all\">畢聯會！</p>\n</section>\n<section class=\"ly-sec\"><h3>Outro<small>男女</small></h3>\n<p class=\"ly-f\"><span class=\"ly-v ly-f\">女</span>我們不是主角。</p>\n<p class=\"ly-m\"><span class=\"ly-v ly-m\">男</span>但我們一直都在。</p>\n<p class=\"ly-duet\"><span class=\"ly-v ly-duet\">男女</span>為每一個需要的人<br>把路照亮。</p>\n<p class=\"ly-duet\">32。</p>\n<p class=\"ly-duet\">逐光畢聯會。</p>\n</section>\n  </div>\n  <div class=\"timing\" id=\"timing\" hidden>\n    <small id=\"tm-info\">幹部用：按「開始」後音樂從頭播放，每一段歌詞<b>開始唱的瞬間</b>按「下一句」（或空白鍵）。</small>\n    <div class=\"row\">\n      <button type=\"button\" id=\"tm-start\">開始</button>\n      <button type=\"button\" class=\"main\" id=\"tm-next\" disabled>下一句（空白鍵）</button>\n      <button type=\"button\" id=\"tm-undo\" disabled>上一步</button>\n    </div>\n    <textarea id=\"tm-out\" readonly hidden></textarea>\n  </div>\n</dialog>";
  while (wrap.firstChild) document.body.appendChild(wrap.firstChild);
  
})();

  // ▼ 歌單：新增歌曲就在這裡加一行（mp3 放在 music 資料夾）
  //   lyrics: true 代表這首顯示歌詞；timed: true 代表歌詞會跟著音樂捲動（用這首的時間軸）
  const PLAYLIST = [
    { title: "32屆逐光畢聯會", src: "music/bgm.mp3", lyrics: true, timed: true },
    { title: "32屆逐光畢聯會（版本二）", src: "music/bgm2.mp3", lyrics: true },
  ];

  (function () {
    const $ = id => document.getElementById(id);
    const a = $("bgm"), box = $("player"), vol = $("mvol");
    const store = {
      get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
      set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
    };
    // ---- 歌單 ----
    const multi = PLAYLIST.length > 1;
    let idx = 0;
    const queue = $("mqueue"), listBtn = $("mlist");
    $("mprev").hidden = $("mnext").hidden = listBtn.hidden = !multi;
    PLAYLIST.forEach((song, k) => {
      const li = document.createElement("li");
      const b = document.createElement("button");
      b.type = "button";
      b.innerHTML = '<span class="n">' + (k + 1) + '</span><span class="t"></span>';
      b.querySelector(".t").textContent = song.title;
      b.addEventListener("click", () => { load(k, true); closeQueue(); });
      li.appendChild(b); queue.appendChild(li);
    });
    let wantPlay = false;
    function load(k, play, at) {
      wantPlay = !!play;
      idx = (k + PLAYLIST.length) % PLAYLIST.length;
      const song = PLAYLIST[idx];
      a.src = song.src;
      a.loop = !multi;
      a.dataset.lyrics = song.lyrics ? "1" : "";
      a.dataset.timed = song.lyrics && song.timed ? "1" : "";
      $("mtitle").textContent = song.title;
      $("mlyr").hidden = !song.lyrics;
      queue.querySelectorAll("button").forEach((b, n) => b.setAttribute("aria-current", n === idx ? "true" : "false"));
      if (at) a.addEventListener("loadedmetadata", () => { if (a.duration) a.currentTime = at % a.duration; }, { once: true });
      if (play) a.play().catch(() => {});
      window.dispatchEvent(new CustomEvent("bgm-song", { detail: idx }));
      try { writeState(); } catch (e) {}   // 還沒準備好時略過
    }
    const closeQueue = () => { queue.hidden = true; listBtn.setAttribute("aria-expanded", "false"); };
    listBtn.addEventListener("click", () => { queue.hidden = !queue.hidden; listBtn.setAttribute("aria-expanded", String(!queue.hidden)); });
    addEventListener("pointerdown", e => { if (!queue.hidden && !e.target.closest("#mqueue, #mlist")) closeQueue(); });
    addEventListener("keydown", e => { if (e.key === "Escape") closeQueue(); });
    $("mprev").addEventListener("click", () => {
      if (a.currentTime > 3) { a.currentTime = 0; return; }   // 播超過 3 秒時，先回到這首開頭
      load(idx - 1, true);
    });
    $("mnext").addEventListener("click", () => load(idx + 1, true));
    a.addEventListener("ended", () => { if (multi) load(idx + 1, true); });

    const saved = store.get("bgm-vol");
    vol.value = saved !== null ? saved : 50;
    a.volume = vol.value / 100;

    const fmt = t => isFinite(t) ? Math.floor(t / 60) + ":" + String(Math.floor(t % 60)).padStart(2, "0") : "0:00";
    a.addEventListener("loadedmetadata", () => { box.hidden = false; $("mtime").textContent = "0:00 / " + fmt(a.duration); });
    const seek = $("mseek");
    let dragging = false;
    const paintSeek = () => {
      const pct = a.duration ? (a.currentTime / a.duration) * 100 : 0;
      if (!dragging) seek.value = Math.round(pct * 10);
      seek.style.background = "";
    };
    a.addEventListener("timeupdate", () => { $("mtime").textContent = fmt(a.currentTime) + " / " + fmt(a.duration); paintSeek(); });
    a.addEventListener("loadedmetadata", paintSeek);
    // 拖曳進度條：拖的時候只顯示時間，放開才跳過去
    seek.addEventListener("input", () => {
      dragging = true;
      if (a.duration) $("mtime").textContent = fmt(seek.value / 1000 * a.duration) + " / " + fmt(a.duration);
    });
    seek.addEventListener("change", () => {
      if (a.duration) a.currentTime = seek.value / 1000 * a.duration;
      dragging = false;
    });
    seek.addEventListener("keydown", e => {   // 鍵盤左右鍵每次跳 5 秒
      if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
        e.preventDefault();
        a.currentTime = Math.max(0, Math.min(a.duration || 0, a.currentTime + (e.key === "ArrowRight" ? 5 : -5)));
      }
    });
    let failed = 0;
    a.addEventListener("error", () => {          // 檔案找不到：有下一首就跳過，全部都失敗才隱藏播放器
      failed++;
      if (multi && failed < PLAYLIST.length) load(idx + 1, wantPlay);
      else box.hidden = true;
    });
    a.addEventListener("playing", () => { failed = 0; });

    function sync() {
      const on = !a.paused;
      box.classList.toggle("playing", on);
      $("icon-play").style.display = on ? "none" : "";
      $("icon-pause").style.display = on ? "" : "none";
      $("mplay").setAttribute("aria-label", on ? "暫停音樂" : "播放音樂");
      const m = a.muted || a.volume === 0;
      $("icon-vol").style.display = m ? "none" : "";
      $("icon-muted").style.display = m ? "" : "none";
      $("mmute").setAttribute("aria-label", m ? "取消靜音" : "靜音");
    }
    a.addEventListener("play", sync); a.addEventListener("pause", sync); a.addEventListener("volumechange", sync);

    $("mplay").addEventListener("click", () => {
      if (a.paused) { a.play().catch(() => {}); store.set("bgm-off", ""); }
      else { a.pause(); store.set("bgm-off", "1"); }   // 使用者自己按暫停，下次就不自動播放
    });

    // ▼ 自動播放：瀏覽器通常禁止有聲音的自動播放，被擋下時改成「使用者第一次點擊或按鍵時」開始
    const AUTOPLAY = true;

    // ▼ 換頁接續播放：記住播放位置，到別的分頁會從同一個地方繼續
    const readState = () => { try { return JSON.parse(sessionStorage.getItem("bgm-state") || localStorage.getItem("bgm-state") || "null"); } catch (e) { return null; } };
    const writeState = () => {
      const v = JSON.stringify({ i: idx, t: a.currentTime, playing: !a.paused, at: Date.now() });
      try { sessionStorage.setItem("bgm-state", v); } catch (e) {}
      try { localStorage.setItem("bgm-state", v); } catch (e) {}
    };
    const st = readState();
    let wasPlaying = true;
    const timingMode = new URLSearchParams(location.search).has("timing");
    if (!timingMode && st && Date.now() - st.at < 30 * 60 * 1000 && (st.i || 0) < PLAYLIST.length) {
      wasPlaying = st.playing;
      load(st.i || 0, false, st.t + (st.playing ? Math.min((Date.now() - st.at) / 1000, 5) : 0));
    } else {
      load(0, false);
    }
    let lastSave = 0;
    a.addEventListener("timeupdate", () => { if (Date.now() - lastSave > 1000) { lastSave = Date.now(); writeState(); } });
    a.addEventListener("pause", writeState); a.addEventListener("play", writeState);
    addEventListener("pagehide", writeState);

    // 同時開好幾個瀏覽器分頁時，只讓一個分頁出聲
    let bc = null;
    try { bc = new BroadcastChannel("cyutgsa-bgm"); } catch (e) {}
    if (bc) {
      a.addEventListener("play", () => bc.postMessage("play"));
      bc.onmessage = e => { if (e.data === "play" && !a.paused) { a.pause(); } };
    }
    if (AUTOPLAY && wasPlaying && store.get("bgm-off") !== "1" && !new URLSearchParams(location.search).has("timing")) {
      let started = false;
      const kick = e => {
        if (started) return;
        if (e && e.target && e.target.closest && e.target.closest("#mplay, #ly-play")) { started = true; return; }  // 按的是播放鍵就交給按鈕處理
        a.play().then(() => { started = true; }).catch(() => {});
      };
      window.__bgmKick = kick;   // 框裡的頁面被點擊時也會呼叫
      ["pointerdown", "keydown", "touchstart"].forEach(ev => addEventListener(ev, kick, { capture: true, passive: true }));
      a.play().then(() => { started = true; }).catch(() => {});
    }
    $("mmute").addEventListener("click", () => {
      if (a.volume === 0) { a.volume = 0.5; vol.value = 50; a.muted = false; }
      else a.muted = !a.muted;
    });
    vol.addEventListener("input", () => {
      a.volume = vol.value / 100; a.muted = false; store.set("bgm-vol", vol.value);
    });
    sync();
  })();


  (function () {
    const d = document.getElementById("lyrics");
    document.getElementById("mlyr").addEventListener("click", () => d.showModal());
    document.getElementById("ly-close").addEventListener("click", () => d.close());
    d.addEventListener("click", e => { if (e.target === d) d.close(); });

    // ▼ 歌詞時間軸：每一段歌詞開始的秒數（用 ?timing=1 打點工具產生）
    const LYRIC_TIMES = [];

    const a = document.getElementById("bgm");
    const body = d.querySelector(".ly-body");
    const lines = [...body.querySelectorAll('p[class^="ly-"]')];
    const playBtn = document.getElementById("ly-play");
    const icoPlay = '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M7 4.5v15l13-7.5z"/></svg>';
    const icoPause = '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><rect x="6" y="4.5" width="4" height="15" rx="1"/><rect x="14" y="4.5" width="4" height="15" rx="1"/></svg>';
    const syncBtn = () => { playBtn.innerHTML = a.paused ? icoPlay : icoPause; playBtn.setAttribute("aria-label", a.paused ? "播放音樂" : "暫停音樂"); };
    playBtn.addEventListener("click", () => { a.paused ? a.play().catch(() => {}) : a.pause(); });
    a.addEventListener("play", syncBtn); a.addEventListener("pause", syncBtn);

    // 使用者自己捲動時，暫停自動捲動 4 秒
    let userScrollUntil = 0;
    ["wheel", "touchmove", "keydown"].forEach(ev => d.addEventListener(ev, () => { userScrollUntil = Date.now() + 4000; }, { passive: true }));

    let times = LYRIC_TIMES.length === lines.length ? LYRIC_TIMES : null;
    let cur = -1;
    function highlight(force) {
      if (!times) return;
      if (a.dataset.timed !== "1") {            // 現在播的歌沒有時間軸：清掉高亮
        if (cur !== -1) { cur = -1; lines.forEach(el => el.classList.remove("on", "done")); }
        return;
      }
      const t = a.currentTime;
      let i = -1;
      for (let k = 0; k < times.length; k++) { if (times[k] <= t) i = k; else break; }
      if (i === cur && !force) return;
      cur = i;
      lines.forEach((el, k) => { el.classList.toggle("on", k === i); el.classList.toggle("done", k < i); });
      if (i >= 0 && d.open && Date.now() > userScrollUntil) lines[i].scrollIntoView({ block: "center", behavior: "smooth" });
    }
    function enableSync() {
      body.classList.add("synced");
      lines.forEach((el, k) => el.addEventListener("click", () => { if (times && a.dataset.timed === "1") { a.currentTime = times[k] + 0.01; a.play().catch(() => {}); } }));
      a.addEventListener("timeupdate", () => highlight(false));
      a.addEventListener("seeked", () => highlight(true));
      d.addEventListener("toggle", () => { if (d.open) { userScrollUntil = 0; highlight(true); } });
    }
    if (times) enableSync();

    // 換到沒有歌詞的歌時，關掉歌詞視窗
    addEventListener("bgm-song", () => { if (a.dataset.lyrics !== "1" && d.open) d.close(); cur = -2; highlight(true); });

    // ---- 打點工具（網址加上 ?timing=1 才會出現）----
    if (new URLSearchParams(location.search).has("timing")) {
      const tm = document.getElementById("timing"), out = document.getElementById("tm-out");
      const bStart = document.getElementById("tm-start"), bNext = document.getElementById("tm-next"), bUndo = document.getElementById("tm-undo");
      tm.hidden = false;
      let marks = [];
      const mark = () => {
        lines.forEach((el, k) => { el.classList.toggle("on", k === marks.length); el.classList.toggle("done", k < marks.length); });
        if (lines[marks.length]) lines[marks.length].scrollIntoView({ block: "center", behavior: "smooth" });
        document.getElementById("tm-info").textContent = marks.length < lines.length
          ? `第 ${marks.length + 1} / ${lines.length} 段：等這段開始唱的瞬間按「下一句」`
          : "全部完成！把下面的數字整段複製，傳給網站管理者。";
        if (marks.length >= lines.length) {
          a.pause(); bNext.disabled = true;
          out.hidden = false; out.value = JSON.stringify(marks);
          times = marks.slice(); cur = -1;
        }
      };
      bStart.addEventListener("click", () => {
        marks = []; times = null; out.hidden = true; body.classList.add("synced");
        a.currentTime = 0; a.play().catch(() => {});
        bNext.disabled = false; bUndo.disabled = false; bStart.textContent = "重來"; mark();
      });
      bNext.addEventListener("click", () => { if (marks.length < lines.length) { marks.push(Math.round(a.currentTime * 10) / 10); mark(); } });
      bUndo.addEventListener("click", () => {
        if (!marks.length) return;
        marks.pop(); a.currentTime = Math.max(0, (marks.length ? marks[marks.length - 1] : 0));
        bNext.disabled = false; out.hidden = true; mark();
      });
      d.addEventListener("keydown", e => { if (e.code === "Space" && !bNext.disabled) { e.preventDefault(); bNext.click(); } });
      if (!times) enableSync();
      document.readyState === "complete" ? d.showModal() : addEventListener("load", () => d.showModal());
    }
  })();


  }
})();
