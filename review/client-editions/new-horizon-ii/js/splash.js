
(function(){
  "use strict";
  /* In the site: runs only when the head gate chose to play it (once per session, never under reduced motion) */
  var root = document.documentElement, host = document.getElementById("m2vSplash");
  if (!host) return;
  if (!root.classList.contains("splash-on")) { host.parentNode.removeChild(host); return; }
  window.__m2vSplashClaimed = true;
  try { sessionStorage.setItem("m2v-intro-seen", "1"); } catch (e) {}
  var alive = true;
  /* the page underneath cannot take focus or clicks while the splash is up */
  var inertEls = Array.prototype.filter.call(document.body.children, function(el){ return el !== host && el.tagName !== "SCRIPT"; });
  inertEls.forEach(function(el){ el.inert = true; });
  var $ = function(s){ return document.querySelector(s); };
  var RM = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  var G = window.gsap || null;
  var stage = $("#spStage"), world = $("#spWorld"), sky = $("#spSky"), sun = $("#spSun"), glow = $("#spGlow");
  var arch = $("#spArch"), horizon = $("#spHorizon"), board = $("#spBoard"), copy = $("#spCopy");
  var portal = $("#spPortal"), portalImg = $("#spPortalImg"), skipBtn = $("#spSkip");
  var wordEl = $("#spWord"), fillEl = $("#spFill"), refEl = $("#spReflect"), refHolder = $("#spRefHolder");
  var canvas = $("#spGlitter"), ctx = canvas.getContext("2d");
  var NAME = "Valencia";
  stage.classList.add("sp-pre");
  var IMG_BIG = "img/a4d9c172.webp", IMG_SMALL = "img/624a0d69.webp";

  /* ---------- letters: three layers driven by one state ---------- */
  function build(el){
    var box = el.querySelector(".sp-letters"); box.textContent = "";
    return NAME.split("").map(function(ch){ var s = document.createElement("span"); s.textContent = ch; box.appendChild(s); return s; });
  }
  var LS = build(wordEl), LF = build(fillEl), LR = build(refEl);
  var REST = { w:600, s:30 };
  var st = NAME.split("").map(function(){ return { y:0, w:REST.w, s:REST.s, o:1 }; });
  var prox = st.map(function(){ return 0; });
  var fillState = { p:1 }, sunState = { rise:1 }, orbitState = { o:1 }, glowState = { o:1 };

  /* ---------- layout ---------- */
  var L = {};
  function px(n){ return Math.round(n) + "px"; }
  function layout(){
    resized = true;
    var W = stage.clientWidth, H = stage.clientHeight, mob = W < 700;
    L.W = W; L.H = H;
    var copyH = copy.offsetHeight || 220;
    var hy = Math.round(H * (mob ? 0.56 : 0.6));
    hy = Math.min(hy, H - copyH - (mob ? 70 : 90));
    hy = Math.max(hy, Math.round(H * 0.42));
    L.hy = hy;
    stage.style.setProperty("--hy", hy + "px");
    /* fit the name */
    var target = Math.min(W * (mob ? 0.92 : 0.78), 980);
    [wordEl, fillEl, refEl].forEach(function(e){ e.style.fontSize = "100px"; });
    var w100 = wordEl.querySelector(".sp-letters").getBoundingClientRect().width || 420;
    var fs = Math.min(target / w100 * 100, hy * 0.42);
    L.fs = fs;
    [wordEl, fillEl, refEl].forEach(function(e){ e.style.fontSize = fs + "px"; });
    /* baseline onto the horizon: shift each word by the gap between its box bottom and its baseline */
    var r = wordEl.getBoundingClientRect(), bl = wordEl.querySelector(".sp-bl").getBoundingClientRect();
    var desc = r.bottom - bl.top;
    L.desc = desc;
    wordEl.style.bottom = fillEl.style.bottom = px(-desc);
    refEl.style.position = "absolute"; refEl.style.bottom = px(-desc);
    refHolder.style.height = px(fs * 1.1);
    L.cap = fs * 0.72;
    L.wordW = wordEl.querySelector(".sp-letters").getBoundingClientRect().width;
    /* arch geometry */
    var top = Math.max(mob ? 112 : 100, hy * 0.15);
    var a = Math.min(W * (mob ? 0.34 : 0.3), 300, (hy - top) * 0.62);
    var legH = Math.max(0, (hy - top) - a);
    L.a = a; L.cx = W / 2; L.top = hy - legH - a; L.legH = legH;
    function archD(rad, base){
      var x1 = L.cx - rad, x2 = L.cx + rad, ys = hy - legH;
      return "M" + x1.toFixed(1) + "," + (hy + base).toFixed(1) + " L" + x1.toFixed(1) + "," + ys.toFixed(1) +
             " A" + rad.toFixed(1) + "," + rad.toFixed(1) + " 0 0 1 " + x2.toFixed(1) + "," + ys.toFixed(1) +
             " L" + x2.toFixed(1) + "," + (hy + base).toFixed(1);
    }
    var bx = L.cx - a - 40, by = Math.max(0, L.top - 40), bw = 2 * a + 80, bh = hy - by;
    arch.setAttribute("viewBox", bx.toFixed(1) + " " + by.toFixed(1) + " " + bw.toFixed(1) + " " + bh.toFixed(1));
    arch.setAttribute("width", bw.toFixed(1)); arch.setAttribute("height", bh.toFixed(1));
    L.archBox = [bx, by];
    var oSize = mob ? 12 : 13, iSize = mob ? 16 : 19;
    $("#spTxtO").style.fontSize = oSize + "px"; $("#spTxtI").style.fontSize = iSize + "px";
    $("#spArchLine").setAttribute("d", archD(a, 2));
    $("#spArchLine2").setAttribute("d", archD(a + 6, 2));
    $("#spPOuter").setAttribute("d", archD(a + 14, 40));
    $("#spPInner").setAttribute("d", archD(a - 14 - iSize * 0.72, 40));
    var al = $("#spArchLine").getTotalLength();
    L.archLen = al;
    /* sun */
    var sr = a * 0.5;
    L.sr = sr; L.sunY = hy - L.cap - sr * 0.35;
    sun.style.width = sun.style.height = px(sr * 2);
    /* orbit text: repeat the phrase enough to wrap the arch twice */
    fillOrbit("#spTpO", "HOME FINDING · SCHOOL FINDING · FORMALITIES · RESIDENCE CARDS · HEALTH INSURANCE · LEGAL ADVICE · INTERCULTURAL WORKSHOPS · YOUR FIRST COFFEE · YOUR NEW STREET · ", "O");
    fillOrbit("#spTpI", "casa · llar · hogar · home · benvinguts · bienvenidos · welcome · ", "I");
    /* board */
    var cw = Math.min((W - 32 - 7 * 6) / 8, mob ? 44 : 62), ch = Math.round(cw * 1.36);
    stage.style.setProperty("--cw", px(cw)); stage.style.setProperty("--ch", px(ch));
    L.ch = ch;
    var cellsEl = $("#spCells");
    board.style.top = px(hy - cellsEl.offsetTop - ch / 2);
    L.boardW = cellsEl.offsetWidth || cw * 8;
    /* glitter canvas */
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var sh = H - hy;
    canvas.width = Math.round(W * dpr); canvas.height = Math.round(sh * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    L.sh = sh;
    /* photo inside the letters */
    var img = W > 1000 ? IMG_BIG : IMG_SMALL;
    LF.forEach(function(s){ s.style.backgroundImage = "linear-gradient(180deg,rgba(255,236,214,.1),rgba(140,59,36,.22)), url(" + img + ")"; });
    portalImg.src = img;
    requestAnimationFrame(cacheRects);
    if (state === "exit" || state === "gone") return;
    portal.style.clipPath = archClip(0);
  }
  /* rects read once per layout/state change instead of every frame */
  function cacheRects(){
    if (!L.W) return;
    L.wr = wordEl.getBoundingClientRect(); L.fr = fillEl.getBoundingClientRect();
    L.lc = LS.map(function(s){ var r = s.getBoundingClientRect(); return r.left + r.width / 2; });
  }
  var orbit = { O:{ len:1, el:null }, I:{ len:1, el:null } };
  function fillOrbit(sel, phrase, key){
    var tp = $(sel); tp.textContent = phrase;
    var unit = tp.getComputedTextLength ? tp.getComputedTextLength() : 800;
    var pathLen = $(key === "O" ? "#spPOuter" : "#spPInner").getTotalLength();
    var n = Math.max(2, Math.ceil(pathLen / Math.max(unit, 1)) + 2);
    tp.textContent = new Array(n + 1).join(phrase);
    orbit[key].len = unit; orbit[key].el = tp;
  }
  function archClip(k){
    /* the doorway as an inset() window; k=0 → the arch, k=1 → full screen */
    var a = L.a, top = L.top, left = L.cx - a, right = L.W - (L.cx + a), bottom = L.H - L.hy;
    var t = top * (1 - k), l = left * (1 - k), r = right * (1 - k), b = bottom * (1 - k), rad = a * (1 - k);
    return "inset(" + t.toFixed(1) + "px " + r.toFixed(1) + "px " + b.toFixed(1) + "px " + l.toFixed(1) + "px round " + rad.toFixed(1) + "px " + rad.toFixed(1) + "px 0 0)";
  }

  /* ---------- split-flap board ---------- */
  var CH = " ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  var cells = [];
  (function buildBoard(){
    var wrap = $("#spCells");
    for (var i = 0; i < 8; i++){
      var c = document.createElement("div"); c.className = "sp-cell";
      c.innerHTML = '<div class="sp-h sp-t"><b></b></div><div class="sp-h sp-b"><b></b></div><div class="sp-leaf sp-t"><b></b></div><div class="sp-leaf sp-b"><b></b></div>';
      wrap.appendChild(c);
      var q = c.querySelectorAll("b"), lv = c.querySelectorAll(".sp-leaf");
      cells.push({ el:c, ts:q[0], bs:q[1], ltb:q[2], lbb:q[3], lt:lv[0], lb:lv[1], c:" " });
    }
  })();
  function setCell(cell, ch){ cell.c = ch; cell.ts.textContent = cell.bs.textContent = ch; }
  var runId = 0;
  function sleep(ms, id){ return new Promise(function(res, rej){ setTimeout(function(){ id === runId ? res() : rej("x"); }, ms); }); }
  function flip(cell, next, d, id){
    return new Promise(function(res, rej){
      if (id !== runId) { rej("x"); return; }
      var cur = cell.c;
      cell.ts.textContent = next; cell.bs.textContent = cur; cell.ltb.textContent = cur; cell.lbb.textContent = next;
      cell.lt.style.visibility = cell.lb.style.visibility = "visible";
      var a1 = cell.lt.animate([{ transform:"rotateX(0deg)", filter:"brightness(1)" }, { transform:"rotateX(-90deg)", filter:"brightness(.5)" }], { duration:d / 2, easing:"cubic-bezier(.55,0,1,.45)", fill:"forwards" });
      var a2 = cell.lb.animate([{ transform:"rotateX(90deg)", filter:"brightness(1.5)" }, { transform:"rotateX(0deg)", filter:"brightness(1)" }], { duration:d / 2, delay:d / 2, easing:"cubic-bezier(0,.55,.45,1)", fill:"both" });
      a2.onfinish = function(){
        cell.bs.textContent = next; cell.c = next;
        cell.lt.style.visibility = cell.lb.style.visibility = "hidden";
        a1.cancel(); a2.cancel(); res();
      };
    });
  }
  function pad(w){ var p = Math.floor((8 - w.length) / 2); var s = new Array(p + 1).join(" ") + w; while (s.length < 8) s += " "; return s; }
  function rnd(n){ return Math.floor(Math.random() * n); }
  /* like a real Solari board: each tile rolls forward through the alphabet to its letter (at most 7 steps), so the board reads as a mechanism, not random noise */
  function rollTo(cur, target, maxSteps){
    var a = CH.indexOf(cur), b = CH.indexOf(target), seq = [];
    if (a < 0) a = 0; if (b < 0) b = 0;
    var n = (b - a + CH.length) % CH.length;
    var start = n > maxSteps ? (b - maxSteps + CH.length) % CH.length : a;
    var k = (b - start + CH.length) % CH.length;
    for (var q = 1; q <= k; q++) seq.push(CH[(start + q) % CH.length]);
    return seq;
  }
  function setWord(w, maxSteps, d, id){
    var t = pad(w);
    return Promise.all(cells.map(function(cell, i){
      return sleep(i * 34, id).then(function(){
        var seq = rollTo(cell.c, t[i], maxSteps), chain = Promise.resolve();
        seq.forEach(function(ch, q){ chain = chain.then(function(){ return flip(cell, ch, q === seq.length - 1 ? d * 1.6 : d, id); }); });
        return chain;
      });
    }));
  }

  /* ---------- state + timelines ---------- */
  var state = "rest", tl = null, exitTl = null, t0 = performance.now();
  function setIntroStart(){
    st.forEach(function(s){ s.y = 0.34; s.w = REST.w; s.s = 100; });
    G.set([wordEl, refEl], { opacity:.07, filter:"blur(3px)" });
    fillState.p = 1; sunState.rise = 0; orbitState.o = .08; glowState.o = 0;
    $("#spArchLine").style.strokeDasharray = L.archLen; $("#spArchLine").style.strokeDashoffset = L.archLen;
    $("#spArchLine2").style.opacity = 0;
    G.set(copy.querySelectorAll("[data-in]"), { opacity:0, y:18 });
    G.set(horizon, { opacity:0, scaleX:L.boardW / L.W });
    G.set(board, { opacity:0 });
    G.set(board.querySelectorAll(".sp-board-meta"), { opacity:1 });
    cells.forEach(function(c){ setCell(c, " "); G.set(c.el.querySelectorAll(".sp-h"), { y:0, opacity:1 }); });
    $("#spBoardLabel").textContent = "Departing from"; $("#spBoardStatus").textContent = "Now boarding"; $("#spBoardCode").textContent = "001";
    skipBtn.hidden = false;
  }
  function intro(){
    if (!G || RM){ toRest(); return; }
    state = "intro"; runId++; var id = runId;
    setIntroStart();
    G.to(board, { opacity:1, duration:.3, ease:"power2.out" });
    /* one departure city (a different one on each visit), then Valencia: the name lands in about two seconds */
    var cities = ["LONDON", "NEW YORK", "TORONTO", "BERLIN", "DUBLIN", "CHICAGO", "ZURICH", "SYDNEY"];
    var from = cities[rnd(cities.length)];
    sleep(120, id).then(function(){ return setWord(from, 3, 40, id); }).then(function(){ return sleep(260, id); }).then(function(){
      $("#spBoardLabel").textContent = "Arriving in";
      return setWord("VALENCIA", 4, 44, id);
    }).then(function(){
      $("#spBoardStatus").textContent = "Arrived · Benvinguts"; $("#spBoardCode").textContent = "VLC";
      return sleep(240, id);
    }).then(function(){ landing(id); }).catch(function(){});
  }
  function landing(id){
    if (id !== runId) return;
    var tops = cells.map(function(c){ return c.el.querySelector(".sp-h.sp-t"); }), bots = cells.map(function(c){ return c.el.querySelector(".sp-h.sp-b"); });
    tl = G.timeline({ onComplete:function(){ state = "rest"; cacheRects(); skipBtn.hidden = true; $("#spLive").textContent = "Valencia. Wherever you're starting from, a new horizon."; } });
    tl.to(tops, { y:-L.ch * .55, opacity:0, duration:.55, ease:"power2.in", stagger:{ each:.035, from:"center" } }, 0)
      .to(bots, { y:L.ch * .55, opacity:0, duration:.55, ease:"power2.in", stagger:{ each:.035, from:"center" } }, 0)
      .to(board.querySelectorAll(".sp-board-meta"), { opacity:0, duration:.3 }, 0)
      .set(horizon, { opacity:1 }, .16)
      .to(horizon, { scaleX:1, duration:.95, ease:"expo.inOut" }, .16)
      .to(glowState, { o:1, duration:1.4, ease:"power1.out" }, .3)
      .to(sunState, { rise:1, duration:1.4, ease:"power3.out" }, .3)
      .to([wordEl, refEl], { opacity:1, filter:"blur(0px)", duration:.9, ease:"power2.out", clearProps:"filter" }, .3)
      .to(st, { y:0, s:REST.s, duration:1.1, ease:"expo.out", stagger:.05 }, .38)
      .to("#spArchLine", { strokeDashoffset:0, duration:1.2, ease:"power2.inOut" }, .6)
      .to("#spArchLine2", { opacity:1, duration:.6 }, 1.3)
      .to(orbitState, { o:1, duration:.9, ease:"power1.out" }, 1.05)
      .to(copy.querySelectorAll("[data-in]"), { opacity:1, y:0, duration:.8, ease:"power3.out", stagger:.07 }, 1.15)
      .set(board, { opacity:0 });
  }
  function toRest(){
    runId++;
    if (tl) tl.kill(); tl = null;
    st.forEach(function(s){ s.y = 0; s.w = REST.w; s.s = REST.s; });
    if (G) G.set([wordEl, refEl], { opacity:1, clearProps:"filter" }); else { wordEl.style.opacity = refEl.style.opacity = 1; }
    fillState.p = 1; sunState.rise = 1; orbitState.o = 1; glowState.o = 1;
    var al = $("#spArchLine"); al.style.strokeDasharray = ""; al.style.strokeDashoffset = "";
    $("#spArchLine2").style.opacity = "";
    if (G){ G.set(copy.querySelectorAll("[data-in]"), { opacity:1, y:0 }); G.set(horizon, { opacity:1, scaleX:1 }); G.set(board, { opacity:0 }); }
    else { board.style.opacity = 0; }
    state = "rest"; skipBtn.hidden = true; cacheRects();
  }

  /* enter: the doorway opens onto the real city */
  function enterSite(){
    if (state !== "rest") return;
    state = "exit";
    if (!G || RM){ leave(true); return; }
    var k = { v:0 };
    portal.style.clipPath = archClip(0);
    exitTl = G.timeline({ onComplete:function(){ leave(false); } });
    exitTl.to(copy.querySelectorAll("[data-in]"), { opacity:0, y:12, duration:.4, ease:"power2.in", stagger:.04 }, 0)
      .to(orbitState, { o:0, duration:.45 }, 0)
      .fromTo(portal, { opacity:0 }, { opacity:1, duration:.7, ease:"power2.out" }, .1)
      .fromTo(portalImg, { scale:1.18 }, { scale:1, duration:2, ease:"power3.inOut" }, .1)
      .to(st, { y:1.3, duration:.7, ease:"power3.in", stagger:{ each:.04, from:"edges" } }, .25)
      .to(k, { v:1, duration:1.25, ease:"expo.inOut", onUpdate:function(){ portal.style.clipPath = archClip(k.v); } }, .75)
      .to(world, { scale:1.12, duration:1.4, ease:"expo.inOut" }, .7);
  }
  /* hand over to the page: fade the splash, wake the deferred hero shader, remove the splash */
  function leave(fast){
    if (state === "gone") return;
    state = "gone"; runId++;
    if (tl) { tl.kill(); tl = null; }
    try { window.scrollTo(0, 0); } catch (e) {}
    host.style.transition = "opacity " + (fast ? ".45s" : ".8s") + " ease";
    host.classList.add("sp-leaving");
    setTimeout(finish, fast ? 470 : 830);
  }
  function finish(){
    alive = false;
    if (host.contains(document.activeElement)) document.activeElement.blur();
    inertEls.forEach(function(el){ el.inert = false; });
    root.classList.remove("splash-on");
    window.__m2vIntroActive = false;
    window.removeEventListener("wheel", onWheel, true);
    window.removeEventListener("keydown", onKey, true);
    if (window.__m2vAfterIntro){ var f = window.__m2vAfterIntro; window.__m2vAfterIntro = null; if (window.requestIdleCallback) requestIdleCallback(f, { timeout:1500 }); else setTimeout(f, 600); }
    var vw = document.getElementById("valenciaWord"); if (vw) vw.classList.add("settled");
    if (host.parentNode) host.parentNode.removeChild(host);
    if (window.ScrollTrigger) ScrollTrigger.refresh();
  }

  /* ---------- the frame loop ---------- */
  var mx = 0, my = 0, sx = 0, sy = 0, pxX = -9999, pxY = -9999, touch = false;
  window.addEventListener("pointermove", function(e){
    mx = e.clientX / L.W * 2 - 1; my = e.clientY / L.H * 2 - 1; pxX = e.clientX; pxY = e.clientY;
    touch = e.pointerType === "touch";
  }, { passive:true });
  window.addEventListener("pointerleave", function(){ pxX = pxY = -9999; });
  stage.addEventListener("pointerup", function(e){ if (e.pointerType === "touch") setTimeout(function(){ pxX = pxY = -9999; }, 500); });

  var lan = { x:-999, y:0, r:0 }, OS = { O:0, I:0 }, last = performance.now(), resized = true, frameN = 0;
  function frame(now){
    if (!alive) return;
    var dt = Math.min(.05, (now - last) / 1000); last = now;
    var t = (now - t0) / 1000;
    if (!touch && !RM){ sx += (mx - sx) * .05; sy += (my - sy) * .05; }
    else if (!RM){ sx += (Math.sin(t * .23) * .4 - sx) * .02; sy += (Math.cos(t * .19) * .25 - sy) * .02; }
    /* letter proximity: the type swells where the pointer is */
    var wr = L.wr || (cacheRects(), L.wr), near = state === "rest" && pxX > -999 && pxY > wr.top - L.fs * .5 && pxY < wr.bottom + L.fs * .6;
    for (var i = 0; i < LS.length; i++){
      var f = 0;
      if (near && !RM){ var d = (pxX - L.lc[i]) / (L.fs * .9); f = Math.exp(-d * d); }
      prox[i] += (f - prox[i]) * .12;
    }
    var dirty = false;
    for (i = 0; i < LS.length; i++){
      var s = st[i], p = prox[i];
      var w = s.w + p * (740 - s.w), so = s.s + p * (100 - s.s), y = s.y - p * .025;
      var fv = '"wght" ' + w.toFixed(0) + ',"SOFT" ' + so.toFixed(0) + ',"opsz" 144,"WONK" 1', tf = "translateY(" + y.toFixed(3) + "em)";
      if (LS[i]._fv !== fv){ LS[i]._fv = fv; LS[i].style.fontVariationSettings = LF[i].style.fontVariationSettings = LR[i].style.fontVariationSettings = fv; dirty = true; }
      if (LS[i]._tf !== tf){ LS[i]._tf = tf; LS[i].style.transform = LF[i].style.transform = LR[i].style.transform = tf; }
    }
    /* photo stays continuous across the letters */
    var fl = fillEl.querySelector(".sp-letters");
    if (dirty || fl._w === undefined || resized) { resized = false; var fw = fl.offsetWidth, fh = fl.offsetHeight; fl._w = fw;
    for (i = 0; i < LF.length; i++){
      LF[i].style.backgroundSize = fw + "px " + (fh * 1.15) + "px," + Math.max(fw * 1.5, fh * 4) + "px auto";
      LF[i].style.backgroundPosition = (-LF[i].offsetLeft) + "px 0," + (-LF[i].offsetLeft) + "px 62%";
    } }
    /* lantern: sweeps once in the intro, then follows the pointer */
    var fr = L.fr, tx, ty, tr;
    if (fillState.p < 1){ tx = (-0.15 + 1.3 * fillState.p) * fr.width; ty = fr.height * .55; tr = fillState.p > 0 ? L.fs * 1.05 : 0; lan.x = tx; lan.y = ty; lan.r = tr; }
    else {
      var inside = state === "rest" && pxX > fr.left - L.fs * .6 && pxX < fr.right + L.fs * .6 && pxY > fr.top - L.fs * .7 && pxY < fr.bottom + L.fs * .5;
      tx = inside ? pxX - fr.left : lan.x; ty = inside ? pxY - fr.top : lan.y; tr = inside && !RM ? L.fs * .95 : 0;
      lan.x += (tx - lan.x) * .18; lan.y += (ty - lan.y) * .18; lan.r += (tr - lan.r) * .1;
    }
    var lk = lan.r < .5 ? "off" : lan.x.toFixed(0) + "," + lan.y.toFixed(0) + "," + lan.r.toFixed(0);
    if (fillEl._lk !== lk){
      fillEl._lk = lk;
      if (lk === "off") fillEl.style.visibility = "hidden";
      else { fillEl.style.visibility = ""; fillEl.style.setProperty("--lx", lan.x.toFixed(0) + "px"); fillEl.style.setProperty("--ly", lan.y.toFixed(0) + "px"); fillEl.style.setProperty("--lr", lan.r.toFixed(0) + "px"); }
    }
    /* parallax */
    var wx = sx * -6, ax = sx * 12, ay = sy * 6;
    wordEl.style.transform = fillEl.style.transform = "translateX(calc(-50% + " + wx.toFixed(2) + "px))";
    refEl.style.transform = "translateX(calc(-50% + " + wx.toFixed(2) + "px))";
    arch.style.transform = "translate(" + (L.archBox[0] + ax).toFixed(2) + "px," + (L.archBox[1] + ay).toFixed(2) + "px)";
    arch.style.opacity = 1;
    /* sun */
    var breathe = RM ? 1 : 1 + Math.sin(t * 1.1) * .012;
    var sunY = L.hy + L.sr + (L.sunY - L.hy - L.sr) * sunState.rise;
    sun.style.transform = "translate(" + (L.cx - L.sr + sx * 18).toFixed(1) + "px," + (sunY - L.sr + sy * 8).toFixed(1) + "px) scale(" + breathe.toFixed(4) + ")";
    var go = glowState.o.toFixed(3); if (glow._o !== go){ glow._o = go; glow.style.opacity = go; }
    /* orbiting words */
    var spd = RM ? 0 : 1;
    OS.O += dt * 15 * spd; OS.I += dt * 9 * spd;
    var oo = orbit.O, oi = orbit.I;
    frameN++;
    var orbitTick = frameN % 5 === 0;
    if (oo.el && orbitTick){ oo.el.setAttribute("startOffset", ((OS.O % oo.len) - oo.len).toFixed(1)); }
    if (oi.el && orbitTick){ oi.el.setAttribute("startOffset", (-(OS.I % oi.len)).toFixed(1)); }
    $("#spTxtO").style.opacity = orbitState.o; $("#spTxtI").style.opacity = orbitState.o * .82;
    if (frameN % 3 === 0) drawSea(t);
    requestAnimationFrame(frame);
  }
  function hash(a, b){ var x = Math.sin(a * 127.1 + b * 311.7) * 43758.5453; return x - Math.floor(x); }
  function drawSea(t){
    var W = L.W, h = L.sh, I = sunState.rise, cx = L.cx + sx * 18;
    ctx.clearRect(0, 0, W, h);
    if (I <= 0.001) return;
    var g = ctx.createRadialGradient(cx, 0, 0, cx, 0, L.a * 2.2);
    g.addColorStop(0, "rgba(232,168,138," + (.45 * I).toFixed(3) + ")"); g.addColorStop(1, "rgba(232,168,138,0)");
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, h);
    /* sun glitter: short streaks that widen with depth */
    var y = 3, row = 0, tt = RM ? 0 : t;
    while (y < h){
      var depth = y / h, spread = L.sr * (.55 + depth * 2.2), n = 3 + Math.floor(depth * 5);
      for (var j = 0; j < n; j++){
        var hx = hash(row, j), x = cx + (hx - .5) * 2 * spread + Math.sin(tt * .9 + row * .8 + j) * (3 + depth * 10);
        var flick = .5 + .5 * Math.sin(tt * (2.2 + hx * 2) + row * 1.7 + j * 2.3);
        var a = I * Math.pow(1 - depth, 1.6) * (.15 + .85 * flick) * (1 - Math.abs(hx - .5) * 1.2);
        if (a < .02) continue;
        var w = (4 + hash(j, row) * 22) * (1 + depth * 2.4);
        ctx.fillStyle = depth < .35 ? "rgba(255,250,242," + a.toFixed(3) + ")" : "rgba(224,138,60," + (a * .55).toFixed(3) + ")";
        ctx.fillRect(x - w / 2, y, w, 1 + depth * 1.6);
      }
      y += 2.5 + depth * 9; row++;
    }
    /* dark water bands break the mirrored name up like a real reflection */
    var band = L.fs * 1.05, tb = tt * 6;
    ctx.fillStyle = "rgba(236,222,208,.6)"; var ww = (L.wordW || W) + 40, x0 = L.cx - ww / 2;
    for (var yb = 2; yb < band; ){
      var gap = 3 + (yb / band) * 9, off = (tb + yb * .7) % gap;
      ctx.fillRect(x0, yb + off * .3, ww, 1 + (yb / band) * 1.8);
      yb += gap;
    }
    /* slow swell lines across the water */
    ctx.fillStyle = "rgba(92,79,69,.06)";
    for (var k = 0; k < 9; k++){
      var yy = (Math.pow((k + (tt * .05) % 1) / 9, 1.7)) * h;
      ctx.fillRect(0, yy, W, 1);
    }
  }

  /* ---------- controls: while the splash is up, wheel and keys belong to it (the page underneath must not scroll) ---------- */
  skipBtn.addEventListener("click", function(){ leave(true); });
  $("#spEnter").addEventListener("click", enterSite);
  $("#spReplay").addEventListener("click", function(){ if (state === "rest") { toRest(); intro(); } });
  var SCROLL_KEYS = { ArrowDown:1, ArrowUp:1, PageDown:1, PageUp:1, Home:1, End:1, " ":1 };
  function onKey(e){
    if (state === "gone") return;
    if (e.key === "Escape") { e.preventDefault(); leave(true); return; }
    if (SCROLL_KEYS[e.key] && !(e.key === " " && e.target && e.target.tagName === "BUTTON")) {
      e.preventDefault();
      if (state === "intro") toRest();
      else if (state === "rest" && (e.key === "ArrowDown" || e.key === "PageDown" || e.key === " ")) enterSite();
    }
  }
  window.addEventListener("keydown", onKey, true);
  var wheelLock = 0;
  function onWheel(e){
    if (state === "gone") return;
    e.preventDefault(); e.stopPropagation();
    if (state === "intro" && Math.abs(e.deltaY) > 8) toRest();
    else if (state === "rest" && e.deltaY > 30 && performance.now() > wheelLock) { wheelLock = performance.now() + 1500; enterSite(); }
  }
  window.addEventListener("wheel", onWheel, { capture:true, passive:false });
  var ty0 = null;
  stage.addEventListener("touchstart", function(e){ ty0 = e.touches[0].clientY; }, { passive:true });
  stage.addEventListener("touchmove", function(e){ e.preventDefault(); }, { passive:false });
  stage.addEventListener("touchend", function(e){
    if (ty0 == null) return; var dy = ty0 - e.changedTouches[0].clientY; ty0 = null;
    if (state === "rest" && dy > 70) enterSite();
  }, { passive:true });
  var rz = 0;
  window.addEventListener("resize", function(){ if (!alive) return; cancelAnimationFrame(rz); rz = requestAnimationFrame(function(){ layout(); if (state === "rest" || state === "intro") { var al = $("#spArchLine"); if (state === "rest") { al.style.strokeDasharray = ""; } } }); });

  /* ---------- boot: wait for the faces (max 3.5 s) so measurements are true ---------- */
  var booted = false;
  function boot(){
    if (booted) return; booted = true; window.__m2vSplashBooted = true;
    layout();
    intro();
    requestAnimationFrame(function(t){ stage.classList.remove("sp-pre"); frame(t); });
  }
  if (document.fonts && document.fonts.load){
    Promise.all([document.fonts.load('600 100px "Fraunces"'), document.fonts.load('600 12px "Schibsted Grotesk"')])
      .then(function(){ requestAnimationFrame(boot); }, boot);
    setTimeout(boot, 450);
    document.fonts.addEventListener && document.fonts.addEventListener("loadingdone", function(){ if (!booted || !alive) return; layout(); if (state === "intro") $("#spArchLine").style.strokeDasharray = L.archLen; cacheRects(); });
  } else boot();
})();

