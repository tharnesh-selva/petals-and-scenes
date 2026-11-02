// Simple demo login: accounts live in this browser's localStorage only (no server).
const Auth = (() => {
    const users = () => JSON.parse(localStorage.getItem("petal_users") || "{}");
    const hash = async t => {
        if (window.crypto && crypto.subtle) {
            const b = await crypto.subtle.digest("SHA-256", new TextEncoder().encode("petal:" + t));
            return [...new Uint8Array(b)].map(x => x.toString(16).padStart(2, "0")).join("");
        }
        let h = 0; for (const c of "petal:" + t) h = (h * 31 + c.charCodeAt(0)) | 0; return String(h);
    };
    const session = () => JSON.parse(localStorage.getItem("petal_session") || "null");
    return {
        session,
        async register(name, email, pw) {
            const u = users(); email = email.trim().toLowerCase();
            if (u[email]) return "That email is already registered. Try logging in.";
            u[email] = { name: name.trim(), pw: await hash(pw) };
            localStorage.setItem("petal_users", JSON.stringify(u));
            localStorage.setItem("petal_session", JSON.stringify({ email, name: name.trim() }));
            return "";
        },
        async login(email, pw) {
            const u = users()[email.trim().toLowerCase()];
            if (!u || u.pw !== await hash(pw)) return "Wrong email or password.";
            localStorage.setItem("petal_session", JSON.stringify({ email: email.trim().toLowerCase(), name: u.name }));
            return "";
        },
        logout() { localStorage.removeItem("petal_session"); }
    };
})();

document.addEventListener("DOMContentLoaded", () => {
    // Login / register forms
    const form = document.getElementById("authForm");
    if (!form) return;
    const msg = document.getElementById("authMsg"), reg = form.dataset.mode === "register";
    if (new URLSearchParams(location.search).get("out")) msg.textContent = "You have been logged out.";
    form.addEventListener("submit", async e => {
        e.preventDefault();
        const f = new FormData(form), pw = f.get("password");
        let err = "";
        if (reg && pw.length < 6) err = "Password needs at least 6 characters.";
        else if (reg && pw !== f.get("confirm")) err = "The two passwords do not match.";
        else err = reg ? await Auth.register(f.get("name"), f.get("email"), pw) : await Auth.login(f.get("email"), pw);
        msg.style.color = err ? "#ff9b9b" : "var(--sakura)";
        msg.textContent = err || (reg ? "Account created! Taking you home..." : "Welcome back! Taking you home...");
        if (!err) setTimeout(() => { location.replace("index.html"); }, 900);
    });
    document.querySelectorAll(".show-pw").forEach(b => b.onclick = () => { const i = b.previousElementSibling; i.type = i.type === "password" ? "text" : "password"; b.textContent = i.type === "password" ? "Show" : "Hide"; });
});
