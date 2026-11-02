// collection.js - Direct control tracking interface lists
document.addEventListener("DOMContentLoaded", () => {
    const grid = document.querySelector(".drama-grid");
    if (!grid) return;

    function renderCollection() {
        const collection = StorageEngine.getCollection() || {};
        const savedIds = Object.keys(collection);

        const planCount = Object.values(collection).filter(v => v === "Plan to watch").length;
        const watchingCount = Object.values(collection).filter(v => v === "Watching").length;
        const completedCount = Object.values(collection).filter(v => v === "Completed").length;

        const savedNode = document.getElementById("summary-saved");
        const planNode = document.getElementById("summary-plan");
        const watchingNode = document.getElementById("summary-watching");
        const completedNode = document.getElementById("summary-completed");

        if (savedNode) savedNode.textContent = savedIds.length;
        if (planNode) planNode.textContent = planCount;
        if (watchingNode) watchingNode.textContent = watchingCount;
        if (completedNode) completedNode.textContent = completedCount;

        // Pulls all saved IDs out of the database without hardcoded limits or caps
        const savedDramas = CENTRAL_DRAMA_DATABASE.filter(d => savedIds.includes(d.id));

        if (savedDramas.length === 0) {
            grid.innerHTML = `
                <div style="grid-column: 1/-1; padding: 60px; text-align: center; color: var(--muted);">
                    <h3>Your collection is empty</h3>
                    <p style="margin-top: 8px;">Save a drama from the discover page and it will appear here.</p>
                    <a href="discover.html" class="btn btn-outline" style="margin-top: 20px;">Find a drama to save</a>
                </div>`;
            return;
        }

        grid.innerHTML = savedDramas.map(d => {
            const currentStatus = collection[d.id];
            return `
                <article class="drama-card">
                    <a href="drama.html?id=${d.id}" class="drama-card-link" style="display: block;" aria-label="Open ${d.title}">
                        <img src="${d.poster}" alt="Poster for ${d.title}">
                        <div class="drama-card-content" style="padding-bottom: 8px;">
                            <h3 style="margin-bottom: 8px;">${d.title}</h3>
                            <p style="font-size: 0.85rem; margin-bottom: 0;">Status: <span style="color: var(--sakura); font-weight: 500;">${currentStatus}</span></p>
                        </div>
                    </a>
                    <div class="drama-card-content" style="padding-top: 6px;">
                        <select class="status-updater" data-id="${d.id}" style="width: 100%; padding: 8px; background: var(--midnight); color: var(--moonlight); border: 1px solid var(--glass-border); border-radius: 6px; outline: none; font-size: 0.85rem;">
                            <option value="Plan to watch" ${currentStatus === 'Plan to watch' ? 'selected' : ''}>Plan to watch</option>
                            <option value="Watching" ${currentStatus === 'Watching' ? 'selected' : ''}>Watching</option>
                            <option value="Completed" ${currentStatus === 'Completed' ? 'selected' : ''}>Completed</option>
                            <option value="Remove">Remove</option>
                        </select>
                    </div>
                </article>
            `;
        }).join('');

        document.querySelectorAll(".status-updater").forEach(select => {
            select.addEventListener("change", (e) => {
                const dramaId = select.getAttribute("data-id");
                StorageEngine.updateWatchStatus(dramaId, e.target.value);
                renderCollection();
            });
        });
    }

    renderCollection();
});
