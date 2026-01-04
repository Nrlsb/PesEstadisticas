import React, { useMemo } from 'react';
import { Trophy, TrendingDown, Star } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, ReferenceLine } from 'recharts';

export default function CupSpecialists({ allLeaguesData, allCompetitionsData = [] }) {

    // Calcular "Índice de Copa" vs "Índice de Liga"
    // Índice Liga: 0-100 (100 = 1er puesto, 0 = último)
    // Índice Copa: Suma de puntos por ronda alcanzada en todas las copas
    const specialistsData = useMemo(() => {
        const teamStats = {};

        // 1. Calcular Score de Liga (Temporada 26/27)
        allLeaguesData.forEach(leagueFile => {
            const currentSeason = leagueFile.find(d => d.season === '26/27' && (d.round === 'Final' || d.round === 'Mid-season')) ||
                leagueFile[leagueFile.length - 1]; // Fallback

            if (currentSeason && currentSeason.standings) {
                const totalTeams = currentSeason.standings.length;
                currentSeason.standings.forEach(t => {
                    // Normalizar rank invertido: 1ro = 1.0, Último = 0.0
                    const leagueScore = ((totalTeams - t.rank + 1) / totalTeams) * 100;

                    teamStats[t.team] = {
                        team: t.team,
                        leagueScore: leagueScore,
                        leagueRank: t.rank,
                        league: currentSeason.league,
                        cupScore: 0,
                        achievements: []
                    };
                });
            }
        });

        // 2. Calcular Score de Copas
        // Puntos arbitrarios: Final Winner=50, Finalist=30, SF=15, QF=8, R16=4
        const ROUND_POINTS = {
            'Final': 50,
            'Semi-Finals': 15,
            'Quarter-Finals': 8,
            'Round of 16': 4
        };

        const hasTeamReachedRound = (roundName, matches, teamName) => {
            return matches.some(m => m.home === teamName || m.away === teamName);
        };

        // Helper para ver si ganó la final
        const wonFinal = (matches, teamName) => {
            return matches.some(m => {
                if (m.home === teamName) return m.homeScore > m.awayScore; // Simplificado, ignorando penales parseados o logica compleja de 'note'
                if (m.away === teamName) return m.awayScore > m.homeScore;
                return false;
            });
        };

        const flatCompetitions = allCompetitionsData.flat();
        flatCompetitions.forEach(comp => {
            // Normalizar a objeto de temporada unica si es array
            let seasonComp = Array.isArray(comp) ? comp.find(c => c.season === '26/27') : (comp.season === '26/27' ? comp : null);

            if (seasonComp && seasonComp.type === 'cup' && seasonComp.rounds) {
                seasonComp.rounds.forEach(round => {
                    const points = ROUND_POINTS[round.name] || 0;
                    if (points > 0) {
                        const teamsInRound = new Set();
                        round.matches.forEach(m => {
                            teamsInRound.add(m.home);
                            teamsInRound.add(m.away);
                        });

                        teamsInRound.forEach(team => {
                            if (teamStats[team]) {
                                // Sumamos puntos por participar en esta ronda
                                // OJO: Si sumamos por cada ronda, el campeón suma R16+QF+SF+Final. Correcto.
                                teamStats[team].cupScore += points;

                                // Detectar ganador
                                if (round.name === 'Final' && wonFinal(round.matches, team)) {
                                    teamStats[team].cupScore += 20; // Bonus campeón
                                    teamStats[team].achievements.push(`🏆 Ganador ${seasonComp.name || 'Copa'}`);
                                } else if (round.name === 'Final') {
                                    teamStats[team].achievements.push(`🥈 Finalista ${seasonComp.name || 'Copa'}`);
                                }
                            }
                        });
                    }
                });
            }
        });

        // 3. Calcular Discrepancia
        return Object.values(teamStats)
            .filter(t => t.cupScore > 0) // Solo equipos que jugaron algo en copa
            .map(t => ({
                ...t,
                // "Specialist Score": Alta Copa - Baja Liga
                specialistIndex: t.cupScore - (t.leagueScore * 0.5) // Ponderamos liga para que no dominen los super equipos que ganan todo
            }))
            .sort((a, b) => b.specialistIndex - a.specialistIndex)
            .slice(0, 10); // Top 10 especialistas

    }, [allLeaguesData, allCompetitionsData]);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full animate-fade-in">
            <div className="lg:col-span-1 space-y-4">
                <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-xl">
                    <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                        <Trophy className="text-purple-500" /> Especialistas en Copas
                    </h3>
                    <p className="text-sm text-slate-400">
                        Equipos que rinden muy por encima de su nivel liguero cuando juegan torneos de eliminación directa.
                    </p>
                </div>

                <div className="space-y-3">
                    {specialistsData.slice(0, 5).map((team, i) => (
                        <div key={i} className="bg-slate-800/30 p-3 rounded-lg border-l-4 border-purple-500">
                            <div className="flex justify-between items-start">
                                <h4 className="font-bold text-white">{team.team}</h4>
                                <span className="text-xs bg-slate-900 text-slate-400 px-2 py-1 rounded">Rank Liga: #{team.leagueRank}</span>
                            </div>
                            {team.achievements.length > 0 ? (
                                <div className="mt-2 text-xs text-yellow-500 font-semibold space-y-1">
                                    {team.achievements.map((ach, j) => <div key={j}>{ach}</div>)}
                                </div>
                            ) : (
                                <div className="mt-2 text-xs text-slate-500">Alto rendimiento en fases finales</div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            <div className="lg:col-span-2 bg-slate-900/50 border border-slate-800 p-4 rounded-xl h-[500px]">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        layout="vertical"
                        data={specialistsData}
                        margin={{ top: 20, right: 30, left: 40, bottom: 5 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
                        <XAxis type="number" stroke="#94a3b8" hide />
                        <YAxis dataKey="team" type="category" width={100} stroke="#94a3b8" tick={{ fontSize: 12 }} />
                        <Tooltip
                            contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }}
                            cursor={{ fill: '#ffffff10' }}
                        />
                        <Legend />
                        <Bar dataKey="cupScore" name="Puntaje en Copas" fill="#8b5cf6" radius={[0, 4, 4, 0]} barSize={20} />
                        <Bar dataKey="leagueScore" name="Potencia en Liga (Norm.)" fill="#334155" radius={[0, 4, 4, 0]} barSize={10} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
