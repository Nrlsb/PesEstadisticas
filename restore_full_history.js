const fs = require('fs');

const GENERAL_FILE = "league_General.json";
const LA_LIGA_FILE = "league_La_Liga.json";

function recoverHistory() {
    // 1. Read General Data (to find the Final Season data we seemingly lost)
    let generalData = [];
    try {
        generalData = JSON.parse(fs.readFileSync(GENERAL_FILE, 'utf-8'));
    } catch (e) { console.error(e); return; }

    const generalLeague = generalData[0]; // Combined data

    // 2. Extract La Liga Final Data from General
    const finalTeams = generalLeague.standings.filter(t => t.origin_league === "La Liga").map(t => { const { origin_league, ...rest } = t; return rest; });
    const finalScorers = generalLeague.top_scorers.filter(t => t.origin_league === "La Liga").map(t => { const { origin_league, ...rest } = t; return rest; });
    const finalAssists = generalLeague.top_assists.filter(t => t.origin_league === "La Liga").map(t => { const { origin_league, ...rest } = t; return rest; });

    // Reconstruct the "Final" Season Object
    const finalSeasonObj = {
        league: "La Liga",
        season: "25/26",
        round: "Final",
        standings: finalTeams,
        top_scorers: finalScorers,
        top_assists: finalAssists
    };

    // 3. Read the Current La Liga File (which user just made with Mid-Season data)
    let currentFile = [];
    try {
        const raw = fs.readFileSync(LA_LIGA_FILE, 'utf-8');
        currentFile = JSON.parse(raw);
    } catch (e) { console.error(e); return; }

    // Ensure it's an array for consistency
    if (!Array.isArray(currentFile)) {
        currentFile = [currentFile];
    }

    // 4. Merge: [MidSeason (User Input), Final (Recovered)]
    // Warning: Check if user input is indeed mid-season. It has "round": "Mid-season"

    const midSeasonObj = currentFile.find(r => r.round === "Mid-season") || currentFile[0];

    // Create the new history array
    const history = [midSeasonObj, finalSeasonObj];

    fs.writeFileSync(LA_LIGA_FILE, JSON.stringify(history, null, 4), 'utf-8');
    console.log("Successfully combined Mid-season and Final data for La Liga.");
}

recoverHistory();
