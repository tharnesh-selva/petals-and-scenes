// Login guard, watching streak, favourites and calendar. Everything is stored in this browser's localStorage.
(function () {
    const page = location.pathname.split("/").pop() || "index.html";
    const authPage = page === "login.html" || page === "register.html";
    const session = JSON.parse(localStorage.getItem("petal_session") || "null");
    if (!session && !authPage) { location.replace("login.html"); return; }
    if (session && authPage && !new URLSearchParams(location.search).get("out")) { location.replace("index.html"); return; }

    const read = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) || d; } catch (e) { return d; } };
    const key = d => d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
    const days = read("petal_days", []);
    const today = key(new Date());
    if (session && !days.includes(today)) { days.push(today); localStorage.setItem("petal_days", JSON.stringify(days)); }

    function streak() {
        let n = 0, d = new Date();
        if (!days.includes(key(d))) d.setDate(d.getDate() - 1);
        while (days.includes(key(d))) { n++; d.setDate(d.getDate() - 1); }
        return n;
    }

    document.addEventListener("DOMContentLoaded", () => {
        const chip = document.getElementById("streakChip");
        if (chip) { if (session) chip.textContent = streak() + "-day streak"; else chip.remove(); }

        // Favourites page
        const fav = () => read("petal_favs", []);
        const grid = document.getElementById("favGrid");
        if (grid && typeof CENTRAL_DRAMA_DATABASE !== "undefined") {
            const list = CENTRAL_DRAMA_DATABASE.filter(d => fav().includes(d.id));
            grid.innerHTML = list.length ? list.map(d => `<a href="drama.html?id=${d.id}" class="drama-card-link" style="display:block"><article class="drama-card"><img src="${d.poster}" alt="Poster for ${d.title}"><div class="drama-card-content"><h3>${d.title}</h3><p>${d.year}, ${d.country}</p><div class="rating">★ ${d.rating}</div></div></article></a>`).join("") : '<p style="grid-column:1/-1;text-align:center;color:var(--muted)">No favourites yet. Open a drama and tap Add to favourites.</p>';
        }

        // Calendar page
        const calGrid = document.getElementById("calGrid");
        if (calGrid) {
            let view = new Date(); view.setDate(1);
            const diary = read("petal_diary", []).map(e => e.date);
            const draw = () => {
                const y = view.getFullYear(), m = view.getMonth(), first = new Date(y, m, 1).getDay(), count = new Date(y, m + 1, 0).getDate();
                document.getElementById("calTitle").textContent = view.toLocaleString("en", { month: "long", year: "numeric" });
                let h = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(x => `<b>${x}</b>`).join("") + "<i></i>".repeat(first);
                for (let d = 1; d <= count; d++) {
                    const k = key(new Date(y, m, d)), c = (days.includes(k) ? " visited" : "") + (diary.includes(k) ? " logged" : "") + (k === today ? " today" : "");
                    h += `<span class="cal-day${c}">${d}</span>`;
                }
                calGrid.innerHTML = h;
            };
            document.getElementById("calPrev").onclick = () => { view.setMonth(view.getMonth() - 1); draw(); };
            document.getElementById("calNext").onclick = () => { view.setMonth(view.getMonth() + 1); draw(); };
            document.getElementById("calSub").textContent = "Current streak: " + streak() + " day(s). Highlighted days are days you visited; a dot means a diary entry.";
            draw();
        }

        // Favourite button on the drama page
        if (page === "drama.html") window.addEventListener("load", () => {
            const h = document.querySelector("main h1"), id = window.CURRENT_DRAMA_ID;
            if (!h || !id) return;
            const b = document.createElement("button");
            b.className = "btn btn-outline fav-btn";
            const set = () => { b.textContent = fav().includes(id) ? "Remove from favourites" : "Add to favourites"; };
            b.onclick = () => { const f = fav(), i = f.indexOf(id); i < 0 ? f.push(id) : f.splice(i, 1); localStorage.setItem("petal_favs", JSON.stringify(f)); set(); };
            set(); h.insertAdjacentElement("afterend", b);
        });
    });
})();
