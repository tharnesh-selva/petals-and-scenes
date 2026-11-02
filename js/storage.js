// ==========================================================================
// PETAL & SCENE — BULLETPROOF STORAGE PERSISTENCE ENGINE
// ==========================================================================

const StorageEngine = {
    // 1. WATCH COLLECTION CONTROLLER MATRICES
    getCollection() {
        const stored = localStorage.getItem("petal_collection");
        // Auto-initializes dummy data models matching webpage context if storage is bare
        if (!stored) {
            const defaults = { "all-2": "Plan to watch", "all-1": "Plan to watch", "all-6": "Watching", "all-11": "Completed" };
            localStorage.setItem("petal_collection", JSON.stringify(defaults));
            return defaults;
        }
        return JSON.parse(stored);
    },

    updateWatchStatus(dramaId, status) {
        const collection = this.getCollection();
        if (status === "Remove" || status === "None") {
            delete collection[dramaId];
        } else {
            collection[dramaId] = status;
        }
        localStorage.setItem("petal_collection", JSON.stringify(collection));
        window.dispatchEvent(new Event("storageUpdate"));
    },

    // 2. TIMELINE DIARY LOG ENGINE CHANNELS
    getDiaryEntries() {
        const stored = localStorage.getItem("petal_diary");
        if (!stored) {
            const defaults = [
                { id: 1, dramaId: "all-2", title: "A quiet ending, finally", date: "2026-10-12", mood: "nostalgic", text: "Beautiful story pacing.", score: 4 },
                { id: 2, dramaId: "all-11", title: "Tea and rainy-day comfort", date: "2026-10-05", mood: "cozy", text: "Absolute comfort watch.", score: 5 }
            ];
            localStorage.setItem("petal_diary", JSON.stringify(defaults));
            return defaults;
        }
        return JSON.parse(stored);
    },

    saveDiaryEntry(entry) {
        const entries = this.getDiaryEntries();
        entries.unshift(entry);
        localStorage.setItem("petal_diary", JSON.stringify(entries));
        window.dispatchEvent(new Event("storageUpdate"));
    },

    // 3. PERSISTENT CANVAS LANDSCAPE GARDEN ARRAYS
    getPlantedFlowers() {
        const stored = localStorage.getItem("petal_garden_flowers");
        return stored ? JSON.parse(stored) : [];
    },

    savePlantedFlowers(flowers) {
        localStorage.setItem("petal_garden_flowers", JSON.stringify(flowers));
    }
};
