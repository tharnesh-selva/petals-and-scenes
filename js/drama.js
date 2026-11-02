const SYNOPSES = {
    "all-1": "A South Korean heiress crash-lands in North Korea after a paragliding accident and is hidden by an army captain who slowly becomes her closest ally.",
    "all-2": "In the fictional land of Daeho, a powerful sorceress's soul wakes in the body of a frail, blind woman and crosses paths with a young nobleman.",
    "all-3": "A caretaker at a psychiatric hospital and a celebrated children's book author with a guarded heart help each other face their pasts.",
    "all-4": "A devoted fan is pulled back in time to save the idol who once saved her, and finds a second chance at his side.",
    "all-5": "A cold company heir and a demon who has lost his powers strike a contract marriage that neither of them planned to feel anything about.",
    "all-6": "A department-store heiress and her small-town husband are on the edge of divorce when life gives their marriage an unexpected turn.",
    "all-7": "After years of suffering from school violence, a woman builds a patient, carefully planned path toward the people who hurt her.",
    "all-8": "A young woman who hides behind makeup becomes the school's new beauty, and her secret draws two very different boys closer.",
    "all-9": "A surgeon is drawn into the world of a hit webtoon, where she meets its hero and starts to question what is real.",
    "all-10": "An immortal goblin has waited centuries for a human bride who can end his endless life, and one girl sees him when nobody else can.",
    "all-11": "A struggling writer and a stiff, practical homeowner agree to a contract marriage to solve their housing troubles.",
    "all-12": "A woman goes on a blind date to help a friend, only to find that her date is her company's CEO.",
    "all-13": "A young woman who hiccups whenever she lies grows up to become a news reporter, in a newsroom where truth is complicated.",
    "all-14": "A gifted surgeon's life is split between two Koreas as he searches for answers and a way back to the people he loves.",
    "all-15": "A brilliant young lawyer on the autism spectrum takes on cases at a big law firm and changes the way her colleagues see her."
};

document.addEventListener("DOMContentLoaded", () => {
    let id = new URLSearchParams(location.search).get("id") || "all-1";
    if (id === "random") id = CENTRAL_DRAMA_DATABASE[Math.floor(Math.random() * CENTRAL_DRAMA_DATABASE.length)].id; window.CURRENT_DRAMA_ID = id;
    const d = CENTRAL_DRAMA_DATABASE.find(x => x.id === id);
    if (!d) return;
    const set = (sel, v) => { const n = document.querySelector(sel); if (n) n.textContent = v; };

    document.title = `${d.title} | Petal & Scene`;
    set("h1", d.title);
    set("#dramaOriginalTitle", d.genres.join(" · "));
    set("#dramaYear", d.year);
    set("#dramaCountry", d.country);
    set("#dramaEpisodes", d.episodes);
    set(".rating-val", `${d.rating} out of 10`);
    const poster = document.getElementById("dramaPoster");
    if (poster) { poster.src = d.poster; poster.alt = `Poster for ${d.title}`; }
    const syn = [...document.querySelectorAll("h2")].find(h => h.textContent.trim() === "Synopsis");
    if (syn && syn.nextElementSibling) syn.nextElementSibling.textContent = SYNOPSES[id] || "";

    const sel = document.querySelector(".status-selector");
    if (sel) {
        sel.value = StorageEngine.getCollection()[id] || "None";
        sel.addEventListener("change", e => StorageEngine.updateWatchStatus(id, e.target.value));
    }

    // Quick links: pick a feeling and jump to the diary with this drama selected
    const panel = document.querySelector(".detail-info-panel");
    if (panel && window.MOODS) {
        panel.insertAdjacentHTML("beforeend", `<h2 style="font-size:1.5rem;margin-bottom:12px;color:var(--moonlight);">How did it make you feel?</h2>
            <div style="display:flex;gap:10px;flex-wrap:wrap;">${Object.entries(MOODS).map(([k, m]) => `<a class="genre-tag" href="diary.html?drama=${id}&mood=${k}">${m.e} ${m.label}</a>`).join("")}</div>`);
    }
});
