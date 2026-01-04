import React, { useMemo } from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ReferenceLine, Label } from 'recharts';

const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        return (
            <div className="bg-slate-900 border border-slate-700 p-3 rounded-lg shadow-xl text-xs">
                <div className="flex items-center gap-2 mb-2">
                    {data.logo && <img src={data.logo} alt="" className="w-6 h-6 object-contain" />}
                    <span className="font-bold text-white text-sm">{data.team}</span>
                </div>
                <div className="space-y-1 text-slate-400">
                    <p>Liga: <span className="text-slate-300">{data.league}</span></p>
                    <p>Goles a Favor: <span className="text-emerald-400 font-bold">{data.goals_for}</span></p>
                    <p>Goles en Contra: <span className="text-rose-400 font-bold">{data.goals_against}</span></p>
                    <p>Diferencia: <span className="text-blue-400 font-bold">{data.goal_diff > 0 ? '+' : ''}{data.goal_diff}</span></p>
                    <p>Partidos: {data.matches_played}</p>
                </div>
            </div>
        );
    }
    return null;
};

export default function StyleMatrixChart({ allLeaguesData }) {
    const data = useMemo(() => {
        let teams = [];

        allLeaguesData.forEach(leagueFile => {
            // Usar última temporada disponible
            const seasons = [...new Set(leagueFile.map(d => d.season))];
            const targetSeason = seasons.includes('26/27') ? '26/27' : seasons[seasons.length - 1];

            // Preferencias de ronda: Final > Mid-season > Matchday
            const seasonData = leagueFile.find(d => d.season === targetSeason && d.round === 'Final') ||
                leagueFile.find(d => d.season === targetSeason && d.round === 'Mid-season') ||
                leagueFile.find(d => d.season === targetSeason);

            if (seasonData && seasonData.standings) {
                const leagueTeams = seasonData.standings.map(t => ({
                    ...t,
                    league: seasonData.league,
                    // Normalizar por partido para comparar ligas con diferentes jornadas jugadas?
                    // Para visualización simple, usamos totales, pero idealmente sería GF/Partido
                    gfp: parseFloat((t.goals_for / t.matches_played).toFixed(2)),
                    gap: parseFloat((t.goals_against / t.matches_played).toFixed(2))
                }));
                teams = [...teams, ...leagueTeams];
            }
        });

        return teams;
    }, [allLeaguesData]);

    // Calcular promedios para los cuadrantes
    const avgGF = useMemo(() => {
        if (!data.length) return 0;
        return data.reduce((acc, curr) => acc + curr.gfp, 0) / data.length;
    }, [data]);

    const avgGA = useMemo(() => {
        if (!data.length) return 0;
        return data.reduce((acc, curr) => acc + curr.gap, 0) / data.length;
    }, [data]);

    return (
        <div className="space-y-6 h-full flex flex-col">
            <div className="flex justify-between items-end">
                <div>
                    <h3 className="text-xl font-bold text-white mb-2">Matriz de Estilo de Juego</h3>
                    <p className="text-slate-400 text-sm max-w-2xl">
                        Comparativa de eficiencia ofensiva vs defensiva por partido.
                        Cada punto representa un equipo. Los cuadrantes indican el perfil táctico.
                    </p>
                </div>
            </div>

            <div className="h-[500px] w-full bg-slate-900/50 rounded-xl border border-slate-800 p-4 relative">
                {/* Leyenda de cuadrantes superpuesta sutilmente */}
                <div className="absolute top-4 right-4 text-xs font-bold text-emerald-500/50 text-right pointer-events-none">
                    ATAQUE ALTO <br /> DEFENSA SOLIDA
                </div>
                <div className="absolute top-4 left-4 text-xs font-bold text-yellow-500/50 text-left pointer-events-none">
                    ATAQUE BAJO <br /> DEFENSA SOLIDA
                </div>
                <div className="absolute bottom-4 right-4 text-xs font-bold text-blue-500/50 text-right pointer-events-none">
                    ATAQUE ALTO <br /> DEFENSA FRÁGIL
                </div>
                <div className="absolute bottom-4 left-4 text-xs font-bold text-rose-500/50 text-left pointer-events-none">
                    ATAQUE BAJO <br /> DEFENSA FRÁGIL
                </div>

                <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                        <XAxis
                            type="number"
                            dataKey="gfp"
                            name="Goles a Favor / Partido"
                            stroke="#94a3b8"
                            label={{ value: 'Poder Ofensivo (Goles/Partido)', position: 'bottom', fill: '#94a3b8', offset: 0 }}
                            domain={['auto', 'auto']}
                        />
                        <YAxis
                            type="number"
                            dataKey="gap"
                            name="Goles en Contra / Partido"
                            stroke="#94a3b8"
                            label={{ value: 'Solidez Defensiva (Goles Recibidos/Partido)', angle: -90, position: 'left', fill: '#94a3b8' }}
                            reversed={true} // Invertir eje Y para que "menos goles recibidos" (mejor defensa) esté ARRIBA
                            domain={['auto', 'auto']}
                        />
                        <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3' }} />

                        {/* Líneas de promedio para dividir cuadrantes */}
                        <ReferenceLine x={avgGF} stroke="#475569" strokeDasharray="5 5" />
                        <ReferenceLine y={avgGA} stroke="#475569" strokeDasharray="5 5" />

                        <Scatter name="Equipos" data={data} fill="#8884d8">
                            {data.map((entry, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={
                                        // Colorear según región
                                        (entry.gfp > avgGF && entry.gap < avgGA) ? '#10b981' : // Elite (Verde)
                                            (entry.gfp > avgGF && entry.gap > avgGA) ? '#3b82f6' : // Espectáculo (Azul)
                                                (entry.gfp < avgGF && entry.gap < avgGA) ? '#eab308' : // Rocoso (Amarillo)
                                                    '#f43f5e' // Sufriendo (Rojo)
                                    }
                                />
                            ))}
                        </Scatter>
                    </ScatterChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
