const fs = require('fs');
const path = require('path');

class StatsManager {
    constructor(basePath) {
        this.basePath = basePath || process.cwd();
        this.statsFile = path.join(this.basePath, 'stats.json');
        this.awardsFile = path.join(this.basePath, 'awards.json');
    }

    _readJson(filepath) {
        if (!fs.existsSync(filepath)) return [];
        try {
            const data = fs.readFileSync(filepath, 'utf8');
            return JSON.parse(data);
        } catch (e) {
            console.error(`Error reading ${filepath}:`, e);
            return [];
        }
    }

    _writeJson(filepath, data) {
        fs.writeFileSync(filepath, JSON.stringify(data, null, 4), 'utf8');
    }

    getLeagueFilepath(leagueName) {
        const safeName = leagueName.replace(/[^a-z0-9]/gi, '_');
        return path.join(this.basePath, `league_${safeName}.json`);
    }

    addMatch(matchData) {
        const stats = this._readJson(this.statsFile);
        stats.push(matchData);
        this._writeJson(this.statsFile, stats);
        console.log(`[StatsManager] Match saved: ${matchData.local} vs ${matchData.visitante}`);
    }

    addAward(awardData) {
        const awards = this._readJson(this.awardsFile);
        awards.push(awardData);
        this._writeJson(this.awardsFile, awards);
        console.log(`[StatsManager] Award saved: ${awardData.award_name}`);
    }

    addLeagueSnapshot(snapshotData) {
        const leagueName = snapshotData.league || "Unknown_League";
        const filepath = this.getLeagueFilepath(leagueName);

        const currentData = this._readJson(filepath);
        currentData.push(snapshotData);

        this._writeJson(filepath, currentData);
        console.log(`[StatsManager] League data saved to: ${path.basename(filepath)}`);
    }
}

module.exports = StatsManager;
