import React, { useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Search } from 'lucide-react';

export default function TeamEvolutionChart({ allLeaguesData }) {
    const [selectedTeam, setSelectedTeam] = useState('Paris Saint-Germain'); // Default team
    const [searchTerm, setSearchTerm] = useState('');

    // Extraer lista única de equipos para el buscador
    const allTeams = useMemo(() => {
        const teamsSet = new Set();
        allLeaguesData.forEach(league => {
            league.forEach(season => {
                if (season.standings) {
                    season.standings.forEach(t => teamsSet.add(t.team));
                }
            });
        });
        return Array.from(teamsSet).sort();
    }, [allLeaguesData]);

    // Preparar datos para el gráfico del equipo seleccionado
    const chartData = useMemo(() => {
        if (!selectedTeam) return [];

        let DataPoints = [];

        // Buscar el equipo en todas las ligas y temporadas
        allLeaguesData.forEach(league => {
            // Ordenar temporadas cronológicamente
            const sortedLeague = [...league].sort((a, b) => a.season.localeCompare(b.season));

            sortedLeague.forEach(seasonData => {
                if (seasonData.standings) {
                    const teamStats = seasonData.standings.find(t => t.team === selectedTeam);
                    if (teamStats) {
                        DataPoints.push({
                            season: seasonData.season,
                            league: seasonData.league,
                            points: teamStats.points,
                            rank: teamStats.rank,
                            goals: teamStats.goals_for,
                            matches: teamStats.matches_played,
                            avg_points: (teamStats.points / teamStats.matches_played).toFixed(2)
                        });
                    }
                }
            });
        });

        // Ordenar cronológicamente (25/26 antes de 26/27)
        return DataPoints.sort((a, b) => a.season.localeCompare(b.season));
    }, [selectedTeam, allLeaguesData]);

    const filteredTeams = allTeams.filter(t => t.toLowerCase().includes(searchTerm.toLowerCase()));

    return (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-full">
            {/* Sidebar Selector */}
            <div className="lg:col-span-1 bg-slate-900/50 rounded-xl border border-slate-800 p-4 h-[500px] flex flex-col">
                <h3 className="font-bold text-white mb-2">Seleccionar Equipo</h3>
                <div className="relative mb-4">
                    <Search className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
                    <input
                        type="text"
                        placeholder="Buscar..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full bg-slate-800 border-none rounded-md py-1.5 pl-8 pr-2 text-xs text-white"
                    />
                </div>
                <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar space-y-1">
                    {filteredTeams.map(team => (
                        <button
                            key={team}
                            onClick={() => setSelectedTeam(team)}
                            className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors truncate ${selectedTeam === team
                                    ? 'bg-blue-600 text-white font-bold'
                                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                                }`}
                        >
                            {team}
                        </button>
                    ))}
                </div>
            </div>

            {/* Main Chart Area */}
            <div className="lg:col-span-3 space-y-6">
                <div className="bg-slate-900/50 p-6 rounded-xl border border-slate-800">
                    <h3 className="text-xl font-bold text-white mb-1 flex items-center gap-2">
                        {selectedTeam}
                        <span className="text-sm font-normal text-slate-500 bg-slate-800 px-2 py-0.5 rounded ml-2">Análisis Histórico</span>
                    </h3>

                    {chartData.length > 0 ? (
                        <div className="h-[300px] w-full mt-4">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorPoints" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <XAxis dataKey="season" stroke="#94a3b8" />
                                    <YAxis stroke="#94a3b8" />
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }}
                                        itemStyle={{ color: '#fff' }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="points"
                                        name="Puntos Totales"
                                        stroke="#3b82f6"
                                        fillOpacity={1}
                                        fill="url(#colorPoints)"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <div className="h-[300px] flex items-center justify-center text-slate-500">
                            Selecciona un equipo para ver su evolución
                        </div>
                    )}
                </div>

                {/* Stats Grid */}
                {chartData.length > 0 && (
                    <div className="grid grid-cols-3 gap-4">
                        {chartData.map((data, i) => (
                            <div key={i} className="bg-slate-800/40 p-4 rounded-xl border border-slate-700/50">
                                <p className="text-xs font-bold text-slate-500 uppercase">{data.season}</p>
                                <div className="flex justify-between items-end mt-2">
                                    <div>
                                        <p className="text-2xl font-bold text-white">{data.points}</p>
                                        <p className="text-xs text-slate-400">Puntos</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-lg font-bold text-emerald-400">#{data.rank}</p>
                                        <p className="text-xs text-slate-400">Posición</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
