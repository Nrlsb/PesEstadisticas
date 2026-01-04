import React from 'react'
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts'
import { X, User, Trophy, Target } from 'lucide-react'

const PlayerProfile = ({ player, onClose, leagueAverageStats, customStats }) => {
    if (!player) return null

    // Prepare Radar Data
    // Comparing Player vs "League Average Top Scorer" (simulated or passed)
    const radarData = [
        { subject: 'Goles', A: player.goals, B: leagueAverageStats.goals || 10, fullMark: 30 },
        { subject: 'Asist', A: player.assists || 0, B: leagueAverageStats.assists || 5, fullMark: 20 },
        { subject: 'Partidos', A: player.matches || 38, B: 38, fullMark: 38 }, // Assuming full season if not available
        { subject: 'Contrib.', A: player.goals + (player.assists || 0), B: (leagueAverageStats.goals || 10) + (leagueAverageStats.assists || 5), fullMark: 50 },
    ]

    // Custom Stats (if matched from stats.json)
    const isCustomPlayer = customStats && customStats.length > 0 && customStats[0].player_name === player.player

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 relative">

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 bg-slate-800/50 hover:bg-slate-700 rounded-full text-slate-400 hover:text-white transition-colors z-10"
                >
                    <X className="w-5 h-5" />
                </button>

                {/* Header */}
                <div className="relative h-32 bg-gradient-to-r from-blue-900 via-slate-900 to-slate-900 p-6 flex items-end">
                    <div className="absolute top-0 left-0 w-full h-full opacity-20 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
                    <div className="flex items-end gap-4 relative z-10 translate-y-8">
                        <div className="w-24 h-24 bg-slate-800 rounded-xl border-4 border-slate-900 shadow-xl overflow-hidden flex items-center justify-center">
                            {/* Placeholder for player image logic if available */}
                            <User className="w-12 h-12 text-slate-600" />
                        </div>
                        <div className="mb-2">
                            <h2 className="text-2xl font-bold text-white leading-none">{player.player}</h2>
                            <div className="text-sm text-blue-400 font-medium flex items-center gap-1 mt-1">
                                <img src={player.team_logo} className="w-4 h-4" alt="" /> {player.team}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="pt-12 px-6 pb-6 space-y-6">

                    {/* Main Stats Grid */}
                    <div className="grid grid-cols-3 gap-2">
                        <div className="bg-slate-800/50 p-3 rounded-lg text-center border border-slate-700/50">
                            <div className="text-xs text-slate-500 uppercase font-bold">Goles</div>
                            <div className="text-2xl font-bold text-yellow-400">{player.goals}</div>
                        </div>
                        <div className="bg-slate-800/50 p-3 rounded-lg text-center border border-slate-700/50">
                            <div className="text-xs text-slate-500 uppercase font-bold">Ranking</div>
                            <div className="text-2xl font-bold text-white">#{player.rank}</div>
                        </div>
                        <div className="bg-slate-800/50 p-3 rounded-lg text-center border border-slate-700/50">
                            <div className="text-xs text-slate-500 uppercase font-bold">Asistencias</div>
                            <div className="text-2xl font-bold text-blue-400">{player.assists || '-'}</div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Radar Chart */}
                        <div className="h-64 relative">
                            <h3 className="text-xs font-bold text-slate-500 uppercase text-center mb-2">vs Promedio Élite</h3>
                            <ResponsiveContainer width="100%" height="100%">
                                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                                    <PolarGrid gridType="polygon" stroke="#334155" />
                                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                                    <PolarRadiusAxis angle={30} domain={[0, 'auto']} tick={false} axisLine={false} />
                                    <Radar
                                        name={player.player}
                                        dataKey="A"
                                        stroke="#3b82f6"
                                        strokeWidth={3}
                                        fill="#3b82f6"
                                        fillOpacity={0.5}
                                    />
                                    <Radar
                                        name="Promedio Top"
                                        dataKey="B"
                                        stroke="#64748b"
                                        strokeWidth={2}
                                        strokeDasharray="4 4"
                                        fill="#64748b"
                                        fillOpacity={0.1}
                                    />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                                        itemStyle={{ color: '#e2e8f0' }}
                                    />
                                </RadarChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Advanced Metrics / Team Impact */}
                        <div className="flex flex-col gap-4">
                            {/* Team Contribution */}
                            {player.teamStats && (
                                <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-4">
                                    <h3 className="text-xs font-bold text-slate-500 uppercase mb-3 flex items-center gap-2">
                                        <Trophy className="w-3 h-3 text-yellow-500" /> Impacto en el Equipo
                                    </h3>

                                    <div className="space-y-4">
                                        {/* Goal Contribution */}
                                        <div>
                                            <div className="flex justify-between text-xs mb-1">
                                                <span className="text-slate-400">Goles del Equipo ({player.teamStats.goals_for})</span>
                                                <span className="text-white font-bold">{Math.round((player.goals / player.teamStats.goals_for) * 100)}%</span>
                                            </div>
                                            <div className="w-full bg-slate-700/50 rounded-full h-2 overflow-hidden">
                                                <div
                                                    className="bg-yellow-500 h-full rounded-full"
                                                    style={{ width: `${Math.min(100, (player.goals / player.teamStats.goals_for) * 100)}%` }}
                                                ></div>
                                            </div>
                                        </div>

                                        {/* Points Per Goal (Simple estimation) */}
                                        <div className="pt-2 border-t border-slate-700/50">
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs text-slate-400">Puntos del Equipo</span>
                                                <span className="text-emerald-400 font-bold">{player.teamStats.points}</span>
                                            </div>
                                            <div className="text-[10px] text-slate-500 mt-1">
                                                Goles por Partido (Equipo): <span className="text-slate-300">{(player.teamStats.goals_for / player.teamStats.matches_played).toFixed(2)}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Custom Stats Badge if applicable */}
                            {isCustomPlayer && (
                                <div className="bg-emerald-500/10 border border-emerald-500/30 p-4 rounded-lg flex items-center gap-3">
                                    <Target className="text-emerald-500 w-8 h-8 flex-shrink-0" />
                                    <div>
                                        <div className="text-emerald-400 font-bold text-sm">Jugador Rastreado</div>
                                        <div className="text-xs text-emerald-500/70">Registros detallados disponibles en tu sistema.</div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    )
}

export default PlayerProfile
