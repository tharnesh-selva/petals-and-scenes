// FAQ: live search over the questions and answers
document.addEventListener("DOMContentLoaded", () => {
    const box = document.getElementById("faqSearch"), items = [...document.querySelectorAll(".faq-item")], groups = [...document.querySelectorAll(".faq-group")], none = document.getElementById("faqNone");
    if (!box) return;
    box.addEventListener("input", () => {
        const q = box.value.trim().toLowerCase();
        items.forEach(i => { const hit = !q || i.textContent.toLowerCase().includes(q); i.hidden = !hit; if (q && hit) i.open = true; if (!q) i.open = false; });
        groups.forEach(g => { let n = g.nextElementSibling, any = false; while (n && n.classList.contains("faq-item")) { if (!n.hidden) any = true; n = n.nextElementSibling; } g.hidden = !any; });
        none.hidden = items.some(i => !i.hidden);
    });
});
