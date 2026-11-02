// MoodBloom: mood data + colour system (shared by every page)
(function () {
    const mix = (h, t, w) => {
        const n = parseInt(h.slice(1), 16), m = parseInt(t.slice(1), 16);
        const c = s => Math.round(((n >> s) & 255) * (1 - w) + ((m >> s) & 255) * w);
        return "#" + [16, 8, 0].map(s => c(s).toString(16).padStart(2, "0")).join("");
    };

    window.MOODS = {
        cozy:        { e: "🍵", label: "Cozy",        c: "#f0a8c2", title: "Tea, blankets and a warm drama", prompt: "What felt warm and comforting about this episode?", ph: "The scene that felt like a hug..." },
        hopeful:     { e: "🌅", label: "Hopeful",     c: "#f7c58d", title: "A new day is rising",            prompt: "What gave you hope tonight?",                      ph: "A moment that made you believe things will work out..." },
        nostalgic:   { e: "🏮", label: "Nostalgic",   c: "#d98fb0", title: "Lantern-lit memories",           prompt: "What did this story remind you of?",               ph: "A memory, a place or a person it brought back..." },
        serene:      { e: "🌙", label: "Serene",      c: "#a9c4f5", title: "Quiet as moonlight",             prompt: "What made this episode calm your mind?",           ph: "The soft scene you want to remember..." },
        thrilled:    { e: "⚡", label: "Thrilled",    c: "#ffd36e", title: "Heart racing, can't stop now",   prompt: "Which twist or cliffhanger got you?",              ph: "The moment you gasped out loud..." },
        inspired:    { e: "✨", label: "Inspired",    c: "#c9a7ff", title: "Sparks of inspiration",          prompt: "What idea or line stayed with you?",               ph: "A character or quote that made you want to act..." },
        melancholy:  { e: "🌧", label: "Melancholy",  c: "#9fb0d0", title: "Rain on the window",             prompt: "What left an ache in your chest?",                 ph: "The scene that made you go quiet..." },
        heartbroken: { e: "🥀", label: "Heartbroken", c: "#e0607e", title: "Petals falling",                 prompt: "Which moment broke your heart?",                   ph: "Let it out: what hurt the most..." }
    };

    // Applies a mood colour. No argument = the mood you log most. Respects a fixed accent chosen in Settings.
    window.applyMoodBloom = function (mood) {
        const a = localStorage.getItem("setting_accent");
        if (a && a !== "mood") return;
        if (!mood) {
            const counts = {};
            StorageEngine.getDiaryEntries().forEach(e => counts[e.mood] = (counts[e.mood] || 0) + 1);
            mood = Object.keys(counts).sort((x, y) => counts[y] - counts[x])[0];
        }
        const m = MOODS[mood];
        if (!m) return;
        const r = document.documentElement.style;
        r.setProperty("--sakura", m.c);
        r.setProperty("--sakura-light", mix(m.c, "#ffffff", 0.55));
        r.setProperty("--rose", mix(m.c, "#000000", 0.25));
    };

    document.addEventListener("DOMContentLoaded", () => applyMoodBloom());
    window.addEventListener("storageUpdate", () => applyMoodBloom());
})();
