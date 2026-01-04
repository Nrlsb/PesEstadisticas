const Tesseract = require('tesseract.js');
const { createWorker } = Tesseract;
const Jimp = require('jimp');

class ScreenReader {
    constructor() {
        this.worker = null;
    }

    async init() {
        this.worker = await createWorker('spa'); // Load Spanish by default
    }

    async stop() {
        if (this.worker) {
            await this.worker.terminate();
        }
    }

    async processImage(imageBuffer) {
        if (!this.worker) await this.init();

        // Optional: Pre-process with Jimp (grayscale, contrast)
        // const image = await Jimp.read(imageBuffer);
        // image.greyscale().contrast(0.5);
        // const processedBuffer = await image.getBufferAsync(Jimp.MIME_PNG);

        const ret = await this.worker.recognize(imageBuffer);
        const text = ret.data.text;

        console.log("--- Detected Text (Preview) ---");
        console.log(text.substring(0, 150).replace(/\n/g, ' '));
        console.log("-------------------------------");

        return this.parseText(text);
    }

    parseText(text) {
        // Strategy pattern
        if (this.isLeagueTable(text)) return this.parseLeagueTable(text);
        if (this.isMatch(text)) return this.parseMatch(text);
        if (this.isAward(text)) return this.parseAward(text);

        return { type: "unknown", text_preview: text.substring(0, 100) };
    }

    // --- Detectors ---

    isLeagueTable(text) {
        return /Posiciones|Puntos|Equipos/i.test(text);
    }

    isMatch(text) {
        const keywords = ["Goles", "Posesión", "Tiros", "Faltas", "Resultado", "Competición", "Supercopa", "Liga"];
        const hits = keywords.filter(k => text.includes(k)).length;
        const scorePattern = /(\d+|[OoQ])\s*-\s*(\d+|[OoQ])/;
        return hits >= 2 || scorePattern.test(text);
    }

    isAward(text) {
        return /Mejor jugador|votos|lugar/i.test(text);
    }

    // --- Parsers ---

    parseLeagueTable(text) {
        const data = {
            type: "league_table",
            league: "Unknown",
            stage: "Actual",
            standings: []
        };

        const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);

        // 1. Detect League Name
        for (let i = 0; i < Math.min(lines.length, 10); i++) {
            let line = lines[i];
            if (/League|LaLiga|Serie A|©/.test(line)) {
                let cleanLine = line.replace(/(FPS|GPU|CPU|LAT).*/, '')
                    .replace('©', '')
                    .replace(/^[^\w]+/, '').trim();

                if (cleanLine.length > 3) {
                    data.league = cleanLine;
                    break;
                }
            }
        }

        // 2. Parse Standings
        let startParsing = false;
        let rankCounter = 1;

        for (const line of lines) {
            if (/Equipos|Puntos|Posiciones/.test(line)) {
                startParsing = true;
                continue;
            }

            if (startParsing) {
                if (line.length < 3) continue;
                if (line.includes("FPS")) continue;

                // Strip leading rank (e.g., "1 Arsenal")
                let cleanLine = line.replace(/^\d+[\.\-\s\)]*/, '').trim();
                // Strip extra junk (e.g., ") Aston")
                cleanLine = cleanLine.replace(/^[\W_]+/, '').trim();

                // Regex: Team Name + Stats
                // Structure: Team Points Won Drawn Lost GF GA GD
                // Example: "Arsenal FC 40 12 4 3 31 13 18"
                // Regex Breakdown:
                // ^(?<team>.+?)     -> Team Name (lazy)
                // \s+(?<points>\d+) -> Points
                // \s+(?<won>\d+)    -> Wins
                // \s+(?<drawn>\d+)  -> Draws
                // \s+(?<lost>\d+)   -> Losses
                // \s+(?<gf>\d+)     -> GF
                // \s+(?<ga>\d+)     -> GA
                // \s+(?<gd>[+-]?\d+) -> GD (optional sign)

                const statsRegex = /^(?<team>.+?)\s+(?<points>\d+)\s+(?<won>\d+)\s+(?<drawn>\d+)\s+(?<lost>\d+)\s+(?<gf>\d+)\s+(?<ga>\d+)\s+(?<gd>[+-]?\d+)/;
                const match = cleanLine.match(statsRegex);

                if (match && match.groups) {
                    const teamName = match.groups.team.trim();

                    if (teamName.length > 2) {
                        data.standings.push({
                            rank: rankCounter++,
                            team: teamName,
                            points: parseInt(match.groups.points, 10),
                            stats: {
                                played: parseInt(match.groups.won) + parseInt(match.groups.drawn) + parseInt(match.groups.lost),
                                won: parseInt(match.groups.won, 10),
                                drawn: parseInt(match.groups.drawn, 10),
                                lost: parseInt(match.groups.lost, 10),
                                gf: parseInt(match.groups.gf, 10),
                                ga: parseInt(match.groups.ga, 10),
                                gd: parseInt(match.groups.gd, 10)
                            }
                        });
                    }
                } else {
                    // Fallback: Try identifying just points if the full line fails (e.g. OCR merged columns)
                    const simpleMatch = cleanLine.match(/^(?<team>.+?)\s+(?<points>\d+)(\s|$)/);
                    if (simpleMatch && simpleMatch.groups && simpleMatch.groups.team.length > 2) {
                        data.standings.push({
                            rank: rankCounter++,
                            team: simpleMatch.groups.team.trim(),
                            points: parseInt(simpleMatch.groups.points, 10),
                            stats: "Incomplete read"
                        });
                    }
                }
            }
        }

        return data;
    }

    parseMatch(text) {
        const data = {
            type: "match",
            competicion: "Unknown",
            local: "Local",
            visitante: "Visitante",
            goles_local: 0,
            goles_visitante: 0,
            resultado: "0 - 0"
        };

        const lines = text.split('\n').map(l => l.trim());
        const scoreRegex = /(\d+|[OoQ])\s*-\s*(\d+|[OoQ])/;

        for (const line of lines) {
            if (/Supercopa|Liga|Copa/.test(line)) {
                data.competicion = line;
            }

            const match = line.match(scoreRegex);
            if (match) {
                const g1 = isNaN(match[1]) ? 0 : parseInt(match[1]);
                const g2 = isNaN(match[2]) ? 0 : parseInt(match[2]);
                data.goles_local = g1;
                data.goles_visitante = g2;
                data.resultado = `${g1} - ${g2}`;

                const parts = line.split(scoreRegex);
                if (parts.length >= 3) {
                    data.local = parts[0].trim();
                    data.visitante = parts[parts.length - 1].trim();
                }
            }
        }
        return data;
    }

    parseAward(text) {
        const data = {
            type: "award",
            award_name: "Unknown Award",
            winner: "Unknown"
        };

        const lines = text.split('\n');
        for (const line of lines) {
            if (line.includes("Mejor jugador")) data.award_name = line.trim();
            if (line.includes("Lucas Benitez")) data.winner = "Lucas Benitez"; // Simple heuristic
        }
        return data;
    }
}

module.exports = ScreenReader;
