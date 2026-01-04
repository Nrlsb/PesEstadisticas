const screenshot = require('screenshot-desktop');
const { GlobalKeyboardListener } = require('node-global-key-listener');
const ScreenReader = require('./services/screenReader');
const StatsManager = require('./services/statsManager');

// Initialize Services
const reader = new ScreenReader();
const manager = new StatsManager();
const keyListener = new GlobalKeyboardListener();

async function processScreen() {
    console.log("\n[!] Taking screenshot...");

    try {
        // 1. Capture
        const imgBuffer = await screenshot({ format: 'png' });

        // 2. Read
        console.log("[*] Analyzing text...");
        const result = await reader.processImage(imgBuffer);

        console.log("\n--- Analysis Result ---");
        console.log(JSON.stringify(result, null, 2));
        console.log("-----------------------");

        if (result.type === 'unknown') {
            console.log("Could not identify screen type.");
            return;
        }

        // 3. Save
        console.log("Saving data...");
        if (result.type === 'match') manager.addMatch(result);
        else if (result.type === 'award') manager.addAward(result);
        else if (result.type === 'league_table') manager.addLeagueSnapshot(result);

        console.log("[OK] Process Cycle Complete.");

    } catch (err) {
        console.error("[ERROR]", err);
    }
}

// Setup Key Listener
keyListener.addListener(function (e, down) {
    if (e.state == "DOWN" && e.name == "F9") {
        // Prevent multiple rapid triggers
        processScreen();
    }
    if (e.state == "DOWN" && e.name == "ESCAPE") {
        console.log("Exiting...");
        process.exit(0);
    }
});

console.log("=== PES Node.js Live Tracker ===");
console.log("Press 'F9' to capture and process.");
console.log("Press 'ESC' to exit.");

// Keep process alive
setInterval(() => { }, 1000);
