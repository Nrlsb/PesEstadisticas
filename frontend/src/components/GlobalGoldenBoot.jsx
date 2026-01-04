import React, { useState, useMemo } from 'react';
import { Trophy, Medal, Search, Filter } from 'lucide-react';


export default function GlobalGoldenBoot({ allLeaguesData, allCompetitionsData = [] }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [activeSeason, setActiveSeason] = useState('26/27'); // Default to latest

    // Unificar todos los datos de competiciones
    const aggregatedStats = useMemo(() => {
        const playerStats = {};
        const processedCompetitions = new Set();

        // Helper para procesar una lista de goleadores
        const processScorers = (scorers, competitionName, season, compType) => {
            if (!scorers) return;

            scorers.forEach(entry => {
                // Normalizar nombre jugadore + equipo para clave única (aproximación)
                // Idealmente tendríamos ID, pero usaremos Nombre + Equipo
                // Ojo: Si un jugador cambia de equipo, esto lo contaría separado (lo cual es correcto en muchos contextos)
                // O podemos usar solo Nombre si confiamos en que es único. Lucas Benitez es único.
                const key = `${entry.player}-${entry.team}`;

                if (!playerStats[key]) {
                    playerStats[key] = {
                        player: entry.player,
                        team: entry.team,
                        team_logo: entry.team_logo,
                        goals: 0,
                        matches: 0, // No siempre disponible en scorers list
                        competitions: new Set(),
                        breakdown: {}
                    };
                }

                playerStats[key].goals += (entry.goals || 0);
                playerStats[key].competitions.add(competitionName);

                if (!playerStats[key].breakdown[competitionName]) {
                    playerStats[key].breakdown[competitionName] = 0;
                }
                playerStats[key].breakdown[competitionName] += (entry.goals || 0);
            });
        };

        // 1. Procesar Ligas (allLeaguesData es array de arrays de snapshots)
        allLeaguesData.forEach(leagueFile => {
            // Buscar snapshots de la temporada activa
            // Priorizar 'Final', si no 'Mid-season', si no el último Matchday disponible para esa temporada
            const seasonSnapshots = leagueFile.filter(d => d.season === activeSeason);

            let targetSnapshot = seasonSnapshots.find(d => d.round === 'Final') ||
                seasonSnapshots.find(d => d.round === 'Mid-season') ||
                seasonSnapshots[seasonSnapshots.length - 1]; // Último disponible

            if (targetSnapshot && targetSnapshot.top_scorers) {
                processScorers(targetSnapshot.top_scorers, targetSnapshot.league, activeSeason, 'League');
                processedCompetitions.add(targetSnapshot.league);
            }
        });

        // 2. Procesar Copas (allCompetitionsData contiene TODO, incluyendo ligas, filtramos por copas)
        // allCompetitionsData es flat list de archivos raw (algunos son arrays, algunos objetos)
        const flatCompetitions = allCompetitionsData.flat();

        flatCompetitions.forEach(comp => {
            // Si es tipo copa y tiene top_scorers
            // A veces las copas no tienen 'season' explícito en el root si son objetos únicos, 
            // pero aquí parece que los archivos de copa son objetos con "name", "season" o arrays de historial.
            // Asumiremos estructura común o buscaremos.

            // Caso: Estructura de Copa (Array de ediciones o Objeto único)
            // Si es array (como las ligas o copas con historial):
            if (Array.isArray(comp)) {
                // Es un historial, buscamos la temporada
                const seasonComp = comp.find(c => c.season === activeSeason);
                if (seasonComp && seasonComp.top_scorers && seasonComp.type === 'cup') {
                    processScorers(seasonComp.top_scorers, seasonComp.name, activeSeason, 'Cup');
                    processedCompetitions.add(seasonComp.name);
                }
            }
            // Caso: Objeto único (si existe alguno así en tu data)
            else if (comp.season === activeSeason && comp.top_scorers && comp.type === 'cup') {
                processScorers(comp.top_scorers, comp.name, activeSeason, 'Cup');
                processedCompetitions.add(comp.name);
            }
        });

        return Object.values(playerStats).sort((a, b) => b.goals - a.goals);
    }, [allLeaguesData, allCompetitionsData, activeSeason]);

    const filteredPlayers = useMemo(() => {
        return aggregatedStats.filter(p =>
            p.player.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.team.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [aggregatedStats, searchTerm]);


    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header Controls & Stats */}
            <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-end">
                <div className="space-y-2">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <Trophy className="text-yellow-500" /> Ranking Global de Goleadores
                    </h2>
                    <p className="text-slate-400 text-sm">
                        Suma de goles en todas las competiciones (Ligas + Copas) para la temporada {activeSeason}.
                    </p>
                </div>

                <div className="flex bg-slate-800 p-1 rounded-lg">
                    <button
                        onClick={() => setActiveSeason('25/26')}
                        className={`px-3 py-1 text-xs font-bold rounded ${activeSeason === '25/26' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
                    >
                        25/26
                    </button>
                    <button
                        onClick={() => setActiveSeason('26/27')}
                        className={`px-3 py-1 text-xs font-bold rounded ${activeSeason === '26/27' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
                    >
                        26/27
                    </button>
                </div>
            </div>

            {/* Top Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-4 rounded-xl border border-slate-700/50 flex items-center gap-4 relative overflow-hidden">
                    <div className="absolute right-0 top-0 p-4 opacity-5">
                        <Trophy size={64} />
                    </div>
                    <div className="w-16 h-16 rounded-full bg-yellow-500/10 flex items-center justify-center text-yellow-500 border border-yellow-500/20">
                        <Trophy size={32} />
                    </div>
                    <div>
                        <p className="text-sm text-yellow-500 font-bold uppercase tracking-wider">Bota de Oro</p>
                        <p className="text-2xl font-black text-white">{aggregatedStats[0]?.player || '-'}</p>
                        <p className="text-sm text-slate-400">{aggregatedStats[0]?.goals || 0} Goles Totales</p>
                    </div>
                </div>

                <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50 flex items-center gap-4">
                    {/* ... Stats genéricos ... */}
                    <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-500">
                        <Medal size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-slate-400">Jugadores en el Ranking</p>
                        <p className="text-xl font-bold text-white">{aggregatedStats.length}</p>
                    </div>
                </div>
            </div>

            {/* Search Input */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                    type="text"
                    placeholder="Buscar en el ranking global..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-slate-900/50 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                />
            </div>

            {/* Detailed Table */}
            <div className="bg-slate-900/50 rounded-xl border border-slate-800 overflow-hidden backdrop-blur-sm">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-950/50 text-slate-400 text-xs uppercase tracking-wider border-b border-slate-800">
                            <th className="p-4 w-16 text-center">#</th>
                            <th className="p-4">Jugador</th>
                            <th className="p-4">Desglose (Goles por Torneo)</th>
                            <th className="p-4 text-right">Total</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/50">
                        {filteredPlayers.slice(0, 50).map((player, index) => (
                            <tr key={`${player.player}-${player.team}`} className="group hover:bg-slate-800/30 transition-colors">
                                <td className="p-4 text-center">
                                    <span className={`
                      inline-flex items-center justify-center w-8 h-8 rounded-lg font-bold
                      ${index === 0 ? 'bg-yellow-500 text-slate-900' :
                                            index === 1 ? 'bg-slate-300 text-slate-900' :
                                                index === 2 ? 'bg-amber-700 text-slate-100' : 'text-slate-500 bg-slate-800'}
                    `}>
                                        {index + 1}
                                    </span>
                                </td>
                                <td className="p-4">
                                    <div className="flex items-center gap-3">
                                        <img src={player.team_logo} alt="" className="w-10 h-10 object-contain drop-shadow-md" loading="lazy" />
                                        <div>
                                            <p className="font-bold text-white text-lg">{player.player}</p>
                                            <p className="text-slate-400 text-xs">{player.team}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="p-4">
                                    <div className="flex flex-wrap gap-2">
                                        {Object.entries(player.breakdown).map(([comp, goals]) => (
                                            <span key={comp} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-800 border border-slate-700 text-xs text-slate-300">
                                                <span className="font-semibold text-white">{goals}</span>
                                                <span className="opacity-70 truncate max-w-[100px]">{comp}</span>
                                            </span>
                                        ))}
                                    </div>
                                </td>
                                <td className="p-4 text-right">
                                    <span className="text-2xl font-black text-emerald-400 tracking-tight">
                                        {player.goals}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
