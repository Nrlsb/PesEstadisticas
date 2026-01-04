import React from 'react';
import { Trophy } from 'lucide-react';

export default function CupBracket({ data, leagueName }) {
    if (!data || !data.rounds) {
        return (
            <div className="p-8 text-center text-slate-500 bg-slate-900/50 rounded-xl border border-slate-800 border-dashed">
                <p>No hay datos de Copa disponibles.</p>
            </div>
        );
    }

    // Reverse rounds to show Final first/top or logical order?
    // Usually brackets go Left -> Right or Top -> Bottom.
    // Let's list rounds.
    const rounds = data.rounds;

    return (
        <div className="space-y-8">
            <div className="flex items-center gap-4 mb-6">
                <div className="w-10 h-10 bg-yellow-500/10 rounded-lg flex items-center justify-center border border-yellow-500/20">
                    <Trophy className="text-yellow-500 w-6 h-6" />
                </div>
                <h2 className="text-2xl font-bold text-white">{leagueName} <span className="text-slate-500 text-lg font-normal">({data.season})</span></h2>
            </div>

            <div className="grid gap-8">
                {rounds.map((round, rIndex) => (
                    <div key={rIndex} className="bg-slate-900/50 rounded-xl border border-slate-800 overflow-hidden">
                        <div className="px-6 py-4 bg-slate-900/80 border-b border-slate-800 flex items-center justify-between">
                            <h3 className="font-bold text-lg text-slate-200">{round.name}</h3>
                        </div>

                        <div className="divide-y divide-slate-800/50">
                            {round.matches.map((match, mIndex) => (
                                <div key={mIndex} className="p-2 md:p-4 flex flex-row items-center justify-between gap-1 md:gap-4 hover:bg-slate-800/30 transition-colors">

                                    {/* Home Team */}
                                    <div className={`flex items-center gap-2 md:gap-3 flex-1 justify-end ${match.homeScore > match.awayScore ? 'text-white font-bold' : 'text-slate-400'}`}>
                                        <span className="text-right text-[11px] md:text-base leading-tight">
                                            <span className="md:hidden">{match.home}</span>
                                            <span className="hidden md:inline">{match.home}</span>
                                        </span>
                                        {match.homeLogo ? (
                                            <img src={match.homeLogo} alt={match.home} className="w-5 h-5 md:w-8 md:h-8 object-contain" />
                                        ) : (
                                            <div className="w-5 h-5 md:w-8 md:h-8 rounded-full bg-slate-800 flex items-center justify-center text-[8px] md:text-[10px] uppercase font-bold text-slate-500">
                                                {match.home.substring(0, 2)}
                                            </div>
                                        )}
                                    </div>

                                    {/* Score */}
                                    <div className="px-2 py-1 bg-slate-950/50 rounded md:rounded-lg border border-slate-800 font-mono text-sm md:text-xl font-bold text-white min-w-[50px] md:min-w-[100px] text-center whitespace-nowrap">
                                        {match.homeScore} - {match.awayScore}
                                    </div>

                                    {/* Away Team */}
                                    <div className={`flex items-center gap-2 md:gap-3 flex-1 justify-start ${match.awayScore > match.homeScore ? 'text-white font-bold' : 'text-slate-400'}`}>
                                        {match.awayLogo ? (
                                            <img src={match.awayLogo} alt={match.away} className="w-5 h-5 md:w-8 md:h-8 object-contain" />
                                        ) : (
                                            <div className="w-5 h-5 md:w-8 md:h-8 rounded-full bg-slate-800 flex items-center justify-center text-[8px] md:text-[10px] uppercase font-bold text-slate-500">
                                                {match.away.substring(0, 2)}
                                            </div>
                                        )}
                                        <span className="text-left text-[11px] md:text-base leading-tight">
                                            <span className="md:hidden">{match.away}</span>
                                            <span className="hidden md:inline">{match.away}</span>
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
