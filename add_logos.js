const fs = require('fs');

// Map of Team Name to football-data.org ID
const TEAM_IDS = {
    // Premier League
    "Arsenal FC": 57,
    "Aston Villa FC": 58,
    "Chelsea FC": 61,
    "Everton FC": 62,
    "Fulham FC": 63,
    "Liverpool FC": 64,
    "Manchester City": 65,
    "Manchester United": 66,
    "Newcastle United": 67,
    "Tottenham Hotspur": 73,
    "Wolverhampton Wanderers": 76,
    "Leeds United": 341,
    "Crystal Palace FC": 354,
    "West Ham United": 563,
    "AFC Bournemouth": 1044,
    "Brighton & Hove Albion": 397,
    "Brentford FC": 402,
    "Nottingham Forest": 351,
    "Burnley FC": 328,
    "Sunderland AFC": 71,
    "Southampton FC": 340,
    "Leicester City": 338,
    "Ipswich Town": 349,

    // La Liga
    "Athletic Bilbao": 77,
    "Atlético Madrid": 78,
    "CA Osasuna": 79,
    "RCD Espanyol": 80,
    "FC Barcelona": 81,
    "Getafe CF": 82,
    "Real Madrid CF": 86,
    "Rayo Vallecano": 87,
    "Levante UD": 88,
    "RCD Mallorca": 89,
    "Real Betis": 90,
    "Real Sociedad": 92,
    "Villarreal CF": 94,
    "Valencia CF": 95,
    "Deportivo Alavés": 263,
    "Celta de Vigo": 558,
    "Sevilla FC": 559,
    "Girona FC": 298,
    "Elche CF": 285,
    "Real Oviedo": 4975,

    // Ligue 1
    "Paris Saint-Germain": 524,
    "Olympique Marseille": 523,
    "AS Monaco": 548,
    "Stade Brestois": 512,
    "Paris FC": 648,
    "LOSC Lille": 521,
    "OGC Nice": 522,
    "Stade Rennais FC": 529,
    "Stade de Reims": 516,
    "AS Saint-Étienne": 527,
    "Stade Lavallois": 4486,
    "FC Nantes": 543,
    "RC Strasbourg Alsace": 576,
    "RC Lens": 546,
    "AC Le Havre": 534,
    "Olympique Lyonnais": 528,
    "FC Metz": 545,
    "AJ Auxerre": 518,
    "FC Lorient": 525,
    "Angers SCO": 532,
    "Toulouse FC": 511,

    // Serie A
    "SSC Napoli": 113,
    "AC Milan": 98,
    "Inter Milan": 108,
    "Atalanta BC": 102,
    "SS Lazio": 110,
    "Torino FC": 586,
    "Como 1907": 73454,
    "US Cremonese": 457,
    "ACF Fiorentina": 99,
    "Juventus FC": 109,
    "AS Roma": 100,
    "Parma Calcio": 112,
    "US Sassuolo": 471,
    "Bologna FC": 103,
    "Genoa CFC": 107,
    "Cagliari Calcio": 104,
    "Pisa Sporting Club": 5664,
    "US Lecce": 5890,
    "Udinese Calcio": 115,
    "Hellas Verona": 450,
    "FC Empoli": 445,
    "UC Sampdoria": 584,
    "Calcio Padova": 5004,
    "Cádiz CF": 264,
    "Real Valladolid": 250,
    "UD Almería": 267,

    // Bundesliga
    "Eintracht Frankfurt": 19,
    "Bayern München": 5,
    "Borussia Dortmund": 4,
    "RB Leipzig": 721,
    "Bayer 04 Leverkusen": 3,
    "Borussia Mönchengladbach": 18,
    "VfL Wolfsburg": 11,
    "FC Augsburg": 16,
    "VfB Stuttgart": 10,
    "SV Werder Bremen": 12,
    "FC Union Berlin": 28,
    "FSV Mainz 05": 15,
    "TSG 1899 Hoffenheim": 2,
    "SC Freiburg": 17,
    "Hamburger SV": 6,
    "FC St. Pauli": 20,
    "FC Köln": 1,
    "FC Heidenheim 1846": 44,

    // UCL / Others
    "Fenerbahçe SK": 607,
    "Sporting CP": 498,
    "Club Brugge KV": 569, // Common ID for Club Brugge
    "KAA Gent": 342,
    "KRC Genk": 343,
    "PAOK Thessaloniki": 394,
    "Panathinaikos FC": 350,
    "Zenit St. Petersburg": 669,
    "Trabzonspor": 601,
    "Istanbul Başakşehir FK": 4410,
    "AEK Athens": 609,
    "RB Salzburg": 2015,
    "SL Benfica": 1903,
    "Racing Club": 2068, // Best guess or placeholder
    "Sepahan SC": 7000,  // Placeholder
    "Wydad Casablanca": 7001, // Placeholder
    "Al Sadd SC": 7002, // Placeholder
    "CR Flamengo": 7003, // Placeholder
    "Dynamo Kyiv": 605,
    "Slavia Prague": 455,
    "Olympiakos Piraeus": 654,
    "FC Københaven": 1876,
    "FC Porto": 503,
    "PSV Eindhoven": 674,

    // Copa del Rey 26/27 additions
    "Sporting Gijón": 96,
    "CD Mirandés": 277,
    "Sociedad B": 7004, // Placeholder/Custom
    "Córdoba CF": 259,
    "SD Eibar": 278,
    "Granada CF": 83,
    "Albacete Balompié": 260,
    "Racing Santander": 262,

    // Coupe de France 26/27 additions
    "Montpellier HSC": 515,
    "ESTAC Troyes": 531,
    "SC Bastia": 538,
    "Clermont Foot": 540,
    "FC Sochaux-Montbéliard": 519,
    "Stade Malherbe Caen": 514,
    "Amiens SC": 530,
    "AS Nancy Lorraine": 537,
    "Valenciennes FC": 536,
    "Rodez AF": 7010, // Custom/Placeholder
    "US Boulogne": 7011,
    "Red Star FC": 7012,
    "Le Mans FC": 7013,
    "FC Annecy": 7014,
    "Pau FC": 7021,

    // Coppa Italia 26/27 additions
    "Virtus Entella": 7030,
    "Delfino Pescara": 7031,
    "Cesena FC": 7032,
    "US Avellino": 7033,
    "US Catanzaro": 7034,
    "Carrarese Calcio": 7035,
    "SS Juve Stabia": 7036,
    "Mantova 1911": 7037,
    "AC Reggiana 1919": 7038,
    "Spezia Calcio": 488,
    "Venezia FC": 454,
    "Palermo FC": 114,
    "Frosinone Calcio": 470,
    "AC Monza": 5911,
    "Bari": 7040,
    "Cosenza": 7041,
    "Modena": 7042,
    "Cittadella": 7043,
    "Südtirol": 7044,

    // Europa League 26/27 additions
    "Pafos FC": 7007,
    "Dinamo Moskva": 7005,
    "Beşiktaş JK": 603,
    "Galatasaray SK": 610,
    "Aris Thessaloniki": 7008,
    "Spartak Moskva": 7006,
    "Go Ahead Eagles": 7009,

    // FA Cup 26/27 additions
    "Swansea City": 72,
    "Millwall FC": 384,
    "Derby County": 342,
    "Oxford United": 1079,
    "Portsmouth FC": 325,
    "Wrexham AFC": 1083,
    "Sheffield Wednesday": 345,
    "Birmingham City": 332,
    "Stoke City": 70,
    "Coventry City": 1076,
    "Blackburn Rovers": 59,
    "Norwich City": 68
};

function addLogos(filename) {
    if (!fs.existsSync(filename)) {
        console.log(`File not found: ${filename}`);
        return;
    }

    const rawData = fs.readFileSync(filename, 'utf-8');
    let data;
    try {
        data = JSON.parse(rawData);
    } catch (e) {
        console.error(`Error parsing JSON in ${filename}:`, e);
        return;
    }

    // Data is a list of league objects
    const dataArray = Array.isArray(data) ? data : [data];

    dataArray.forEach(league => {
        // Update Standings
        if (league.standings) {
            league.standings.forEach(team => {
                const name = team.team;
                let logoUrl = "";

                if (TEAM_IDS[name]) {
                    logoUrl = `https://crests.football-data.org/${TEAM_IDS[name]}.svg`;
                } else {
                    console.log(`Missing ID for: ${name}`);
                    logoUrl = "https://via.placeholder.com/50/333333/FFFFFF?text=Logo";
                }
                team.logo = logoUrl;
            });
        }

        // Update Rounds (Cup matches)
        if (league.rounds) {
            league.rounds.forEach(round => {
                if (round.matches) {
                    round.matches.forEach(match => {
                        if (TEAM_IDS[match.home]) {
                            match.homeLogo = `https://crests.football-data.org/${TEAM_IDS[match.home]}.svg`;
                        } else {
                            console.log(`Missing Home Logo ID for: ${match.home}`);
                        }
                        if (TEAM_IDS[match.away]) {
                            match.awayLogo = `https://crests.football-data.org/${TEAM_IDS[match.away]}.svg`;
                        } else {
                            console.log(`Missing Away Logo ID for: ${match.away}`);
                        }
                    });
                }
            });
        }

        // Update Top Scorers
        if (league.top_scorers) {
            league.top_scorers.forEach(scorer => {
                const tname = scorer.team;
                if (TEAM_IDS[tname]) {
                    scorer.team_logo = `https://crests.football-data.org/${TEAM_IDS[tname]}.svg`;
                }
            });
        }

        // Update Top Assists
        if (league.top_assists) {
            league.top_assists.forEach(assist => {
                const tname = assist.team;
                if (TEAM_IDS[tname]) {
                    assist.team_logo = `https://crests.football-data.org/${TEAM_IDS[tname]}.svg`;
                }
            });
        }
    });

    fs.writeFileSync(filename, JSON.stringify(dataArray, null, 4), 'utf-8');
    console.log(`Updated ${filename}`);
}

addLogos("league_La_Liga.json");
addLogos("league_Premier_League.json");
addLogos("league_Ligue_1.json");
addLogos("league_Serie_A.json");
addLogos("league_Bundesliga.json");
addLogos("cup_DFB_Pokal.json");
addLogos("cup_Copa_del_Rey.json");
addLogos("cup_Coppa_Italia.json");
addLogos("cup_Coupe_de_France.json");
addLogos("cup_FA_Cup.json");
addLogos("cup_Champions_League.json");
addLogos("cup_FA_Community_Shield.json");
addLogos("cup_Trophee_des_Champions.json");
addLogos("cup_Supercoppa_Italiana.json");
addLogos("cup_Supercopa_de_Espana.json");
addLogos("cup_DFL_Supercup.json");
addLogos("cup_FIFA_Club_World_Cup.json");
addLogos("cup_Europa_League.json");
addLogos("cup_UEFA_Super_Cup.json");



