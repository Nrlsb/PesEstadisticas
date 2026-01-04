import React, { useState, useEffect } from 'react'
import LeagueTable from './components/LeagueTable'
import StatsTable from './components/StatsTable'
import CupBracket from './components/CupBracket'
import SuperLeagueDashboard from './components/SuperLeagueDashboard'
import LeagueAnalytics from './components/LeagueAnalytics'
import ChampionsHistory from './components/ChampionsHistory'
import TrophyRoom from './components/TrophyRoom'
import AnalysisDashboard from './components/AnalysisDashboard'
import PlayerProfile from './components/PlayerProfile'
import { LayoutDashboard, RefreshCw, TrendingUp, History } from 'lucide-react'

// Import JSON files
import laLigaDataRaw from '../../league_La_Liga.json'
import premierLeagueDataRaw from '../../league_Premier_League.json'
import ligue1DataRaw from '../../league_Ligue_1.json'
import serieADataRaw from '../../league_Serie_A.json'
import bundesligaDataRaw from '../../league_Bundesliga.json' // Fixed typo if any
import generalLeagueDataRaw from '../../league_General.json'
import cupDFBPokalDataRaw from '../../cup_DFB_Pokal.json'
import cupCopaDelReyDataRaw from '../../cup_Copa_del_Rey.json'
import cupCoppaItaliaDataRaw from '../../cup_Coppa_Italia.json'
import cupCoupeDeFranceDataRaw from '../../cup_Coupe_de_France.json'
import cupFACupDataRaw from '../../cup_FA_Cup.json'
import cupChampionsLeagueDataRaw from '../../cup_Champions_League.json'
import cupFACommunityShieldDataRaw from '../../cup_FA_Community_Shield.json'
import cupTropheeDesChampionsDataRaw from '../../cup_Trophee_des_Champions.json'
import cupSupercoppaItalianaDataRaw from '../../cup_Supercoppa_Italiana.json'
import cupSupercopaDeEspanaDataRaw from '../../cup_Supercopa_de_Espana.json'
import cupDFLSupercupDataRaw from '../../cup_DFL_Supercup.json'
import cupEuropaLeagueDataRaw from '../../cup_Europa_League.json'
import cupUEFASuperCupDataRaw from '../../cup_UEFA_Super_Cup.json'
import cupFIFAClubWorldCupDataRaw from '../../cup_FIFA_Club_World_Cup.json'
import customStatsRaw from '../../stats.json'

// ... imports

export default App

function App() {
  const [activeCategory, setActiveCategory] = useState('Ligas')
  const [activeLeague, setActiveLeague] = useState('La Liga')
  const [leagueDataArray, setLeagueDataArray] = useState([]) // Store full array of snapshots
  const [activeSeason, setActiveSeason] = useState('')
  const [viewAll, setViewAll] = useState(false)
  const [activeRoundIndex, setActiveRoundIndex] = useState(0) // Index within the filtered season data
  const [loading, setLoading] = useState(false)
  const [viewMode, setViewMode] = useState('table') // 'table' or 'analytics'
  const [activePlayer, setActivePlayer] = useState(null)

  const handlePlayerClick = (player, snapshot) => {
    // Inject team stats from the snapshot (standings) for advanced metrics
    const teamStats = snapshot?.standings?.find(t => t.team === player.team) || null
    setActivePlayer({ ...player, teamStats })
  }

  const CATEGORIES = {
    'Ligas': ['La Liga', 'Premier League', 'Ligue 1', 'Serie A', 'Bundesliga', 'General'],
    'Copas Nacionales': ['DFB Pokal', 'Copa del Rey', 'Coppa Italia', 'Coupe de France', 'FA Cup'],
    'Supercopas Nacionales': ['Community Shield', 'Trophée des Champions', 'Supercoppa Italiana', 'Supercopa de España', 'DFL-Supercup'],
    'Copas Internacionales': ['FIFA Club World Cup', 'UEFA Super Cup'],
    'UEFA Champions League': ['UEFA Champions League'],
    'UEFA Europa League': ['UEFA Europa League'],
    'Superliga': ['Superliga Europea'],
    'Palmarés': [],
    'Análisis Avanzado': []
  }

  // Effect to set default active league when category changes
  useEffect(() => {
    if (activeCategory === 'Ligas') {
      setActiveLeague('La Liga')
    } else if (activeCategory === 'Copas Nacionales') {
      setActiveLeague('DFB Pokal')
    } else if (activeCategory === 'Supercopas Nacionales') {
      setActiveLeague('Community Shield')
    } else if (activeCategory === 'Copas Internacionales') {
      setActiveLeague('FIFA Club World Cup')
    } else if (activeCategory === 'UEFA Champions League') {
      setActiveLeague('UEFA Champions League')
    } else if (activeCategory === 'UEFA Europa League') {
      setActiveLeague('UEFA Europa League')
    } else if (activeCategory === 'Superliga') {
      setActiveLeague('Superliga Europea')
    } else if (activeCategory === 'Palmarés') {
      setActiveLeague('Palmarés')
    } else if (activeCategory === 'Análisis Avanzado') {
      setActiveLeague('Análisis Avanzado')
    }
  }, [activeCategory])

  // Load data based on active league
  useEffect(() => {
    if (!activeLeague && activeCategory !== 'UEFA Champions League' && activeCategory !== 'UEFA Europa League' && activeCategory !== 'Superliga' && activeCategory !== 'Palmarés' && activeCategory !== 'Análisis Avanzado') {
      setLeagueDataArray([])
      setLoading(false)
      return
    }

    setLoading(true)
    let dataRaw = []

    if (activeLeague === 'Superliga Europea') {
      // Special case: No single data source, we handle this in render
      setLeagueDataArray([])
      setLoading(false)
      return
    }

    if (activeLeague === 'Palmarés') {
      setLeagueDataArray([])
      setLoading(false)
      return
    }

    if (activeLeague === 'Análisis Avanzado') {
      setLeagueDataArray([])
      setLoading(false)
      return
    }

    // ... load data logic (same as before just mapped to new Spanish values if needed, 
    // but the file contents are just values. We need to check if 'activeLeague' usage matches 'La Liga', etc.)
    // Since names 'La Liga' etc are strings in JSON, we keep them EN/Universal. 
    // Only UI labels change.

    if (activeLeague === 'La Liga') {
      dataRaw = laLigaDataRaw
    } else if (activeLeague === 'Premier League') {
      dataRaw = premierLeagueDataRaw
    } else if (activeLeague === 'Ligue 1') {
      dataRaw = ligue1DataRaw
    } else if (activeLeague === 'Serie A') {
      dataRaw = serieADataRaw
    } else if (activeLeague === 'Bundesliga') {
      dataRaw = bundesligaDataRaw
    } else if (activeLeague === 'General') {
      dataRaw = generalLeagueDataRaw
    } else if (activeLeague === 'DFB Pokal') {
      dataRaw = cupDFBPokalDataRaw
    } else if (activeLeague === 'Copa del Rey') {
      dataRaw = cupCopaDelReyDataRaw
    } else if (activeLeague === 'Coppa Italia') {
      dataRaw = cupCoppaItaliaDataRaw
    } else if (activeLeague === 'Coupe de France') {
      dataRaw = cupCoupeDeFranceDataRaw
    } else if (activeLeague === 'FA Cup') {
      dataRaw = cupFACupDataRaw
    } else if (activeLeague === 'Community Shield') {
      dataRaw = cupFACommunityShieldDataRaw
    } else if (activeLeague === 'Trophée des Champions') {
      dataRaw = cupTropheeDesChampionsDataRaw
    } else if (activeLeague === 'Supercoppa Italiana') {
      dataRaw = cupSupercoppaItalianaDataRaw
    } else if (activeLeague === 'Supercopa de España') {
      dataRaw = cupSupercopaDeEspanaDataRaw
    } else if (activeLeague === 'DFL-Supercup') {
      dataRaw = cupDFLSupercupDataRaw
    } else if (activeLeague === 'UEFA Super Cup') {
      dataRaw = cupUEFASuperCupDataRaw
    } else if (activeLeague === 'FIFA Club World Cup') {
      dataRaw = cupFIFAClubWorldCupDataRaw
    } else if (activeLeague === 'UEFA Champions League') {
      dataRaw = cupChampionsLeagueDataRaw
    } else if (activeLeague === 'UEFA Europa League') {
      dataRaw = cupEuropaLeagueDataRaw
    }

    // Ensure it's an array
    const dataArray = Array.isArray(dataRaw) ? dataRaw : [dataRaw]
    setLeagueDataArray(dataArray)

    // Extract available seasons
    const seasons = [...new Set(dataArray.map(d => d.season).filter(Boolean))]

    // Default to latest season if available
    if (seasons.length > 0) {
      setActiveSeason(seasons[seasons.length - 1])
    } else {
      setActiveSeason('')
    }

    // Reset View All
    setViewAll(false)
    setLoading(false)
  }, [activeLeague, activeCategory])

  // ... rest of logic ...

  // Filter data by Active Season
  const currentSeasonData = leagueDataArray.filter(d => d.season === activeSeason)

  // Reset/Default Active Round when currentSeasonData changes
  useEffect(() => {
    if (currentSeasonData.length > 0) {
      // Default to latest available round in the season
      setActiveRoundIndex(currentSeasonData.length - 1)
    } else {
      setActiveRoundIndex(0)
    }
  }, [activeSeason, leagueDataArray.length])

  // Get data to display
  const displayedData = viewAll ? currentSeasonData : (currentSeasonData[activeRoundIndex] ? [currentSeasonData[activeRoundIndex]] : [])

  // Get available seasons for the selector
  const availableSeasons = [...new Set(leagueDataArray.map(d => d.season).filter(Boolean))]

  // Prepare aggregations for Super League
  const allLeaguesData = [
    { name: 'La Liga', data: laLigaDataRaw },
    { name: 'Premier League', data: premierLeagueDataRaw },
    { name: 'Ligue 1', data: ligue1DataRaw },
    { name: 'Serie A', data: serieADataRaw },
    { name: 'Bundesliga', data: bundesligaDataRaw }
  ]

  const allCompetitionsData = [
    laLigaDataRaw, premierLeagueDataRaw, ligue1DataRaw, serieADataRaw, bundesligaDataRaw,
    generalLeagueDataRaw, cupDFBPokalDataRaw, cupCopaDelReyDataRaw, cupCoppaItaliaDataRaw,
    cupCoupeDeFranceDataRaw, cupFACupDataRaw, cupChampionsLeagueDataRaw, cupFACommunityShieldDataRaw,
    cupTropheeDesChampionsDataRaw, cupSupercoppaItalianaDataRaw, cupSupercopaDeEspanaDataRaw,
    cupDFLSupercupDataRaw, cupEuropaLeagueDataRaw, cupUEFASuperCupDataRaw, cupFIFAClubWorldCupDataRaw
  ]

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8">
      <header className="max-w-7xl mx-auto mb-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20">
            <LayoutDashboard className="text-white w-6 h-6" />
          </div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-300">
            Estadísticas PES
          </h1>
        </div>

        {/* Controls Container */}
        <div className="flex flex-wrap items-center gap-4 bg-slate-900/50 p-2 rounded-xl border border-slate-800 backdrop-blur-sm">

          {/* Season Selector */}
          {availableSeasons.length > 0 && activeLeague && activeLeague !== 'Superliga Europea' && activeLeague !== 'Palmarés' && activeLeague !== 'Análisis Avanzado' && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-2">Temporada</span>
              <div className="flex gap-1">
                {availableSeasons.map(season => (
                  <button
                    key={season}
                    onClick={() => setActiveSeason(season)}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${activeSeason === season
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25 ring-1 ring-blue-400'
                      : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
                      }`}
                  >
                    {season}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Separator */}
          {availableSeasons.length > 0 && currentSeasonData.length > 0 && activeLeague && activeLeague !== 'Superliga Europea' && activeLeague !== 'Palmarés' && activeLeague !== 'Análisis Avanzado' && (
            <div className="w-px h-6 bg-slate-800 mx-2"></div>
          )}

          {/* View Mode & Round Selector */}
          {currentSeasonData.length > 0 && activeLeague && activeLeague !== 'Superliga Europea' && activeLeague !== 'Palmarés' && activeLeague !== 'Análisis Avanzado' && (
            <div className="flex items-center gap-3">
              {/* Analytics Toggle */}
              <button
                onClick={() => setViewMode(viewMode === 'analytics' ? 'table' : 'analytics')}
                className={`flex items-center gap-2 px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${viewMode === 'analytics'
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/25 ring-1 ring-emerald-400'
                  : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
                  }`}
              >
                <TrendingUp className="w-3.5 h-3.5" />
                Análisis
              </button>

              {/* History Toggle */}
              <button
                onClick={() => setViewMode(viewMode === 'history' ? 'table' : 'history')}
                className={`flex items-center gap-2 px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${viewMode === 'history'
                  ? 'bg-yellow-600 text-white shadow-lg shadow-yellow-500/25 ring-1 ring-yellow-400'
                  : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
                  }`}
              >
                <History className="w-3.5 h-3.5" />
                Historial
              </button>

              <div className="w-px h-4 bg-slate-800 mx-1"></div>

              {/* View All Toggle */}
              {viewMode !== 'analytics' && (
                <button
                  onClick={() => setViewAll(!viewAll)}
                  className={`flex items-center gap-2 px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${viewAll
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/25 ring-1 ring-purple-400'
                    : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
                    }`}
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${viewAll ? 'animate-spin-slow' : ''}`} />
                  {viewAll ? 'Todo' : 'Ronda'}
                </button>
              )}

              {/* Round Selector (Hidden if View All is active or Analytics is active) */}
              {!viewAll && viewMode !== 'analytics' && currentSeasonData.length > 1 && (
                <div className="flex bg-slate-800 rounded-lg p-1 gap-1">
                  {currentSeasonData.map((snapshot, index) => (
                    <button
                      key={index}
                      onClick={() => setActiveRoundIndex(index)}
                      className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${activeRoundIndex === index
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                        }`}
                    >
                      {snapshot.round || `Ronda ${index + 1}`}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto space-y-8">
        {/* Category Tabs */}
        <div className="flex flex-wrap justify-center gap-4 md:gap-8 border-b border-slate-800 pb-1 mb-8">
          {Object.keys(CATEGORIES).map(category => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`pb-4 px-4 text-lg font-bold tracking-wide transition-all relative ${activeCategory === category
                ? 'text-white'
                : 'text-slate-500 hover:text-slate-300'
                }`}
            >
              {category}
              {activeCategory === category && (
                <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-t-full shadow-[0_-2px_10px_rgba(59,130,246,0.5)]"></div>
              )}
            </button>
          ))}
        </div>

        {/* Competition Navigation (Sub-tabs) */}
        {activeCategory !== 'UEFA Champions League' && activeCategory !== 'UEFA Europa League' && activeCategory !== 'Superliga' && activeCategory !== 'Palmarés' && activeCategory !== 'Análisis Avanzado' && (
          <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
            {CATEGORIES[activeCategory].map(league => (
              <button
                key={league}
                className={`px-5 py-2.5 rounded-full text-sm font-bold tracking-wide transition-all whitespace-nowrap ${activeLeague === league
                  ? (league === 'General' ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/20' : 'bg-blue-600 text-white shadow-lg shadow-blue-500/20')
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:border-slate-700 hover:text-white'
                  }`}
                onClick={() => setActiveLeague(league)}
              >
                {league === 'General' ? 'General' : league}
              </button>
            ))}
          </div>
        )}

        <section className="space-y-12">
          {loading ? (
            <div className="p-20 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mb-4"></div>
              <p className="text-slate-500">Cargando estadísticas...</p>
            </div>
          ) : activeLeague === 'Análisis Avanzado' ? (
            <AnalysisDashboard
              allLeaguesData={[laLigaDataRaw, premierLeagueDataRaw, ligue1DataRaw, serieADataRaw, bundesligaDataRaw]}
              allCompetitionsData={allCompetitionsData}
            />
          ) : activeLeague === 'Superliga Europea' ? (
            <SuperLeagueDashboard allLeaguesData={allLeaguesData} />
          ) : activeLeague === 'Palmarés' ? (
            <TrophyRoom allData={allCompetitionsData} />
          ) : viewMode === 'history' ? (
            <ChampionsHistory data={leagueDataArray} />
          ) : viewMode === 'analytics' ? (
            <LeagueAnalytics leagueDataArray={leagueDataArray} activeSeason={activeSeason} />
          ) : displayedData.length > 0 ? (
            displayedData.map((data, index) => (
              <div key={index} className={`space-y-8 ${viewAll && index > 0 ? 'pt-12 border-t border-slate-800/50' : ''}`}>
                {viewAll && (
                  <div className="flex items-center gap-4 mb-6">
                    <h2 className="text-2xl font-bold text-white">{data.round} <span className="text-slate-500 text-lg font-normal">({data.season})</span></h2>
                    <div className="h-px flex-1 bg-gradient-to-r from-slate-800 to-transparent"></div>
                  </div>
                )}

                {/* Standings Table or Cup Bracket */}
                {data.type === 'cup' ? (
                  <CupBracket
                    data={data}
                    leagueName={viewAll ? '' : `${data.league}`}
                  />
                ) : (
                  <LeagueTable
                    data={data.standings}
                    leagueName={viewAll ? '' : `${data.league} - ${data.round} (${data.season})`}
                  />
                )}

                {/* Stats Tables Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <StatsTable
                    data={data.top_scorers}
                    title="Top Scorers"
                    type="goals"
                    onPlayerClick={(p) => handlePlayerClick(p, data)}
                  />
                  <StatsTable
                    data={data.top_assists}
                    title="Top Assists"
                    type="assists"
                    onPlayerClick={(p) => handlePlayerClick(p, data)}
                  />
                </div>
              </div>
            ))
          ) : (
            <div className="p-12 text-center text-slate-500 bg-slate-900/50 rounded-xl border border-slate-800 border-dashed">
              <p>No hay datos disponibles para {activeSeason || activeLeague}</p>
            </div>
          )}
        </section>

        {/* Player Profile Modal */}
        {activePlayer && (
          <PlayerProfile
            player={activePlayer}
            onClose={() => setActivePlayer(null)}
            leagueAverageStats={{ goals: 12, assists: 6 }}
            customStats={activePlayer.player === 'Lucas Benitez' ? customStatsRaw : []}
          />
        )}
      </main>
    </div>
  )
}
