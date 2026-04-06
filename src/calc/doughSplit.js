export function calcDoughSplit(cfg, totalDoughWeight) {
    const n = cfg.numPieces;
    if (cfg.mode === 'equal') {
        const pieceWeight = totalDoughWeight / n;
        const pieces = Array(n).fill(pieceWeight);
        return {
            totalDoughWeight,
            pieces,
            trimLoss: 0,
            pieceWeightForProof: pieceWeight,
        };
    }
    // Custom mode
    const pieces = cfg.customWeights.slice(0, n);
    const piecesSum = pieces.reduce((s, w) => s + w, 0);
    const trimLoss = Math.max(0, totalDoughWeight - piecesSum);
    const pieceWeightForProof = pieces.length > 0 ? Math.max(...pieces) : totalDoughWeight;
    return {
        totalDoughWeight,
        pieces,
        trimLoss,
        pieceWeightForProof,
    };
}
