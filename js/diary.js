document.addEventListener("DOMContentLoaded", () => {
    const $ = s => document.querySelector(s);
    const list = $(".entries-stream-container"), form = $(".diary-form");
    const dSel = $(".drama-select"), mSel = $(".mood-select-menu"), banner = $("#moodBanner");
    const title = $(".entry-title-input"), text = $(".thoughts-textarea"), score = $(".score-select");
    const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
    if (!form || !list) return;

    dSel.innerHTML = CENTRAL_DRAMA_DATABASE.map(d => `<option value="${d.id}">${esc(d.title)}</option>`).join("");
    mSel.innerHTML = Object.entries(MOODS).map(([k, m]) => `<option value="${k}">${m.e} ${m.label}</option>`).join("");

    // Everything on the page that depends on the chosen feeling
    function setMood(k) {
        const m = MOODS[k];
        if (!m) return;
        mSel.value = k;
        banner.innerHTML = `<span class="mood-emoji">${m.e}</span><div><strong>${m.title}</strong><p>${m.prompt}</p></div>`;
        banner.classList.remove("pop"); void banner.offsetWidth; banner.classList.add("pop");
        title.placeholder = `${m.label} thoughts: name this entry...`;
        text.placeholder = m.ph;
        chips.querySelectorAll(".mood-chip").forEach(c => c.classList.toggle("active", c.dataset.mood === k));
        form.closest(".glass-card").style.setProperty("--mood", m.c);
        applyMoodBloom(k);
    }
    const chips = $("#moodChips");
    chips.innerHTML = Object.entries(MOODS).map(([k, m]) => `<button type="button" class="mood-chip" data-mood="${k}" style="--c:${m.c}">${m.e} ${m.label}</button>`).join("");
    chips.addEventListener("click", e => { const b = e.target.closest(".mood-chip"); if (b) { setMood(b.dataset.mood); history.replaceState(null, "", "?mood=" + b.dataset.mood); } });
    mSel.addEventListener("change", () => setMood(mSel.value));

    const params = new URLSearchParams(location.search);
    if (CENTRAL_DRAMA_DATABASE.some(d => d.id === params.get("drama"))) dSel.value = params.get("drama");
    setMood(MOODS[params.get("mood")] ? params.get("mood") : "cozy");

    function renderEntries() {
        const entries = StorageEngine.getDiaryEntries();
        if (!entries.length) { list.innerHTML = `<p>No entries yet. Write your first reflection after tonight's episode.</p>`; return; }
        list.innerHTML = entries.map(e => {
            const d = CENTRAL_DRAMA_DATABASE.find(x => x.id === e.dramaId), m = MOODS[e.mood];
            return `<div class="glass-card past-entry-item" style="padding:20px;margin-bottom:16px;">
                <h3>${esc(e.title)} <span style="font-size:0.9rem;color:var(--sakura);">${m ? m.e + " " + m.label : esc(e.mood)}</span></h3>
                <p style="font-size:0.85rem;">Logged on ${esc(e.date)} about <strong>${d ? esc(d.title) : "Unknown"}</strong></p>
                <p style="margin-top:8px;color:var(--moonlight);">${esc(e.text)}</p>
                <div style="color:var(--sakura);margin-top:4px;">${"★".repeat(e.score || 0)}</div></div>`;
        }).join("");
    }

    form.addEventListener("submit", e => {
        e.preventDefault();
        const mood = mSel.value;
        StorageEngine.saveDiaryEntry({
            id: Date.now(), dramaId: dSel.value, title: title.value, mood,
            date: new Date().toISOString().split("T")[0], text: text.value, score: parseInt(score.value, 10)
        });
        form.reset();
        dSel.value = dSel.value; setMood(mood);
        renderEntries();
    });
    renderEntries();
});
