// Settings: one engine applies every saved choice on every page; the Settings page (settings.html) draws the controls.
(function () {
    // ---- Setting definitions: k = storage key, t = title, h = hint, d = default, o = options [value, label] ----
    const GROUPS = [
        { id: "look", name: "Appearance", items: [
            { k: "theme", t: "Theme", h: "Switch between the dark night look and a bright light look.", d: "dark", o: [["dark", "Dark"], ["light", "Light"]] },
            { k: "accent", t: "Accent colour", h: "Auto follows the mood you log most in your diary.", d: "mood", type: "swatch" },
            { k: "tint", t: "Background tint", h: "The only colour laid over the background picture. Works in both Dark and Light.", d: "default", o: [["default", "Original"], ["blue", "Deep ocean"], ["plum", "Plum dusk"], ["forest", "Night forest"], ["sunset", "Sunset"], ["clear", "Crystal clear"]] },
            { k: "cards", t: "Card style", d: "glass", o: [["glass", "Glass"], ["solid", "Solid"], ["neon", "Neon outline"]] },
            { k: "round", t: "Corners", d: "soft", o: [["sharp", "Sharp"], ["soft", "Soft"], ["round", "Very round"]] },
            { k: "video", t: "Header video", h: "Drifting petals video behind the top bar.", d: "off", o: [["on", "On"], ["off", "Off"]] },
            { k: "aurora", t: "Aurora glow", h: "The slow coloured light drifting over the page.", d: "on", o: [["on", "On"], ["off", "Off"]] }
        ] },
        { id: "pointer", name: "Mouse pointer", items: [
            { k: "cursor", t: "Pointer skin", h: "Pick one, or upload your own picture.", d: "default", type: "skins" },
            { k: "cursize", t: "Pointer size", d: "32", o: [["24", "Small"], ["32", "Normal"], ["48", "Large"], ["64", "Huge"]] },
            { k: "trail", t: "Pointer trail", d: "off", o: [["off", "Off"], ["sparkle", "Sparkles"], ["petals", "Petals"], ["hearts", "Hearts"], ["stars", "Stars"], ["rainbow", "Rainbow"]] },
            { k: "click", t: "Click effect", d: "off", o: [["off", "Off"], ["ripple", "Ripple"], ["burst", "Petal burst"]] },
            { k: "glow", t: "Light that follows the pointer", d: "off", o: [["off", "Off"], ["on", "On"]] }
        ] },
        { id: "motion", name: "Motion and sound", items: [
            { k: "page", t: "Page change effect", h: "Zoom is the default. Pick one and it plays a preview.", d: "zoom", o: [["zoom", "Zoom"], ["tear", "Page tear"], ["curtain", "Theatre curtain"], ["iris", "Iris circle"], ["diamond", "Diamond"], ["split", "Split doors"], ["roller", "Roller blind"], ["wipe", "Sakura wipe"], ["petals", "Petal storm"], ["ink", "Ink bleed"], ["blinds", "Blinds"], ["shutter", "Shutter"], ["mosaic", "Mosaic tiles"], ["slide", "Slide"], ["skew", "Skew slide"], ["flip", "3D flip"], ["swing", "Swing"], ["spin", "Spin"], ["rise", "Rise"], ["drop", "Drop in"], ["blur", "Blur"], ["fade", "Fade"], ["random", "Surprise me"], ["none", "None"]] },
            { k: "motion", t: "Animations", h: "Choose Reduced if movement bothers you.", d: "on", o: [["on", "On"], ["off", "Reduced"]] },
            { k: "tilt", t: "Card hover", d: "lift", o: [["lift", "Lift"], ["tilt", "3D tilt"], ["none", "None"]] },
            { k: "sound", t: "Soft click sound", d: "off", o: [["off", "Off"], ["on", "On"]] }
        ] },
        { id: "text", name: "Text", items: [
            { k: "font", t: "Font style", d: "elegant", o: [["elegant", "Elegant serif"], ["modern", "Modern sans"], ["classic", "Classic"], ["rounded", "Rounded"]] },
            { k: "size", t: "Text size", d: "100", o: [["90", "Small"], ["100", "Normal"], ["115", "Large"], ["130", "Extra large"]] },
            { k: "contrast", t: "High contrast text", d: "off", o: [["off", "Off"], ["on", "On"]] }
        ] },
        { id: "buddy", name: "Companion", items: [
            { k: "buddy", t: "Show Loomi", h: "Your little floating friend. Drag it anywhere.", d: "on", o: [["on", "Show"], ["off", "Hide"]] },
            { k: "chatter", t: "How chatty", d: "talk", o: [["talk", "Chatty"], ["quiet", "Only when poked"]] },
            { k: "buddyskin", t: "Look", h: "Pick one of six friends, or use any picture you like.", d: "default", type: "buddyskin" }
        ] }
    ];
    const ITEMS = GROUPS.flatMap(g => g.items);
    const dflt = k => ITEMS.find(i => i.k === k).d;
    const get = (k, d) => localStorage.getItem("setting_" + k) || d;
    const root = document.documentElement;
    root.dataset.theme = (localStorage.getItem("setting_theme") === "light") ? "light" : "dark";

    const ACC = { sakura: ["#f0a8c2", "#ffd8e5", "#bd7898", "Sakura"], wisteria: ["#b9a3f0", "#e3d9ff", "#8a72c4", "Wisteria"], mint: ["#8fe3c8", "#d3fff0", "#5fb89c", "Moon mint"], gold: ["#f2c879", "#fff0cc", "#c49a4a", "Lantern gold"], sky: ["#8cc8f5", "#d6eeff", "#5b97c4", "Sky blue"], coral: ["#ff8f7a", "#ffd9d1", "#cc6552", "Coral"], lime: ["#b7e86a", "#eefccc", "#86b23f", "Fresh lime"] };
    // Background tint is the ONLY thing that colours the picture. Each theme has its own set, so Light never inherits the dark overlays.
    const TINT = {
        dark: {
            default: "linear-gradient(to bottom, rgba(11, 13, 25, 0.8), #0b0d19)",
            blue: "linear-gradient(to bottom, rgba(15, 32, 67, 0.75), rgba(9, 17, 34, 0.95))",
            plum: "linear-gradient(to bottom, rgba(56, 36, 63, 0.75), rgba(11, 13, 25, 0.95))",
            forest: "linear-gradient(to bottom, rgba(14, 52, 44, 0.72), rgba(7, 20, 22, 0.96))",
            sunset: "linear-gradient(to bottom, rgba(96, 40, 62, 0.65), rgba(30, 14, 36, 0.96))",
            clear: "linear-gradient(to bottom, rgba(0, 0, 0, 0.05), rgba(0, 0, 0, 0.15))"
        },
        light: {
            default: "linear-gradient(rgba(255, 255, 255, 0), rgba(255, 255, 255, 0))",
            blue: "linear-gradient(to bottom, rgba(110, 165, 230, 0.30), rgba(80, 130, 205, 0.45))",
            plum: "linear-gradient(to bottom, rgba(190, 140, 205, 0.30), rgba(155, 100, 180, 0.45))",
            forest: "linear-gradient(to bottom, rgba(110, 190, 155, 0.30), rgba(70, 150, 115, 0.45))",
            sunset: "linear-gradient(to bottom, rgba(255, 175, 150, 0.30), rgba(235, 115, 140, 0.45))",
            clear: "linear-gradient(rgba(255, 255, 255, 0), rgba(255, 255, 255, 0))"
        }
    };
    const FONT = {
        elegant: ["'Playfair Display', Georgia, serif", "'DM Sans', Arial, sans-serif"],
        modern: ["'DM Sans', Arial, sans-serif", "'DM Sans', Arial, sans-serif"],
        classic: ["Georgia, 'Times New Roman', serif", "Georgia, 'Times New Roman', serif"],
        rounded: ["'Trebuchet MS', 'Segoe UI', sans-serif", "'Trebuchet MS', 'Segoe UI', sans-serif"]
    };
    const RAD = { sharp: [4, 8, 10], soft: [10, 18, 26], round: [18, 30, 40] };
    const svg = (b, s) => `<svg xmlns='http://www.w3.org/2000/svg' width='${s}' height='${s}' viewBox='0 0 32 32'>${b}</svg>`;
    const svgUrl = (b, s) => 'url("data:image/svg+xml,' + encodeURIComponent(svg(b, s)) + '")';
    // name: [svg body, hotspot x, hotspot y, label]
    const CUR = {
        petal: ["<path d='M16 3C9 9 8 18 16 29c8-11 7-20 0-26z' fill='#f0a8c2' stroke='#fff4f0' stroke-width='1.5'/>", 16, 3, "Petal"],
        star: ["<path d='M16 2l4 9 10 1-7.5 6.5L25 29l-9-5-9 5 2.5-10.5L2 12l10-1z' fill='#ffd8e5' stroke='#f0a8c2' stroke-width='1.5'/>", 16, 16, "Star"],
        heart: ["<path d='M16 28C4 19 4 8 11 7c3 0 5 2 5 4 0-2 2-4 5-4 7 1 7 12-5 21z' fill='#f0a8c2' stroke='#fff4f0' stroke-width='1.5'/>", 16, 16, "Heart"],
        orb: ["<circle cx='16' cy='16' r='7' fill='#ffd8e5'/><circle cx='16' cy='16' r='12' fill='none' stroke='#f0a8c2' stroke-width='2' opacity='.7'/>", 16, 16, "Glow orb"],
        moon: ["<path d='M22 4a12 12 0 1 0 6 20A10 10 0 0 1 22 4z' fill='#fff0cc' stroke='#f2c879' stroke-width='1.5'/>", 16, 16, "Moon"],
        butterfly: ["<path d='M16 16C8 4 2 8 4 15s8 6 12 1zm0 0c8-12 14-8 12-1s-8 6-12 1zM16 16c-6 2-8 10-4 12 3 1 4-6 4-12zm0 0c6 2 8 10 4 12-3 1-4-6-4-12z' fill='#c9a7ff' stroke='#fff4f0' stroke-width='1.2'/>", 16, 16, "Butterfly"],
        leaf: ["<path d='M5 27C5 12 14 5 28 4c0 14-7 23-21 23z' fill='#8fe3c8' stroke='#fff4f0' stroke-width='1.5'/>", 5, 27, "Leaf"],
        flame: ["<path d='M16 2c2 7 9 10 9 18a9 9 0 0 1-18 0c0-5 3-6 4-11 2 2 3 3 5-7z' fill='#f2c879' stroke='#f0a8c2' stroke-width='1.5'/>", 16, 16, "Flame"],
        diamond: ["<path d='M16 2l11 14-11 14L5 16z' fill='#8cc8f5' stroke='#fff4f0' stroke-width='1.5'/>", 16, 16, "Diamond"],
        lotus: ["<path d='M16 28C9 24 6 17 8 10c4 1 7 4 8 8 1-4 4-7 8-8 2 7-1 14-8 18z' fill='#ffd8e5' stroke='#bd7898' stroke-width='1.5'/>", 16, 16, "Lotus"],
        ring: ["<circle cx='16' cy='16' r='11' fill='none' stroke='#f0a8c2' stroke-width='3'/><circle cx='16' cy='16' r='2.5' fill='#fff4f0'/>", 16, 16, "Ring"],
        cross: ["<path d='M16 3v26M3 16h26' stroke='#f0a8c2' stroke-width='2'/><circle cx='16' cy='16' r='3' fill='#fff4f0'/>", 16, 16, "Crosshair"]
    };

    let trailMode = "off", clickMode = "off", soundOn = false, lastT = 0, hue = 0, audio = null;
    const cursorStyle = document.createElement("style");
    document.head.appendChild(cursorStyle);

    window.toast = function (msg) {
        let box = document.getElementById("toastBox");
        if (!box) { box = document.createElement("div"); box.id = "toastBox"; box.setAttribute("role", "status"); document.body.appendChild(box); }
        box.innerHTML = ""; const t = document.createElement("div"); t.className = "toast"; t.textContent = msg; box.appendChild(t);
        setTimeout(() => t.remove(), 3200);
    };

    // ---- Appliers: one per setting key ----
    const A = {
        accent(v) { const p = ACC[v]; if (p) ["--sakura", "--sakura-light", "--rose"].forEach((n, i) => root.style.setProperty(n, p[i])); else { ["--sakura", "--sakura-light", "--rose"].forEach(n => root.style.removeProperty(n)); window.applyMoodBloom && window.applyMoodBloom(); } },
        theme(v) { root.dataset.theme = v === "light" ? "light" : "dark"; A.tint(get("tint", dflt("tint"))); },
        tint(v) { const set = TINT[root.dataset.theme === "light" ? "light" : "dark"]; root.style.setProperty("--bg-tint-gradient", set[v] || set.default); },
        aurora(v) { root.classList.toggle("no-aurora", v === "off"); },
        cursor() { A.cursize(); },
        cursize() {
            const img = localStorage.getItem("setting_cursor_img"), name = get("cursor", "default"), c = CUR[name], s = +get("cursize", "32");
            if (name === "custom" && img) cursorStyle.textContent = `*{cursor:url("${img}") 0 0, auto !important}`;
            else cursorStyle.textContent = c ? `*{cursor:${svgUrl(c[0], s)} ${Math.round(c[1] * s / 32)} ${Math.round(c[2] * s / 32)}, auto !important}` : "";
        },
        trail(v) { trailMode = v; },
        glow(v) { let g = document.getElementById("cursorGlow"); if (v === "on" && !g) { g = document.createElement("div"); g.id = "cursorGlow"; document.body.appendChild(g); } if (g) g.style.display = v === "on" ? "block" : "none"; },
        click(v) { clickMode = v; },
        page() {},
        motion(v) { root.classList.toggle("no-anim", v === "off"); },
        tilt(v) { root.dataset.hover = v; },
        sound(v) { soundOn = v === "on"; },
        font(v) { const f = FONT[v] || FONT.elegant; root.style.setProperty("--font-heading", f[0]); root.style.setProperty("--font-body", f[1]); },
        size(v) { root.style.fontSize = v + "%"; document.body.style.fontSize = (15 * v / 100) + "px"; },
        cards(v) { root.dataset.cards = v; },
        round(v) { const r = RAD[v] || RAD.soft; ["--radius-sm", "--radius-md", "--radius-lg"].forEach((n, i) => root.style.setProperty(n, r[i] + "px")); },
        contrast(v) { root.classList.toggle("hi-contrast", v === "on"); },
        video(v) {
            root.classList.toggle("hide-video", v === "off");
            const head = document.getElementById("siteHeader");
            if (!head) return;
            let wrap = head.querySelector(".hdr-video");
            if (v === "on" && !wrap) {
                wrap = document.createElement("div"); wrap.className = "hdr-video"; wrap.setAttribute("aria-hidden", "true");
                const base = location.pathname.includes("/html/") ? "../" : "";
                wrap.innerHTML = `<video autoplay muted loop playsinline preload="metadata"><source src="${base}assets/videos/petals.mp4" type="video/mp4"></video>`;
                head.prepend(wrap);
                const vid = wrap.querySelector("video"); vid.muted = true; vid.play && vid.play().catch(() => {});
            } else if (wrap) {
                const vid = wrap.querySelector("video");
                if (v === "on") vid.play && vid.play().catch(() => {}); else vid.pause && vid.pause();
            }
        },
        buddy() { window.dispatchEvent(new Event("buddyChange")); },
        chatter() { window.dispatchEvent(new Event("buddyChange")); },
        buddyskin() { window.dispatchEvent(new Event("buddyChange")); }
    };
    const apply = k => A[k](get(k, dflt(k)));
    A.tint(get("tint", dflt("tint")));

    function chime() {
        try {
            audio = audio || new (window.AudioContext || window.webkitAudioContext)();
            const o = audio.createOscillator(), g = audio.createGain();
            o.type = "sine"; o.frequency.value = 660 + Math.random() * 220;
            g.gain.setValueAtTime(0.0001, audio.currentTime); g.gain.exponentialRampToValueAtTime(0.08, audio.currentTime + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, audio.currentTime + 0.25);
            o.connect(g); g.connect(audio.destination); o.start(); o.stop(audio.currentTime + 0.26);
        } catch (e) { /* sound is optional */ }
    }

    // Shrink an uploaded picture to a small data URL (used for pointer skins and Loomi's look)
    function shrink(file, size, done) {
        const img = new Image();
        img.onload = () => {
            const c = document.createElement("canvas"), r = Math.min(size / img.width, size / img.height);
            c.width = Math.round(img.width * r); c.height = Math.round(img.height * r);
            c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
            done(c.toDataURL("image/png"));
        };
        img.src = URL.createObjectURL(file);
    }

    // ---- Settings page ----
    function control(i) {
        const cur = get(i.k, i.d);
        if (i.type === "swatch") {
            const auto = `<button class="swatch auto${cur === "mood" ? " on" : ""}" data-k="accent" data-v="mood" title="Auto (follows your diary moods)" aria-label="Auto"></button>`;
            return `<div class="swatches">${auto}${Object.entries(ACC).map(([v, p]) => `<button class="swatch${cur === v ? " on" : ""}" data-k="accent" data-v="${v}" style="--c:${p[0]}" title="${p[3]}" aria-label="${p[3]}"></button>`).join("")}</div>`;
        }
        if (i.type === "skins") {
            const mine = localStorage.getItem("setting_cursor_img");
            const tile = (v, label, inner) => `<button class="skin${cur === v ? " on" : ""}" data-k="cursor" data-v="${v}">${inner}<span>${label}</span></button>`;
            return `<div class="skin-grid">${tile("default", "Default", "<i class='skin-arrow'></i>")}${Object.entries(CUR).map(([v, c]) => tile(v, c[3], svg(c[0], 30))).join("")}${tile("custom", "My skin", mine ? `<img src="${mine}" alt="">` : "<b>+</b>")}</div>
                <label class="upload">Upload your own skin<input type="file" accept="image/*" id="skinFile"></label>`;
        }
        if (i.type === "buddyskin") {
            const mine = localStorage.getItem("setting_buddy_img"), S = window.LoomiSkins || {};
            const tile = (v, label, inner, off) => `<button class="skin${cur === v ? " on" : ""}" data-k="buddyskin" data-v="${v}"${off ? " disabled" : ""}>${inner}<span>${label}</span></button>`;
            return `<div class="skin-grid buddy-grid">${Object.entries(S).map(([v, k]) => tile(v, k.label, k.svg("t"))).join("")}${tile("custom", "My picture", mine ? `<img src="${mine}" alt="">` : "<b>+</b>", !mine)}</div>
                <label class="upload">Upload your own picture<input type="file" accept="image/*" id="buddyFile"></label>`;
        }
        return `<div class="seg" role="radiogroup" aria-label="${i.t}">${i.o.map(([v, t]) => `<button class="opt${cur === v ? " on" : ""}" role="radio" aria-checked="${cur === v}" data-k="${i.k}" data-v="${v}">${t}</button>`).join("")}</div>`;
    }
    function buildPage(host) {
        const s = Auth.session() || { name: "Guest", email: "" };
        const row = i => `<div class="set-row"><div class="set-info"><b>${i.t}</b>${i.h ? `<span>${i.h}</span>` : ""}</div><div class="set-ctl">${control(i)}</div></div>`;
        host.innerHTML = `<aside class="set-tabs" role="tablist">${GROUPS.map(g => `<button role="tab" data-tab="${g.id}">${g.name}</button>`).join("")}<button role="tab" data-tab="account">Account and data</button></aside>
            <div class="set-body">${GROUPS.map(g => `<section class="glass-card set-card" data-panel="${g.id}"><h2>${g.name}</h2>${g.items.map(row).join("")}</section>`).join("")}
            <section class="glass-card set-card" data-panel="account"><h2>Account and data</h2>
                <div class="set-row"><div class="set-info"><b>${s.name.replace(/[<>&"]/g, "")}</b><span>${s.email.replace(/[<>&"]/g, "")}</span></div><div class="set-ctl"><button class="btn btn-outline" id="setLogout">Log out</button></div></div>
                <div class="set-row"><div class="set-info"><b>Reset settings</b><span>Puts every option on this page back to how it started. Your dramas are kept.</span></div><div class="set-ctl"><button class="btn btn-outline" id="resetSettings">Reset settings</button></div></div>
                <div class="set-row danger"><div class="set-info"><b>Clear my data</b><span>Deletes your diary, collection, favourites and garden. This cannot be undone.</span></div><div class="set-ctl"><button class="btn btn-outline" id="resetData">Clear my data</button></div></div>
            </section></div>`;

        const show = id => { host.querySelectorAll("[data-panel]").forEach(p => p.hidden = p.dataset.panel !== id); host.querySelectorAll("[data-tab]").forEach(t => t.classList.toggle("active", t.dataset.tab === id)); history.replaceState(null, "", "#" + id); };
        host.querySelectorAll("[data-tab]").forEach(t => t.onclick = () => show(t.dataset.tab));
        show(location.hash.slice(1) || "look");

        const redraw = () => { const open = host.querySelector("[data-panel]:not([hidden])").dataset.panel; const sc = scrollY; buildPage(host); show(open); scrollTo(0, sc); };
        host.addEventListener("click", e => {
            const b = e.target.closest("[data-k]");
            if (!b || b.disabled) return;
            localStorage.setItem("setting_" + b.dataset.k, b.dataset.v);
            A[b.dataset.k](b.dataset.v);
            host.querySelectorAll(`[data-k="${b.dataset.k}"]`).forEach(x => { const on = x === b; x.classList.toggle("on", on); if (x.hasAttribute("aria-checked")) x.setAttribute("aria-checked", on); });
            window.toast("Saved");
            if (b.dataset.k === "page" && window.PetalTransitions) setTimeout(() => window.PetalTransitions.preview(b.dataset.v), 250);
        });
        const skin = host.querySelector("#skinFile"), bud = host.querySelector("#buddyFile");
        if (skin) skin.onchange = e => e.target.files[0] && shrink(e.target.files[0], 48, d => { localStorage.setItem("setting_cursor_img", d); localStorage.setItem("setting_cursor", "custom"); A.cursor(); redraw(); window.toast("Your skin is on"); });
        if (bud) bud.onchange = e => e.target.files[0] && shrink(e.target.files[0], 160, d => { localStorage.setItem("setting_buddy_img", d); localStorage.setItem("setting_buddyskin", "custom"); A.buddyskin(); redraw(); window.toast("Loomi has a new look"); });
        host.querySelector("#setLogout").onclick = () => { Auth.logout(); location.href = "login.html?out=1"; };
        host.querySelector("#resetSettings").onclick = () => { ITEMS.forEach(i => { localStorage.removeItem("setting_" + i.k); A[i.k](i.d); }); redraw(); window.toast("Settings reset"); };
        host.querySelector("#resetData").onclick = () => { if (confirm("Delete your diary entries, collection, favourites and garden? This cannot be undone.")) { ["petal_collection", "petal_diary", "petal_garden_flowers", "petal_garden_meta", "petal_favs", "petal_days"].forEach(k => localStorage.removeItem(k)); window.toast("Your data was cleared"); } };
    }

    // ---- Page-wide effects (trail, click, tilt, sound) ----
    document.addEventListener("DOMContentLoaded", () => {
        ITEMS.forEach(i => apply(i.k));
        const host = document.getElementById("settingsRoot");
        if (host) buildPage(host);

        document.addEventListener("mousemove", e => {
            const g = document.getElementById("cursorGlow");
            if (g) { g.style.left = e.clientX + "px"; g.style.top = e.clientY + "px"; }
            if (trailMode === "off") return;
            const t = performance.now();
            if (t - lastT < 45) return;
            lastT = t;
            const d = document.createElement("i");
            d.className = "trail-dot" + (trailMode === "petals" ? " petal-dot" : "");
            if (trailMode === "hearts" || trailMode === "stars") { d.className = "trail-dot trail-glyph"; d.textContent = trailMode === "hearts" ? "♥" : "✦"; }
            if (trailMode === "rainbow") { hue = (hue + 28) % 360; d.style.background = `hsl(${hue} 90% 70%)`; d.style.boxShadow = `0 0 10px hsl(${hue} 90% 65%)`; }
            d.style.left = e.clientX + "px"; d.style.top = e.clientY + "px";
            document.body.appendChild(d);
            setTimeout(() => d.remove(), 700);
        });

        document.addEventListener("click", e => {
            if (soundOn) chime();
            if (clickMode === "off") return;
            if (clickMode === "ripple") {
                const r = document.createElement("i"); r.className = "click-ripple"; r.style.left = e.clientX + "px"; r.style.top = e.clientY + "px";
                document.body.appendChild(r); setTimeout(() => r.remove(), 700);
            } else {
                for (let i = 0; i < 9; i++) {
                    const p = document.createElement("i"), a = (i / 9) * Math.PI * 2;
                    p.className = "burst-petal"; p.style.left = e.clientX + "px"; p.style.top = e.clientY + "px";
                    p.style.setProperty("--dx", Math.cos(a) * 46 + "px"); p.style.setProperty("--dy", Math.sin(a) * 46 + "px");
                    document.body.appendChild(p); setTimeout(() => p.remove(), 700);
                }
            }
        });

        document.addEventListener("mousemove", e => {
            if (root.dataset.hover !== "tilt") return;
            const c = e.target.closest && e.target.closest(".drama-card");
            document.querySelectorAll(".drama-card.tilting").forEach(x => { if (x !== c) { x.classList.remove("tilting"); x.style.transform = ""; } });
            if (!c) return;
            const r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
            c.classList.add("tilting"); c.style.transform = `perspective(700px) rotateY(${x * 14}deg) rotateX(${-y * 14}deg) translateY(-6px)`;
        });
    });
})();
