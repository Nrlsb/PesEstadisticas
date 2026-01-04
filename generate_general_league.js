const fs = require('fs');
const path = require('path');

const LEAGUE_FILES = [
    "league_La_Liga.json",
    "league_Premier_League.json",
    "league_Ligue_1.json",
    "league_Serie_A.json",
    "league_Bundesliga.json"
];

const OUTPUT_FILE = "league_General.json";

function loadJson(filepath) {
    if (!fs.existsSync(filepath)) {
        console.log(`Warning: ${filepath} not found.`);
        return null;
    }
    try {
        const rawData = fs.readFileSync(filepath, 'utf-8');
        return JSON.parse(rawData);
    } catch (e) {
        console.error(`Error parsing ${filepath}`, e);
        return null;
    }
}

function processTopScorers(scorers, leagueName, season) {
    if (!scorers) return [];
    return scorers.map(p => ({
        ...p,
        origin_league: leagueName,
        season: season // Track season for debugging or potentially frontend use
    }));
}

function processTopAssists(assists, leagueName, season) {
    if (!assists) return [];
    return assists.map(p => ({
        ...p,
        origin_league: leagueName,
        season: season
    }));
}

function generateGeneralLeague() {
    // Structure: { "25/26": { teams: [], scorers: [], assists: [] }, "26/27": ... }
    const seasonsMap = {};
    const allTimeTeamsMap = {}; // Key: TeamName (assuming unique enough across leagues or combine with league)

    LEAGUE_FILES.forEach(filename => {
        const data = loadJson(filename);
        if (!data) return;

        // Data is an array of season objects: [{ season: "25/26", ...}, { season: "26/27", ...}]
        // Or possibly a single object if older version (but we see array in file view)
        const leagueArray = Array.isArray(data) ? data : [data];

        leagueArray.forEach(seasonData => {
            const season = seasonData.season;
            const leagueName = seasonData.league;

            if (!seasonsMap[season]) {
                seasonsMap[season] = { teams: [], scorers: [], assists: [] };
            }

            // --- Standings ---
            // Only take the FINAL round available for that season to avoid partial duplicates?
            // Actually, the file structure usually has one entry per season which IS the latest snapshot.
            // But if there are multiple entires for the SAME season (e.g. Mid-season, Final), we generally want the LAST one for that season.
            // The logic below assumes the input array might contain multiple snapshots for one season.
            // We should filter for the "latest" round for this specific season.
        });

        // Group by season first to find latest round per season
        const seasonGroups = {};
        leagueArray.forEach(entry => {
            if (!seasonGroups[entry.season]) seasonGroups[entry.season] = [];
            seasonGroups[entry.season].push(entry);
        });

        Object.keys(seasonGroups).forEach(season => {
            // Take the last entry for this season (assuming appended chronologically)
            const latestSeasonData = seasonGroups[season][seasonGroups[season].length - 1];

            if (!seasonsMap[season]) {
                seasonsMap[season] = { teams: [], scorers: [], assists: [] };
            }

            // Add Teams
            if (latestSeasonData.standings) {
                latestSeasonData.standings.forEach(team => {
                    const teamWithLeague = { ...team, origin_league: latestSeasonData.league };
                    seasonsMap[season].teams.push(teamWithLeague);

                    // --- All Time Aggregation ---
                    const teamKey = `${team.team}_${latestSeasonData.league}`; // Unique key
                    if (!allTimeTeamsMap[teamKey]) {
                        allTimeTeamsMap[teamKey] = {
                            rank: 0, // Will recalculate
                            team: team.team,
                            points: 0,
                            matches_played: 0,
                            wins: 0,
                            draws: 0,
                            losses: 0,
                            goals_for: 0,
                            goals_against: 0,
                            goal_diff: 0,
                            logo: team.logo,
                            origin_league: latestSeasonData.league,
                            seasons_count: 0,
                            titles: 0 // Could potentially track if rank === 1
                        };
                    }

                    const att = allTimeTeamsMap[teamKey];
                    att.points += (team.points || 0);
                    att.matches_played += (team.matches_played || 0);
                    att.wins += (team.wins || 0);
                    att.draws += (team.draws || 0);
                    att.losses += (team.losses || 0);
                    att.goals_for += (team.goals_for || 0);
                    att.goals_against += (team.goals_against || 0);
                    att.goal_diff += (team.goal_diff || 0);
                    att.seasons_count += 1;
                });
            }

            // Add Scorers
            if (latestSeasonData.top_scorers) {
                const s = processTopScorers(latestSeasonData.top_scorers, latestSeasonData.league, season);
                seasonsMap[season].scorers.push(...s);
            }

            // Add Assists
            if (latestSeasonData.top_assists) {
                const a = processTopAssists(latestSeasonData.top_assists, latestSeasonData.league, season);
                seasonsMap[season].assists.push(...a);
            }
        });
    });

    const outputLeagueList = [];

    // 1. Process Individual Seasons
    Object.keys(seasonsMap).forEach(season => {
        const sData = seasonsMap[season];

        // Sort Standings
        sData.teams.sort((a, b) => {
            if (b.points !== a.points) return b.points - a.points;
            if (b.goal_diff !== a.goal_diff) return b.goal_diff - a.goal_diff;
            return b.goals_for - a.goals_for;
        });
        // Re-rank
        sData.teams.forEach((t, i) => t.rank = i + 1);

        // Sort Scorers
        sData.scorers.sort((a, b) => b.goals - a.goals);
        let r = 1;
        sData.scorers.forEach((p, i) => {
            if (i > 0 && p.goals < sData.scorers[i - 1].goals) r = i + 1;
            p.rank = r;
        });

        // Sort Assists
        sData.assists.sort((a, b) => b.assists - a.assists);
        r = 1;
        sData.assists.forEach((p, i) => {
            if (i > 0 && p.assists < sData.assists[i - 1].assists) r = i + 1;
            p.rank = r;
        });

        outputLeagueList.push({
            league: "General League",
            season: season,
            round: "Combined",
            standings: sData.teams,
            top_scorers: sData.scorers.slice(0, 50),
            top_assists: sData.assists.slice(0, 50)
        });
    });

    // 2. Process All-Time
    const allTimeTeams = Object.values(allTimeTeamsMap);

    // Aggregate All-Time Scorers and Assists
    const allTimeScorersMap = {};
    const allTimeAssistsMap = {};

    Object.keys(seasonsMap).forEach(season => {
        const sData = seasonsMap[season];

        // Scorers
        sData.scorers.forEach(p => {
            const key = p.player; // Aggregate by name
            if (!allTimeScorersMap[key]) {
                allTimeScorersMap[key] = {
                    player: p.player,
                    team: p.team, // Keep most recent or primary
                    teams: [p.team], // Track all teams
                    goals: 0,
                    team_logo: p.team_logo,
                    season: "Histórico"
                };
            }
            allTimeScorersMap[key].goals += p.goals;
            if (!allTimeScorersMap[key].teams.includes(p.team)) {
                allTimeScorersMap[key].teams.push(p.team);
                // Optionally update display team to show multiple? 
                // For now, let's keep the initial one or maybe update to "Multiple" if needed, 
                // but usually the frontend shows one logo. 
                // Let's stick to the first encountered for logo, or maybe list them. 
                // To be simple: just sum goals.
            }
        });

        // Assists
        sData.assists.forEach(p => {
            const key = p.player;
            if (!allTimeAssistsMap[key]) {
                allTimeAssistsMap[key] = {
                    player: p.player,
                    team: p.team,
                    teams: [p.team],
                    assists: 0,
                    team_logo: p.team_logo,
                    season: "Histórico"
                };
            }
            allTimeAssistsMap[key].assists += p.assists;
            if (!allTimeAssistsMap[key].teams.includes(p.team)) {
                allTimeAssistsMap[key].teams.push(p.team);
            }
        });
    });

    const allTimeScorers = Object.values(allTimeScorersMap);
    const allTimeAssists = Object.values(allTimeAssistsMap);

    // Sort All-Time Teams
    allTimeTeams.sort((a, b) => {
        if (b.points !== a.points) return b.points - a.points;
        if (b.goal_diff !== a.goal_diff) return b.goal_diff - a.goal_diff;
        return b.goals_for - a.goals_for;
    });
    allTimeTeams.forEach((t, i) => t.rank = i + 1);

    // Sort All-Time Scorers
    allTimeScorers.sort((a, b) => b.goals - a.goals);
    let r = 1;
    allTimeScorers.forEach((p, i) => {
        if (i > 0 && p.goals < allTimeScorers[i - 1].goals) r = i + 1;
        p.rank = r;
    });

    // Sort All-Time Assists
    allTimeAssists.sort((a, b) => b.assists - a.assists);
    r = 1;
    allTimeAssists.forEach((p, i) => {
        if (i > 0 && p.assists < allTimeAssists[i - 1].assists) r = i + 1;
        p.rank = r;
    });

    outputLeagueList.push({
        league: "General League",
        season: "Histórico",
        round: "Combined",
        standings: allTimeTeams,
        top_scorers: allTimeScorers.slice(0, 100), // Top 100 All Time
        top_assists: allTimeAssists.slice(0, 100)  // Top 100 All Time
    });

    // Sort output so seasons are in order, All-Time last?
    // Crude sort: 25/26, 26/27... Histórico
    outputLeagueList.sort((a, b) => {
        if (a.season === "Histórico") return 1;
        if (b.season === "Histórico") return -1;
        return a.season.localeCompare(b.season);
    });

    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(outputLeagueList, null, 4), 'utf-8');
    console.log(`Successfully created ${OUTPUT_FILE} with ${outputLeagueList.length} entries (Seasons + All-Time).`);
}

generateGeneralLeague();
