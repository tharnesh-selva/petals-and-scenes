// Shared top bar. One place builds the menu for every page, so pages never carry their own copy.
(function () {
    const page = location.pathname.split("/").pop() || "index.html";
    const authPage = page === "login.html" || page === "register.html";
    document.body.classList.toggle("auth-page", authPage);
    const header = document.getElementById("siteHeader");
    if (authPage || !header) return;

    const session = JSON.parse(localStorage.getItem("petal_session") || "null") || { name: "Guest", email: "" };
    const safe = t => String(t).replace(/[<>&"]/g, "");
    const MAIN = [["Home", "index.html"], ["Discover", "discover.html"], ["Collection", "collection.html"], ["Diary", "diary.html"], ["Garden", "garden.html"], ["Settings", "settings.html"]];
    const MORE = [["Favourites", "favourites.html"], ["Calendar", "calendar.html"], ["Surprise me", "drama.html?id=random"], ["FAQ", "faq.html"], ["Feedback", "feedback.html"]];
    const on = h => h === page;
    const moreActive = MORE.some(([, h]) => on(h));

    header.innerHTML = `
        <a class="brand" href="index.html"><span class="brand-mark">夜桜</span><span class="brand-name">Petal &amp; Scene</span></a>
        <button class="nav-toggle" aria-expanded="false" aria-controls="mainNav">Menu</button>
        <nav class="nav" id="mainNav" aria-label="Main">
            <div class="nav-main">${MAIN.map(([t, h]) => `<a class="nav-link${on(h) ? " active" : ""}" href="${h}">${t}</a>`).join("")}</div>
            <div class="nav-more">
                <button class="nav-link more-btn${moreActive ? " active" : ""}" aria-haspopup="true" aria-expanded="false">More</button>
                <div class="menu" id="moreMenu">${MORE.map(([t, h]) => `<a href="${h}"${on(h) ? ' class="active"' : ""}>${t}</a>`).join("")}</div>
            </div>
            <div class="nav-right">
                <span id="streakChip" class="streak-chip"></span>
                <div class="user">
                    <button class="user-btn" aria-haspopup="true" aria-expanded="false"><span class="avatar">${safe(session.name).charAt(0).toUpperCase() || "?"}</span><span class="user-name">${safe(session.name)}</span></button>
                    <div class="menu" id="userMenu"><div class="who"><b>${safe(session.name)}</b>${safe(session.email)}</div><hr><a href="settings.html">Settings</a><button id="logoutBtn">Log out</button></div>
                </div>
            </div>
        </nav>`;

    const menus = [["moreMenu", ".more-btn"], ["userMenu", ".user-btn"]].map(([id, btn]) => ({ menu: header.querySelector("#" + id), btn: header.querySelector(btn) }));
    const closeAll = except => menus.forEach(m => { if (m.menu !== except) { m.menu.classList.remove("open"); m.btn.setAttribute("aria-expanded", "false"); } });
    menus.forEach(m => m.btn.addEventListener("click", e => { e.stopPropagation(); closeAll(m.menu); const o = m.menu.classList.toggle("open"); m.btn.setAttribute("aria-expanded", o); }));
    document.addEventListener("click", () => closeAll());
    document.addEventListener("keydown", e => { if (e.key === "Escape") closeAll(); });

    const nav = header.querySelector("#mainNav"), tog = header.querySelector(".nav-toggle");
    tog.onclick = () => { const o = nav.classList.toggle("open"); tog.setAttribute("aria-expanded", o); };
    header.querySelector("#logoutBtn").onclick = () => { Auth.logout(); location.href = "login.html?out=1"; };

    const onScroll = () => header.classList.toggle("scrolled", window.scrollY > 24);
    window.addEventListener("scroll", onScroll, { passive: true }); onScroll();
})();
