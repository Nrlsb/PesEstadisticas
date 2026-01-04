import React, { useState } from 'react';
import { Target, Trophy, TrendingUp, Shield, BarChart3, Star, Crown } from 'lucide-react';
import GlobalGoldenBoot from './GlobalGoldenBoot';
import StyleMatrixChart from './StyleMatrixChart';
import TeamEvolutionChart from './TeamEvolutionChart';
import CupPerformance from './CupPerformance';
import DoubleDoubleClub from './DoubleDoubleClub';
import TeamProgression from './TeamProgression';
import CupSpecialists from './CupSpecialists';

export default function AnalysisDashboard({
    allLeaguesData,      // Array of arrays (each league json)
    allCompetitionsData  // Array of all raw jsons for cups etc
}) {
    const [activeTab, setActiveTab] = useState('double-double');

    const TABS = [
        { id: 'double-double', label: 'Club Doble-Doble', icon: Crown, color: 'text-amber-500' },
        { id: 'progression', label: 'Revelaciones', icon: TrendingUp, color: 'text-emerald-500' },
        { id: 'cups-specialists', label: 'Especialistas Copas', icon: Star, color: 'text-purple-500' },
        { id: 'goldenboot', label: 'Bota de Oro Global', icon: Target },
        { id: 'stylematrix', label: 'Matriz de Estilos', icon: BarChart3 },
        { id: 'evolution', label: 'Evolución Equipos', icon: TrendingUp },
        { id: 'cups', label: 'Rey de Copas (Histórico)', icon: Trophy },
    ];

    return (
        <div className="space-y-8 animate-fade-in-up">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                        <Shield className="text-emerald-500" />
                        Centro de Análisis Avanzado
                    </h2>
                    <p className="text-slate-400 text-sm mt-1">Explora métricas profundas y comparativas globales.</p>
                </div>

                <div className="flex overflow-x-auto no-scrollbar max-w-full p-1 bg-slate-900/80 rounded-xl border border-slate-800 backdrop-blur-sm">
                    {TABS.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-lg transition-all whitespace-nowrap flex-shrink-0 ${activeTab === tab.id
                                ? 'bg-slate-800 text-white shadow-lg border border-slate-700'
                                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                                }`}
                        >
                            <tab.icon size={16} className={activeTab === tab.id ? tab.color : ''} />
                            <span>{tab.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            <div className="bg-slate-950/30 rounded-2xl border border-white/5 p-6 min-h-[500px]">
                {activeTab === 'goldenboot' && (
                    <GlobalGoldenBoot
                        allLeaguesData={allLeaguesData}
                        allCompetitionsData={allCompetitionsData}
                    />
                )}

                {activeTab === 'double-double' && (
                    <DoubleDoubleClub
                        allLeaguesData={allLeaguesData}
                        allCompetitionsData={allCompetitionsData}
                    />
                )}

                {activeTab === 'progression' && (
                    <TeamProgression
                        allLeaguesData={allLeaguesData}
                    />
                )}

                {activeTab === 'cups-specialists' && (
                    <CupSpecialists
                        allLeaguesData={allLeaguesData}
                        allCompetitionsData={allCompetitionsData}
                    />
                )}

                {activeTab === 'stylematrix' && (
                    <StyleMatrixChart allLeaguesData={allLeaguesData} />
                )}

                {activeTab === 'evolution' && (
                    <TeamEvolutionChart allLeaguesData={allLeaguesData} />
                )}

                {activeTab === 'cups' && (
                    <CupPerformance allCompetitionsData={allCompetitionsData} />
                )}
            </div>
        </div>
    );
}
