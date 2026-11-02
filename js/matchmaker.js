function getMatchmakerPicks() {
    const entries = StorageEngine.getDiaryEntries();
    const collection = StorageEngine.getCollection();

    // Map favored genres from high-scoring logs
    const favoriteGenres = entries.filter(e => e.score >= 4).flatMap(e => {
        const drama = CENTRAL_DRAMA_DATABASE.find(d => d.id === e.dramaId);
        return drama ? drama.genres : [];
    });

    // Score uncollected titles against user alignment patterns
    return CENTRAL_DRAMA_DATABASE.filter(d => !collection[d.id]).map(d => {
        const matchScore = d.genres.filter(g => favoriteGenres.includes(g)).length;
        return { drama: d, confidence: matchScore };
    }).sort((a, b) => b.confidence - a.confidence).slice(0, 3).map(item => item.drama);
}
