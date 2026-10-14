(function(){
  "use strict";
  var prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var motionOff = prefersReduced;
  document.documentElement.classList.toggle("reduced-motion", prefersReduced);

  /* ---------- Top bar state ---------- */
  var topbar = document.getElementById("topbar");
  function onScrollBar(){ topbar.classList.toggle("scrolled", window.scrollY > window.innerHeight * 0.82); }
  window.addEventListener("scroll", onScrollBar, { passive:true }); onScrollBar();

  /* ---------- Accordions (services + FAQ) ---------- */
  function wireAccordion(scope){
    var buttons = scope.querySelectorAll("button[aria-expanded][aria-controls]");
    buttons.forEach(function(btn){
      btn.addEventListener("click", function(){
        var panel = document.getElementById(btn.getAttribute("aria-controls"));
        var open = btn.getAttribute("aria-expanded") === "true";
        btn.setAttribute("aria-expanded", String(!open));
        if (panel) panel.hidden = open;
      });
    });
  }
  wireAccordion(document);

  /* ---------- Atlas tabs (roving tabindex, touch + keyboard) ---------- */
  var tabs = Array.prototype.slice.call(document.querySelectorAll('[role="tab"]'));
  function selectTab(tab, focus){
    tabs.forEach(function(t){
      var on = t === tab;
      t.setAttribute("aria-selected", String(on));
      t.tabIndex = on ? 0 : -1;
      var p = document.getElementById(t.getAttribute("aria-controls"));
      if (p) p.hidden = !on;
    });
    if (focus) tab.focus();
    if (window.ScrollTrigger && !motionOff) ScrollTrigger.refresh();
  }
  tabs.forEach(function(tab, i){
    tab.addEventListener("click", function(){ selectTab(tab, false); });
    tab.addEventListener("keydown", function(e){
      var j = null;
      if (e.key === "ArrowRight") j = (i + 1) % tabs.length;
      else if (e.key === "ArrowLeft") j = (i - 1 + tabs.length) % tabs.length;
      else if (e.key === "Home") j = 0;
      else if (e.key === "End") j = tabs.length - 1;
      if (j !== null){ e.preventDefault(); selectTab(tabs[j], true); }
    });
  });

  /* Intro "first light": CSS runs the sequence from first paint (see the intro styles); this script only lands the arch on the hero arch, honours skips (any pointer, wheel, touch or key) and cleans up. Once per session, never under reduced motion or Motion off. */
  var heroEl = document.getElementById("hero");
  var introEl = document.getElementById("intro");
  var introState = { playing: false, done: true };
  window.__m2vIntroTiming = { played: false, durationMs: 0, skipped: false };
  function introSeen(){ try { sessionStorage.setItem("m2v-intro-seen", "1"); } catch (e) {} }
  var INTRO_EVENTS = ["pointerdown", "wheel", "touchmove", "keydown"];
  function finishIntro(skipped){
    if (!introState.playing){ introState.done = true; return; }
    introState.playing = false; introState.done = true;
    introSeen();
    window.__m2vIntroTiming = { played: true, durationMs: Math.round(performance.now() - (window.__m2vIntroT0 || 0)), skipped: !!skipped };
    INTRO_EVENTS.forEach(function(ev){ window.removeEventListener(ev, introSkip, true); });
    var root = document.documentElement;
    function clean(){
      root.classList.remove("intro-playing", "intro-go", "intro-leaving");
      window.__m2vIntroActive = false;
      if (window.__m2vAfterIntro){ var f = window.__m2vAfterIntro; window.__m2vAfterIntro = null; if (window.requestIdleCallback) requestIdleCallback(f, { timeout: 1500 }); else setTimeout(f, 700); }
      if (introEl) introEl.style.display = "none";
      var vw = document.getElementById("valenciaWord");
      if (vw) vw.classList.add("settled");
      if (window.ScrollTrigger) ScrollTrigger.refresh();
    }
    if (skipped){ root.classList.add("intro-leaving"); setTimeout(clean, 320); }
    else clean();
  }
  function introSkip(e){
    if (e && e.type === "keydown" && (e.key === "Shift" || e.key === "Alt" || e.key === "Control" || e.key === "Meta")) return;
    finishIntro(true);
  }
  /* Land the intro arch on the hero's own arch (same photograph), so the
     opening frame becomes the hero without a seam. */
  function flipIntroArch(){
    var wrap = document.getElementById("introArchWrap");
    var arch = document.getElementById("introArch");
    var target = document.querySelector("#flArch .frame");
    if (!introState.playing || !wrap || !target || !wrap.animate) return;
    var r = wrap.getBoundingClientRect(), t = target.getBoundingClientRect();
    if (!t.width || !r.width) return;
    wrap.style.animation = "none";
    wrap.style.cssText += ";position:fixed;left:" + r.left + "px;top:" + r.top + "px;width:" + r.width + "px;height:" + r.height + "px;bottom:auto;transform:none;margin:0;z-index:6";
    wrap.animate([
      { left: r.left + "px", top: r.top + "px", width: r.width + "px", height: r.height + "px" },
      { left: t.left + "px", top: t.top + "px", width: t.width + "px", height: t.height + "px" }
    ], { duration: 850, easing: "cubic-bezier(.76,0,.24,1)", fill: "forwards" });
    if (arch && arch.animate) arch.animate([{ borderColor: getComputedStyle(arch).borderTopColor }, { borderColor: "#FFD9B8" }], { duration: 850, easing: "cubic-bezier(.76,0,.24,1)", fill: "forwards" });
  }
  function playIntro(){
    if (!introEl || !heroEl) return;
    window.__m2vIntroClaimed = true;
    introState.playing = true; introState.done = false;
    introSeen(); /* marked at start: a mid-intro reload never replays it */
    INTRO_EVENTS.forEach(function(ev){ window.addEventListener(ev, introSkip, true); });
    window.__m2vIntroActive = true;
    var FLIP_AT = 1700, END_AT = 2600;
    (function whenGo(){
      if (!introState.playing) return;
      if (!window.__m2vIntroT0){ requestAnimationFrame(whenGo); return; }
      var elapsed = performance.now() - window.__m2vIntroT0;
      if (elapsed < FLIP_AT - 60) setTimeout(flipIntroArch, FLIP_AT - elapsed);
      setTimeout(function(){ finishIntro(false); }, Math.max(0, END_AT - elapsed));
    })();
  }
  /* Pointer parallax — the hero's only remaining interactivity (fine
     pointers, transform-only, layers drift a few px against the cursor). */
  if (heroEl && window.matchMedia && matchMedia("(pointer: fine)").matches){
    var plxQueued = false, plxPt = null;
    heroEl.addEventListener("pointermove", function(e){
      if (motionOff || introState.playing) return;
      plxPt = { x: e.clientX, y: e.clientY };
      if (plxQueued) return; plxQueued = true;
      requestAnimationFrame(function(){
        plxQueued = false;
        if (!plxPt || motionOff) return;
        var r = heroEl.getBoundingClientRect();
        var dx = (plxPt.x - r.left) / Math.max(1, r.width) - 0.5;
        var dy = (plxPt.y - r.top) / Math.max(1, r.height) - 0.5;
        heroEl.querySelectorAll("[data-plx]").forEach(function(el){
          var d = parseFloat(el.getAttribute("data-depth") || "6");
          el.style.transform = "translate(" + (dx * d).toFixed(1) + "px," + (dy * d).toFixed(1) + "px)";
        });
      });
    }, { passive: true });
    heroEl.addEventListener("pointerleave", function(){
      heroEl.querySelectorAll("[data-plx]").forEach(function(el){ el.style.transform = ""; });
    });
  }
  var shouldPlayIntro = !!window.__m2vPlayIntro && !motionOff;
  if (shouldPlayIntro){
    playIntro();
  } else {
    introState.done = true;
    if (introEl) introEl.style.display = "none";
    document.documentElement.classList.remove("intro-playing");
    var vw0 = document.getElementById("valenciaWord");
    if (vw0) vw0.classList.add("settled");
  }

  /* ---------- Scroll progress bar (vanilla — works with or without GSAP) ---------- */
  var prog = document.getElementById("scrollProgress");
  function onProgress(){
    if (!prog) return;
    var max = document.documentElement.scrollHeight - window.innerHeight;
    var p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
    prog.style.transform = "scaleX(" + p + ")";
  }
  window.addEventListener("scroll", onProgress, { passive: true });
  window.addEventListener("resize", onProgress); onProgress();

  /* ---------- A day in Valencia — time slider ---------- */
  var DAYS = [
    { time: "08:15 — morning", title: "Coffee in the old town", wash: "linear-gradient(180deg, rgba(255,190,120,.10), rgba(30,60,70,.06))",
      text: "A café con leche or an horchata at Santa Catalina, under two centuries of tiles, before the day starts." },
    { time: "13:30 — midday", title: "The market at midday", wash: "linear-gradient(180deg, rgba(255,240,200,.16), rgba(255,180,90,.05))",
      text: "Russafa's market hall in full colour, shutters half-closed against the sun, lunch stretching longer than planned." },
    { time: "18:30 — afternoon", title: "The sea after work", wash: "linear-gradient(180deg, rgba(150,200,230,.12), rgba(30,70,90,.08))",
      text: "Twenty minutes by tram and the Malvarrosa is still warm — a swim, a walk along the water, the city behind you." },
    { time: "20:05 — evening", title: "The old town turns to amber", wash: "linear-gradient(180deg, rgba(255,140,60,.20), rgba(140,50,30,.14))",
      text: "Carrer d’En Pina in the last light, the Micalet at the end of the street. Somewhere near here could be yours." }
  ];
  /* Continuous, frame-perfect day slider: the value runs 0..3 (four stops); the
     photographs and washes crossfade exactly as far as you drag, the clock time
     counts live, and on release it glides to the nearest stop. */
  var dayRange = document.getElementById("dayRange");
  var dayBtns = Array.prototype.slice.call(document.querySelectorAll("[data-day]"));
  var dayImgs = Array.prototype.slice.call(document.querySelectorAll("[data-day-img]"));
  var dayStage = document.getElementById("dayStage");
  var dayCap = document.querySelector(".day-cap");
  var dayTimeEl = document.getElementById("dayTime"), dayTitleEl = document.getElementById("dayTitle"), dayTextEl = document.getElementById("dayText");
  var DAY_MIN = [495, 810, 1110, 1205]; /* 08:15, 13:30, 18:30, 20:05 */
  var DAY_PART = ["morning", "midday", "afternoon", "evening"];
  var dayWashes = [];
  var oldWash = document.getElementById("dayWash");
  if (dayStage && oldWash){
    DAYS.forEach(function(d){ var w = document.createElement("div"); w.className = "wash"; w.style.background = d.wash; dayStage.insertBefore(w, oldWash); dayWashes.push(w); });
    oldWash.parentNode.removeChild(oldWash);
  }
  var dayV = 0, dayShown = -1, dayRaf = 0, dayTween = 0, dayDragging = false;
  function fmtClock(m){ m = Math.round(m); var h = Math.floor(m / 60), mm = m % 60; return (h < 10 ? "0" : "") + h + ":" + (mm < 10 ? "0" : "") + mm; }
  function dayClock(v){ var i = Math.min(2, Math.floor(v)), f = v - i; return DAY_MIN[i] + (DAY_MIN[i + 1] - DAY_MIN[i]) * f; }
  function renderDay(){
    dayRaf = 0;
    var v = dayV;
    dayImgs.forEach(function(img){ var k = parseInt(img.getAttribute("data-day-img"), 10); img.style.opacity = String(Math.max(0, Math.min(1, 1 - Math.abs(v - k)))); });
    dayWashes.forEach(function(w, k){ w.style.opacity = String(Math.max(0, Math.min(1, 1 - Math.abs(v - k)))); });
    var near = Math.round(v);
    var clock = fmtClock(dayClock(v));
    if (dayTimeEl) dayTimeEl.textContent = clock + " — " + DAY_PART[near];
    if (dayRange){
      dayRange.value = String(Math.round(v * 100));
      dayRange.style.setProperty("--p", (v / 3 * 100) + "%");
      dayRange.setAttribute("aria-valuetext", clock + ", " + DAY_PART[near]);
    }
    if (near !== dayShown){
      var first = dayShown < 0; dayShown = near;
      dayBtns.forEach(function(b){ b.setAttribute("aria-pressed", String(parseInt(b.getAttribute("data-day"), 10) === near)); });
      var put = function(){ if (dayTitleEl) dayTitleEl.textContent = DAYS[near].title; if (dayTextEl) dayTextEl.textContent = DAYS[near].text; };
      if (first || !dayCap || motionOff) put();
      else { dayCap.classList.add("swapping"); clearTimeout(dayCap._t); dayCap._t = setTimeout(function(){ put(); dayCap.classList.remove("swapping"); }, 180); }
    }
  }
  function setDayV(v){ dayV = Math.max(0, Math.min(3, v)); if (!dayRaf) dayRaf = requestAnimationFrame(renderDay); }
  function glideDay(to){
    cancelAnimationFrame(dayTween);
    if (motionOff){ setDayV(to); return; }
    var from = dayV, t0 = performance.now(), dur = 260 + 240 * Math.min(3, Math.abs(to - from)) / 3;
    (function step(now){
      var t = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - t, 3);
      setDayV(from + (to - from) * e);
      if (t < 1) dayTween = requestAnimationFrame(step);
    })(t0);
  }
  if (dayRange){
    dayRange.addEventListener("pointerdown", function(){ dayDragging = true; cancelAnimationFrame(dayTween); });
    dayRange.addEventListener("input", function(){ cancelAnimationFrame(dayTween); setDayV(parseInt(dayRange.value, 10) / 100); });
    var dayRelease = function(){ if (!dayDragging) return; dayDragging = false; glideDay(Math.round(dayV)); };
    window.addEventListener("pointerup", dayRelease); window.addEventListener("pointercancel", dayRelease);
    dayRange.addEventListener("change", function(){ if (!dayDragging) glideDay(Math.round(dayV)); });
    dayRange.addEventListener("keydown", function(e){
      var k = e.key, cur = Math.round(dayV);
      if (k === "ArrowRight" || k === "ArrowUp" || k === "PageUp"){ e.preventDefault(); glideDay(Math.min(3, cur + 1)); }
      else if (k === "ArrowLeft" || k === "ArrowDown" || k === "PageDown"){ e.preventDefault(); glideDay(Math.max(0, cur - 1)); }
      else if (k === "Home"){ e.preventDefault(); glideDay(0); }
      else if (k === "End"){ e.preventDefault(); glideDay(3); }
    });
  }
  dayBtns.forEach(function(b){ b.addEventListener("click", function(){ glideDay(parseInt(b.getAttribute("data-day"), 10)); }); });
  dayImgs.forEach(function(img){ img.classList.remove("on"); });
  setDayV(0); renderDay();

  /* ---------- Before / after drag reveal: sub-pixel, one write per frame ---------- */
  var cmpRange = document.getElementById("compareRange");
  var cmpStage = document.getElementById("compareStage");
  var cmpV = cmpRange ? parseFloat(cmpRange.value) : 55, cmpRaf = 0, cmpTween = 0, cmpW = 0;
  function cmpMeasure(){ if (cmpStage) cmpW = cmpStage.getBoundingClientRect().width; }
  function renderCompare(){
    cmpRaf = 0;
    if (!cmpStage) return;
    if (!cmpW) cmpMeasure();
    cmpStage.style.setProperty("--split", cmpV + "%");
    cmpStage.style.setProperty("--hx", (cmpW * cmpV / 100) + "px");
    if (cmpRange){
      cmpRange.value = String(Math.round(cmpV * 10) / 10);
      cmpRange.style.setProperty("--p", cmpV + "%");
      cmpRange.setAttribute("aria-valuetext", Math.round(cmpV) + "% postcard");
    }
  }
  function setCompare(v){ cmpV = Math.max(0, Math.min(100, v)); if (!cmpRaf) cmpRaf = requestAnimationFrame(renderCompare); }
  function glideCompare(to){
    cancelAnimationFrame(cmpTween);
    if (motionOff){ setCompare(to); return; }
    var from = cmpV, t0 = performance.now();
    (function step(now){
      var t = Math.min(1, (now - t0) / 240), e = 1 - Math.pow(1 - t, 3);
      setCompare(from + (to - from) * e);
      if (t < 1) cmpTween = requestAnimationFrame(step);
    })(t0);
  }
  if (cmpRange){
    cmpRange.addEventListener("input", function(){ cancelAnimationFrame(cmpTween); setCompare(parseFloat(cmpRange.value)); });
    cmpRange.addEventListener("keydown", function(e){
      var d = e.shiftKey ? 10 : 2;
      if (e.key === "ArrowRight" || e.key === "ArrowUp"){ e.preventDefault(); glideCompare(cmpV + d); }
      else if (e.key === "ArrowLeft" || e.key === "ArrowDown"){ e.preventDefault(); glideCompare(cmpV - d); }
      else if (e.key === "Home"){ e.preventDefault(); glideCompare(0); }
      else if (e.key === "End"){ e.preventDefault(); glideCompare(100); }
    });
  }
  if (cmpStage){
    var cmpDrag = false, cmpLeft = 0;
    var cmpAt = function(x){ return (x - cmpLeft) / cmpW * 100; };
    cmpStage.addEventListener("pointerdown", function(e){
      var r = cmpStage.getBoundingClientRect(); cmpLeft = r.left; cmpW = r.width;
      cmpDrag = true; try { cmpStage.setPointerCapture(e.pointerId); } catch (err) {}
      glideCompare(cmpAt(e.clientX));
    });
    cmpStage.addEventListener("pointermove", function(e){ if (!cmpDrag) return; cancelAnimationFrame(cmpTween); setCompare(cmpAt(e.clientX)); });
    var cmpEnd = function(){ cmpDrag = false; };
    cmpStage.addEventListener("pointerup", cmpEnd); cmpStage.addEventListener("pointercancel", cmpEnd); cmpStage.addEventListener("lostpointercapture", cmpEnd);
    window.addEventListener("resize", function(){ cmpMeasure(); setCompare(cmpV); });
    if (window.ResizeObserver) new ResizeObserver(function(){ cmpMeasure(); setCompare(cmpV); }).observe(cmpStage);
  }
  setCompare(cmpV);

  /* ---------- Drag gallery: mouse drag with momentum (touch keeps native scrolling) ---------- */
  var gallery = document.getElementById("gallery");
  if (gallery){
    var gDown = false, gMoved = false, gStartX = 0, gStartScroll = 0, gLastX = 0, gLastT = 0, gVel = 0, gMomentum = 0;
    function gSnap(){
      gallery.classList.remove("dragging");
      var figs = gallery.querySelectorAll("figure"), best = gallery.scrollLeft, bestD = Infinity, gl = gallery.getBoundingClientRect().left;
      figs.forEach(function(f){ var off = f.getBoundingClientRect().left - gl - 4, d = Math.abs(off); if (d < bestD){ bestD = d; best = gallery.scrollLeft + off; } });
      gallery.scrollTo({ left: best, behavior: motionOff ? "auto" : "smooth" });
    }
    gallery.addEventListener("pointerdown", function(e){
      if (e.pointerType !== "mouse" || e.button !== 0) return;
      cancelAnimationFrame(gMomentum);
      gDown = true; gMoved = false; gStartX = gLastX = e.clientX; gLastT = performance.now(); gStartScroll = gallery.scrollLeft; gVel = 0;
    });
    gallery.addEventListener("pointermove", function(e){
      if (!gDown) return;
      var dx = e.clientX - gStartX;
      if (!gMoved && Math.abs(dx) > 4){ gMoved = true; gallery.classList.add("dragging"); try { gallery.setPointerCapture(e.pointerId); } catch (err) {} }
      if (!gMoved) return;
      var now = performance.now(), dt = Math.max(1, now - gLastT);
      gVel = 0.8 * ((e.clientX - gLastX) / dt) + 0.2 * gVel;
      gLastX = e.clientX; gLastT = now;
      gallery.scrollLeft = gStartScroll - dx;
    });
    var gUp = function(){
      if (!gDown) return; gDown = false;
      if (!gMoved){ gallery.classList.remove("dragging"); return; }
      var v = -gVel * 16; /* px per frame */
      if (motionOff || Math.abs(v) < 1){ gSnap(); return; }
      (function coast(){
        gallery.scrollLeft += v; v *= 0.93;
        if (Math.abs(v) > 0.6) gMomentum = requestAnimationFrame(coast); else gSnap();
      })();
    };
    gallery.addEventListener("pointerup", gUp); gallery.addEventListener("pointercancel", gUp); gallery.addEventListener("lostpointercapture", gUp);
    gallery.addEventListener("click", function(e){ if (gMoved){ e.preventDefault(); e.stopPropagation(); } }, true);
    var step = function(){ return Math.min(430, gallery.clientWidth * 0.85); };
    var prev = document.getElementById("galPrev"), next = document.getElementById("galNext");
    if (prev) prev.addEventListener("click", function(){ gallery.scrollBy({ left: -step(), behavior: motionOff ? "auto" : "smooth" }); });
    if (next) next.addEventListener("click", function(){ gallery.scrollBy({ left: step(), behavior: motionOff ? "auto" : "smooth" }); });
  }

  /* ---------- Build your move — planner ---------- */
  var STAGE_ORDER = ["Plan", "Prepare", "Arrive", "Settle"];
  var picks = Array.prototype.slice.call(document.querySelectorAll(".pick"));
  var planOut = document.getElementById("planListOut");
  var planEmpty = document.getElementById("planEmpty");
  var planCount = document.getElementById("planCount");
  var planToDraft = document.getElementById("planToDraft");
  var planStatus = document.getElementById("planStatus");
  function selectedPicks(){
    return picks.filter(function(p){ return p.getAttribute("aria-pressed") === "true"; })
      .sort(function(a, b){
        return STAGE_ORDER.indexOf(a.getAttribute("data-stage")) - STAGE_ORDER.indexOf(b.getAttribute("data-stage"));
      });
  }
  function renderPlan(){
    if (!planOut) return;
    var sel = selectedPicks();
    planOut.innerHTML = "";
    sel.forEach(function(p){
      var li = document.createElement("li");
      var st = document.createElement("span"); st.className = "st"; st.textContent = p.getAttribute("data-stage");
      var sv = document.createElement("span"); sv.className = "sv"; sv.textContent = p.getAttribute("data-service");
      li.appendChild(st); li.appendChild(sv); planOut.appendChild(li);
    });
    if (planEmpty) planEmpty.hidden = sel.length > 0;
    if (planCount) planCount.textContent = sel.length === 0 ? "Nothing selected yet"
      : sel.length === 1 ? "1 piece chosen — a focused start" : sel.length + " pieces chosen — in route order";
    document.querySelectorAll(".plan-route i").forEach(function(seg){
      var on = sel.some(function(p){ return p.getAttribute("data-stage") === seg.getAttribute("data-seg"); });
      seg.classList.toggle("on", on);
    });
    if (planToDraft) planToDraft.disabled = sel.length === 0;
  }
  picks.forEach(function(p){
    p.addEventListener("click", function(){
      p.setAttribute("aria-pressed", String(p.getAttribute("aria-pressed") !== "true"));
      if (planStatus) planStatus.textContent = "";
      renderPlan();
    });
  });
  var planClear = document.getElementById("planClear");
  if (planClear) planClear.addEventListener("click", function(){
    picks.forEach(function(p){ p.setAttribute("aria-pressed", "false"); });
    if (planStatus) planStatus.textContent = "";
    renderPlan();
  });
  if (planToDraft) planToDraft.addEventListener("click", function(){
    var sel = selectedPicks();
    if (!sel.length) return;
    var names = sel.map(function(p){ return p.getAttribute("data-service"); });
    var msg = document.getElementById("fMsg");
    var line = "We'd like help with: " + names.join("; ") + ".";
    if (msg){
      var existing = msg.value.trim();
      msg.value = existing ? existing + "\n" + line : line;
    }
    if (planStatus) planStatus.textContent = "Added to the email draft below — scroll down, add your name, and prepare the draft when you're ready.";
    var start = document.getElementById("start");
    if (start) start.scrollIntoView({ behavior: motionOff ? "auto" : "smooth" });
    if (msg) setTimeout(function(){ msg.focus({ preventScroll: true }); }, motionOff ? 60 : 700);
  });
  renderPlan();

  /* ---------- Places explorer ---------- */
  var PLACES = [
    { title: "El Carmen & the old town", img: "img/3518bc6f.webp", srcset: "img/1d4a9e35.webp 640w, img/3518bc6f.webp 1280w",
      alt: "Plaza de la Virgen in Valencia's old town — the Turia fountain, the cathedral and the Miguelete",
      text: "The historic heart: narrow streets, small squares, balconies of plants, the Miguelete watching over it. Evenings here are for wandering; mornings smell of coffee and market deliveries.",
      detail: "Worth discussing: old-town character versus quieter residential streets." },
    { title: "Mercado Central", img: "img/7fc40439.webp", srcset: "img/6912322a.webp 640w, img/7fc40439.webp 1024w",
      alt: "Inside Valencia's Mercado Central, shoppers at a fruit and vegetable stall beneath the iron and glass roof",
      text: "One of Europe's great food halls, and the old town's pantry. Living near it turns the weekly shop into the week's best hour — stallholders who remember you, and what's good today.",
      detail: "Worth discussing: which neighbourhoods keep the market in walking distance." },
    { title: "Turia Gardens", img: "img/03d9ce70.webp", srcset: "img/c03d1e42.webp 640w, img/03d9ce70.webp 1219w",
      alt: "The Turia Gardens — pampas grass and paths in the old riverbed, with L’Àgora and the Assut de l’Or bridge beyond",
      text: "A river that became a park: kilometres of green running through the city, stitching neighbourhoods together. Your run, your dog walk, your children's long way home from school.",
      detail: "Worth discussing: which stretch of the gardens you'd want on your doorstep." },
    { title: "City of Arts & Sciences", img: "img/8084d55e.webp", srcset: "img/4753cf40.webp 640w, img/8084d55e.webp 1280w",
      alt: "The City of Arts and Sciences in Valencia, white futuristic buildings reflected in shallow pools",
      text: "Calatrava's white arcs at the Turia's eastern end — concerts, the science museum, evening walks around the reflecting pools. The city's modern face, and a landmark every visitor finds first.",
      detail: "Worth discussing: the newer districts growing up around it." },
    { title: "The beach & the Malvarrosa", img: "img/a4ee2ca8.webp", srcset: "img/b99629c7.webp 640w, img/a4ee2ca8.webp 800w",
      alt: "The palm-lined seafront promenade at La Patacona, beside Valencia’s northern beaches",
      text: "The Mediterranean as a daily habit rather than a holiday: promenade runs, swims before lunch, paella where it was invented. Bright, breezy, and a tram ride from the old town.",
      detail: "Worth discussing: living by the sea versus living in the shade of the centre." }
  ];
  var placeBtns = Array.prototype.slice.call(document.querySelectorAll("[data-place]"));
  var placeImg = document.getElementById("placeImg");
  function setPlace(i){
    var p = PLACES[i]; if (!p) return;
    placeBtns.forEach(function(b){ b.setAttribute("aria-pressed", String(parseInt(b.getAttribute("data-place"), 10) === i)); });
    if (placeImg){
      placeImg.style.opacity = "0";
      var swap = function(){ placeImg.src = p.img; if (p.srcset) placeImg.srcset = p.srcset; placeImg.alt = p.alt; placeImg.style.opacity = "1"; };
      if (motionOff) swap(); else setTimeout(swap, 160);
    }
    var t = document.getElementById("placeTitle"); if (t) t.innerHTML = p.title;
    var x = document.getElementById("placeText"); if (x) x.textContent = p.text;
    var d = document.getElementById("placeDetail"); if (d) d.textContent = p.detail;
  }
  placeBtns.forEach(function(b){ b.addEventListener("click", function(){ setPlace(parseInt(b.getAttribute("data-place"), 10)); }); });

  /* ---------- Pointer tilt on marked imagery (fine pointers only) ---------- */
  if (window.matchMedia && matchMedia("(pointer: fine)").matches){
    document.querySelectorAll("[data-tilt]").forEach(function(el){
      el.addEventListener("pointermove", function(e){
        if (motionOff) return;
        var r = el.getBoundingClientRect();
        var rx = ((e.clientY - r.top) / r.height - 0.5) * -5;
        var ry = ((e.clientX - r.left) / r.width - 0.5) * 6;
        el.style.transform = "perspective(900px) rotateX(" + rx.toFixed(2) + "deg) rotateY(" + ry.toFixed(2) + "deg)";
      });
      el.addEventListener("pointerleave", function(){ el.style.transform = ""; });
    });
  }

  /* ---------- Email draft form (mailto — labelled as a draft) ---------- */
  document.getElementById("draftForm").addEventListener("submit", function(e){e.preventDefault();window.juryPrepareDraft(e.currentTarget);});

  /* ---------- Ken Burns fallback (9.5, item 2) ----------
     No verifiable licensed Valencia video file could be sourced at build
     time (Pexels/Pixabay searches returned photos, not directly licensable
     video files with stable URLs), so per brief the real photographs get a
     slow Ken Burns drift + light sweep instead. Live only while on-screen;
     paused offscreen, on hidden tab, and under motion-off/reduced motion.
     The poster is the photograph itself — failure mode is a still photo. */
  var kbEls = Array.prototype.slice.call(document.querySelectorAll("[data-kb]"));
  if (kbEls.length && "IntersectionObserver" in window){
    var kbIO = new IntersectionObserver(function(entries){
      entries.forEach(function(en){
        en.target.classList.toggle("kb-live", en.isIntersecting && !document.hidden);
        en.target.classList.toggle("kb-paused", !en.isIntersecting);
      });
    }, { threshold: 0.12 });
    kbEls.forEach(function(el){ kbIO.observe(el); });
    document.addEventListener("visibilitychange", function(){
      kbEls.forEach(function(el){ el.classList.toggle("kb-paused", document.hidden); });
    });
  } else { kbEls.forEach(function(el){ el.classList.add("kb-live"); }); }

  /* ---------- Motion: GSAP signature scenes ---------- */
  var toggle = document.getElementById("motionToggle");
  var label = document.getElementById("motionLabel");
  var triggers = [];

  function setScatter(chip){
    var p = (chip.getAttribute("data-scatter") || "0,0,0").split(",");
    /* scatter scales with the viewport so no card leaves a phone screen */
    var k = Math.max(0.22, Math.min(1, (window.innerWidth - 300) / 900));
    return { x: parseFloat(p[0]) * 6 * k, y: parseFloat(p[1]) * 2.2, rotation: parseFloat(p[2]) * (0.4 + 0.6 * k) };
  }

  /* ---------- Kinetic engine state ---------- */
  var lenis = null, lenisWired = false, anchorsWired = false, visWired = false;
  var splitRestore = [], kwWords = [], heroChars = [];
  var glAmp = { v: 1, target: 1 };
  var pointerPt = null, pressureQueued = false;

  function lenisRaf(time){ if (lenis) lenis.raf(time * 1000); }

  /* Split into masked lines (SplitText) with a manual word-mask fallback.
     Original markup is stored so motion-off restores the exact end state. */
  function wrapWords(node){
    Array.prototype.slice.call(node.childNodes).forEach(function(child){
      if (child.nodeType === 3){
        var frag = document.createDocumentFragment();
        child.textContent.split(/(\s+)/).forEach(function(part){
          if (!part) return;
          if (/^\s+$/.test(part)) frag.appendChild(document.createTextNode(" "));
          else {
            var m = document.createElement("span"); m.className = "wm";
            var i = document.createElement("span"); i.className = "wi"; i.textContent = part;
            m.appendChild(i); frag.appendChild(m);
          }
        });
        node.replaceChild(frag, child);
      } else if (child.nodeType === 1) wrapWords(child);
    });
  }
  function splitLines(el, withChars){
    if (!el || el.getAttribute("data-split-done")) return [];
    splitRestore.push({ el: el, html: el.innerHTML });
    el.setAttribute("data-split-done", "1");
    if (window.SplitText){
      try {
        var st = new SplitText(el, {
          type: withChars ? "lines,chars" : "lines",
          mask: "lines", linesClass: "st-line", charsClass: "st-char"
        });
        if (el.id === "hero-h") heroChars = st.chars || [];
        return st.lines || [];
      } catch (err) { /* fall through to the manual splitter */ }
    }
    wrapWords(el);
    return Array.prototype.slice.call(el.querySelectorAll(".wi"));
  }
  function restoreSplits(){
    splitRestore.forEach(function(r){ r.el.innerHTML = r.html; r.el.removeAttribute("data-split-done"); });
    splitRestore = []; heroChars = [];
  }

  /* Variable-font word-art: weight answers scroll (scrub) and pointer proximity. */
  function kineticWord(el, base, scrollAmt, triggerEl){
    if (!el) return;
    el.classList.add("kw");
    var st = { s: 0, p: 0 };
    function apply(){ el.style.fontVariationSettings = "'wght' " + Math.round(base + st.s + st.p + (st.v || 0)); }
    apply();
    kwWords.push({ el: el, st: st, apply: apply });
    gsap.to(st, { s: scrollAmt, ease: "none", onUpdate: apply,
      scrollTrigger: { trigger: triggerEl || el, start: "top 96%", end: "top 22%", scrub: 0.6 } });
  }
  function queuePressure(){ if (pressureQueued) return; pressureQueued = true; requestAnimationFrame(applyPressure); }
  function applyPressure(){
    pressureQueued = false;
    if (motionOff || !pointerPt) return;
    kwWords.forEach(function(k){
      var r = k.el.getBoundingClientRect();
      if (r.bottom < -80 || r.top > window.innerHeight + 80) return;
      var dx = pointerPt.x - (r.left + r.width / 2), dy = pointerPt.y - (r.top + r.height / 2);
      var d = Math.sqrt(dx * dx + dy * dy);
      var target = Math.max(0, 1 - d / Math.max(280, r.width * 0.8)) * 130;
      gsap.to(k.st, { p: target, duration: 0.6, ease: "power2.out", overwrite: "auto", onUpdate: k.apply });
    });
    heroChars.forEach(function(c){
      var r = c.getBoundingClientRect();
      var dx = pointerPt.x - (r.left + r.width / 2), dy = pointerPt.y - (r.top + r.height / 2);
      var d = Math.sqrt(dx * dx + dy * dy);
      var inf = Math.max(0, 1 - d / 230);
      c.style.fontVariationSettings = "'wght' " + Math.round(360 + inf * 300);
    });
  }
  document.addEventListener("pointermove", function(e){
    pointerPt = { x: e.clientX, y: e.clientY }; queuePressure();
  }, { passive: true });

  /* Magnetic CTAs — pointer pulls, release settles back. */
  function wireMagnetic(){
    if (!window.matchMedia || !matchMedia("(pointer: fine)").matches || !window.gsap) return;
    document.querySelectorAll(".hero-cta .btn, .topbar .btn, #draftForm .btn").forEach(function(btn){
      if (btn._magWired) return; btn._magWired = true;
      btn.classList.add("magnetic");
      var qx = gsap.quickTo(btn, "x", { duration: 0.4, ease: "power3" });
      var qy = gsap.quickTo(btn, "y", { duration: 0.4, ease: "power3" });
      btn.addEventListener("pointermove", function(e){
        if (motionOff) return;
        var r = btn.getBoundingClientRect();
        qx((e.clientX - (r.left + r.width / 2)) * 0.28);
        qy((e.clientY - (r.top + r.height / 2)) * 0.34);
      });
      btn.addEventListener("pointerleave", function(){ qx(0); qy(0); });
    });
  }

  /* In-page anchors ride the smooth-scroll engine when it is live. */
  function wireAnchors(){
    if (anchorsWired) return; anchorsWired = true;
    document.querySelectorAll('a[href^="#"]').forEach(function(a){
      a.addEventListener("click", function(e){
        var id = a.getAttribute("href");
        if (!id || id.length < 2) return;
        var target = document.querySelector(id);
        if (!target) return;
        e.preventDefault();
        if (lenis && !motionOff) lenis.scrollTo(target, { offset: -70, duration: 1.25 });
        else target.scrollIntoView({ behavior: motionOff ? "auto" : "smooth" });
      });
    });
  }

  /* ---------- WebGL hero — the photograph, breathing ----------
     One shader moment: the hero image as a texture, gently displaced by
     layered waves; scroll velocity feeds the amplitude, the pointer drifts
     the frame. Capped DPR, paused offscreen/hidden, and the plain <img loading="lazy" decoding="async">
     underneath stays as the complete static fallback. */
  var glState = null;
  function startGL(){
    var canvas = document.getElementById("glCanvas");
    if (!canvas) return;
    if (glState){
      if (glState.stopped){
        glState.stopped = false;
        glState.start = performance.now();
        glState.raf = requestAnimationFrame(glState.loop);
        if (glState.ready) document.body.classList.add("gl-on");
      }
      return;
    }
    var gl = null;
    try { gl = canvas.getContext("webgl", { antialias: false, alpha: false, depth: false, stencil: false, powerPreference: "low-power" }); } catch (e) { gl = null; }
    if (!gl) return;
    var vsSrc = "attribute vec2 p; varying vec2 vUv; void main(){ vUv = p * 0.5 + 0.5; gl_Position = vec4(p, 0.0, 1.0); }";
    var fsSrc = [
      "precision mediump float;",
      "varying vec2 vUv;",
      "uniform sampler2D uTex;",
      "uniform float uTime;",
      "uniform float uAmp;",
      "uniform vec2 uRes;",
      "uniform vec2 uImg;",
      "uniform vec2 uMouse;",
      "void main(){",
      "  vec2 uv = vUv;",
      "  float rs = uRes.x / uRes.y;",
      "  float ri = uImg.x / uImg.y;",
      "  vec2 ratio = vec2(1.0);",
      "  if (rs < ri) { ratio.x = rs / ri; } else { ratio.y = ri / rs; }",
      "  vec2 st = (uv - vec2(0.5, 0.42)) * ratio + vec2(0.5, 0.42);",
      "  float t = uTime * 0.5;",
      "  vec2 drift = vec2(",
      "    sin(st.y * 9.0 + t) * 0.6 + sin(st.y * 21.0 - t * 1.35) * 0.4,",
      "    cos(st.x * 7.0 - t * 0.8) * 0.6 + sin(st.x * 15.0 + t) * 0.4);",
      "  st += drift * 0.0032 * uAmp;",
      "  st += (uMouse - vec2(0.5, 0.42)) * 0.014;",
      "  vec3 col = texture2D(uTex, st).rgb;",
      "  float g = fract(sin(dot(uv + fract(uTime), vec2(12.9898, 78.233))) * 43758.5453);",
      "  col += (g - 0.5) * 0.025;",
      "  col *= vec3(1.04, 1.0, 0.96);",
      "  gl_FragColor = vec4(col, 1.0);",
      "}"
    ].join("\n");
    function makeShader(type, src){
      var s = gl.createShader(type);
      gl.shaderSource(s, src); gl.compileShader(s);
      return gl.getShaderParameter(s, gl.COMPILE_STATUS) ? s : null;
    }
    var vsh = makeShader(gl.VERTEX_SHADER, vsSrc), fsh = makeShader(gl.FRAGMENT_SHADER, fsSrc);
    if (!vsh || !fsh) return;
    var prog = gl.createProgram();
    gl.attachShader(prog, vsh); gl.attachShader(prog, fsh); gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;
    gl.useProgram(prog);
    var buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    var loc = gl.getAttribLocation(prog, "p");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    var uni = {
      time: gl.getUniformLocation(prog, "uTime"),
      amp: gl.getUniformLocation(prog, "uAmp"),
      res: gl.getUniformLocation(prog, "uRes"),
      img: gl.getUniformLocation(prog, "uImg"),
      mouse: gl.getUniformLocation(prog, "uMouse"),
      tex: gl.getUniformLocation(prog, "uTex")
    };
    gl.uniform1i(uni.tex, 0);
    var hero = document.querySelector(".hero");
    var state = {
      gl: gl, uni: uni, canvas: canvas, hero: hero,
      tex: gl.createTexture(), ready: false, visible: true, stopped: false,
      iw: 1, ih: 1, mx: 0.5, my: 0.42, start: performance.now(), raf: 0, loop: null
    };
    glState = state;
    function resizeGL(){
      var dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      var w = Math.max(2, Math.round(hero.clientWidth * dpr));
      var h = Math.max(2, Math.round(hero.clientHeight * dpr));
      if (canvas.width !== w || canvas.height !== h){
        canvas.width = w; canvas.height = h;
        gl.viewport(0, 0, w, h);
      }
    }
    state.loop = function(now){
      state.raf = requestAnimationFrame(state.loop);
      if (!state.ready || !state.visible || state.stopped || document.hidden || motionOff) return;
      resizeGL();
      glAmp.v += (glAmp.target - glAmp.v) * 0.06;
      glAmp.target += (1 - glAmp.target) * 0.02;
      gl.uniform1f(uni.time, (now - state.start) / 1000);
      gl.uniform1f(uni.amp, glAmp.v);
      gl.uniform2f(uni.res, canvas.width, canvas.height);
      gl.uniform2f(uni.img, state.iw, state.ih);
      gl.uniform2f(uni.mouse, state.mx, state.my);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    };
    var image = new Image();
    image.onload = function(){
      gl.bindTexture(gl.TEXTURE_2D, state.tex);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      state.iw = image.naturalWidth; state.ih = image.naturalHeight;
      state.ready = true;
      resizeGL();
      document.body.classList.add("gl-on");
    };
    image.src = "img/a461f1cc.webp";
    if ("IntersectionObserver" in window){
      new IntersectionObserver(function(en){ state.visible = en[0].isIntersecting; }, { threshold: 0.02 }).observe(hero);
    }
    hero.addEventListener("pointermove", function(e){
      var r = hero.getBoundingClientRect();
      state.mx = (e.clientX - r.left) / Math.max(1, r.width);
      state.my = 1 - (e.clientY - r.top) / Math.max(1, r.height);
    }, { passive: true });
    window.addEventListener("resize", resizeGL);
    state.raf = requestAnimationFrame(state.loop);
  }
  function stopGL(){
    document.body.classList.remove("gl-on");
    if (glState){ glState.stopped = true; cancelAnimationFrame(glState.raf); }
  }

  function buildMotion(){
    if (!window.gsap || !window.ScrollTrigger) return;
    gsap.registerPlugin(ScrollTrigger);
    var isDesktop = window.matchMedia("(min-width: 900px)").matches;

    /* Lenis — the single scroll engine; ScrollTrigger reads from it */
    if (window.Lenis && !lenis){
      lenis = new Lenis({ duration: 1.15, smoothWheel: true });
      lenis.on("scroll", ScrollTrigger.update);
      if (!lenisWired){ gsap.ticker.add(lenisRaf); gsap.ticker.lagSmoothing(0); lenisWired = true; }
    }
    wireAnchors();
    wireMagnetic();
    /* The shader setup is the heaviest thing on the page; run it after the intro hands over */
    if (window.__m2vIntroActive) window.__m2vAfterIntro = startGL; else startGL();

    /* Hero entrance is owned by the intro module above (it runs at load
       and is skippable). buildMotion must not re-split or re-hide the
       headline — it only adds scroll behaviour below. */

    /* Section headings — masked line reveals, one easing family */
    [".bridge", "#leap-h", "#route-h", "#person-h", "#belong-h", "#faq-h", "#start-h"].forEach(function(sel){
      var el = document.querySelector(sel);
      if (!el) return;
      var lines = splitLines(el, false);
      if (!lines.length) return;
      gsap.fromTo(lines, { yPercent: 118 },
        { yPercent: 0, duration: 1.15, ease: "expo.out", stagger: 0.09,
          scrollTrigger: { trigger: el, start: "top 88%" } });
    });

    /* Kinetic word-art — variable weight answers scroll and pointer */
    kineticWord(document.getElementById("imagineWord"), 400, 190, document.querySelector(".scene-imagine"));
    kineticWord(document.getElementById("belongWord"), 620, -170, document.querySelector(".belong-word-wrap"));
    kineticWord(document.querySelector(".route-sticky .word"), 430, 150, document.querySelector(".route-sec"));

    /* Scroll velocity — skews the big type, feeds energy to the hero shader */
    ["#hero-h", "#imagineWord", "#belongWord", "#leap-h", "#start-h"].forEach(function(sel){
      var el = document.querySelector(sel);
      if (el) el.classList.add("vel-skew");
    });
    var skewProxy = { v: 0 };
    var skewSet = gsap.quickSetter(".vel-skew", "skewY", "deg");
    var skewClamp = gsap.utils.clamp(-5, 5);
    var velTrig = ScrollTrigger.create({
      start: 0, end: "max",
      onUpdate: function(self){
        var vel = self.getVelocity();
        glAmp.target = 1 + Math.min(2.4, Math.abs(vel) / 1100);
        /* Velocity-reactive type: weight swells with scroll speed, settles at rest */
        var vBoost = Math.min(90, Math.abs(vel) / 16);
        kwWords.forEach(function(k){
          k.st.v = vBoost;
          k.apply();
          gsap.to(k.st, { v: 0, duration: 0.9, ease: "power3.out", overwrite: "auto", onUpdate: k.apply });
        });
        var skew = skewClamp(vel / -300);
        if (Math.abs(skew) > Math.abs(skewProxy.v)){
          skewProxy.v = skew;
          gsap.to(skewProxy, { v: 0, duration: 0.8, ease: "power3", overwrite: true,
            onUpdate: function(){ skewSet(skewProxy.v); } });
        }
      }
    });
    triggers.push(velTrig);

    /* Photographs rise and settle — always ending fully visible (clearProps),
       so a stalled trigger can never leave an image hidden. */
    gsap.utils.toArray(".scene .ph, .atlas-panel .ph").forEach(function(ph){
      gsap.fromTo(ph, { y: 44, opacity: 0.35 },
        { y: 0, opacity: 1, duration: 1.1, ease: "expo.out", clearProps: "transform,opacity",
          scrollTrigger: { trigger: ph, start: "top 88%" } });
    });

    /* Hero atmosphere on scroll — the ambient backdrop parallaxes gently. */
    gsap.fromTo(".hero-media img", { yPercent: -4 }, { yPercent: 5, ease: "none",
      scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: 0.6 } });

    /* Gallery frames drift at slightly different speeds — a living contact sheet */
    if (isDesktop){
      gsap.utils.toArray(".gallery figure").forEach(function(fig, i){
        gsap.fromTo(fig, { y: i % 2 ? 14 : 0 }, { y: i % 2 ? 0 : 14, ease: "none",
          scrollTrigger: { trigger: "#gallery", start: "top bottom", end: "bottom top", scrub: 0.7 } });
      });
    }

    /* Scene 1 — IMAGINE (PINNED on desktop, 9.5): note → word fills & grows →
       doorway rises through a clip reveal → reading pause. Scrubbed, so reverse
       scroll reverses it coherently. Mobile: same phases, unpinned. */
    var tl1 = gsap.timeline({ scrollTrigger: {
      trigger: ".scene-imagine",
      start: isDesktop ? "top top" : "top 85%",
      end: isDesktop ? "+=125%" : "bottom 55%",
      scrub: 0.6, pin: isDesktop, anticipatePin: isDesktop ? 1 : 0
    } });
    tl1.fromTo(".imagine-note", { y: 18 }, { y: 0, ease: "none", duration: 0.35 })
       .fromTo("#imagineWord", { scale: 0.8, opacity: 0.2, backgroundPosition: "50% 72%" },
         { scale: 1, opacity: 1, backgroundPosition: "50% 30%", ease: "none", duration: 0.9 }, 0.1)
       .fromTo("#doorway", { y: 110, opacity: 0, clipPath: "inset(38% 0% 0% 0%)" },
         { y: 0, opacity: 1, clipPath: "inset(0% 0% 0% 0%)", ease: "none", duration: 0.8 }, 0.55)
       .to({}, { duration: 0.5 }); /* reading pause — doorway held, fully readable */
    triggers.push(tl1.scrollTrigger);

    /* Chapter parallax depth — every chapter gets a slow counter-drift layer */
    gsap.utils.toArray("[data-depth-ch]").forEach(function(el){
      var d = parseFloat(el.getAttribute("data-depth-ch") || "6");
      gsap.fromTo(el, { y: d * 2.2 }, { y: -d * 2.2, ease: "none",
        scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: 0.7 } });
    });
    gsap.utils.toArray(".scene .ph, .place-stage .ph, .atlas-panel .ph").forEach(function(el){
      gsap.fromTo(el, { y: 18 }, { y: -18, ease: "none",
        scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: 0.8 } });
    });
    /* Marquee morphs — horizon line lifts into the doorway arch as you pass */
    gsap.utils.toArray(".marquee-graphic").forEach(function(svg){
      var arch = svg.querySelector(".mg-arch"), hor = svg.querySelector(".mg-horizon");
      if (!arch || !hor) return;
      var o = { t: 0 };
      gsap.to(o, { t: 1, ease: "none",
        scrollTrigger: { trigger: svg.closest(".marquee"), start: "top bottom", end: "top 30%", scrub: 0.6 },
        onUpdate: function(){
          arch.style.opacity = String(0.25 + o.t * 0.75);
          arch.style.transform = "translateY(" + ((1 - o.t) * 5).toFixed(1) + "px)";
          hor.style.opacity = String(1 - o.t * 0.55);
        } });
    });

    /* Chapter 2 — route line draws; scenes drift gently */
    var rp = document.getElementById("routePath");
    if (rp){
      var len = rp.getTotalLength();
      gsap.fromTo(rp, { strokeDasharray: len, strokeDashoffset: len },
        { strokeDashoffset: 0, ease: "none",
          scrollTrigger: { trigger: ".scenes", start: "top 75%", end: "bottom 60%", scrub: 0.5 } });
    }
    gsap.utils.toArray(".scene .ph img").forEach(function(img){
      gsap.fromTo(img, { scale: 1.08 }, { scale: 1, ease: "none",
        scrollTrigger: { trigger: img, start: "top bottom", end: "bottom top", scrub: 0.6 } });
    });
    gsap.utils.toArray(".scene .tx").forEach(function(tx){
      gsap.from(tx, { y: 34, opacity: 0, duration: 0.9, ease: "power2.out",
        scrollTrigger: { trigger: tx, start: "top 82%" } });
    });

    /* Scene 2 — The leap: scattered questions align into a plan (pinned on desktop) */
    var chips = gsap.utils.toArray("#planList .qchip");
    chips.forEach(function(chip){ var s = setScatter(chip); gsap.set(chip, s); });
    var tl2 = gsap.timeline({
      scrollTrigger: {
        trigger: ".leap", start: "top top", end: "+=135%", scrub: 0.6,
        pin: isDesktop, anticipatePin: isDesktop ? 1 : 0
      }
    });
    tl2.to(chips, { x: 0, y: 0, rotation: 0, duration: 1, ease: "power2.inOut", stagger: 0.12 })
       .fromTo(".leap .resolution", { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.5, ease: "power1.out" }, "-=0.25")
       .to({}, { duration: 0.45 }); /* reading pause in resolved state */
    triggers.push(tl2.scrollTrigger);

    /* Chapter 4 — ARRIVE line draws in the sticky diagram */
    var ap = document.getElementById("arrivePath");
    if (ap && isDesktop){
      var alen = ap.getTotalLength();
      gsap.fromTo(ap, { strokeDasharray: alen, strokeDashoffset: alen },
        { strokeDashoffset: 0, ease: "none",
          scrollTrigger: { trigger: ".route-sec", start: "top 60%", end: "bottom 80%", scrub: 0.5 } });
    }

    /* Scene 3 — BELONG (PINNED on desktop, 9.5): letters rise & fill while the
       wrap holds, then the word settles as the full-width scene below takes
       over. Scrubbed/reversible; mobile keeps the unpinned rise. */
    var tl3 = gsap.timeline({ scrollTrigger: {
      trigger: ".belong-word-wrap",
      start: isDesktop ? "top 62%" : "top 88%",
      end: isDesktop ? "+=115%" : "top 30%",
      scrub: 0.6, pin: isDesktop, anticipatePin: isDesktop ? 1 : 0
    } });
    tl3.fromTo("#belongWord", { y: 80, opacity: 0.15, backgroundPosition: "50% 92%", scale: 0.94 },
          { y: 0, opacity: 1, backgroundPosition: "50% 55%", scale: 1, ease: "none", duration: 1 })
       .to("#belongWord", { scale: 0.985, ease: "none", duration: 0.25 })
       .to({}, { duration: 0.45 }); /* reading pause — BELONG held full and legible */
    triggers.push(tl3.scrollTrigger);
    var arch = document.getElementById("archPath");
    if (arch){
      var archLen = arch.getTotalLength();
      gsap.fromTo(arch, { strokeDasharray: archLen, strokeDashoffset: archLen },
        { strokeDashoffset: 0, ease: "none",
          scrollTrigger: { trigger: ".belong-scene", start: "top 85%", end: "top 25%", scrub: 0.5 } });
    }
    gsap.from(".belong-scene img", { scale: 1.07, ease: "none",
      scrollTrigger: { trigger: ".belong-scene", start: "top bottom", end: "bottom top", scrub: 0.6 } });

    /* Chapter 7 — horizon returns as a quiet underline */
    var up = document.getElementById("underlinePath");
    if (up){
      var ulen = up.getTotalLength();
      gsap.fromTo(up, { strokeDasharray: ulen, strokeDashoffset: ulen },
        { strokeDashoffset: 0, duration: 1.1, ease: "power2.inOut",
          scrollTrigger: { trigger: ".start", start: "top 62%" } });
    }

    /* Pause decorative motion when tab hidden */
    if (!visWired){
      visWired = true;
      document.addEventListener("visibilitychange", function(){
        if (!window.gsap) return;
        if (document.hidden){ gsap.globalTimeline.pause(); if (lenis) lenis.stop(); }
        else if (!motionOff){ gsap.globalTimeline.play(); if (lenis) lenis.start(); }
      });
    }

    window.addEventListener("load", function(){ ScrollTrigger.refresh(); });
  }

  function teardownMotion(){
    triggers.forEach(function(t){ if (t) t.kill(); });
    triggers = [];
    if (window.ScrollTrigger) ScrollTrigger.getAll().forEach(function(t){ t.kill(); });
    if (lenis){ lenis.destroy(); lenis = null; }
    stopGL();
    kwWords.forEach(function(k){ k.el.style.fontVariationSettings = ""; });
    kwWords = [];
    restoreSplits();
    finishIntro();
    if (window.gsap){
      gsap.set("#planList .qchip, #imagineWord, #doorway, .leap .resolution, .scene .tx, .hero-copy > *, .hl-inner, .vel-skew, .magnetic, .scene .ph, .atlas-panel .ph", { clearProps: "all" });
      gsap.set("#flArch", { clearProps: "transform,opacity,clipPath" });
    }
  }

  function applyMotionState(){
    document.body.classList.toggle("motion-off", motionOff);
    toggle.setAttribute("aria-pressed", String(motionOff));
    label.textContent = motionOff ? "Motion off" : "Motion on";
    document.documentElement.classList.toggle("reduced-motion", motionOff);
    if (motionOff){ teardownMotion(); }
    else { buildMotion(); if (window.ScrollTrigger) ScrollTrigger.refresh(); }
  }

  toggle.addEventListener("click", function(){ motionOff = !motionOff; applyMotionState(); });

  if (motionOff){
    document.body.classList.add("motion-off");
    toggle.setAttribute("aria-pressed", "true");
    label.textContent = "Motion off";
  } else if (document.fonts && document.fonts.ready){
    /* Split lines only once the variable font is in, so masks measure true */
    document.fonts.ready.then(function(){ whenSplashGone(function(){ if (!motionOff) buildMotion(); }); });
  } else {
    whenSplashGone(buildMotion);
  }
  /* the splash covers the page: scroll scenes are measured and built once it has gone */
  function whenSplashGone(fn){
    var r = document.documentElement;
    if (!r.classList.contains("splash-on")) { fn(); return; }
    var iv = setInterval(function(){ if (!r.classList.contains("splash-on")) { clearInterval(iv); requestAnimationFrame(fn); } }, 100);
  }
})();
