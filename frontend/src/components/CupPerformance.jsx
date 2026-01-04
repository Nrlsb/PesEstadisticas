import React, { useMemo } from 'react';
import { Crown } from 'lucide-react';

export default function CupPerformance({ allCompetitionsData }) {
    // Filtrar solo los archivos que son copas
    const cupData = useMemo(() => {
        // Identificar copas buscando la propiedad 'type': 'cup' o adivinando por el nombre
        // allCompetitionsData es un arreglo de (objetos o arrays de objetos).
        // Normalizamos para manejar tanto archivos individuales (objetos) como arrays (historial)
        const flatList = allCompetitionsData.flat();
        return flatList.filter(d => d.type === 'cup' && d.rounds);
    }, [allCompetitionsData]);

    const ranking = useMemo(() => {
        const teamPoints = {};

        // Sistema de puntuación arbitrario para "Performance Copero"
        const POINTS_SYSTEM = {
            'Final': 10,
            'Semi-Finals': 5,
            'Quarter-Finals': 3,
            'Round of 16': 2,
            'Round of 32': 1
        };

        cupData.forEach(cup => {
            if (cup.rounds) {
                cup.rounds.forEach(round => {
                    const points = POINTS_SYSTEM[round.name] || 0;
                    if (points > 0 && round.matches) {
                        round.matches.forEach(match => {
                            // Sumar puntos a ambos equipos por llegar a esta ronda
                            // (Ojo: esto suma puntos por *jugar* la ronda, lo cual es correcto para "llegar a")

                            // Normalizar nombres
                            const home = match.home;
                            const away = match.away;

                            if (!teamPoints[home]) teamPoints[home] = { name: home, points: 0, logos: [match.homeLogo], titles: 0, finals: 0 };
                            if (!teamPoints[away]) teamPoints[away] = { name: away, points: 0, logos: [match.awayLogo], titles: 0, finals: 0 };

                            // Añadimos puntos por participación en la ronda
                            // Para no duplicar (ej: si hay ida y vuelta), idealmente chequearíamos unicidad, 
                            // pero en estos JSONs parece ser partido único o resumen de ronda.

                            // NOTA: Para no sumar puntos duplicados si la ronda tiene múltiples partidos para el mismo equipo
                            // (aunque en estructuras de copa simple suele ser 1 match por equipo por ronda).
                            // Asumiremos 1 match por ronda por ahora.

                            teamPoints[home].points += points;
                            teamPoints[away].points += points;

                            // Detectar campeón (Solo en Final)
                            if (round.name === 'Final') {
                                teamPoints[home].finals += 1;
                                teamPoints[away].finals += 1;

                                const winner = match.homeScore > match.awayScore ? match.home :
                                    match.awayScore > match.homeScore ? match.away :
                                        (match.note && match.note.includes(match.home)) ? match.home :
                                            (match.note && match.note.includes(match.away)) ? match.away : null;

                                if (winner && teamPoints[winner]) {
                                    teamPoints[winner].titles += 1;
                                    teamPoints[winner].points += 15; // Bonus Campeón
                                }
                            }
                        });
                    }
                });
            }
        });

        return Object.values(teamPoints).sort((a, b) => b.points - a.points);
    }, [cupData]);

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4 bg-purple-900/20 p-4 rounded-xl border border-purple-500/30">
                <div className="p-3 bg-purple-600 rounded-full text-white shadow-lg shadow-purple-500/30">
                    <Crown size={24} />
                </div>
                <div>
                    <h3 className="text-xl font-bold text-white">Ranking Rey de Copas</h3>
                    <p className="text-slate-400 text-sm">
                        Clasificación basada en el desempeño en torneos de eliminación directa.
                        (Campeón +15pts, Final +10pts, Semis +5pts...)
                    </p>
                </div>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-800">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-slate-900 text-slate-400 text-xs uppercase font-bold tracking-wider">
                            <th className="p-4 text-center">#</th>
                            <th className="p-4">Equipo</th>
                            <th className="p-4 text-center">Títulos</th>
                            <th className="p-4 text-center">Finales</th>
                            <th className="p-4 text-right">Puntos Totales</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 bg-slate-900/40">
                        {ranking.slice(0, 20).map((team, index) => (
                            <tr key={index} className="hover:bg-slate-800/50 transition-colors">
                                <td className="p-4 text-center font-mono text-slate-500">
                                    {index === 0 ? '👑' : index + 1}
                                </td>
                                <td className="p-4">
                                    <div className="flex items-center gap-3">
                                        {team.logos[0] && <img src={team.logos[0]} className="w-8 h-8 object-contain" alt="" />}
                                        <span className={index === 0 ? 'text-yellow-400 font-bold' : 'text-slate-200 font-semibold'}>
                                            {team.name}
                                        </span>
                                    </div>
                                </td>
                                <td className="p-4 text-center">
                                    {team.titles > 0 ? (
                                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-500/10 text-yellow-500 rounded font-bold text-xs border border-yellow-500/20">
                                            <Crown size={12} /> {team.titles}
                                        </span>
                                    ) : '-'}
                                </td>
                                <td className="p-4 text-center text-slate-400">
                                    {team.finals}
                                </td>
                                <td className="p-4 text-right font-bold text-purple-400 text-lg">
                                    {team.points}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
