// ==========================================================================
// PETAL & SCENE — ZEN GARDEN (inspired by the Plants vs. Zombies 2 Zen Garden)
// Bright cartoon lawn, stone-edged planting bed, terracotta pots.
// Tools: Plant (click an empty pot), Water (seedling grows faster), Dig up (remove a flower).
// ==========================================================================
document.addEventListener("DOMContentLoaded", () => {
    const canvas = document.getElementById("gardenCanvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    let flowers = StorageEngine.getPlantedFlowers();
    const collection = StorageEngine.getCollection() || {};
    const completedCount = Object.values(collection).filter(v => v === "Completed").length;
    const countPlantedNode = document.querySelector(".count-planted");
    const countCompletedNode = document.querySelector(".count-completed");
    if (countCompletedNode) countCompletedNode.textContent = completedCount;

    const W = 960, H = 540, COLS = 8, ROWS = 3;
    const GROW_MS = 45000, WATER_BOOST = 7000, WATER_COOLDOWN = 1800;
    const slotX = c => 138 + c * 97;
    const slotBase = r => 285 + r * 90;
    const slotPos = i => ({ x: slotX(i % COLS), y: slotBase(Math.floor(i / COLS)) });

    // Older saves had free-form x/y: tuck those flowers into free pots
    (function migrate() {
        const used = new Set(flowers.filter(f => typeof f.slot === "number" && f.slot < COLS * ROWS).map(f => f.slot));
        let changed = false;
        flowers.forEach(f => {
            if (typeof f.slot === "number" && f.slot < COLS * ROWS) return;
            let i = 0; while (used.has(i) && i < COLS * ROWS) i++;
            f.slot = i; used.add(i); changed = true;
        });
        flowers = flowers.filter(f => f.slot < COLS * ROWS);
        flowers.forEach(f => { const p = slotPos(f.slot); f.x = p.x; f.y = p.y; });
        if (changed) StorageEngine.savePlantedFlowers(flowers);
    })();

    function updatePlantedCounter() {
        const lv = document.querySelector(".count-level"); if (lv) lv.textContent = 1 + Math.floor(flowers.length / 3);
        if (countPlantedNode) countPlantedNode.textContent = `${flowers.length} / ${completedCount}`;
    }
    updatePlantedCounter();

    const img = { blossom: new Image(), branch: new Image(), tulip: new Image() };
    img.blossom.src = "../assets/flowers/cherry_blossom.svg";
    img.branch.src = "../assets/flowers/flower_branch.svg";
    img.tulip.src = "../assets/flowers/pink_tulip.svg";

    // ---------- helpers ----------
    function rr(c, x, y, w, h, r) { c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath(); }
    function ell(c, x, y, rx, ry, fill, stroke, lw) {
        c.beginPath(); c.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
        if (fill) { c.fillStyle = fill; c.fill(); } if (stroke) { c.lineWidth = lw || 2; c.strokeStyle = stroke; c.stroke(); }
    }
    function seeded(seed) { return () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
    const easeOutBack = x => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); };

    // ---------- static scenery ----------
    function tree(c, x, base, s, col, hi, trunk) {
        c.fillStyle = trunk || "#8a5a35"; rr(c, x - 6 * s, base - 54 * s, 12 * s, 56 * s, 4); c.fill();
        [[0, -76, 34], [-24, -56, 25], [24, -56, 25], [0, -50, 28]].forEach(([dx, dy, r]) => ell(c, x + dx * s, base + dy * s, r * s, r * s, col, "rgba(0,0,0,.12)", 2));
        [[-10, -84, 12], [18, -64, 9]].forEach(([dx, dy, r]) => ell(c, x + dx * s, base + dy * s, r * s, r * s, hi));
    }
    function bush(c, x, y, s, col, hi) {
        [[-18, 0, 17], [0, -8, 22], [18, 0, 17]].forEach(([dx, dy, r]) => ell(c, x + dx * s, y + dy * s, r * s, r * s, col, "rgba(0,0,0,.14)", 2));
        ell(c, x - 6 * s, y - 16 * s, 8 * s, 6 * s, hi);
    }
    function daisy(c, x, y, s, col) {
        c.strokeStyle = "#4c9a3a"; c.lineWidth = 2; c.beginPath(); c.moveTo(x, y); c.lineTo(x, y + 12 * s); c.stroke();
        for (let i = 0; i < 6; i++) { const a = i * Math.PI / 3; ell(c, x + Math.cos(a) * 5 * s, y + Math.sin(a) * 5 * s, 4 * s, 4 * s, col); }
        ell(c, x, y, 3 * s, 3 * s, "#ffd23f");
    }
    function drawScene(c) {
        const rnd = seeded(7);
        let g = c.createLinearGradient(0, 0, 0, 230); g.addColorStop(0, "#6cc3fb"); g.addColorStop(1, "#d9f4ff");
        c.fillStyle = g; c.fillRect(0, 0, W, 240);
        g = c.createRadialGradient(850, 58, 4, 850, 58, 130); g.addColorStop(0, "rgba(255,250,210,1)"); g.addColorStop(.22, "rgba(255,240,170,.85)"); g.addColorStop(1, "rgba(255,240,170,0)");
        c.fillStyle = g; c.fillRect(690, 0, 270, 200);
        ell(c, 140, 232, 280, 78, "#a6e07c"); ell(c, 540, 240, 340, 92, "#9bdb70"); ell(c, 900, 232, 250, 70, "#a6e07c");
        ell(c, 330, 245, 240, 60, "#8fd566"); ell(c, 760, 248, 260, 62, "#8fd566");
        tree(c, 70, 196, .9, "#4faf3e", "#76cf5d"); tree(c, 250, 200, .7, "#5bbb45", "#82d868"); tree(c, 460, 198, .6, "#4faf3e", "#76cf5d");
        tree(c, 640, 200, .75, "#5bbb45", "#82d868");
        tree(c, 835, 198, 1, "#f6b3cd", "#ffdbe8", "#7a4c33");
        for (let i = 0; i < 16; i++) ell(c, 790 + rnd() * 90, 108 + rnd() * 52, 3, 3, "#ff8fb5");
        for (let x = -4; x < W; x += 24) {
            c.beginPath(); c.moveTo(x + 3, 176); c.lineTo(x + 12, 160); c.lineTo(x + 21, 176); c.lineTo(x + 21, 224); c.lineTo(x + 3, 224); c.closePath();
            c.fillStyle = "#e0a762"; c.fill(); c.lineWidth = 2; c.strokeStyle = "#8a5a2b"; c.stroke();
            c.strokeStyle = "rgba(255,255,255,.28)"; c.beginPath(); c.moveTo(x + 7, 178); c.lineTo(x + 7, 220); c.stroke();
        }
        [186, 208].forEach(y => { c.fillStyle = "#c58a46"; c.fillRect(0, y, W, 8); c.strokeStyle = "#8a5a2b"; c.lineWidth = 2; c.strokeRect(-2, y, W + 4, 8); });
        c.fillStyle = "#7ccd45"; c.fillRect(0, 224, W, H - 224);
        for (let ty = 224, r = 0; ty < H; ty += 44, r++) for (let tx = 0, q = 0; tx < W; tx += 44, q++) if ((r + q) & 1) { c.fillStyle = "#72c43c"; c.fillRect(tx, ty, 44, 44); }
        g = c.createLinearGradient(0, 224, 0, H); g.addColorStop(0, "rgba(255,255,255,.16)"); g.addColorStop(1, "rgba(0,60,0,.14)");
        c.fillStyle = g; c.fillRect(0, 224, W, H - 224);
        c.strokeStyle = "rgba(40,110,30,.45)"; c.lineWidth = 2; c.lineCap = "round";
        for (let i = 0; i < 70; i++) { const x = rnd() * W, y = 230 + rnd() * 300; c.beginPath(); c.moveTo(x - 4, y); c.lineTo(x - 5, y - 8); c.moveTo(x, y); c.lineTo(x, y - 11); c.moveTo(x + 4, y); c.lineTo(x + 6, y - 8); c.stroke(); }
        rr(c, 62, 232, 836, 312, 28); c.fillStyle = "rgba(0,0,0,.2)"; c.fill();
        rr(c, 64, 230, 832, 306, 28); c.fillStyle = "#cdbb91"; c.fill();
        const stone = (x, y, w, h, i) => { rr(c, x, y, w, h, 7); c.fillStyle = i % 2 ? "#e9dcb8" : "#d9c9a0"; c.fill(); c.lineWidth = 2; c.strokeStyle = "#8f7d57"; c.stroke(); c.strokeStyle = "rgba(255,255,255,.55)"; c.beginPath(); c.moveTo(x + 6, y + 3); c.lineTo(x + w - 6, y + 3); c.stroke(); };
        for (let x = 94, i = 0; x <= 826; x += 44, i++) { stone(x, 232, 40, 20, i); stone(x, 514, 40, 20, i + 1); }
        for (let y = 262, i = 0; y <= 490; y += 38, i++) { stone(66, y, 20, 34, i); stone(874, y, 20, 34, i + 1); }
        [[66, 232], [874, 232], [66, 514], [874, 514]].forEach(([x, y], i) => stone(x, y, 20, 20, i));
        rr(c, 90, 256, 780, 258, 14); g = c.createLinearGradient(0, 256, 0, 514); g.addColorStop(0, "#94603a"); g.addColorStop(1, "#7c4d2c"); c.fillStyle = g; c.fill();
        c.save(); rr(c, 90, 256, 780, 258, 14); c.clip();
        c.strokeStyle = "rgba(70,40,20,.35)"; c.lineWidth = 3;
        for (let y = 268; y < 514; y += 18) { c.beginPath(); c.moveTo(90, y); for (let x = 90; x <= 870; x += 30) c.lineTo(x + 15, y + (((x / 30) | 0) % 2 ? 2 : -2)); c.stroke(); }
        for (let i = 0; i < 90; i++) ell(c, 96 + rnd() * 768, 262 + rnd() * 246, 2 + rnd() * 2.5, 1.6 + rnd() * 1.4, rnd() > .5 ? "#a8764a" : "#6b4125");
        c.restore();
        rr(c, 90, 256, 780, 258, 14); c.strokeStyle = "rgba(0,0,0,.3)"; c.lineWidth = 4; c.stroke();
        bush(c, 30, 268, 1, "#4faf3e", "#76cf5d"); bush(c, 930, 272, 1, "#4faf3e", "#76cf5d");
        [[22, 330, "#ffffff"], [40, 350, "#ffd23f"], [926, 340, "#ff9ec0"], [942, 362, "#ffffff"], [26, 520, "#ff9ec0"], [938, 520, "#ffd23f"], [300, 538, "#ffffff"]].forEach(([x, y, col]) => daisy(c, x, y, 1, col));
        c.fillStyle = "#8a5a35"; rr(c, 27, 420, 10, 95, 3); c.fill(); c.strokeStyle = "#5c3a1f"; c.lineWidth = 2; c.stroke();
        rr(c, 6, 405, 52, 34, 6); c.fillStyle = "#e0a762"; c.fill(); c.stroke();
        c.fillStyle = "#5c3a1f"; c.font = "700 13px 'DM Sans', Arial, sans-serif"; c.textAlign = "center"; c.fillText("ZEN", 32, 421); c.font = "700 9px 'DM Sans', Arial, sans-serif"; c.fillText("GARDEN", 32, 432);
        c.save(); c.translate(928, 478);
        rr(c, -22, -2, 40, 34, 8); c.fillStyle = "#4aa8e8"; c.fill(); c.strokeStyle = "#2468a0"; c.lineWidth = 2.5; c.stroke();
        c.beginPath(); c.moveTo(-22, 8); c.lineTo(-40, -8); c.lineTo(-34, -12); c.lineTo(-20, 0); c.fillStyle = "#4aa8e8"; c.fill(); c.stroke();
        c.beginPath(); c.arc(4, -4, 14, Math.PI, 0); c.strokeStyle = "#2468a0"; c.lineWidth = 5; c.stroke();
        c.fillStyle = "rgba(255,255,255,.4)"; rr(c, -16, 4, 8, 22, 4); c.fill(); c.restore();
    }

    // ---------- moving things ----------
    const butterflies = [
        { cx: 300, cy: 330, rx: 200, ry: 70, a: .5, b: .8, col: "#ff8fb5" },
        { cx: 650, cy: 400, rx: 220, ry: 60, a: .4, b: .7, col: "#ffd23f" },
        { cx: 480, cy: 260, rx: 260, ry: 40, a: .3, b: .9, col: "#c9a7ff" }
    ];
    const clouds = [{ x: 90, y: 50, s: 1, v: 6 }, { x: 430, y: 95, s: .7, v: 4 }, { x: 700, y: 40, s: .85, v: 5 }];
    const fallingPetals = Array.from({ length: 12 }, () => ({ x: Math.random() * W, off: Math.random() * H, v: 18 + Math.random() * 20, ph: Math.random() * 6, s: 4 + Math.random() * 3 }));
    let particles = [];
    function drawCloud(c, x, y, s) {
        c.fillStyle = "rgba(255,255,255,.95)";
        [[0, 0, 26], [28, -10, 32], [62, 0, 26], [32, 8, 28]].forEach(([dx, dy, r]) => { c.beginPath(); c.arc(x + dx * s, y + dy * s, r * s, 0, Math.PI * 2); c.fill(); });
    }
    function drawButterfly(c, b, t) {
        const x = b.cx + Math.sin(t * b.a) * b.rx, y = b.cy + Math.sin(t * b.b + 1) * b.ry, flap = Math.max(.15, Math.abs(Math.sin(t * 11 + b.cx)));
        const dir = Math.cos(t * b.a) >= 0 ? 1 : -1;
        c.save(); c.translate(x, y); c.scale(dir, 1); c.rotate(Math.sin(t * 3) * .15);
        [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([sx, sy]) => { c.save(); c.scale(flap * sx, 1); ell(c, 7, sy * 5, 7, 5.5, b.col, "rgba(0,0,0,.35)", 1.2); c.restore(); });
        c.fillStyle = "#3a2a2a"; rr(c, -1.5, -7, 3, 14, 1.5); c.fill(); c.restore();
    }

    // ---------- pots and plants ----------
    function drawPot(c, x, base) {
        const sy = base + 6;
        ell(c, x, sy + 41, 38, 8, "rgba(0,0,0,.28)");
        c.beginPath(); c.moveTo(x - 33, sy); c.lineTo(x + 33, sy); c.lineTo(x + 25, sy + 36); c.quadraticCurveTo(x + 24, sy + 40, x + 19, sy + 40); c.lineTo(x - 19, sy + 40); c.quadraticCurveTo(x - 24, sy + 40, x - 25, sy + 36); c.closePath();
        const g = c.createLinearGradient(x - 33, 0, x + 33, 0); g.addColorStop(0, "#d46c3a"); g.addColorStop(.35, "#f09a62"); g.addColorStop(1, "#b9532a");
        c.fillStyle = g; c.fill(); c.lineWidth = 2.5; c.strokeStyle = "#8f3f1c"; c.stroke();
        rr(c, x - 38, sy - 8, 76, 15, 7); c.fillStyle = "#f2a06a"; c.fill(); c.stroke();
        c.fillStyle = "rgba(255,255,255,.32)"; rr(c, x - 30, sy - 5, 22, 4, 2); c.fill();
        ell(c, x, sy - 5, 31, 6.5, "#5a3a22"); ell(c, x, sy - 6, 26, 4.5, "#6d482b");
    }
    function leaf(c, x, y, ang, len, col) {
        c.save(); c.translate(x, y); c.rotate(ang); c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(len * .5, -len * .38, len, 0); c.quadraticCurveTo(len * .5, len * .32, 0, 0);
        c.fillStyle = col; c.fill(); c.lineWidth = 1.5; c.strokeStyle = "rgba(20,80,20,.5)"; c.stroke(); c.restore();
    }
    function stem(c, h, w) {
        c.strokeStyle = "#3f8f35"; c.lineWidth = w; c.lineCap = "round"; c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(3, -h * .5, 0, -h); c.stroke();
        c.strokeStyle = "rgba(160,235,120,.55)"; c.lineWidth = w * .35; c.beginPath(); c.moveTo(-1, -2); c.quadraticCurveTo(2, -h * .5, -1, -h + 2); c.stroke();
    }
    function drawMature(c, f) {
        if (f.type === "tulip") {
            const im = img.tulip, h = f.size * 2.1, w = h * 240 / 360;
            if (im.complete) c.drawImage(im, -w / 2, -h * .915, w, h);
        } else if (f.type === "branch") {
            const im = img.branch, w = f.size * 2.5, h = w * 260 / 420;
            leaf(c, 0, -6, -2.4, 24, "#6fb35c"); leaf(c, 0, -10, -.7, 24, "#5ba24c");
            if (im.complete) c.drawImage(im, -w * .05, -h * .9, w, h);
        } else {
            const st = 46 + f.size * .3;
            stem(c, st, 5); leaf(c, 1, -st * .35, -2.5, 26, "#6fb35c"); leaf(c, 1, -st * .5, -.6, 26, "#5ba24c");
            const im = img.blossom, s = f.size * 1.55;
            if (im.complete) c.drawImage(im, -s / 2, -st - s * .5, s, s);
        }
    }
    function drawSeedling(c, p, t) {
        const h = 8 + p * 40;
        c.rotate(Math.sin(t * 3) * .03);
        stem(c, h, 3.5 + p * 1.5);
        const L = 8 + p * 14;
        leaf(c, 0, -h * .45, -2.6, L, "#76c25c"); leaf(c, 0, -h * .45, -.55, L, "#63b14d");
        if (p < .3) { leaf(c, 0, -h, -2.1, L * .7, "#8ad36a"); leaf(c, 0, -h, -1.05, L * .7, "#8ad36a"); }
        else {
            const q = (p - .3) / .7, r = 4 + q * 9;
            const col = q < .5 ? "#9fdc7a" : `rgb(${Math.round(159 + 85 * (q - .5) * 2)},${Math.round(220 - 52 * (q - .5) * 2)},${Math.round(122 + 72 * (q - .5) * 2)})`;
            ell(c, 0, -h - r * .6, r * .8, r, col, "rgba(0,0,0,.2)", 1.5);
        }
    }
    function drawPlant(c, f, t, now) {
        const p = Math.min((now - f.plantedTime) / GROW_MS, 1);
        c.save(); c.translate(f.x, f.y);
        if (p >= 1) { c.rotate(Math.sin(t * 1.5 + f.slot) * .035); drawMature(c, f); }
        else if (p < .7) drawSeedling(c, p / .7, t);
        else { const q = (p - .7) / .3, s = .32 + .68 * easeOutBack(q); c.rotate(Math.sin(t * 2.2 + f.slot) * .03); c.scale(s, s); drawMature(c, f); }
        c.restore();
        return p;
    }

    // ---------- effects ----------
    function burst(x, y, kind, n) {
        for (let i = 0; i < n; i++) {
            const a = Math.random() * Math.PI * 2, sp = 40 + Math.random() * 90;
            particles.push({ kind, x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 40, born: performance.now(), life: kind === "dust" ? 600 : 800, size: 2 + Math.random() * 3 });
        }
    }
    function drawParticles(c, nowP, dt) {
        particles = particles.filter(p => nowP - p.born < p.life);
        particles.forEach(p => {
            const k = (nowP - p.born) / p.life;
            p.x += p.vx * dt; p.y += p.vy * dt; p.vy += (p.kind === "spark" ? 20 : 220) * dt;
            c.globalAlpha = 1 - k;
            if (p.kind === "drop") ell(c, p.x, p.y, p.size * .7, p.size * 1.2, "#6cc4ff", "#fff", 1);
            else if (p.kind === "dust") ell(c, p.x, p.y, p.size * 1.6, p.size * 1.6, "#8a5a34");
            else { c.fillStyle = "#ffe066"; c.save(); c.translate(p.x, p.y); c.rotate(k * 6); c.fillRect(-p.size, -1, p.size * 2, 2); c.fillRect(-1, -p.size, 2, p.size * 2); c.restore(); }
            c.globalAlpha = 1;
        });
    }
    const cans = [];
    function drawCans(c, nowP) {
        for (let i = cans.length - 1; i >= 0; i--) {
            const a = cans[i], k = (nowP - a.born) / 750;
            if (k >= 1) { cans.splice(i, 1); continue; }
            const tilt = -Math.sin(Math.min(k * 1.6, 1) * Math.PI * .5) * .55 * (k > .8 ? (1 - k) * 5 : 1);
            c.save(); c.translate(a.x + 44, a.y - 70); c.rotate(tilt); c.globalAlpha = k > .85 ? (1 - k) / .15 : 1;
            rr(c, -22, -2, 40, 30, 8); c.fillStyle = "#4aa8e8"; c.fill(); c.strokeStyle = "#2468a0"; c.lineWidth = 2.5; c.stroke();
            c.beginPath(); c.moveTo(-22, 6); c.lineTo(-42, -8); c.lineTo(-36, -13); c.lineTo(-20, -2); c.fill(); c.stroke();
            c.beginPath(); c.arc(4, -4, 13, Math.PI, 0); c.lineWidth = 5; c.stroke(); c.restore();
            if (Math.random() < .6) particles.push({ kind: "drop", x: a.x - 6 + Math.random() * 6, y: a.y - 74, vx: -10 - Math.random() * 20, vy: 30, born: nowP, life: 700, size: 3 });
        }
    }

    // ---------- input ----------
    const tool = () => (document.querySelector(".tool-radio:checked") || { value: "plant" }).value;
    const flowerType = () => (document.querySelector(".flower-radio:checked") || { value: "blossom" }).value;
    let mouse = { x: -999, y: -999, in: false };
    const toLogical = e => { const r = canvas.getBoundingClientRect(); return { x: (e.clientX - r.left) * W / r.width, y: (e.clientY - r.top) * H / r.height }; };
    function slotAt(m) {
        let best = -1, bd = 58 * 58;
        for (let i = 0; i < COLS * ROWS; i++) { const p = slotPos(i), dx = m.x - p.x, dy = m.y - (p.y + 4), d = dx * dx + dy * dy; if (d < bd) { bd = d; best = i; } }
        return best;
    }
    const flowerAt = i => flowers.find(f => f.slot === i);
    canvas.addEventListener("mousemove", e => { mouse = Object.assign(toLogical(e), { in: true }); });
    canvas.addEventListener("mouseleave", () => { mouse.in = false; });

    const bloomed = new Set(flowers.filter(f => Date.now() - f.plantedTime >= GROW_MS).map(f => f.slot));

    canvas.addEventListener("click", e => {
        const i = slotAt(toLogical(e));
        if (i < 0) return;
        const p = slotPos(i), f = flowerAt(i), t = tool();
        if (t === "plant") {
            if (f) { window.toast("That pot is already growing a flower. Try the Water tool, or Dig it up first."); return; }
            if (flowers.length >= completedCount) {
                window.toast(completedCount === 0 ? "Finish a drama in your collection to earn your first blossom." : `All ${completedCount} blossom(s) planted. Complete another drama to plant more.`);
                return;
            }
            flowers.push({ slot: i, x: p.x, y: p.y, type: flowerType(), size: Math.random() * 12 + 36, plantedTime: Date.now() });
            StorageEngine.savePlantedFlowers(flowers); updatePlantedCounter();
            burst(p.x, p.y, "dust", 12);
        } else if (t === "water") {
            if (!f) { window.toast("Nothing planted in this pot yet."); return; }
            if (Date.now() - f.plantedTime >= GROW_MS) { window.toast("This flower is already in full bloom."); return; }
            if (Date.now() - (f.wateredAt || 0) < WATER_COOLDOWN) return;
            f.plantedTime -= WATER_BOOST; f.wateredAt = Date.now();
            StorageEngine.savePlantedFlowers(flowers);
            cans.push({ x: p.x, y: p.y, born: performance.now() });
        } else if (t === "remove") {
            if (!f) return;
            if (!confirm("Dig up this flower? You can plant the blossom again somewhere else.")) return;
            flowers = flowers.filter(x => x !== f); bloomed.delete(f.slot);
            StorageEngine.savePlantedFlowers(flowers); updatePlantedCounter();
            burst(p.x, p.y - 20, "dust", 18);
        }
    });

    // ---------- main loop ----------
    let bg = null, scale = 1, last = performance.now();
    function frame(nowP) {
        const dt = Math.min((nowP - last) / 1000, .05); last = nowP;
        const t = nowP / 1000, now = Date.now();
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.drawImage(bg, 0, 0);
        ctx.setTransform(scale, 0, 0, scale, 0, 0);
        clouds.forEach(cl => drawCloud(ctx, ((cl.x + t * cl.v) % (W + 260)) - 130, cl.y, cl.s));

        const grown = flowers.filter(f => now - f.plantedTime >= GROW_MS).sort((a, b) => a.slot - b.slot).map(f => ({ x: f.x, y: f.y - 22 }));
        if (typeof renderConstellation === "function") renderConstellation(ctx, grown, "rgba(255,255,255,.7)");

        const hs = mouse.in ? slotAt(mouse) : -1, tl = tool();
        for (let i = 0; i < COLS * ROWS; i++) {
            const p = slotPos(i), f = flowerAt(i);
            if (i === hs) {
                const col = tl === "plant" ? "255,255,255" : tl === "water" ? "108,196,255" : "255,90,90";
                ctx.save(); ctx.globalAlpha = .55 + Math.sin(t * 6) * .15; ell(ctx, p.x, p.y + 6, 46, 15, `rgba(${col},.45)`, `rgba(${col},.95)`, 3); ctx.restore();
            }
            drawPot(ctx, p.x, p.y);
            if (f) {
                const prog = drawPlant(ctx, f, t, now);
                if (prog >= 1 && !bloomed.has(f.slot)) { bloomed.add(f.slot); burst(f.x, f.y - 55, "spark", 18); window.toast("A blossom has fully bloomed!"); }
                if (prog < 1 && tl === "water" && now - (f.wateredAt || 0) > 4000) {
                    const bob = Math.sin(t * 4 + i) * 3; ctx.save(); ctx.translate(f.x + 26, f.y - 52 + bob); ell(ctx, 0, 0, 9, 11, "#6cc4ff", "#fff", 2); ctx.fillStyle = "#fff"; ctx.font = "700 11px sans-serif"; ctx.textAlign = "center"; ctx.fillText("?", 0, 4); ctx.restore();
                }
            } else if (i === hs && tl === "plant" && flowers.length < completedCount) {
                ctx.save(); ctx.globalAlpha = .55; ctx.translate(p.x, p.y); drawMature(ctx, { type: flowerType(), size: 40, slot: i }); ctx.restore();
            }
        }

        butterflies.forEach(b => drawButterfly(ctx, b, t));
        fallingPetals.forEach(fp => {
            const y = (fp.off + t * fp.v) % (H + 40) - 20, x = fp.x + Math.sin(t * .8 + fp.ph) * 36;
            ctx.save(); ctx.translate(x, y); ctx.rotate(t * .9 + fp.ph); ell(ctx, 0, 0, fp.s, fp.s * .55, "rgba(255,170,200,.85)"); ctx.restore();
        });
        drawCans(ctx, nowP); drawParticles(ctx, nowP, dt);

        if (hs >= 0) {
            const f = flowerAt(hs), p = slotPos(hs);
            let label = "";
            if (tl === "plant") label = f ? "Pot in use" : (flowers.length < completedCount ? "Plant here" : "No blossoms left");
            else if (tl === "water") label = f ? (now - f.plantedTime >= GROW_MS ? "In full bloom" : "Water it!") : "Empty pot";
            else label = f ? "Dig up" : "Empty pot";
            if (f && now - f.plantedTime < GROW_MS) label += "  ·  " + Math.ceil((GROW_MS - (now - f.plantedTime)) / 1000) + "s left";
            ctx.font = "700 13px 'DM Sans', Arial, sans-serif"; ctx.textAlign = "center";
            const w = ctx.measureText(label).width + 20, ty = p.y - (f ? 105 : 50);
            rr(ctx, p.x - w / 2, ty - 15, w, 24, 12); ctx.fillStyle = "rgba(40,28,18,.85)"; ctx.fill(); ctx.fillStyle = "#fff"; ctx.fillText(label, p.x, ty + 2);
        }
        requestAnimationFrame(frame);
    }

    function fit() {
        const cssW = canvas.getBoundingClientRect().width || Math.max(260, canvas.parentElement.clientWidth - 32);
        const dpr = Math.min(2, window.devicePixelRatio || 1);
        canvas.width = Math.round(cssW * dpr); canvas.height = Math.round(cssW * H / W * dpr);
        scale = canvas.width / W;
        bg = document.createElement("canvas"); bg.width = canvas.width; bg.height = canvas.height;
        const b = bg.getContext("2d"); b.setTransform(scale, 0, 0, scale, 0, 0); drawScene(b);
    }
    fit();
    let rz; window.addEventListener("resize", () => { clearTimeout(rz); rz = setTimeout(fit, 120); });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(fit);
    requestAnimationFrame(frame);
});
