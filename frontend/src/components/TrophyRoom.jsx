import React, { useMemo, useState } from 'react'
import { Trophy, Medal, Star, Shield, Crown } from 'lucide-react'

const TrophyRoom = ({ allData }) => {
    const [searchTerm, setSearchTerm] = useState('')

    // Aggregate all trophies from all data sources
    const trophyData = useMemo(() => {
        if (!allData || allData.length === 0) return []

        const counts = {} // { "Team Name": { name, logo, total: 0, breakdown: { "League Name": count } } }

        allData.forEach(dataset => {
            // Flatten if dataset is an array (history) or single object. 
            // Actually usually it's an array of seasons.
            const seasonsData = Array.isArray(dataset) ? dataset : [dataset]

            seasonsData.forEach(snapshot => {
                let winner = null

                // Logic to find winner in this snapshot
                // Case A: Cup
                if (snapshot.rounds && Array.isArray(snapshot.rounds)) {
                    const finalRound = snapshot.rounds.find(r => r.name === 'Final')
                    if (finalRound && finalRound.matches && finalRound.matches.length > 0) {
                        const match = finalRound.matches[0]
                        const homeScore = match.homeScore
                        const awayScore = match.awayScore

                        if (homeScore > awayScore) {
                            winner = { name: match.home, logo: match.homeLogo }
                        } else if (awayScore > homeScore) {
                            winner = { name: match.away, logo: match.awayLogo }
                        } else {
                            // Draw - check note
                            const note = match.note ? match.note.toLowerCase() : ''
                            if (note.includes(match.home.toLowerCase())) {
                                winner = { name: match.home, logo: match.homeLogo }
                            } else if (note.includes(match.away.toLowerCase())) {
                                winner = { name: match.away, logo: match.awayLogo }
                            }
                        }
                    }
                }
                // Case B: League
                else if (snapshot.standings && snapshot.round === 'Final') {
                    const rank1 = snapshot.standings.find(s => s.rank === 1)
                    if (rank1) {
                        winner = { name: rank1.team, logo: rank1.logo }
                    }
                }

                // If we found a winner, add to counts
                if (winner) {
                    if (!counts[winner.name]) {
                        counts[winner.name] = {
                            name: winner.name,
                            logo: winner.logo,
                            total: 0,
                            breakdown: {}
                        }
                    }

                    counts[winner.name].total += 1
                    const competitionName = snapshot.league // e.g., "La Liga", "Copa del Rey"
                    counts[winner.name].breakdown[competitionName] = (counts[winner.name].breakdown[competitionName] || 0) + 1
                }
            })
        })

        // Convert to array and sort
        return Object.values(counts).sort((a, b) => b.total - a.total)
    }, [allData])

    const filteredData = trophyData.filter(team =>
        team.name.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

            {/* Header */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-slate-900/50 p-6 rounded-2xl border border-slate-800 backdrop-blur-md">
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-amber-700 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/20 transform rotate-3 hover:rotate-6 transition-transform">
                        <Crown className="w-8 h-8 text-white" />
                    </div>
                    <div>
                        <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 to-amber-500">
                            Sala de Trofeos
                        </h2>
                        <p className="text-slate-400 font-medium">Palmarés histórico de todos los clubes</p>
                    </div>
                </div>

                {/* Search */}
                <div className="relative w-full md:w-64">
                    <input
                        type="text"
                        placeholder="Buscar equipo..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl py-3 px-4 pl-10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all"
                    />
                    <Star className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 gap-4">
                {filteredData.map((team, index) => (
                    <div key={team.name} className="group relative bg-slate-900/80 hover:bg-slate-800 border border-slate-800 p-6 rounded-xl transition-all hover:shadow-xl hover:shadow-black/50 overflow-hidden">

                        {/* Rank Background */}
                        <div className="absolute -right-4 -bottom-6 text-9xl font-black text-slate-800/50 group-hover:text-amber-500/10 transition-colors select-none">
                            #{index + 1}
                        </div>

                        <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">

                            {/* Rank Badge */}
                            <div className={`w-12 h-12 flex items-center justify-center rounded-full font-black text-xl shrink-0 ${index === 0 ? 'bg-yellow-500 text-black shadow-[0_0_20px_rgba(234,179,8,0.5)]' :
                                    index === 1 ? 'bg-slate-300 text-black shadow-[0_0_20px_rgba(203,213,225,0.5)]' :
                                        index === 2 ? 'bg-amber-700 text-white shadow-[0_0_20px_rgba(180,83,9,0.5)]' :
                                            'bg-slate-800 text-slate-400 border border-slate-700'
                                }`}>
                                {index + 1}
                            </div>

                            {/* Team Info */}
                            <div className="flex items-center gap-4 flex-1">
                                <img src={team.logo} alt={team.name} className="w-16 h-16 object-contain drop-shadow-md" />
                                <div>
                                    <h3 className="text-2xl font-bold text-white group-hover:text-amber-400 transition-colors">{team.name}</h3>
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {Object.entries(team.breakdown).map(([comp, count]) => (
                                            <span key={comp} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-950/50 border border-slate-700/50 text-xs font-semibold text-slate-300">
                                                <Trophy className="w-3 h-3 text-amber-500" />
                                                {count} {comp}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Total Count */}
                            <div className="flex flex-col items-center justify-center min-w-[100px] border-l border-slate-800 pl-6 md:pl-8">
                                <span className="text-5xl font-black text-white">{team.total}</span>
                                <span className="text-xs uppercase font-bold text-slate-500 tracking-wider">Títulos Total</span>
                            </div>

                        </div>
                    </div>
                ))}

                {filteredData.length === 0 && (
                    <div className="text-center py-20 text-slate-500">
                        <p>No se encontraron equipos con ese nombre.</p>
                    </div>
                )}
            </div>

        </div>
    )
}

export default TrophyRoom
