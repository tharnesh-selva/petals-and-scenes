// Page change effects. The leaving page plays a "cover" animation, the next page plays the matching "reveal".
// Settings > Page change effect picks one of the modes below ("random" picks a different one each click).
(function () {
    const LAYER = ["tear", "curtain", "iris", "blinds", "wipe", "petals", "mosaic", "ink", "shutter", "diamond", "split", "roller"];
    const BODY = ["fade", "slide", "zoom", "blur", "flip", "drop", "spin", "rise", "swing", "skew"];
    const ALL = LAYER.concat(BODY);
    const mode = () => localStorage.getItem("setting_page") || "zoom";
    const animOff = () => document.documentElement.classList.contains("no-anim");
    const pick = m => m === "random" ? ALL[Math.floor(Math.random() * ALL.length)] : m;
    const rnd = (a, b) => a + Math.random() * (b - a);

    function build(effect) {
        const d = document.createElement("div");
        d.id = "tearLayer"; d.className = "fx-" + effect; d.setAttribute("aria-hidden", "true");
        let h = "";
        if (effect === "tear") h = '<div class="half l"></div><div class="half r"></div><div class="mark">夜桜 Petal &amp; Scene</div>';
        else if (effect === "curtain") h = '<div class="cur cl"></div><div class="cur cr"></div>';
        else if (effect === "iris") h = '<div class="iris-fill"></div><div class="mark">夜桜</div>';
        else if (effect === "wipe") h = '<div class="wipe-fill"></div><div class="wipe-fill w2"></div>';
        else if (effect === "ink") h = '<div class="ink-fill"></div>';
        else if (effect === "diamond") h = '<div class="dia"></div><div class="mark">夜桜</div>';
        else if (effect === "split") h = '<div class="sp st"></div><div class="sp sb"></div>';
        else if (effect === "roller") h = '<div class="roll"></div><div class="mark">夜桜 Petal &amp; Scene</div>';
        else if (effect === "blinds") { for (let i = 0; i < 10; i++) h += `<i style="--i:${i}"></i>`; }
        else if (effect === "shutter") { for (let i = 0; i < 6; i++) h += `<i style="--i:${i}"></i>`; }
        else if (effect === "mosaic") {
            const cols = innerWidth < 600 ? 6 : 12, rows = innerWidth < 600 ? 10 : 7;
            d.style.setProperty("--cols", cols); d.style.setProperty("--rows", rows);
            for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) h += `<i style="--dl:${((r + c) * 28 + Math.random() * 120).toFixed(0)}ms"></i>`;
        } else if (effect === "petals") {
            h = '<div class="petal-bg"></div>';
            for (let i = 0; i < 46; i++) {
                const s = rnd(18, 46), y = rnd(-5, 100);
                h += `<b style="top:${y}%;width:${s}px;height:${s}px;--dl:${(Math.random() * 260).toFixed(0)}ms;--rot:${rnd(260, 900).toFixed(0)}deg;--dy:${rnd(-60, 60).toFixed(0)}px"></b>`;
            }
        }
        d.innerHTML = h;
        document.body.appendChild(d);
        return d;
    }

    const arrive = sessionStorage.getItem("petal_fx");
    if (arrive && mode() !== "none" && !animOff()) {
        sessionStorage.removeItem("petal_fx");
        if (LAYER.includes(arrive)) {
            const start = () => { const d = build(arrive); d.classList.add("open"); setTimeout(() => d.remove(), 1500); };
            document.body ? start() : document.addEventListener("DOMContentLoaded", start);
        } else if (BODY.includes(arrive) && arrive !== "fade") {
            const start = () => { document.body.classList.add("pt-in-" + arrive); setTimeout(() => document.body.classList.remove("pt-in-" + arrive), 1000); };
            document.body ? start() : document.addEventListener("DOMContentLoaded", start);
        }
    } else sessionStorage.removeItem("petal_fx");

    function leave(effect, go) {
        sessionStorage.setItem("petal_fx", effect);
        if (LAYER.includes(effect)) { build(effect).classList.add("cover"); setTimeout(go, effect === "petals" ? 650 : 480); }
        else if (effect === "fade") { document.body.classList.add("fade-out-active"); setTimeout(go, 400); }
        else { document.body.classList.add("pt-out-" + effect); setTimeout(go, 420); }
    }

    document.addEventListener("click", e => {
        const a = e.target.closest("a");
        if (!a) return;
        const href = a.getAttribute("href");
        if (!href || href.startsWith("#") || href.startsWith("javascript:") || a.target === "_blank" || a.classList.contains("nav-settings-trigger") || e.ctrlKey || e.metaKey || e.shiftKey) return;
        const m = mode();
        if (m === "none" || animOff()) return;
        e.preventDefault();
        leave(pick(m), () => { location.href = href; });
    });

    // Used by the Settings window: play an effect on this window without leaving the page
    window.PetalTransitions = {
        list: ALL,
        preview(m) {
            if (animOff()) { window.toast && window.toast("Turn Animations back on to preview effects"); return; }
            if (m === "none") return;
            const e = pick(m);
            if (LAYER.includes(e)) {
                const d = build(e); d.classList.add("cover");
                setTimeout(() => { d.classList.remove("cover"); d.classList.add("open"); setTimeout(() => d.remove(), 1500); }, e === "petals" ? 700 : 520);
            } else if (e === "fade") {
                document.body.classList.add("fade-out-active");
                setTimeout(() => document.body.classList.remove("fade-out-active"), 450);
            } else {
                document.body.classList.add("pt-out-" + e);
                setTimeout(() => { document.body.classList.remove("pt-out-" + e); document.body.classList.add("pt-in-" + e); setTimeout(() => document.body.classList.remove("pt-in-" + e), 950); }, 450);
            }
        }
    };
    window.addEventListener("pageshow", e => {
        if (e.persisted) { document.body.classList.remove("fade-out-active"); BODY.forEach(b => document.body.classList.remove("pt-out-" + b)); const t = document.getElementById("tearLayer"); if (t) t.remove(); }
    });
})();
