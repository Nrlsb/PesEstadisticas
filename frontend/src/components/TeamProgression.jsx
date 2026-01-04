import React, { useMemo } from 'react';
import { TrendingUp, TrendingDown, Minus, ArrowUp, ArrowDown } from 'lucide-react';

export default function TeamProgression({ allLeaguesData }) {

    // Calcular cambios de ranking
    const progressionData = useMemo(() => {
        let teams = [];

        allLeaguesData.forEach(leagueFile => {
            // Obtener datos de la temporada 25/26 (Base)
            // Preferimos 'Final' o 'Mid-season'
            const baseSeason = leagueFile.filter(d => d.season === '25/26');
            const baseSnapshot = baseSeason.find(d => d.round === 'Final') ||
                baseSeason.find(d => d.round === 'Mid-season') ||
                baseSeason[baseSeason.length - 1];

            // Obtener datos de la temporada 26/27 (Actual)
            const currentSeason = leagueFile.filter(d => d.season === '26/27');
            const currentSnapshot = currentSeason.find(d => d.round === 'Final') ||
                currentSeason.find(d => d.round === 'Mid-season') ||
                currentSeason[currentSeason.length - 1];

            if (baseSnapshot && currentSnapshot) {
                // Mapear ranking base
                const baseRanks = {};
                if (baseSnapshot.standings) {
                    baseSnapshot.standings.forEach(t => {
                        baseRanks[t.team] = t.rank;
                    });
                }

                // Comparar con actual
                if (currentSnapshot.standings) {
                    currentSnapshot.standings.forEach(t => {
                        if (baseRanks[t.team]) {
                            const prevRank = baseRanks[t.team];
                            const currRank = t.rank;
                            const change = prevRank - currRank; // Positivo = Mejora (ej: 10 -> 2 = +8)

                            teams.push({
                                team: t.team,
                                logo: t.logo,
                                league: currentSnapshot.league,
                                prevRank,
                                currRank,
                                change,
                                points: t.points // Para desempate o contexto
                            });
                        }
                    });
                }
            }
        });

        // Ordenar: Los que más subieron primero
        return teams.sort((a, b) => b.change - a.change);
    }, [allLeaguesData]);

    const topImprovers = progressionData.filter(t => t.change > 0).slice(0, 10);
    const topDroppers = [...progressionData].filter(t => t.change < 0).sort((a, b) => a.change - b.change).slice(0, 10); // Los más negativos primero

    const TeamCard = ({ data, type }) => (
        <div className="flex items-center justify-between p-3 bg-slate-800/40 border border-slate-700/50 rounded-lg hover:bg-slate-800 transition-colors">
            <div className="flex items-center gap-3">
                <span className="text-xl font-bold text-slate-500 w-6 text-center">{data.currRank}</span>
                <img src={data.logo} alt="" className="w-8 h-8 object-contain" />
                <div>
                    <p className="font-bold text-white text-sm">{data.team}</p>
                    <p className="text-[10px] text-slate-400">{data.league}</p>
                </div>
            </div>
            <div className={`flex items-center gap-1 font-bold ${type === 'up' ? 'text-emerald-500' : 'text-rose-500'}`}>
                {type === 'up' ? <ArrowUp size={16} /> : <ArrowDown size={16} />}
                <span>{Math.abs(data.change)}</span>
            </div>
        </div>
    );

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fade-in-up">
            {/* Column: Revelations */}
            <div className="space-y-4">
                <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-xl">
                    <h3 className="text-lg font-bold text-emerald-400 flex items-center gap-2">
                        <TrendingUp /> Revelaciones (25/26 vs 26/27)
                    </h3>
                    <p className="text-xs text-emerald-300/60">Equipos que más posiciones han escalado respecto al año anterior.</p>
                </div>
                <div className="space-y-2">
                    {topImprovers.map((team, i) => (
                        <TeamCard key={i} data={team} type="up" />
                    ))}
                </div>
            </div>

            {/* Column: Disappointments */}
            <div className="space-y-4">
                <div className="bg-rose-500/10 border border-rose-500/20 p-4 rounded-xl">
                    <h3 className="text-lg font-bold text-rose-400 flex items-center gap-2">
                        <TrendingDown /> Caídas Libres
                    </h3>
                    <p className="text-xs text-rose-300/60">Equipos que más posiciones han perdido en la clasificación.</p>
                </div>
                <div className="space-y-2">
                    {topDroppers.map((team, i) => (
                        <TeamCard key={i} data={team} type="down" />
                    ))}
                </div>
            </div>
        </div>
    );
}
