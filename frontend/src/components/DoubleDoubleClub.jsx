import React, { useState, useMemo } from 'react';
import { Crown, Star, Medal, Users } from 'lucide-react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from 'recharts';

const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        return (
            <div className="bg-slate-900 border border-slate-700 p-3 rounded-lg shadow-xl text-xs">
                <div className="flex items-center gap-2 mb-2">
                    {data.team_logo && <img src={data.team_logo} alt="" className="w-6 h-6 object-contain" />}
                    <span className="font-bold text-white text-sm">{data.player}</span>
                </div>
                <div className="space-y-1 text-slate-400">
                    <p>{data.team}</p>
                    <p>Goles Totales: <span className="text-emerald-400 font-bold">{data.goals}</span></p>
                    <p>Asistencias Totales: <span className="text-blue-400 font-bold">{data.assists}</span></p>
                    <p>Contribución Total: <span className="text-yellow-400 font-bold">{data.total_contribution}</span></p>
                </div>
            </div>
        );
    }
    return null;
};

export default function DoubleDoubleClub({ allLeaguesData, allCompetitionsData = [] }) {
    const [activeSeason, setActiveSeason] = useState('26/27');

    const aggregatedStats = useMemo(() => {
        const playerStats = {};

        // Helper para procesar estadísticas (goles o asistencias)
        const processStats = (list, type, competitionName) => {
            if (!list) return;

            list.forEach(entry => {
                const key = `${entry.player}-${entry.team}`;

                if (!playerStats[key]) {
                    playerStats[key] = {
                        player: entry.player,
                        team: entry.team,
                        team_logo: entry.team_logo,
                        goals: 0,
                        assists: 0,
                        competitions: new Set()
                    };
                }

                playerStats[key][type] += (entry[type] || 0); // entry.goals or entry.assists
                playerStats[key].competitions.add(competitionName);
            });
        };

        // 1. Procesar Ligas
        allLeaguesData.forEach(leagueFile => {
            const leagueData = leagueFile.filter(d => d.season === activeSeason);
            // Usar snapshots prioritarios (Final > Mid > Last)
            const targetSnapshot = leagueData.find(d => d.round === 'Final') ||
                leagueData.find(d => d.round === 'Mid-season') ||
                leagueData[leagueData.length - 1];

            if (targetSnapshot) {
                if (targetSnapshot.top_scorers) processStats(targetSnapshot.top_scorers, 'goals', targetSnapshot.league);
                if (targetSnapshot.top_assists) processStats(targetSnapshot.top_assists, 'assists', targetSnapshot.league);
            }
        });

        // 2. Procesar Copas
        const flatCompetitions = allCompetitionsData.flat();
        flatCompetitions.forEach(comp => {
            let seasonComp = null;

            if (Array.isArray(comp)) {
                seasonComp = comp.find(c => c.season === activeSeason);
            } else if (comp.season === activeSeason) {
                seasonComp = comp;
            }

            if (seasonComp && seasonComp.type === 'cup') {
                const compName = seasonComp.name || seasonComp.league || 'Copa';
                if (seasonComp.top_scorers) processStats(seasonComp.top_scorers, 'goals', compName);
                if (seasonComp.top_assists) processStats(seasonComp.top_assists, 'assists', compName);
            }
        });

        // Filtrar y enriquecer
        return Object.values(playerStats)
            .map(p => ({
                ...p,
                total_contribution: p.goals + p.assists,
                isDoubleDouble: p.goals >= 10 && p.assists >= 10
            }))
            .filter(p => p.total_contribution > 10) // Mínimo de relevancia
            .sort((a, b) => b.total_contribution - a.total_contribution);

    }, [allLeaguesData, allCompetitionsData, activeSeason]);

    const doubleDoubleMembers = aggregatedStats.filter(p => p.isDoubleDouble);

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <Crown className="text-amber-500" /> El Club del Doble-Doble
                    </h2>
                    <p className="text-slate-400 text-sm">
                        Jugadores de élite con dobles dígitos en Goles y Asistencias ({activeSeason}).
                    </p>
                </div>
                <div className="flex bg-slate-800 p-1 rounded-lg">
                    {['25/26', '26/27'].map(season => (
                        <button
                            key={season}
                            onClick={() => setActiveSeason(season)}
                            className={`px-3 py-1 text-xs font-bold rounded ${activeSeason === season ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-white'}`}
                        >
                            {season}
                        </button>
                    ))}
                </div>
            </div>

            {/* Top Members Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {doubleDoubleMembers.slice(0, 4).map((player, i) => (
                    <div key={i} className="bg-gradient-to-br from-amber-900/40 to-slate-900 border border-amber-500/30 p-4 rounded-xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Star size={48} />
                        </div>
                        <div className="flex items-center gap-3 mb-3">
                            <img src={player.team_logo} alt="" className="w-10 h-10 object-contain drop-shadow-lg" />
                            <div>
                                <p className="font-bold text-white leading-tight">{player.player}</p>
                                <p className="text-xs text-amber-500 font-semibold">{player.team}</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-center">
                            <div className="bg-slate-950/50 rounded py-1">
                                <p className="text-xl font-black text-white">{player.goals}</p>
                                <p className="text-[10px] text-slate-400 uppercase">Goles</p>
                            </div>
                            <div className="bg-slate-950/50 rounded py-1">
                                <p className="text-xl font-black text-white">{player.assists}</p>
                                <p className="text-[10px] text-slate-400 uppercase">Asist.</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Scatter Chart */}
            <div className="h-[450px] bg-slate-900/50 rounded-xl border border-slate-800 p-4 relative">
                <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart margin={{ top: 20, right: 30, bottom: 20, left: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                        <XAxis
                            type="number"
                            dataKey="assists"
                            name="Asistencias"
                            stroke="#94a3b8"
                            label={{ value: 'Asistencias', position: 'bottom', fill: '#94a3b8' }}
                        />
                        <YAxis
                            type="number"
                            dataKey="goals"
                            name="Goles"
                            stroke="#94a3b8"
                            label={{ value: 'Goles', angle: -90, position: 'left', fill: '#94a3b8' }}
                        />
                        <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3' }} />

                        {/* Zonas */}
                        <ReferenceLine x={10} stroke="#f59e0b" strokeDasharray="5 5" label={{ value: "10+ Asistencias", position: 'insideTopRight', fill: '#f59e0b', fontSize: 10 }} />
                        <ReferenceLine y={10} stroke="#f59e0b" strokeDasharray="5 5" label={{ value: "10+ Goles", position: 'insideTopRight', fill: '#f59e0b', fontSize: 10 }} />

                        <Scatter name="Jugadores" data={aggregatedStats} fill="#8884d8">
                            {aggregatedStats.map((entry, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={entry.isDoubleDouble ? '#f59e0b' : '#64748b'}
                                    fillOpacity={entry.isDoubleDouble ? 1 : 0.5}
                                />
                            ))}
                        </Scatter>
                    </ScatterChart>
                </ResponsiveContainer>

                {/* Stats Summary */}
                <div className="absolute bottom-4 right-4 bg-slate-950/80 p-3 rounded-lg border border-slate-700 backdrop-blur-sm text-xs">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="w-3 h-3 bg-amber-500 rounded-full"></span>
                        <span className="text-white font-bold">Club Doble-Doble ({doubleDoubleMembers.length})</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-3 h-3 bg-slate-500 rounded-full opacity-50"></span>
                        <span className="text-slate-400">Otros Jugadores</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
