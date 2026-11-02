// Feedback: rating, topic and message are saved in this browser (per account) and listed on the right.
document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("fbForm");
    if (!form) return;
    const s = Auth.session() || { email: "guest", name: "Guest" };
    const KEY = "petal_feedback_" + s.email;
    const read = () => { try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch (e) { return []; } };
    const WORDS = ["Tap a star", "Not great", "Could be better", "It is okay", "Really good", "Absolutely love it"];
    let rating = 0, type = "Idea";
    const stars = [...document.querySelectorAll("#fbStars button")], text = document.getElementById("fbText"), msg = document.getElementById("fbMsg"), list = document.getElementById("fbList");

    const paint = n => { stars.forEach(b => b.classList.toggle("on", +b.dataset.v <= n)); document.getElementById("fbStarText").textContent = WORDS[n]; };
    stars.forEach(b => {
        b.onmouseenter = () => paint(+b.dataset.v);
        b.onmouseleave = () => paint(rating);
        b.onclick = () => { rating = +b.dataset.v; stars.forEach(x => x.setAttribute("aria-checked", +x.dataset.v === rating)); paint(rating); };
    });
    document.querySelectorAll("#fbType .genre-tag").forEach(b => b.onclick = () => { type = b.dataset.v; document.querySelectorAll("#fbType .genre-tag").forEach(x => x.classList.toggle("active", x === b)); });
    text.oninput = () => document.getElementById("fbCount").textContent = text.value.length + " / 800";

    const esc = t => t.replace(/[<>&"]/g, c => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;" }[c]));
    function draw() {
        const all = read();
        list.innerHTML = all.length ? all.map((f, i) => `<article class="fb-note"><header><b>${esc(f.type)}</b><span>${"★".repeat(f.rating)}${"☆".repeat(5 - f.rating)}</span></header><p>${esc(f.text)}</p><footer><time>${new Date(f.at).toLocaleDateString("en", { day: "numeric", month: "short", year: "numeric" })}</time><button data-i="${i}">Delete</button></footer></article>`).join("") : '<p class="fb-empty">Nothing yet. Your notes will show up here.</p>';
    }
    list.onclick = e => { const b = e.target.closest("button[data-i]"); if (!b) return; const all = read(); all.splice(+b.dataset.i, 1); localStorage.setItem(KEY, JSON.stringify(all)); draw(); };

    form.addEventListener("submit", e => {
        e.preventDefault();
        msg.style.color = "#ff9b9b";
        if (!rating) { msg.textContent = "Please choose a star rating first."; return; }
        if (text.value.trim().length < 5) { msg.textContent = "Add a few words so we know what you mean."; return; }
        const all = read(); all.unshift({ rating, type, text: text.value.trim(), at: Date.now() });
        localStorage.setItem(KEY, JSON.stringify(all.slice(0, 30)));
        rating = 0; paint(0); stars.forEach(x => x.setAttribute("aria-checked", "false")); text.value = ""; document.getElementById("fbCount").textContent = "0 / 800";
        msg.style.color = "var(--sakura)"; msg.textContent = "Thank you! Your feedback was saved.";
        window.toast && window.toast("Feedback sent");
        draw();
    });
    draw();
});
