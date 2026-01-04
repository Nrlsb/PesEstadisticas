import React, { useMemo } from 'react'
import { Trophy, Shield, Activity, TrendingUp } from 'lucide-react'
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell
} from 'recharts'

const SuperLeagueDashboard = ({ allLeaguesData }) => {
    // Aggregate and process data
    const { topScorers, powerRankings, defensiveKings } = useMemo(() => {
        let scorers = []
        let teams = []

        allLeaguesData.forEach(league => {
            // Get the latest available season/round
            // We assume the data passed is the full array for each league
            // Use the last element (latest snapshot)
            const latestSnapshot = league.data[league.data.length - 1]
            if (!latestSnapshot) return

            const leagueName = league.name

            // Process Scorers
            if (latestSnapshot.top_scorers) {
                latestSnapshot.top_scorers.forEach(scorer => {
                    scorers.push({
                        ...scorer,
                        league: leagueName,
                        uniqueId: `${scorer.player}-${leagueName}`
                    })
                })
            }

            // Process Standings for Teams
            if (latestSnapshot.standings) {
                latestSnapshot.standings.forEach(team => {
                    teams.push({
                        ...team,
                        league: leagueName,
                        ppg: (team.points / team.matches_played).toFixed(2),
                        concededPerGame: (team.goals_against / team.matches_played).toFixed(2)
                    })
                })
            }
        })

        // Sort Golden Boot
        const sortedScorers = [...scorers].sort((a, b) => b.goals - a.goals).slice(0, 10)

        // Sort Power Rankings (PPG > Goal Diff)
        const sortedTeams = [...teams].sort((a, b) => {
            if (b.ppg !== a.ppg) return b.ppg - a.ppg
            return b.goal_diff - a.goal_diff
        }).slice(0, 10)

        // Sort Defensive Kings (Least Conceded/Game)
        const sortedDefense = [...teams].sort((a, b) => a.concededPerGame - b.concededPerGame).slice(0, 10)

        return { topScorers: sortedScorers, powerRankings: sortedTeams, defensiveKings: sortedDefense }
    }, [allLeaguesData])

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="text-center space-y-2 mb-10">
                <h2 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-600 inline-flex items-center gap-3">
                    <Trophy className="w-10 h-10 text-yellow-400" />
                    Superliga Europea
                    <Trophy className="w-10 h-10 text-yellow-400" />
                </h2>
                <p className="text-slate-400">Lo mejor de lo mejor de todas las grandes ligas</p>
            </div>

            {/* Grid Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                {/* Golden Boot Section */}
                <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 backdrop-blur-sm shadow-xl hover:shadow-yellow-900/10 transition-all">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-bold text-yellow-100 flex items-center gap-2">
                            <Activity className="text-yellow-500" /> Bota de Oro Europea
                        </h3>
                        <span className="text-xs bg-yellow-500/20 text-yellow-300 px-2 py-1 rounded font-mono">TOP 10</span>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-slate-500 uppercase bg-slate-900/50">
                                <tr>
                                    <th className="px-4 py-3 rounded-l-lg">Pos</th>
                                    <th className="px-4 py-3">Jugador</th>
                                    <th className="px-4 py-3">Equipo</th>
                                    <th className="px-4 py-3 text-right rounded-r-lg">Goles</th>
                                </tr>
                            </thead>
                            <tbody>
                                {topScorers.map((player, index) => (
                                    <tr key={player.uniqueId} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                                        <td className="px-4 py-3 font-mono text-slate-500">#{index + 1}</td>
                                        <td className="px-4 py-3 font-semibold text-white flex items-center gap-2">
                                            {/* Abstracting logo logic or simpler text if no face image logic yet */}
                                            {player.player}
                                        </td>
                                        <td className="px-4 py-3 text-slate-300">
                                            <div className="flex items-center gap-2">
                                                <img src={player.team_logo} alt="" className="w-5 h-5 object-contain" />
                                                <span className="truncate max-w-[120px]">{player.team}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-right font-bold text-yellow-400 text-base">{player.goals}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Power Rankings Section */}
                <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 backdrop-blur-sm shadow-xl hover:shadow-blue-900/10 transition-all">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-bold text-blue-100 flex items-center gap-2">
                            <TrendingUp className="text-blue-500" /> Ranking de Poder (Pts/Part)
                        </h3>
                        <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded font-mono">TOP 10</span>
                    </div>

                    <div className="h-[400px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart layout="vertical" data={powerRankings} margin={{ left: 40, right: 40 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
                                <XAxis type="number" domain={[0, 3]} hide />
                                <YAxis
                                    dataKey="team"
                                    type="category"
                                    width={140}
                                    tick={{ fill: '#94a3b8', fontSize: 12 }}
                                />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                                    itemStyle={{ color: '#e2e8f0' }}
                                    cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }}
                                />
                                <Bar dataKey="ppg" radius={[0, 4, 4, 0]} barSize={20}>
                                    {powerRankings.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={`hsl(217, 91%, ${60 - (index * 4)}%)`} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Defensive Kings Section */}
                <div className="col-span-1 lg:col-span-2 bg-slate-900/50 border border-slate-800 rounded-xl p-6 backdrop-blur-sm shadow-xl hover:shadow-emerald-900/10 transition-all">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-bold text-emerald-100 flex items-center gap-2">
                            <Shield className="text-emerald-500" /> La Gran Muralla (Menos Goles Recibidos/Partido)
                        </h3>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
                        {defensiveKings.slice(0, 5).map((team, index) => (
                            <div key={team.team} className="bg-slate-800/50 p-4 rounded-lg border border-slate-700/50 flex flex-col items-center gap-3">
                                <div className="relative">
                                    <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold text-sm absolute -top-2 -left-2 border border-emerald-500/50">
                                        #{index + 1}
                                    </div>
                                    <img src={team.logo} alt={team.team} className="w-16 h-16 object-contain drop-shadow-lg" />
                                </div>
                                <div className="text-center">
                                    <h4 className="font-bold text-slate-200 text-sm">{team.team}</h4>
                                    <p className="text-xs text-slate-500">{team.league}</p>
                                </div>
                                <div className="mt-auto w-full bg-slate-900/80 rounded py-1 px-2 text-center border border-slate-700">
                                    <span className="text-emerald-400 font-bold">{team.concededPerGame}</span>
                                    <span className="text-xs text-slate-500 ml-1">goles/partido</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    )
}

export default SuperLeagueDashboard
