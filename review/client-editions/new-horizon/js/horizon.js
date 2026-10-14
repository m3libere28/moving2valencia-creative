
(function(){
  "use strict";
  var root = document.documentElement;
  var $ = function(s, c){ return (c || document).querySelector(s); };
  var $$ = function(s, c){ return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var rmq = window.matchMedia("(prefers-reduced-motion: reduce)");
  var KEY = "m2v-horizon-motion";
  var motionOn = !rmq.matches;
  try { var saved = localStorage.getItem(KEY); if (saved === "on" || saved === "off") motionOn = saved === "on"; } catch (e) {}
  var hasGsap = !!(window.gsap && window.ScrollTrigger);
  if (hasGsap) { gsap.registerPlugin(ScrollTrigger); ScrollTrigger.config({ ignoreMobileResize: true }); }

  /* ---------- Hero: align the drawn horizon with the photo's horizon ---------- */
  var heroImg = $(".hero-photo"), heroStage = $(".hero-stage"), PHOTO_HZ = .842;
  function alignHorizon(){
    if (!heroImg || !heroStage) return;
    var W = heroStage.clientWidth, H = heroStage.clientHeight;
    var nw = heroImg.naturalWidth || 1600, nh = heroImg.naturalHeight || 1200;
    var sc = Math.max(W / nw, H / nh), rh = nh * sc;
    var py = (parseFloat((getComputedStyle(heroImg).objectPosition || "50% 85%").split(" ")[1]) || 85) / 100;
    var y = Math.round((H - rh) * py + PHOTO_HZ * rh);
    heroStage.style.setProperty("--hz", y + "px");
    heroImg.style.transformOrigin = (parseFloat(getComputedStyle(heroImg).objectPosition) || 72) + "% " + y + "px";
  }
  if (heroImg) { if (heroImg.complete) alignHorizon(); else heroImg.addEventListener("load", alignHorizon); }
  window.addEventListener("resize", function(){ clearTimeout(alignHorizon._t); alignHorizon._t = setTimeout(alignHorizon, 100); });
  alignHorizon();

  /* ---------- Scenes (one coordinator: gsap.matchMedia) ---------- */
  var mm = null;
  var vw = function(f){ return window.innerWidth * f; };

  function heroScene(desk){
    var stage = $(".hero-stage");
    var arch = function(){
      var side = desk ? .22 : .08, top = desk ? 7 : 5;
      var r = Math.round(stage.clientWidth * (1 - side * 2) / 2);
      return "inset(" + top + "% " + (side * 100) + "% 0% " + (side * 100) + "% round " + r + "px " + r + "px 0px 0px)";
    };
    var tl = gsap.timeline({ defaults:{ ease:"none" }, scrollTrigger:{
      trigger: ".hero", start: "top top", end: desk ? "+=130%" : "bottom 15%",
      pin: desk ? stage : false, scrub: .5, anticipatePin: 1, invalidateOnRefresh: true } });
    tl.fromTo(".hero-photo", { scale:1.12 }, { scale:1, duration:3 }, 0)
      .fromTo(".horizon", { scaleX:.45 }, { scaleX:1, duration:3 }, 0)
      .fromTo(".hero-copy", { opacity:1, y:0 }, { opacity:0, y:-36, duration:1.6 }, 3)
      .fromTo(".imagine", { scale: desk ? .32 : .4, opacity:0 }, { scale: desk ? 1 : .92, opacity:1, duration:3 }, 3)
      .to({}, { duration:1 }, 6)
      .fromTo(stage, { clipPath:"inset(0% 0% 0% 0% round 0px 0px 0px 0px)" }, { clipPath: arch, duration:3 }, 7)
      .to(".imagine", { scale: desk ? .5 : .74, duration:3 }, 7)
      .fromTo(".hero-note", { opacity:1 }, { opacity:0, duration:1 }, 7)
      .fromTo(".door-cue", { opacity:0 }, { opacity:1, duration:1.5 }, 8.5);
  }
  function lifeScene(desk){
    var path = desk ? $(".route-desk path") : $(".route-mob path");
    gsap.fromTo(path, { strokeDashoffset:1 }, { strokeDashoffset:0, ease:"none",
      scrollTrigger:{ trigger:".scenes", start:"top 78%", end:"bottom 72%", scrub:.6 } });
    $$(".scene-art img").forEach(function(img){
      gsap.fromTo(img, { yPercent:-4 }, { yPercent:4, ease:"none",
        scrollTrigger:{ trigger:img.parentNode, start:"top bottom", end:"bottom top", scrub:true } });
    });
    gsap.fromTo(".s1 .scene-art", { clipPath:"inset(0% 100% 0% 0%)" }, { clipPath:"inset(0% 0% 0% 0%)", ease:"power2.out",
      scrollTrigger:{ trigger:".s1", start:"top 82%", end:"top 32%", scrub:.6 } });
    $$(".scene figcaption").forEach(function(c){
      gsap.from(c.children, { y:16, opacity:0, duration:.8, stagger:.14, ease:"power2.out",
        scrollTrigger:{ trigger:c, start:"top 90%", toggleActions:"play none none reverse" } });
    });
  }

  function beginScene(desk){
    var items = $$(".plan li:not(.plan-spine)");
    if (desk) {
      var sc = [ {x:"34vw",y:"-4vh",r:-4,s:1.08}, {x:"6vw",y:"3vh",r:3,s:.94}, {x:"30vw",y:"4vh",r:-2,s:.92}, {x:"-2vw",y:"6vh",r:4,s:1} ];
      var tl = gsap.timeline({ defaults:{ ease:"none" }, scrollTrigger:{
        trigger:".begin-stage", start:"top top", end:"+=120%", pin:true, scrub:.5, anticipatePin:1, invalidateOnRefresh:true } });
      items.forEach(function(li, i){
        tl.fromTo($(".q", li), { x:sc[i].x, y:sc[i].y, rotation:sc[i].r, scale:sc[i].s },
          { x:0, y:0, rotation:0, scale:1, duration:4, ease:"power1.inOut" }, 1.5);
      });
      tl.fromTo(".plan .step-k, .plan .a", { opacity:0 }, { opacity:1, duration:1.6, stagger:.22 }, 5.4)
        .fromTo(".plan li:not(.plan-spine)", { borderColor:"rgba(238,230,216,0)" }, { borderColor:"rgba(238,230,216,.16)", duration:1.5 }, 5.2)
        .fromTo(".plan-spine", { scaleY:0 }, { scaleY:1, duration:3 }, 5)
        .to({}, { duration:2.2 }, 8);
    } else {
      gsap.fromTo(".plan-spine", { scaleY:0 }, { scaleY:1, ease:"none", scrollTrigger:{ trigger:".plan", start:"top 85%", end:"bottom 70%", scrub:.4 } });
      items.forEach(function(li){
        gsap.fromTo(li, { x:-24 }, { x:0, ease:"none",
          scrollTrigger:{ trigger:li, start:"top 92%", end:"top 68%", scrub:.4 } });
      });
    }
  }

  function routeScene(desk){
    gsap.fromTo(".a-fill", { clipPath:"inset(100% 0% 0% 0%)" }, { clipPath:"inset(0% 0% 0% 0%)", ease:"none",
      scrollTrigger:{ trigger:".arrive", start:"top 85%", end:"top 30%", scrub:.5 } });
    gsap.fromTo(".a-ghost", { x:"-.05em", y:"-.05em" }, { x:0, y:0, ease:"none",
      scrollTrigger:{ trigger:".arrive", start:"top 85%", end:"top 30%", scrub:.5 } });
    if (!desk) return;
    var ms = $$(".route-map .m");
    ms.forEach(function(m, i){ if (i > 0) m.classList.remove("is-on"); });
    gsap.fromTo(".route-map .prog", { strokeDashoffset:1 }, { strokeDashoffset:0, ease:"none",
      scrollTrigger:{ trigger:".stages", start:"top 60%", end:"bottom 60%", scrub:.5 } });
    $$(".stage").forEach(function(st, i){
      if (i === 0) return;
      ScrollTrigger.create({ trigger:st, start:"top 60%",
        onEnter:function(){ ms[i].classList.add("is-on"); },
        onLeaveBack:function(){ ms[i].classList.remove("is-on"); } });
    });
  }

  function trustScene(){
    gsap.fromTo(".portrait", { clipPath:"inset(100% 0% 0% 0%)" }, { clipPath:"inset(0% 0% 0% 0%)", ease:"power2.out",
      scrollTrigger:{ trigger:".portrait", start:"top 88%", end:"top 42%", scrub:.6 } });
  }

  function belongScene(desk){
    var stage = $("#belongStage");
    if (desk) {
      stage.classList.add("is-cine");
      var tiles = $$(".tile", stage), fr = $(".door-frame", stage);
      var r0 = function(){ return Math.round(stage.clientWidth * .12); };
      var tl = gsap.timeline({ defaults:{ ease:"none" }, scrollTrigger:{
        trigger:stage, start:"top top", end:"+=150%", pin:true, scrub:.5, anticipatePin:1, invalidateOnRefresh:true } });
      tl.fromTo(tiles, { y:0 }, { y:-22, duration:2, stagger:.08 }, 0)
        .to(tiles, {
          x:function(i, el){ return stage.clientWidth / 2 - (el.offsetLeft + el.offsetWidth / 2); },
          y:function(i, el){ return stage.clientHeight / 2 - (el.offsetTop + el.offsetHeight / 2); },
          scale:.16, opacity:0, duration:3, stagger:.07, ease:"power2.in" }, 2)
        .fromTo(".belong-word", { scale:.82, opacity:0 }, { scale:1, opacity:1, duration:2.6 }, 2.3)
        .to({}, { duration:1 }, 4.9)
        .fromTo(fr, { opacity:0, left:"38%", top:"30%", width:"24%", height:"56%", borderTopLeftRadius:r0, borderTopRightRadius:r0 },
          { opacity:1, duration:.6 }, 5.9)
        .to(".belong-word", { opacity:0, scale:1.04, duration:.6 }, 6.1)
        .fromTo(".belong-scene", { opacity:0, clipPath:function(){ var r = r0(); return "inset(30% 38% 14% 38% round " + r + "px " + r + "px 0px 0px)"; } },
          { opacity:1, duration:.3 }, 6.7)
        .fromTo(".belong-scene", { clipPath:function(){ var r = r0(); return "inset(30% 38% 14% 38% round " + r + "px " + r + "px 0px 0px)"; } }, { clipPath:"inset(0% 0% 0% 0% round 0px 0px 0px 0px)", duration:2.2, immediateRender:false }, 7.0)
        .to(fr, { left:"0%", top:"0%", width:"100%", height:"100%", borderTopLeftRadius:0, borderTopRightRadius:0, opacity:0, duration:2.2 }, 7.0)
        .fromTo(".belong-line", { opacity:0, y:24 }, { opacity:1, y:0, duration:1 }, 8.8)
        .to({}, { duration:1.3 }, 9.8);
    } else {
      gsap.fromTo($$(".tile", stage), { y:28, opacity:.4 }, { y:0, opacity:1, stagger:.06, ease:"none",
        scrollTrigger:{ trigger:".collage", start:"top 92%", end:"top 55%", scrub:.4 } });
      gsap.fromTo(".belong-word", { scale:.86, letterSpacing:"-.06em" }, { scale:1, letterSpacing:"-.03em", ease:"none",
        scrollTrigger:{ trigger:".belong-word", start:"top 90%", end:"top 50%", scrub:.4 } });
      gsap.fromTo(".belong-scene", { clipPath:function(){ var r = Math.round(stage.clientWidth * .32); return "inset(6% 18% 0% 18% round " + r + "px " + r + "px 0px 0px)"; } },
        { clipPath:"inset(0% 0% 0% 0% round 0px 0px 0px 0px)", ease:"none",
          scrollTrigger:{ trigger:".belong-scene", start:"top 90%", end:"top 25%", scrub:.5, invalidateOnRefresh:true } });
    }
  }

  function interludeScene(){
    gsap.fromTo(".interlude img", { yPercent:-6 }, { yPercent:6, ease:"none",
      scrollTrigger:{ trigger:".interlude", start:"top bottom", end:"bottom top", scrub:true } });
  }
  function closingScene(){
    gsap.fromTo(".close-line path", { strokeDashoffset:1 }, { strokeDashoffset:0, ease:"none",
      scrollTrigger:{ trigger:".close-line", start:"top 92%", end:"top 62%", scrub:.5 } });
    gsap.fromTo(".footer-line", { scaleX:.2 }, { scaleX:1, ease:"none",
      scrollTrigger:{ trigger:".footer", start:"top bottom", end:"top 60%", scrub:.5 } });
  }

  function buildScenes(){
    alignHorizon();
    if (!hasGsap) return;
    if (mm) { mm.revert(); mm = null; }
    $$(".route-map .m").forEach(function(m){ m.classList.add("is-on"); });
    $("#belongStage").classList.remove("is-cine");
    if (motionOn) {
      mm = gsap.matchMedia();
      mm.add({ desk:"(min-width: 900px)", mob:"(max-width: 899.98px)" }, function(ctx){
        var desk = ctx.conditions.desk;
        heroScene(desk); lifeScene(desk); beginScene(desk); routeScene(desk); trustScene(); interludeScene(); belongScene(desk); closingScene();
        return function(){
          $("#belongStage").classList.remove("is-cine");
          $$(".route-map .m").forEach(function(m){ m.classList.add("is-on"); });
        };
      });
    }
    ScrollTrigger.refresh();
  }

  function entrance(){
    if (!hasGsap || !motionOn) return;
    gsap.from(".h1-line > span", { yPercent:108, duration:1, ease:"power3.out", stagger:.12, delay:.05 });
    gsap.from(".hero-eyebrow, .hero-aside", { opacity:0, y:14, duration:.8, ease:"power2.out", stagger:.1, delay:.35 });
  }

  /* ---------- Motion control ---------- */
  var mb = $("#motionBtn");
  function applyMotion(persist){
    root.classList.toggle("motion-off", !motionOn);
    mb.setAttribute("aria-pressed", String(motionOn));
    mb.setAttribute("title", motionOn ? "Turn scroll animation off" : "Turn scroll animation on");
    if (persist) { try { localStorage.setItem(KEY, motionOn ? "on" : "off"); } catch (e) {} }
  }
  mb.addEventListener("click", function(){
    var y = window.scrollY, anchor = null;
    motionOn = !motionOn; applyMotion(true);
    $$("main > section").some(function(s){ var r = s.getBoundingClientRect(); if (r.bottom > 80) { anchor = s; return true; } return false; });
    buildScenes();
    if (anchor && y > 10) anchor.scrollIntoView({ behavior:"instant", block:"start" });
  });
  if (rmq.addEventListener) rmq.addEventListener("change", function(e){
    try { if (localStorage.getItem(KEY)) return; } catch (err) {}
    motionOn = !e.matches; applyMotion(false); buildScenes();
  });

  /* ---------- Menu ---------- */
  var menuBtn = $("#menuBtn"), menu = $("#navMenu");
  function setMenu(open){ menu.classList.toggle("open", open); menuBtn.setAttribute("aria-expanded", String(open)); }
  menuBtn.addEventListener("click", function(){ setMenu(!menu.classList.contains("open")); });
  $$("a", menu).forEach(function(a){ a.addEventListener("click", function(){ setMenu(false); }); });
  document.addEventListener("keydown", function(e){ if (e.key === "Escape" && menu.classList.contains("open")) { setMenu(false); menuBtn.focus(); } });
  document.addEventListener("click", function(e){ if (menu.classList.contains("open") && !e.target.closest(".nav-inner")) setMenu(false); });

  /* ---------- Atlas tabs ---------- */
  var tabs = $$('[role="tab"]');
  function selectTab(tab, focus){
    tabs.forEach(function(t){
      var on = t === tab;
      t.setAttribute("aria-selected", String(on)); t.tabIndex = on ? 0 : -1;
      var p = document.getElementById(t.getAttribute("aria-controls"));
      p.hidden = !on;
      if (on) { p.classList.remove("fade-in"); void p.offsetWidth; p.classList.add("fade-in"); }
    });
    if (focus) tab.focus();
    if (hasGsap) ScrollTrigger.refresh();
  }
  tabs.forEach(function(t, i){
    t.addEventListener("click", function(){ selectTab(t, false); });
    t.addEventListener("keydown", function(e){
      var n = null;
      if (e.key === "ArrowRight" || e.key === "ArrowDown") n = tabs[(i + 1) % tabs.length];
      else if (e.key === "ArrowLeft" || e.key === "ArrowUp") n = tabs[(i - 1 + tabs.length) % tabs.length];
      else if (e.key === "Home") n = tabs[0];
      else if (e.key === "End") n = tabs[tabs.length - 1];
      if (n) { e.preventDefault(); selectTab(n, true); }
    });
  });

  /* ---------- Contact: prepares an email draft; never claims to send ---------- */
  var TO = "info@moving2valencia.eu";
  function copyText(text, statusEl, fallbackEl, okMsg){
    var fail = function(){
      if (fallbackEl) { fallbackEl.focus(); if (fallbackEl.select) fallbackEl.select(); }
      statusEl.textContent = "Couldn’t copy automatically. The text is selected, so copy it with your keyboard.";
    };
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(function(){ statusEl.textContent = okMsg; }, fail);
      } else fail();
    } catch (e) { fail(); }
  }
  $("#copyAddr").addEventListener("click", function(){ copyText(TO, $("#addrStatus"), null, "Address copied."); });

  var form = $("#askForm"), panel = $("#draftPanel");
  form.addEventListener("submit", function(e){
    e.preventDefault();
    var st = $("#formStatus"); st.textContent = "";
    if (!form.checkValidity()) {
      var bad = form.querySelector(":invalid");
      var lbl = bad ? form.querySelector('label[for="' + bad.id + '"]') : null;
      st.textContent = bad && bad.type === "email" && bad.value ? "Check your email address: it should look like name@example.com." : "Please fill in " + (lbl ? lbl.textContent.replace(/\(optional\)/, "").trim().toLowerCase() : "the required fields") + ".";
      if (bad) bad.focus();
      return;
    }
    var v = function(id){ return $("#" + id).value.trim(); };
    var subj = "Conversation request: moving to Valencia";
    var body = "Hello Christa,\n\n" + v("f-msg") + "\n\n" +
      "Where I live now: " + (v("f-from") || "Not given") + "\n" +
      "When I’d like to move: " + ($("#f-when").value || "Not sure yet") + "\n\n" +
      "Best regards,\n" + v("f-name") + "\n" + v("f-email");
    $("#d-subj").textContent = subj;
    $("#d-body").value = body;
    $("#mailLink").href = "mailto:" + TO + "?subject=" + encodeURIComponent(subj) + "&body=" + encodeURIComponent(body);
    $("#draftStatus").textContent = "";
    form.hidden = true; panel.hidden = false;
    $("#draftTitle").focus();
    if (hasGsap) ScrollTrigger.refresh();
  });
  $("#copyDraft").addEventListener("click", function(){
    copyText("To: " + TO + "\nSubject: " + $("#d-subj").textContent + "\n\n" + $("#d-body").value, $("#draftStatus"), $("#d-body"), "Email text copied. Paste it into a new email to send it.");
  });
  $("#mailLink").addEventListener("click", function(){
    $("#draftStatus").textContent = "If your email app didn’t open, copy the text instead. Nothing has been sent until you send it yourself.";
  });
  $("#editDraft").addEventListener("click", function(){ panel.hidden = true; form.hidden = false; $("#f-msg").focus(); if (hasGsap) ScrollTrigger.refresh(); });

  /* ---------- Boot ---------- */
  applyMotion(false);
  buildScenes();
  entrance();
  var refresh = function(){ alignHorizon(); if (hasGsap) ScrollTrigger.refresh(); };
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(refresh);
  window.addEventListener("load", function(){
    refresh();
    var id = location.hash.slice(1);
    if (id && /^[\w.~-]+$/.test(id)) { var el = document.getElementById(id); if (el) { root.style.scrollBehavior = "auto"; el.scrollIntoView({ block:"start" }); root.style.scrollBehavior = ""; } }
  });
})();
