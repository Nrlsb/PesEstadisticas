import React, { useMemo } from 'react'
import { Trophy, Calendar, Medal } from 'lucide-react'

const ChampionsHistory = ({ data }) => {
    // Process data to find champions
    const history = useMemo(() => {
        if (!data || !Array.isArray(data)) return []

        // We want one entry per season
        // For Leagues: Find the snapshot with round="Final"
        // For Cups: Find the snapshot with a "Final" match in rounds

        const champions = []
        const handledSeasons = new Set()

        // Reverse to show latest first
        const reversedData = [...data].reverse()
        reversedData.forEach(snapshot => {
            if (handledSeasons.has(snapshot.season)) return

            let winner = null
            let runnerUp = null
            let type = 'Unknown'

            // Case A: Cup (has 'rounds' array)
            if (snapshot.rounds && Array.isArray(snapshot.rounds)) {
                const finalRound = snapshot.rounds.find(r => r.name === 'Final')
                if (finalRound && finalRound.matches && finalRound.matches.length > 0) {
                    type = 'Cup'
                    const match = finalRound.matches[0] // Assuming single leg final

                    // Determine winner logic
                    const homeScore = match.homeScore
                    const awayScore = match.awayScore
                    // Check for penalty text in note if needed, but usually score is enough or note says who won

                    // Simple score check (ignoring pk details for now unless parsed)
                    // If draw, check note for "wins on penalties"
                    if (homeScore > awayScore) {
                        winner = { name: match.home, logo: match.homeLogo }
                        runnerUp = { name: match.away, logo: match.awayLogo }
                    } else if (awayScore > homeScore) {
                        winner = { name: match.away, logo: match.awayLogo }
                        runnerUp = { name: match.home, logo: match.homeLogo }
                    } else {
                        // Draw - check note
                        const note = match.note ? match.note.toLowerCase() : ''
                        if (note.includes(match.home.toLowerCase())) {
                            winner = { name: match.home, logo: match.homeLogo }
                            runnerUp = { name: match.away, logo: match.awayLogo }
                        } else if (note.includes(match.away.toLowerCase())) {
                            winner = { name: match.away, logo: match.awayLogo }
                            runnerUp = { name: match.home, logo: match.homeLogo }
                        }
                    }
                }
            }
            // Case B: League (has 'standings' array) and is marked as 'Final'
            else if (snapshot.standings && snapshot.round === 'Final') {
                type = 'League'
                const rank1 = snapshot.standings.find(s => s.rank === 1)
                const rank2 = snapshot.standings.find(s => s.rank === 2)

                if (rank1) winner = { name: rank1.team, logo: rank1.logo }
                if (rank2) runnerUp = { name: rank2.team, logo: rank2.logo }
            }

            if (winner) {
                champions.push({
                    season: snapshot.season,
                    competition: snapshot.league,
                    type,
                    winner,
                    runnerUp
                })
                handledSeasons.add(snapshot.season)
            }
        })

        return champions
    }, [data])

    // Calculate Ranking
    const ranking = useMemo(() => {
        const counts = {}
        history.forEach(h => {
            if (counts[h.winner.name]) {
                counts[h.winner.name].count += 1
            } else {
                counts[h.winner.name] = {
                    name: h.winner.name,
                    logo: h.winner.logo,
                    count: 1
                }
            }
        })
        return Object.values(counts).sort((a, b) => b.count - a.count)
    }, [history])

    if (history.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-slate-500 bg-slate-900/50 rounded-xl border border-slate-800">
                <Trophy className="w-16 h-16 mb-4 opacity-20" />
                <h3 className="text-xl font-bold">Sin Historial Disponible</h3>
                <p className="text-sm">No se han encontrado registros de campeones (Finales jugadas) en los datos actuales.</p>
            </div>
        )
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

            {/* Title Ranking Section */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 backdrop-blur-sm">
                <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <Medal className="text-purple-500" /> Ranking de Títulos
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {ranking.map((team, index) => (
                        <div key={team.name} className={`flex items-center gap-4 p-4 rounded-lg border ${index === 0 ? 'bg-yellow-500/10 border-yellow-500/50' :
                                index === 1 ? 'bg-slate-400/10 border-slate-400/50' :
                                    index === 2 ? 'bg-amber-700/10 border-amber-700/50' :
                                        'bg-slate-800/50 border-slate-700'
                            } relative overflow-hidden group`}>
                            {/* Rank Number */}
                            <div className={`absolute -right-4 -bottom-6 text-6xl font-black opacity-10 select-none ${index === 0 ? 'text-yellow-500' :
                                    index === 1 ? 'text-slate-400' :
                                        index === 2 ? 'text-amber-700' :
                                            'text-slate-600'
                                }`}>
                                #{index + 1}
                            </div>

                            <div className="relative z-10 flex items-center gap-4 w-full">
                                <div className="text-2xl font-black italic text-slate-500 w-6 text-center">{index + 1}</div>
                                <img src={team.logo} alt={team.name} className="w-10 h-10 object-contain drop-shadow-md" />
                                <div className="flex-1">
                                    <div className={`font-bold leading-tight ${index === 0 ? 'text-yellow-400' :
                                            index === 1 ? 'text-slate-200' :
                                                index === 2 ? 'text-amber-500' :
                                                    'text-slate-300'
                                        }`}>{team.name}</div>
                                    <div className="text-xs text-slate-500 uppercase font-bold mt-0.5">
                                        {team.count} {team.count === 1 ? 'Título' : 'Títulos'}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="w-full h-px bg-slate-800/50 my-6"></div>

            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <Trophy className="text-yellow-500" /> Desglose por Temporada
            </h2>

            <div className="grid grid-cols-1 gap-4">
                {history.map((record) => (
                    <div key={record.season} className="bg-slate-900/80 border border-slate-700/50 p-6 rounded-xl flex flex-col md:flex-row items-center justify-between gap-6 hover:bg-slate-800/80 transition-all group relative overflow-hidden">

                        {/* Background Gradient/Effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>

                        {/* Season & Info */}
                        <div className="flex items-center gap-6 min-w-[200px] relative z-10">
                            <div className="text-5xl font-black text-slate-800 group-hover:text-slate-700 transition-colors">
                                {record.season.split('/')[0]}<span className="text-2xl align-top">{record.season.split('/')[1]}</span>
                            </div>
                            <div>
                                <div className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1 flex items-center gap-1">
                                    <Calendar className="w-3 h-3" /> Temporada {record.season}
                                </div>
                                <div className="text-white font-bold text-lg">{record.competition}</div>
                            </div>
                        </div>

                        {/* Winner Section */}
                        <div className="flex-1 flex items-center justify-center gap-8 relative z-10">
                            {/* Runner Up (Small) */}
                            {record.runnerUp && (
                                <div className="flex flex-col items-center opacity-60 scale-75 hidden sm:flex">
                                    <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center border-2 border-slate-700 mb-2 grayscale">
                                        <img src={record.runnerUp.logo} alt={record.runnerUp.name} className="w-10 h-10 object-contain" />
                                    </div>
                                    <div className="text-xs text-slate-400 font-bold">Subcampeón</div>
                                    <div className="text-sm text-slate-300 font-bold">{record.runnerUp.name}</div>
                                </div>
                            )}

                            {/* Champion (Big) */}
                            <div className="flex flex-col items-center transform group-hover:scale-105 transition-transform">
                                <Medal className="w-8 h-8 text-yellow-400 mb-2 drop-shadow-lg" />
                                <div className="w-32 h-32 bg-gradient-to-br from-yellow-500/20 to-amber-900/20 rounded-full flex items-center justify-center border-4 border-yellow-500/30 shadow-[0_0_30px_rgba(234,179,8,0.2)] mb-3 relative">
                                    <div className="absolute inset-0 rounded-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
                                    <img src={record.winner.logo} alt={record.winner.name} className="w-20 h-20 object-contain drop-shadow-xl" />
                                </div>
                                <div className="text-xs text-yellow-500 font-bold uppercase tracking-widest mb-1">Campeón</div>
                                <div className="text-2xl text-white font-black text-center leading-none">{record.winner.name}</div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default ChampionsHistory
