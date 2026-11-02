document.addEventListener("DOMContentLoaded", () => {
    const grid = document.querySelector(".drama-grid");
    if (!grid) return;

    // Pick top high-rated titles for front page spotlight feature
    const picks = CENTRAL_DRAMA_DATABASE.slice(0, 5);
    
    // Wrapped the entire card container element inside the anchor routing tag safely
    grid.innerHTML = picks.map(d => `
        <a href="drama.html?id=${d.id}" class="drama-card-link fade-up" style="display: block;">
            <article class="drama-card">
                <img src="${d.poster}" alt="Poster for ${d.title}">
                <div class="drama-card-content">
                    <h3>${d.title}</h3>
                    <p>${d.year}, ${d.country}, ${d.episodes} eps</p>
                    <div class="rating">★ ${d.rating}</div>
                </div>
            </article>
        </a>
    `).join('');
});

document.addEventListener("DOMContentLoaded", () => {
    const g = document.getElementById("matchmakerGrid");
    if (!g || typeof getMatchmakerPicks !== "function") return;
    g.innerHTML = getMatchmakerPicks().map(d => `
        <a href="drama.html?id=${d.id}" class="drama-card-link" style="display: block;">
            <article class="drama-card">
                <img src="${d.poster}" alt="Poster for ${d.title}">
                <div class="drama-card-content"><h3>${d.title}</h3><p>${d.genres.join(" · ")}</p><div class="rating">★ ${d.rating}</div></div>
            </article>
        </a>`).join("");
});
