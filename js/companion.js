// Loomi: a small floating companion. Draggable, follows your pointer with its eyes, chats, naps when you are idle.
// (Original character made for this project; any picture can replace it from Settings.)
(function () {
    const page = location.pathname.split("/").pop() || "index.html";
    const get = (k, d) => localStorage.getItem("setting_" + k) || d;
    const session = JSON.parse(localStorage.getItem("petal_session") || "null");
    const name = session ? session.name.split(" ")[0].replace(/[<>&"]/g, "") : "friend";
    let el, bubble, hideT, chatT, sleepT, dragged = false;

    // ---- Skins: every skin shares the same eyes (.pl / .pr) so the eyes keep following the pointer ----
    const ear = (d, f, st) => `<path d="${d}" fill="${f}" stroke="${st}" stroke-width="2" stroke-linejoin="round"/>`;
    const SKIN_DEFS = {
        default: { label: "Loomi", c: ["#fff0f6", "#f0a8c2", "#c9a7ff"], st: "#bd7898", glow: "#f0a8c2", cheek: "#ff8fb1",
            back: ear("M27 34C14 14 34 6 42 27z", "#ffd8e5", "#bd7898") + ear("M73 34C86 14 66 6 58 27z", "#ffd8e5", "#bd7898"),
            mouth: '<path d="M43 72q7 7 14 0" fill="none" stroke="#2a1f3d" stroke-width="2.6" stroke-linecap="round"/>' },
        cat: { label: "Mochi cat", c: ["#ffffff", "#ffe9c9", "#f2c879"], st: "#c49a4a", glow: "#f2c879", cheek: "#ffa59a",
            back: ear("M23 42L21 10L48 27z", "#ffe9c9", "#c49a4a") + ear("M77 42L79 10L52 27z", "#ffe9c9", "#c49a4a")
                + '<path d="M28 33L27 19L38 27z" fill="#ffb7b7"/><path d="M72 33L73 19L62 27z" fill="#ffb7b7"/>',
            mouth: '<path d="M44 72q3 4 6 0q3 4 6 0" fill="none" stroke="#2a1f3d" stroke-width="2.4" stroke-linecap="round"/><path d="M47 67h6l-3 3z" fill="#e58a8a"/>',
            front: '<g stroke="#c49a4a" stroke-width="1.6" stroke-linecap="round"><path d="M20 68l-12-3M20 73l-12 3M80 68l12-3M80 73l12 3"/></g>' },
        frog: { label: "Mint frog", c: ["#f2fff3", "#8fe3c8", "#5fb89c"], st: "#3f8f78", glow: "#8fe3c8", cheek: "#ff9eb0",
            back: '<circle cx="31" cy="33" r="12" fill="#8fe3c8" stroke="#3f8f78" stroke-width="2"/><circle cx="69" cy="33" r="12" fill="#8fe3c8" stroke="#3f8f78" stroke-width="2"/>',
            mouth: '<path d="M37 71q13 11 26 0" fill="none" stroke="#2a1f3d" stroke-width="2.6" stroke-linecap="round"/>' },
        pup: { label: "Sky pup", c: ["#eaf6ff", "#8cc8f5", "#5b97c4"], st: "#3e6f99", glow: "#8cc8f5", cheek: "#ff9eb0",
            back: ear("M26 38C8 36 3 66 14 80C24 78 31 60 33 44z", "#5b97c4", "#3e6f99") + ear("M74 38C92 36 97 66 86 80C76 78 69 60 67 44z", "#5b97c4", "#3e6f99"),
            mouth: '<path d="M44 74q6 6 12 0" fill="none" stroke="#2a1f3d" stroke-width="2.4" stroke-linecap="round"/><ellipse cx="50" cy="68" rx="4.5" ry="3.2" fill="#2a1f3d"/>' },
        fox: { label: "Lantern fox", c: ["#fff4e0", "#ffa65c", "#e0662c"], st: "#a8461c", glow: "#ffa65c", cheek: "#ff8f7a",
            back: ear("M22 44L25 6L50 28z", "#ffa65c", "#a8461c") + ear("M78 44L75 6L50 28z", "#ffa65c", "#a8461c")
                + '<path d="M26 22L25 6L36 15z" fill="#3a2a2a"/><path d="M74 22L75 6L64 15z" fill="#3a2a2a"/>'
                + '<path d="M84 84C99 80 100 58 92 50C90 62 86 68 80 72z" fill="#ffa65c" stroke="#a8461c" stroke-width="2" stroke-linejoin="round"/><path d="M92 50C90 62 86 68 82 70C90 70 99 62 92 50z" fill="#fff4e0"/>',
            mid: '<ellipse cx="50" cy="77" rx="19" ry="11" fill="#fff4e0"/>',
            mouth: '<path d="M44 74q6 6 12 0" fill="none" stroke="#2a1f3d" stroke-width="2.4" stroke-linecap="round"/><path d="M47 68h6l-3 4z" fill="#2a1f3d"/>' },
        ghost: { label: "Wisteria ghost", c: ["#ffffff", "#e3d9ff", "#b9a3f0"], st: "#8a72c4", glow: "#b9a3f0", cheek: "#ff9ec0",
            body: "M12 64C12 32 28 16 50 16S88 32 88 64V100q-6.3 9-12.6 0q-6.3 9-12.6 0q-6.3 9-12.6 0q-6.3 9-12.6 0q-6.3 9-12.6 0q-6.3 9-12.6 0z",
            back: '<path d="M44 17q-4-10 4-12" fill="none" stroke="#8a72c4" stroke-width="2.4" stroke-linecap="round"/>',
            mouth: '<ellipse cx="50" cy="75" rx="3.6" ry="4.6" fill="#2a1f3d"/>' }
    };
    function skinSvg(key, sfx) {
        const d = SKIN_DEFS[key] || SKIN_DEFS.default, id = (sfx || "b") + "-" + key;
        const shape = d.body
            ? `<path d="${d.body}" fill="url(#lm-b-${id})" stroke="${d.st}" stroke-width="2" stroke-linejoin="round"/>`
            : `<ellipse cx="50" cy="63" rx="38" ry="35" fill="url(#lm-b-${id})" stroke="${d.st}" stroke-width="2"/>`;
        return `<svg viewBox="0 0 100 112" aria-hidden="true"><defs>
        <radialGradient id="lm-b-${id}" cx="40%" cy="30%" r="80%"><stop offset="0" stop-color="${d.c[0]}"/><stop offset=".55" stop-color="${d.c[1]}"/><stop offset="1" stop-color="${d.c[2]}"/></radialGradient>
        <radialGradient id="lm-g-${id}" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="${d.glow}" stop-opacity=".5"/><stop offset="1" stop-color="${d.glow}" stop-opacity="0"/></radialGradient></defs>
        <ellipse cx="50" cy="106" rx="26" ry="4.5" fill="rgba(0,0,0,.35)"/>
        <circle cx="50" cy="60" r="50" fill="url(#lm-g-${id})"/>
        ${d.back || ""}${shape}${d.mid || ""}
        <ellipse cx="38" cy="44" rx="11" ry="6" fill="#fff" opacity=".35" transform="rotate(-25 38 44)"/>
        <circle cx="29" cy="70" r="6" fill="${d.cheek}" opacity=".55"/><circle cx="71" cy="70" r="6" fill="${d.cheek}" opacity=".55"/>
        <g class="eyes"><circle cx="37" cy="58" r="9.5" fill="#fff"/><circle cx="63" cy="58" r="9.5" fill="#fff"/>
            <g class="pupils"><circle class="pl" cx="37" cy="59" r="5.5" fill="#2a1f3d"/><circle class="pr" cx="63" cy="59" r="5.5" fill="#2a1f3d"/>
            <circle cx="35" cy="56.5" r="1.8" fill="#fff"/><circle cx="61" cy="56.5" r="1.8" fill="#fff"/></g></g>
        <g class="lids" fill="none" stroke="#2a1f3d" stroke-width="2.6" stroke-linecap="round"><path d="M29 59q8 6 16 0"/><path d="M55 59q8 6 16 0"/></g>
        ${d.mouth}${d.front || ""}</svg>`;
    }
    // The Settings page uses this to draw the skin picker
    window.LoomiSkins = Object.fromEntries(Object.keys(SKIN_DEFS).map(k => [k, { label: SKIN_DEFS[k].label, svg: sfx => skinSvg(k, sfx) }]));

    const LINES = {
        any: ["Hi {n}! I am Loomi. Poke me anytime.", "You have great taste in dramas.", "Tea break? I vote yes.", "Drag me anywhere you like!", "Fun fact: the best episodes are always the last two.", "Double-click me. I dare you.",
            "Remember to drink some water. Plants and humans both.",
            "I read somewhere that crying at dramas is good for you.",
            "Episode 12 is where everything goes wrong. Every time.",
            "Hot take: the second lead deserves better.",
            "Snacks first, then the next episode.",
            "Did you see that plot twist coming? Me neither.",
            "I wonder what the main character is having for dinner.",
            "Rewatching a favourite counts as self care.",
            "Blankets are basically required for sad episodes.",
            "One more episode. That is what you said last time.",
            "Subtitles on, volume low, snacks ready. Perfect.",
            "Friendly reminder: sit up straight. I am watching.",
            "If the rain scene starts, it is going to be a good one.",
            "Every drama has that one umbrella moment.",
            "Tissues are within reach, right?",
            "I love a slow burn. Patience is a virtue.",
            "Enemies to lovers is my favourite. Do not tell the others.",
            "The soundtrack always hits harder at the end.",
            "Have you stretched lately? Go on, I will wait.",
            "I am small, but my opinions on endings are big.",
            "Writing in your diary counts as a tiny victory.",
            "A good cliffhanger is just a hug that waits.",
            "Favourite character? You can tell me. I am a vault.",
            "Your watchlist is looking healthy today.",
            "Take a deep breath. The finale will be fine.",
            "I have never met a drama I could not forgive. Except bad endings.",
            "Pro tip: pause before the last episode. Savour it.",
            "Dreaming of a fantasy drama tonight? Same.",
            "Is it a romance night or a thriller night?",
            "Plot armour is real. Prove me wrong.",
            "You are doing great, even if the show says otherwise.",
            "Petals fall, stories bloom.",
            "Cherry blossoms only last a week. Watch while they are here.",
            "I once spun in a circle for ten minutes. Dizzy, but happy.",
            "Psst. Try the Surprise me button. Live a little.",
            "If you hear violins, someone is about to confess.",
            "Slow walk, wind in the hair, dramatic music. Classic.",
            "Never trust a character who says, \"I will be right back.\"",
            "The best friend always knows more than they say.",
            "Tonight feels like a good night for a comfort rewatch.",
            "I am not saying I cried at the last episode. I am saying it rained inside.",
            "Look away from the screen for a moment. Your eyes will thank you.",
            "Do you prefer sub or dub? I will not judge. Much.",
            "Your garden is a little thirsty, I think.",
            "Skip the recap, trust me. Or do not. I am just a blob.",
            "Every credit roll is a tiny goodbye.",
            "A story is a good friend that never interrupts.",
            "Warm tea, soft light, good story. That is the whole secret.",
            "Whoever wrote that last line owes me a hug.",
            "Thanks for keeping me company, {n}."],
        "index.html": ["Not sure what to watch? Try Surprise me under More.", "Your Matchmaker picks get better with every diary entry."],
        "discover.html": ["Filter by genre to narrow things down fast.", "Ooh, that one looks good."],
        "collection.html": ["Mark a drama Completed and you earn a garden seed!", "Look at all those saved stories."],
        "diary.html": ["How did tonight's episode feel? Pick a mood.", "Write it down before the feeling fades."],
        "garden.html": ["Pick a tool, then click a pot. Water helps seedlings grow faster!", "Finish a drama in your collection to earn a blossom to plant.", "Butterflies are friendly. Probably."],
        "favourites.html": ["Your favourites live here. Good picks!"],
        "calendar.html": ["Keep the streak going!", "A dot means you wrote a diary entry that day."],
        "settings.html": ["Try a new pointer skin. Or upload your own!", "You can swap me for any picture too."],
        "faq.html": ["Can't find it? Send feedback and tell us."],
        "feedback.html": ["Be honest, I will not cry. Much."],
        "login.html": ["Welcome! Log in and your garden will be waiting.", "Psst. Your passwords stay in this browser only."],
        "register.html": ["New here? Yay! Pick a password you will remember."]
    };
    const say = (t, ms = 5200) => {
        if (!bubble) return;
        bubble.textContent = t; bubble.classList.add("show");
        clearTimeout(hideT); hideT = setTimeout(() => bubble.classList.remove("show"), ms);
    };
    const pick = () => { const pool = [...(LINES[page] || []), ...LINES.any]; return pool[Math.floor(Math.random() * pool.length)].replace("{n}", name); };
    const hearts = () => {
        const r = el.getBoundingClientRect();
        for (let i = 0; i < 4; i++) setTimeout(() => {
            const h = document.createElement("i"); h.className = "buddy-heart"; h.textContent = "♥";
            h.style.left = r.left + r.width / 2 + (Math.random() * 50 - 25) + "px"; h.style.top = r.top + 10 + "px"; h.style.setProperty("--hx", (Math.random() * 40 - 20) + "px");
            document.body.appendChild(h); setTimeout(() => h.remove(), 1100);
        }, i * 120);
    };
    const anim = cls => { el.classList.remove("pop", "spin"); void el.offsetWidth; el.classList.add(cls); setTimeout(() => el.classList.remove(cls), 950); };
    const wake = () => { el.classList.remove("sleepy"); clearTimeout(sleepT); sleepT = setTimeout(() => { el.classList.add("sleepy"); say("zzz... wake me if you need me.", 3000); }, 90000); };

    function build() {
        if (el) { el.remove(); el = null; }
        clearTimeout(chatT); clearTimeout(sleepT);
        if (get("buddy", "on") === "off") return;
        el = document.createElement("div"); el.id = "buddy"; el.setAttribute("role", "button"); el.setAttribute("aria-label", "Loomi, your companion. Click to chat.");
        const skin = get("buddyskin", "default"), mine = skin === "custom" && localStorage.getItem("setting_buddy_img");
        el.innerHTML = (mine ? `<img class="buddy-img" src="${mine}" alt="">` : skinSvg(skin, "b")) + '<span class="zzz">z z</span><div class="buddy-bubble" role="status"></div>';
        bubble = el.querySelector(".buddy-bubble");
        document.body.appendChild(el);
        const pos = JSON.parse(localStorage.getItem("petal_buddy_pos") || "null");
        if (pos) { el.style.left = Math.min(pos.x, innerWidth - 80) + "px"; el.style.top = Math.min(pos.y, innerHeight - 90) + "px"; el.style.right = "auto"; el.style.bottom = "auto"; }

        // drag to move (a tap without moving counts as a poke)
        let sx, sy, ox, oy, down = false;
        el.addEventListener("pointerdown", e => { down = true; dragged = false; sx = e.clientX; sy = e.clientY; const r = el.getBoundingClientRect(); ox = r.left; oy = r.top; el.setPointerCapture(e.pointerId); });
        el.addEventListener("pointermove", e => {
            if (!down) return;
            if (Math.abs(e.clientX - sx) + Math.abs(e.clientY - sy) > 5) dragged = true;
            if (!dragged) return;
            el.classList.add("dragging");
            el.style.left = Math.max(0, Math.min(innerWidth - el.offsetWidth, ox + e.clientX - sx)) + "px";
            el.style.top = Math.max(0, Math.min(innerHeight - el.offsetHeight, oy + e.clientY - sy)) + "px";
            el.style.right = "auto"; el.style.bottom = "auto";
        });
        el.addEventListener("pointerup", () => {
            down = false; el.classList.remove("dragging");
            if (dragged) { const r = el.getBoundingClientRect(); localStorage.setItem("petal_buddy_pos", JSON.stringify({ x: r.left, y: r.top })); say("Wheee!", 1800); return; }
            wake(); anim("pop"); hearts(); say(pick());
        });
        el.addEventListener("dblclick", () => { anim("spin"); say("Ta-da!", 2000); });

        wake();
        const tick = () => { if (get("chatter", "talk") === "talk" && !el.classList.contains("sleepy") && !document.hidden) say(pick()); chatT = setTimeout(tick, 32000 + Math.random() * 25000); };
        chatT = setTimeout(tick, 38000);
        const hour = new Date().getHours(), greet = hour < 5 ? "Still up, " : hour < 12 ? "Good morning, " : hour < 18 ? "Good afternoon, " : "Good evening, ";
        setTimeout(() => say(greet + name + "!"), 900);
    }

    // eyes follow the pointer
    document.addEventListener("mousemove", e => {
        if (!el) return;
        const pl = el.querySelector(".pl"), pr = el.querySelector(".pr");
        if (!pl) return;
        const r = el.getBoundingClientRect(), dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2), d = Math.hypot(dx, dy) || 1, k = Math.min(3.2, d / 60);
        const tx = dx / d * k, ty = dy / d * k;
        pl.setAttribute("transform", `translate(${tx} ${ty})`); pr.setAttribute("transform", `translate(${tx} ${ty})`);
    });
    ["mousemove", "keydown", "scroll"].forEach(ev => document.addEventListener(ev, () => { if (el && el.classList.contains("sleepy")) { wake(); say("Oh, you are back!", 2500); } }, { passive: true }));

    window.addEventListener("buddyChange", build);
    window.addEventListener("buddySay", e => { if (el) { say(e.detail); } });
    document.addEventListener("DOMContentLoaded", build);
    if (document.readyState !== "loading") build();
})();
