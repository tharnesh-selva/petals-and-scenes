document.addEventListener("DOMContentLoaded", () => {
    const grid = document.querySelector(".drama-grid");
    const searchInput = document.querySelector(".search-box input");
    if (!grid) return;

    let activeGenre = null;
    let activeCountry = "Any country";

    function render() {
        const searchVal = searchInput ? searchInput.value.toLowerCase() : "";
        
        const filtered = CENTRAL_DRAMA_DATABASE.filter(d => {
            const matchesSearch = d.title.toLowerCase().includes(searchVal) || d.genres.join(" ").toLowerCase().includes(searchVal);
            const matchesGenre = !activeGenre || d.genres.includes(activeGenre);
            const matchesCountry = activeCountry === "Any country" || d.country === activeCountry;
            return matchesSearch && matchesGenre && matchesCountry;
        });

        const sort = new URLSearchParams(location.search).get("sort");
        if (sort === "top") filtered.sort((a, b) => b.rating - a.rating);
        if (sort === "new") filtered.sort((a, b) => b.year - a.year);
        if (filtered.length === 0) {
            grid.innerHTML = `<div style="grid-column: 1/-1; padding: 40px; text-align: center;"><h3>No dramas match those filters</h3></div>`;
            return;
        }

        // Wrapped the entire card inside an anchor layout layer to capture full poster clicks
        grid.innerHTML = filtered.map(d => `
            <a href="drama.html?id=${d.id}" class="drama-card-link" style="display: block;">
                <article class="drama-card">
                    <img src="${d.poster}" alt="Poster for ${d.title}">
                    <div class="drama-card-content">
                        <h3>${d.title}</h3>
                        <p>${d.year}, ${d.country}</p>
                        <div class="rating">★ ${d.rating}</div>
                    </div>
                </article>
            </a>
        `).join('');
    }

    if (searchInput) searchInput.addEventListener("input", render);

    document.querySelectorAll("main .genre-tag").forEach(tag => {
        tag.addEventListener("click", (e) => {
            e.preventDefault();
            document.querySelectorAll("main .genre-tag").forEach(t => t.classList.remove("active"));
            const genreText = tag.textContent.trim();
            if (activeGenre === genreText) {
                activeGenre = null;
            } else {
                activeGenre = genreText;
                tag.classList.add("active");
            }
            render();
        });
    });
    const gp = new URLSearchParams(location.search).get("genre");
    if (gp) document.querySelectorAll("main button.genre-tag").forEach(t => {
        if (t.textContent.trim().toLowerCase() === gp.replace(/-/g, " ").toLowerCase()) { activeGenre = t.textContent.trim(); t.classList.add("active"); }
    });
    render();
});
