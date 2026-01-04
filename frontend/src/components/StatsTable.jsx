import React from 'react';
import { motion } from 'framer-motion';
import { Medal } from 'lucide-react';

const StatsTable = ({ data, title, type, onPlayerClick }) => {
    if (!data || !data.length) {
        return null;
    }

    return (
        <div className="w-full overflow-hidden bg-gray-900 rounded-xl shadow-2xl border border-gray-800">
            <div className="px-6 py-4 bg-gray-800/50 border-b border-gray-700 flex items-center justify-between">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <Medal className="w-5 h-5 text-yellow-500" />
                    {title}
                </h2>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="text-gray-400 text-xs uppercase tracking-wider border-b border-gray-800 bg-gray-900/50">
                            <th className="px-6 py-4 font-semibold text-center w-16">Pos</th>
                            <th className="px-6 py-4 font-semibold">Jugador</th>
                            <th className="px-6 py-4 font-semibold">Equipo</th>
                            <th className="px-6 py-4 font-semibold text-center">{type === 'goals' ? 'Goles' : 'Asistencias'}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                        {data.map((item, index) => (
                            <motion.tr
                                key={index}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.05 }}
                                onClick={() => onPlayerClick && onPlayerClick(item)}
                                className="hover:bg-gray-800/30 transition-colors duration-200 cursor-pointer"
                            >
                                <td className="px-6 py-4 text-center">
                                    <span className={`
                                        inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold
                                        ${item.rank === 1 ? 'bg-yellow-500/20 text-yellow-400' :
                                            item.rank === 2 ? 'bg-gray-400/20 text-gray-300' :
                                                item.rank === 3 ? 'bg-orange-500/20 text-orange-400' : 'text-gray-500'}
                                    `}>
                                        {item.rank}
                                    </span>
                                </td>
                                <td className="px-6 py-4 font-medium text-gray-200">{item.player}</td>
                                <td className="px-6 py-4 text-gray-400 flex items-center gap-2">
                                    {item.team_logo && <img src={item.team_logo} alt={item.team} className="w-6 h-6 object-contain" />}
                                    {item.team}
                                </td>
                                <td className="px-6 py-4 text-center font-bold text-white text-lg">
                                    {type === 'goals' ? item.goals : item.assists}
                                </td>
                            </motion.tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default StatsTable;
