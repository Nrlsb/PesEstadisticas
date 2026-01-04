import React, { useMemo, useState } from 'react'
import {
    ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Label,
    Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Legend
} from 'recharts'
import { TrendingUp, Activity, Crosshair, Target, Shield, Zap } from 'lucide-react'

const LeagueAnalytics = ({ leagueDataArray, activeSeason }) => {
    const [teamA, setTeamA] = useState(null)
    const [teamB, setTeamB] = useState(null)

    // 1. Get current season snapshots
    const seasonSnapshots = useMemo(() => {
        return leagueDataArray.filter(d => d.season === activeSeason)
    }, [leagueDataArray, activeSeason])

    // 2. Get latest standings for Scatter Plot & Competitiveness
    const latestSnapshot = seasonSnapshots[seasonSnapshots.length - 1]

    const standings = useMemo(() => {
        return latestSnapshot ? latestSnapshot.standings : []
    }, [latestSnapshot])

    // Init Logic for Team Comparison Selectors (Default to Top 2)
    useMemo(() => {
        if (standings.length >= 2 && !teamA && !teamB) {
            setTeamA(standings[0].team)
            setTeamB(standings[1].team)
        }
    }, [standings, teamA, teamB])


    // 3. Calculate "Competitiveness Score" (Std Dev of Points)
    const competitivenessScore = useMemo(() => {
        if (standings.length === 0) return 0
        const points = standings.map(t => t.points)
        const mean = points.reduce((a, b) => a + b, 0) / points.length
        const variance = points.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / points.length
        return Math.sqrt(variance).toFixed(2)
    }, [standings])

    // 4. Prepare Scatter Plot Data (Attack vs Defense)
    const scatterData = useMemo(() => {
        return standings.map(team => ({
            x: team.goals_for, // Attack
            y: team.goals_against, // Defense 
            z: team.points, // Bubble size optional
            name: team.team,
            logo: team.logo
        }))
    }, [standings])

    // 5. Season Projections Logic
    const projections = useMemo(() => {
        if (!standings.length) return []

        // Assuming league size based on standings length (e.g., 20 teams -> 38 games)
        // Standard league double round robin = (N-1)*2
        const totalMatches = (standings.length - 1) * 2

        return standings.map(team => {
            const matchesPlayed = team.matches_played || 0
            const points = team.points || 0

            // Avoid division by zero
            const ppg = matchesPlayed > 0 ? points / matchesPlayed : 0
            const matchesRemaining = Math.max(0, totalMatches - matchesPlayed)

            const projectedPoints = Math.round(points + (ppg * matchesRemaining))

            return {
                ...team,
                projectedPoints,
                ppg: ppg.toFixed(2),
                matchesRemaining
            }
        }).sort((a, b) => b.projectedPoints - a.projectedPoints)
    }, [standings])

    // 6. Team Comparison Radar Data
    const radarData = useMemo(() => {
        if (!teamA || !teamB || !standings.length) return []

        const t1 = standings.find(t => t.team === teamA)
        const t2 = standings.find(t => t.team === teamB)

        if (!t1 || !t2) return []

        // Normalize helper: (val - min) / (max - min) * 100
        // Or simpler: just raw values if comparable, but specific metrics are better scaled.
        // Let's use relative scaling based on League Max for better context

        const maxGF = Math.max(...standings.map(t => t.goals_for))
        const maxGA = Math.max(...standings.map(t => t.goals_against)) // Be careful, lower is better
        const maxWins = Math.max(...standings.map(t => t.wins))

        const getScore = (team, type) => {
            switch (type) {
                case 'Attack': return (team.goals_for / maxGF) * 100
                case 'Defense': return ((maxGA - team.goals_against) / maxGA) * 100 // Inverted: Less GA = Higher Score
                case 'Wins': return (team.wins / maxWins) * 100
                case 'Points': return (team.points / (team.matches_played * 3)) * 100 // Efficiency
                case 'GoalDiff':
                    // Normalize to 0-100 range where 50 is 0 GD? Or just absolute strength? 
                    // Let's simplified: Attack + Defense covers GD mostly. 
                    // Let's use "Effective Possession" proxy? No data.
                    // Let's use Win Rate
                    return (team.wins / team.matches_played) * 100
                default: return 0
            }
        }

        return [
            { subject: 'Ataque', A: getScore(t1, 'Attack'), B: getScore(t2, 'Attack'), fullMark: 100 },
            { subject: 'Defensa', A: getScore(t1, 'Defense'), B: getScore(t2, 'Defense'), fullMark: 100 },
            { subject: 'Victorias', A: getScore(t1, 'Wins'), B: getScore(t2, 'Wins'), fullMark: 100 },
            { subject: 'Eficiencia', A: getScore(t1, 'Points'), B: getScore(t2, 'Points'), fullMark: 100 },
            { subject: 'Ratio Victoria', A: getScore(t1, 'GoalDiff'), B: getScore(t2, 'GoalDiff'), fullMark: 100 },
        ]
    }, [standings, teamA, teamB])


    // 7. Star Dependency Logic ("Messidependencia")
    const starDependencyData = useMemo(() => {
        if (!latestSnapshot || !latestSnapshot.top_scorers || !standings.length) return []

        // Map top scorers to their teams
        const dependency = []
        latestSnapshot.top_scorers.forEach(scorer => {
            const team = standings.find(t => t.team === scorer.team)
            if (team && team.goals_for > 0) {
                const percentage = (scorer.goals / team.goals_for) * 100
                // Avoid duplicates if multiple scorers from same team in top list (take highest?)
                // Or just show all top scorers. Let's show all top scorers high dependence.
                dependency.push({
                    player: scorer.player,
                    team: scorer.team,
                    teamLogo: scorer.team_logo,
                    goals: scorer.goals,
                    teamGoals: team.goals_for,
                    percentage: percentage.toFixed(1)
                })
            }
        })

        // Sort by dependency percentage
        return dependency.sort((a, b) => b.percentage - a.percentage).slice(0, 10)
    }, [latestSnapshot, standings])

    // 8. Tier List Logic
    const tierList = useMemo(() => {
        if (!standings.length) return { S: [], A: [], B: [], C: [] }

        // Sort by points (already sorted usually)
        const sorted = [...standings].sort((a, b) => b.points - a.points)
        const total = sorted.length

        const S = sorted.slice(0, 4) // Top 4
        const C = sorted.slice(total - 3, total) // Bottom 3
        const A = sorted.slice(4, 7) // Next 3
        const B = sorted.slice(7, total - 3) // Mid table

        return { S, A, B, C }
    }, [standings])


    // 9. Interpret Competitiveness (Existing)
    const getCompetitivenessLabel = (score) => {
        if (score < 10) return "Hiper Competitiva (Cualquiera gana)"
        if (score < 15) return "Liga Equilibrada"
        if (score < 20) return "Desigual (Favoritos Claros)"
        return "Monopolio (Dominada por uno)"
    }

    if (!latestSnapshot) return <div className="text-center p-8 text-slate-500">No hay datos suficientes para análisis</div>

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

            {/* Metrics Header */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-xl backdrop-blur-sm flex items-center justify-between">
                    <div>
                        <h3 className="text-slate-400 text-sm font-bold uppercase tracking-wider mb-1">Índice de Competitividad</h3>
                        <p className="text-3xl font-bold text-white">{competitivenessScore}</p>
                        <div className="text-xs text-blue-400 mt-1">{getCompetitivenessLabel(competitivenessScore)}</div>
                    </div>
                    <div className="w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center">
                        <Activity className="text-blue-500 w-6 h-6" />
                    </div>
                </div>

                <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-xl backdrop-blur-sm flex items-center justify-between">
                    <div>
                        <h3 className="text-slate-400 text-sm font-bold uppercase tracking-wider mb-1">Promedio Goles / Partido</h3>
                        {/* Crude calc: Total GF / Total Matches */}
                        <p className="text-3xl font-bold text-white">
                            {(standings.reduce((acc, t) => acc + t.goals_for, 0) / standings.reduce((acc, t) => acc + t.matches_played, 0)).toFixed(2)}
                        </p>
                        <div className="text-xs text-emerald-400 mt-1">Valor de Entretenimiento</div>
                    </div>
                    <div className="w-12 h-12 bg-emerald-500/10 rounded-full flex items-center justify-center">
                        <TrendingUp className="text-emerald-500 w-6 h-6" />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Scatter Plot */}
                <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 backdrop-blur-sm shadow-xl">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                            <Crosshair className="text-purple-500" /> Eficiencia Ataque vs Defensa
                        </h3>
                        <div className="text-xs text-slate-500 hidden sm:block">
                            Sup Der: Goleador y Sólido
                        </div>
                    </div>

                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                                <XAxis type="number" dataKey="x" name="Goles a Favor" unit="g" stroke="#94a3b8">
                                    <Label value="Goles a Favor" offset={-10} position="insideBottom" fill="#64748b" style={{ fontSize: '10px' }} />
                                </XAxis>
                                <YAxis type="number" dataKey="y" name="Goles en Contra" unit="g" stroke="#94a3b8" reversed>
                                    <Label value="Goles en Contra" angle={-90} position="insideLeft" fill="#64748b" style={{ fontSize: '10px' }} />
                                </YAxis>
                                <Tooltip
                                    cursor={{ strokeDasharray: '3 3' }}
                                    content={({ active, payload }) => {
                                        if (active && payload && payload.length) {
                                            const data = payload[0].payload
                                            return (
                                                <div className="bg-slate-900 border border-slate-700 p-3 rounded shadow-xl">
                                                    <div className="font-bold text-white mb-1 flex items-center gap-2">
                                                        <img src={data.logo} className="w-4 h-4" alt="" /> {data.name}
                                                    </div>
                                                    <div className="text-xs text-slate-400">Goles Marcados: <span className="text-emerald-400">{data.x}</span></div>
                                                    <div className="text-xs text-slate-400">Goles Recibidos: <span className="text-red-400">{data.y}</span></div>
                                                </div>
                                            )
                                        }
                                        return null
                                    }}
                                />
                                <Scatter name="Equipos" data={scatterData} fill="#8884d8">
                                    {scatterData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={index < 4 ? '#3b82f6' : '#64748b'} />
                                    ))}
                                </Scatter>
                            </ScatterChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Team Comparison Radar */}
                <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 backdrop-blur-sm shadow-xl flex flex-col">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                            <Target className="text-pink-500" /> Comparativa Directa
                        </h3>
                    </div>

                    <div className="flex gap-4 mb-4">
                        <select
                            value={teamA || ''}
                            onChange={(e) => setTeamA(e.target.value)}
                            className="bg-slate-800 text-white text-xs p-2 rounded border border-slate-700 flex-1 truncate"
                        >
                            {standings.map(t => <option key={t.team} value={t.team}>{t.team}</option>)}
                        </select>
                        <div className="text-slate-500 font-bold self-center">VS</div>
                        <select
                            value={teamB || ''}
                            onChange={(e) => setTeamB(e.target.value)}
                            className="bg-slate-800 text-white text-xs p-2 rounded border border-slate-700 flex-1 truncate"
                        >
                            {standings.map(t => <option key={t.team} value={t.team}>{t.team}</option>)}
                        </select>
                    </div>

                    <div className="flex-1 min-h-[250px] relative">
                        <ResponsiveContainer width="100%" height="100%">
                            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                                <PolarGrid stroke="#334155" />
                                <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                                <Radar name={teamA} dataKey="A" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.4} />
                                <Radar name={teamB} dataKey="B" stroke="#ec4899" fill="#ec4899" fillOpacity={0.4} />
                                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc' }}
                                    itemStyle={{ color: '#f8fafc' }}
                                />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Star Dependency & Tier List Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                {/* Star Dependency Chart */}
                <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 backdrop-blur-sm shadow-xl">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                            <TrendingUp className="text-amber-500" /> Dependencia de Goleadores
                        </h3>
                        <div className="text-xs text-slate-500">
                            % de Goles del Equipo
                        </div>
                    </div>

                    <div className="space-y-4">
                        {starDependencyData.map((item, index) => (
                            <div key={index} className="relative">
                                <div className="flex justify-between text-xs mb-1 relative z-10">
                                    <div className="flex items-center gap-2">
                                        <span className="text-slate-400 w-4">{index + 1}.</span>
                                        <span className="text-white font-bold">{item.player}</span>
                                        <img src={item.teamLogo} className="w-4 h-4 opacity-70" alt="" />
                                    </div>
                                    <span className={item.percentage > 40 ? 'text-red-400 font-bold' : (item.percentage > 25 ? 'text-yellow-400' : 'text-emerald-400')}>
                                        {item.percentage}% ({item.goals}G)
                                    </span>
                                </div>
                                <div className="w-full bg-slate-800/50 rounded-full h-2 overflow-hidden">
                                    <div
                                        className={`h-full rounded-full transition-all duration-500 ${item.percentage > 40 ? 'bg-red-500' : (item.percentage > 25 ? 'bg-yellow-500' : 'bg-emerald-500')
                                            }`}
                                        style={{ width: `${item.percentage}%` }}
                                    ></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Tier List */}
                <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 backdrop-blur-sm shadow-xl">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                            <Shield className="text-indigo-500" /> Tier List de Liga
                        </h3>
                        <div className="text-xs text-slate-500">
                            Clasificación
                        </div>
                    </div>

                    <div className="space-y-2">
                        {/* S Tier */}
                        <div className="flex">
                            <div className="w-16 bg-red-600 flex items-center justify-center rounded-l-lg font-bold text-2xl text-black">S</div>
                            <div className="flex-1 bg-slate-800/80 rounded-r-lg p-2 flex flex-wrap gap-2 min-h-[60px] items-center">
                                {tierList.S.map(t => (
                                    <img key={t.team} src={t.logo} title={t.team} className="w-10 h-10 object-contain drop-shadow-lg" alt={t.team} />
                                ))}
                            </div>
                        </div>
                        {/* A Tier */}
                        <div className="flex">
                            <div className="w-16 bg-orange-500 flex items-center justify-center rounded-l-lg font-bold text-2xl text-black">A</div>
                            <div className="flex-1 bg-slate-800/80 rounded-r-lg p-2 flex flex-wrap gap-2 min-h-[60px] items-center">
                                {tierList.A.map(t => (
                                    <img key={t.team} src={t.logo} title={t.team} className="w-10 h-10 object-contain drop-shadow-lg" alt={t.team} />
                                ))}
                            </div>
                        </div>
                        {/* B Tier */}
                        <div className="flex">
                            <div className="w-16 bg-emerald-500 flex items-center justify-center rounded-l-lg font-bold text-2xl text-black">B</div>
                            <div className="flex-1 bg-slate-800/80 rounded-r-lg p-2 flex flex-wrap gap-2 min-h-[60px] items-center">
                                {tierList.B.map(t => (
                                    <img key={t.team} src={t.logo} title={t.team} className="w-8 h-8 object-contain opacity-80" alt={t.team} />
                                ))}
                            </div>
                        </div>
                        {/* C Tier */}
                        <div className="flex">
                            <div className="w-16 bg-slate-500 flex items-center justify-center rounded-l-lg font-bold text-2xl text-black">C</div>
                            <div className="flex-1 bg-slate-800/80 rounded-r-lg p-2 flex flex-wrap gap-2 min-h-[60px] items-center">
                                {tierList.C.map(t => (
                                    <img key={t.team} src={t.logo} title={t.team} className="w-10 h-10 object-contain grayscale opacity-70" alt={t.team} />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

            </div>

            {/* Season Projections Table */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 backdrop-blur-sm shadow-xl">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                        <Zap className="text-yellow-500" /> Proyección de Temporada
                    </h3>
                    <div className="text-xs text-slate-500">
                        Basado en rendimiento actual (PPG)
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="text-left text-slate-500 border-b border-slate-800">
                                <th className="pb-3 pl-2">Equipo</th>
                                <th className="pb-3">PJ</th>
                                <th className="pb-3 text-emerald-400">PPG</th>
                                <th className="pb-3 text-right">Puntos Actuales</th>
                                <th className="pb-3 text-right text-yellow-500 font-bold">Proyección Final</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/50">
                            {projections.map((team, index) => (
                                <tr key={team.team} className="group hover:bg-slate-800/30 transition-colors">
                                    <td className="py-3 pl-2 flex items-center gap-3">
                                        <span className="text-slate-500 w-4 font-mono text-xs">{index + 1}</span>
                                        <img src={team.logo} alt="" className="w-6 h-6 object-contain" />
                                        <span className={`font-semibold ${index === 0 ? 'text-yellow-400 line-clamp-1' : 'text-slate-300 line-clamp-1'}`}>
                                            {team.team}
                                        </span>
                                    </td>
                                    <td className="py-3 text-slate-400">{team.matches_played}</td>
                                    <td className="py-3 text-emerald-400 font-mono">{team.ppg}</td>
                                    <td className="py-3 text-right text-slate-300 font-bold">{team.points}</td>
                                    <td className="py-3 text-right text-yellow-400 font-bold text-lg">{team.projectedPoints}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

        </div>
    )
}

export default LeagueAnalytics
