// ===== YOUR INFORMATION (edit here, then re-upload) =====
const CONTENT = {
  name: "Fuad Hasan",
  jobTitle: "Student",
  tagline: "Class 12 · Science · Abdul Awal Degree College",
  photo: "fuad.jpg",
  heroImage: "",            // later: "fuad-hero.jpg" (Spider-Man version)
  phone: "+8801352251589",
  whatsapp: "+8801352251589",
  email: "fuadhasan9174@gmail.com",
  facebook: "",             // paste your Facebook link
  tiktok: "",               // paste your TikTok link
  location: "",             // optional
  accent: "#ff3b2f"
};

const $ = id => document.getElementById(id);
const esc = s => String(s).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const digits = s => String(s).replace(/\D/g, "");
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
const canHover = matchMedia("(hover: hover)").matches;

// ----- fill in your content -----
document.documentElement.style.setProperty("--accent", CONTENT.accent);
$("navName").textContent = CONTENT.name;
$("heroName").innerHTML = esc(CONTENT.name).replace(" ", "<br>");
$("heroTagline").textContent = CONTENT.tagline;
$("idRole").textContent = CONTENT.jobTitle;
$("idName").textContent = CONTENT.name;
$("idPhoto").src = CONTENT.photo;
$("revealNormal").src = CONTENT.photo;
$("revealNormal").alt = CONTENT.name;
if (CONTENT.heroImage) $("revealHero").style.background = `url("${CONTENT.heroImage}") center/cover no-repeat`;
$("footName").textContent = CONTENT.name;
$("year").textContent = new Date().getFullYear();

// contact rows: tapping the number or email opens it directly
function rowHTML(label, value, href, copy) {
  const copyBtn = copy ? `<button class="copy-btn" data-copy="${esc(value)}">Copy</button>` : "";
  return `<div class="row"><a href="${href}" style="color:inherit;text-decoration:none;flex:1;min-width:0"><small>${label}</small><strong>${esc(value)}</strong></a>${copyBtn}<span class="go">↗</span></div>`;
}
let rows = "";
if (CONTENT.phone) rows += rowHTML("Phone", CONTENT.phone, "tel:+" + digits(CONTENT.phone), false);
if (CONTENT.whatsapp) rows += rowHTML("WhatsApp", CONTENT.whatsapp, "https://wa.me/" + digits(CONTENT.whatsapp), false);
if (CONTENT.email) rows += rowHTML("Email", CONTENT.email, "mailto:" + esc(CONTENT.email), true);
if (CONTENT.location) rows += `<div class="row"><div style="flex:1"><small>Location</small><strong>${esc(CONTENT.location)}</strong></div></div>`;
$("contactRows").innerHTML = rows;

document.querySelectorAll(".copy-btn").forEach(b => b.addEventListener("click", e => {
  e.preventDefault();
  if (navigator.clipboard) navigator.clipboard.writeText(b.dataset.copy);
  b.textContent = "Copied";
}));

let social = "";
if (CONTENT.facebook) social += `<a href="${esc(CONTENT.facebook)}" target="_blank" rel="noopener">Facebook</a>`;
if (CONTENT.tiktok) social += `<a href="${esc(CONTENT.tiktok)}" target="_blank" rel="noopener">TikTok</a>`;
$("socialRow").innerHTML = social;
if (!social) $("socialRow").style.display = "none";

// ----- EFFECT 1: hanging, stretchy ID card -----
function constrain(a, b, SEG) {
  const dx = b.x - a.x, dy = b.y - a.y, d = Math.hypot(dx, dy) || 0.0001;
  if (d <= SEG) return;                       // only pulls when stretched
  const diff = (d - SEG) / d;
  if (!a.fixed && !b.fixed) { a.x += dx*diff*0.5; a.y += dy*diff*0.5; b.x -= dx*diff*0.5; b.y -= dy*diff*0.5; }
  else if (!a.fixed) { a.x += dx*diff; a.y += dy*diff; }
  else if (!b.fixed) { b.x -= dx*diff; b.y -= dy*diff; }
}

(function idCard() {
  const stage = $("idStage"), canvas = $("idCanvas"), card = $("idCard");
  const ctx = canvas.getContext("2d");
  const N = 12, SEG = 14, GRAV = 0.55, DAMP = 0.982, MAXV = 16;
  let W = 0, H = 0, anchorX = 0, pts = [], dragging = false, running = false;
  let lastP = null, vel = { x: 0, y: 0 };

  function size() {
    W = stage.clientWidth;
    stage.style.height = W > 760 ? "580px" : "480px";
    H = stage.clientHeight;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.25);
    canvas.width = W * dpr; canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    anchorX = W > 760 ? W * 0.9 - card.offsetWidth / 2 : W / 2;
  }
  function step() {
    pts[N].fixed = dragging;
    for (let i = 1; i <= N; i++) {
      const p = pts[i]; if (p.fixed) continue;
      let vx = (p.x - p.px) * DAMP, vy = (p.y - p.py) * DAMP;
      vx = Math.max(-MAXV, Math.min(MAXV, vx)); vy = Math.max(-MAXV, Math.min(MAXV, vy));
      p.px = p.x; p.py = p.y;
      p.x += vx; p.y += vy + GRAV;
    }
    for (let k = 0; k < 6; k++) for (let i = 0; i < N; i++) constrain(pts[i], pts[i+1], SEG);
  }
  function draw() {
    ctx.clearRect(0, 0, W, H);
    ctx.strokeStyle = CONTENT.accent; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i <= N; i++) ctx.lineTo(pts[i].x, pts[i].y);
    ctx.stroke();
    const a = pts[N-1], b = pts[N];
    const deg = (Math.atan2(b.y - a.y, b.x - a.x) - Math.PI/2) * 180 / Math.PI;
    card.style.right = "auto";
    card.style.left = (b.x - card.offsetWidth / 2) + "px";
    card.style.top = b.y + "px";
    card.style.transformOrigin = "50% 0";
    card.style.transform = `rotate(${deg}deg)`;
  }
  function loop() {
    step(); draw();
    let motion = 0;
    for (let i = 1; i <= N; i++) motion += Math.abs(pts[i].x - pts[i].px) + Math.abs(pts[i].y - pts[i].py);
    if (dragging || motion > 0.05) requestAnimationFrame(loop); else running = false;
  }
  function start() { if (!running) { running = true; requestAnimationFrame(loop); } }
  function pos(e) { const r = stage.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; }

  card.addEventListener("pointerdown", e => {
    dragging = true; card.setPointerCapture(e.pointerId);
    lastP = pos(e); vel = { x: 0, y: 0 }; start(); e.preventDefault();
  });
  card.addEventListener("pointermove", e => {
    if (!dragging) return;
    const p = pos(e); vel = { x: p.x - lastP.x, y: p.y - lastP.y }; lastP = p;
    const n = pts[N]; n.x = p.x; n.y = p.y; n.px = p.x; n.py = p.y;
  });
  function release() {
    if (!dragging) return;
    dragging = false;
    const n = pts[N]; n.fixed = false;
    const k = 0.35;
    n.px = n.x - Math.max(-MAXV, Math.min(MAXV, vel.x * k));
    n.py = n.y - Math.max(-MAXV, Math.min(MAXV, vel.y * k));
    start();
  }
  card.addEventListener("pointerup", release);
  card.addEventListener("pointercancel", release);

  function init() {
    size(); pts = [];
    for (let i = 0; i <= N; i++) {
      const y = reduce ? i * SEG : -i * SEG;
      pts.push({ x: anchorX, y, px: anchorX, py: y, fixed: i === 0 });
    }
    draw();
    if (!reduce) setTimeout(start, 500);
  }
  window.addEventListener("resize", size);
  init();
})();

// ----- EFFECT 2: superhero mask reveal -----
(function reveal() {
  const box = $("reveal");
  let tx = 0, ty = 0, cx = 0, cy = 0, rt = 0, rc = 0;
  function init() { const w = box.clientWidth, h = box.clientHeight; tx = cx = w/2; ty = cy = h/2; }
  function frame() {
    const w = box.clientWidth;
    cx += (tx - cx) * 0.18; cy += (ty - cy) * 0.18; rc += (rt * w - rc) * 0.18;
    box.style.setProperty("--mx", cx + "px");
    box.style.setProperty("--my", cy + "px");
    box.style.setProperty("--r", rc + "px");
    requestAnimationFrame(frame);
  }
  function setTarget(e) { const r = box.getBoundingClientRect(); tx = e.clientX - r.left; ty = e.clientY - r.top; }
  box.addEventListener("pointermove", setTarget);
  box.addEventListener("pointerdown", e => { rt = 0.32; box.setPointerCapture(e.pointerId); setTarget(e); });
  box.addEventListener("pointerup", () => { rt = 0.2; });
  box.addEventListener("pointerenter", () => { rt = 0.2; });
  box.addEventListener("pointerleave", () => { rt = 0; });
  window.addEventListener("resize", init);
  init(); frame();
})();

// ----- EFFECT 3: "let's collab" button -----
(function collab() {
  const a = document.createElement("a");
  a.id = "gooLink"; a.href = "#contact"; a.textContent = "let's collab";
  document.body.appendChild(a);
  if (!canHover || reduce) return;
  addEventListener("pointermove", e => {
    const r = a.getBoundingClientRect();
    const cx = r.left + r.width/2, cy = r.top + r.height/2;
    const dx = e.clientX - cx, dy = e.clientY - cy, d = Math.hypot(dx, dy), R = 160;
    if (d < R) {
      const p = 1 - d / R;
      a.style.transform = `translate(calc(-50% + ${(dx*p*0.3).toFixed(1)}px), ${(dy*p*0.3).toFixed(1)}px) scale(${(1 + p*0.08).toFixed(3)})`;
    } else a.style.transform = "";
  });
})();

// ----- EFFECT 4: cursor follower ring -----
(function cursor() {
  if (!canHover) return;
  const dot = document.createElement("div"); dot.id = "dot";
  const ring = document.createElement("div"); ring.id = "ring";
  const halo = document.createElement("div"); halo.id = "halo";
  document.body.append(halo, ring, dot);
  let mx = -100, my = -100, rx = -100, ry = -100, hx = -100, hy = -100, hot = false;
  addEventListener("pointermove", e => {
    mx = e.clientX; my = e.clientY;
    hot = !!e.target.closest("a,button,.reveal,.id-card");
  });
  function frame() {
    rx += (mx - rx) * 0.2; ry += (my - ry) * 0.2;
    hx += (mx - hx) * 0.12; hy += (my - hy) * 0.12;
    dot.style.transform = `translate3d(${mx}px,${my}px,0)`;
    ring.style.transform = `translate3d(${rx}px,${ry}px,0)`;
    halo.style.transform = `translate3d(${hx}px,${hy}px,0)`;
    ring.classList.toggle("hot", hot);
    requestAnimationFrame(frame);
  }
  frame();
})();
    
