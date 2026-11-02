function renderConstellation(ctx, nodes) {
    if (nodes.length < 2) return;
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = "rgba(255, 244, 240, 0.25)";
    ctx.setLineDash([4, 4]); // Creates a star-map tracing lane aesthetic

    ctx.beginPath();
    ctx.moveTo(nodes[0].x, nodes[0].y);
    for (let i = 1; i < nodes.length; i++) {
        ctx.lineTo(nodes[i].x, nodes[i].y);
    }
    ctx.stroke();
    ctx.setLineDash([]); // Reset line configurations
}
