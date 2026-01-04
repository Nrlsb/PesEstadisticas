import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Shield, Minus, X } from 'lucide-react';

const LeagueTable = ({ data, leagueName }) => {
    if (!data || !data.length) {
        return (
            <div className="p-8 text-center text-gray-400">
                No hay datos disponibles para esta liga.
            </div>
        );
    }

    // Assuming data is an array of objects: { position, name, matches_played, wins, draws, losses, goals_for, goals_against, goal_difference, points }
    // Detailed structure might vary, adapting to common keys.

    return (
        <div className="w-full overflow-hidden bg-gray-900 rounded-xl shadow-2xl border border-gray-800">
            <div className="px-6 py-4 bg-gray-800/50 border-b border-gray-700 flex items-center justify-between">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-yellow-500" />
                    {leagueName || 'Tabla de Liga'}
                </h2>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="text-gray-400 text-xs uppercase tracking-wider border-b border-gray-800 bg-gray-900/50">
                            <th className="px-6 py-4 font-semibold text-center w-16">Pos</th>
                            <th className="px-6 py-4 font-semibold">Equipo</th>
                            <th className="px-4 py-4 font-semibold text-center">PJ</th>
                            <th className="px-4 py-4 font-semibold text-center text-green-400">G</th>
                            <th className="px-4 py-4 font-semibold text-center text-gray-400">E</th>
                            <th className="px-4 py-4 font-semibold text-center text-red-400">P</th>
                            <th className="px-4 py-4 font-semibold text-center hidden md:table-cell">GF</th>
                            <th className="px-4 py-4 font-semibold text-center hidden md:table-cell">GC</th>
                            <th className="px-4 py-4 font-semibold text-center">DG</th>
                            <th className="px-6 py-4 font-bold text-center text-white text-lg">Pts</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                        {data.map((team, index) => {
                            // Handle different potential key names or fallback to parsing
                            const pos = team.position || team.rank || index + 1;
                            const name = team.name || team.team_name || team.team || "Unknown";
                            const mp = team.matches_played || team.pj || 0;
                            const w = team.wins || team.pg || 0;
                            const d = team.draws || team.pe || 0;
                            const l = team.losses || team.pp || 0;
                            const gf = team.goals_for || team.gf || 0;
                            const ga = team.goals_against || team.gc || 0;
                            const gd = team.goal_difference || team.goal_diff || team.dg || 0;
                            const pts = team.points || team.pts || 0;

                            return (
                                <motion.tr
                                    key={team.name || index}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="hover:bg-gray-800/30 transition-colors duration-200 group"
                                >
                                    <td className="px-6 py-4 text-center">
                                        <span className={`
                        inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold
                        ${pos <= 4 ? 'bg-blue-500/20 text-blue-400 ring-1 ring-blue-500/50' : ''}
                        ${pos > 4 && pos <= 6 ? 'bg-orange-500/20 text-orange-400 ring-1 ring-orange-500/50' : ''}
                        ${pos > 17 ? 'bg-red-500/20 text-red-400 ring-1 ring-red-500/50' : ''}
                        ${pos > 6 && pos <= 17 ? 'text-gray-400' : ''}
                      `}>
                                            {pos}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            {team.logo ? (
                                                <img src={team.logo} alt={name} className="w-8 h-8 object-contain" />
                                            ) : (
                                                <div className="w-8 h-8 rounded bg-gray-700 flex items-center justify-center text-xs font-bold text-gray-500 group-hover:bg-gray-600 transition-colors">
                                                    {name.substring(0, 2).toUpperCase()}
                                                </div>
                                            )}
                                            <span className="font-semibold text-gray-200 group-hover:text-white transition-colors">{name}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-4 text-center text-gray-300 font-medium">{mp}</td>
                                    <td className="px-4 py-4 text-center text-green-400/80 font-medium">{w}</td>
                                    <td className="px-4 py-4 text-center text-gray-500 font-medium">{d}</td>
                                    <td className="px-4 py-4 text-center text-red-400/80 font-medium">{l}</td>
                                    <td className="px-4 py-4 text-center text-gray-400 hidden md:table-cell">{gf}</td>
                                    <td className="px-4 py-4 text-center text-gray-400 hidden md:table-cell">{ga}</td>
                                    <td className="px-4 py-4 text-center font-medium
                      ${gd > 0 ? 'text-green-500' : gd < 0 ? 'text-red-500' : 'text-gray-500'}
                    ">
                                        {gd > 0 ? `+${gd}` : gd}
                                    </td>
                                    <td className="px-6 py-4 text-center font-bold text-white text-lg bg-gray-800/20 rounded-lg mx-2">
                                        {pts}
                                    </td>
                                </motion.tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            <div className="bg-gray-800/50 px-6 py-3 border-t border-gray-700 flex flex-wrap gap-4 text-xs text-gray-400">
                <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-blue-500/20 ring-1 ring-blue-500/50"></span> Champions League
                </div>
                <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-orange-500/20 ring-1 ring-orange-500/50"></span> Europa League
                </div>
                <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-red-500/20 ring-1 ring-red-500/50"></span> Descenso
                </div>
            </div>
        </div>
    );
};

export default LeagueTable;
