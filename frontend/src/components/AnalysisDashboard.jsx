import React, { useState } from 'react';
import { Target, Trophy, TrendingUp, Shield, BarChart3 } from 'lucide-react';
import GlobalGoldenBoot from './GlobalGoldenBoot';
import StyleMatrixChart from './StyleMatrixChart'; // To be implemented
import TeamEvolutionChart from './TeamEvolutionChart'; // To be implemented
import CupPerformance from './CupPerformance'; // To be implemented

export default function AnalysisDashboard({
    allLeaguesData,      // Array of arrays (each league json)
    allCompetitionsData  // Array of all raw jsons for cups etc
}) {
    const [activeTab, setActiveTab] = useState('goldenboot');

    const TABS = [
        { id: 'goldenboot', label: 'Bota de Oro Global', icon: Target },
        { id: 'stylematrix', label: 'Matriz de Estilos', icon: BarChart3 },
        { id: 'evolution', label: 'Evolución Equipos', icon: TrendingUp },
        { id: 'cups', label: 'Rey de Copas', icon: Trophy },
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

                <div className="flex p-1 bg-slate-900/80 rounded-xl border border-slate-800 backdrop-blur-sm">
                    {TABS.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-lg transition-all ${activeTab === tab.id
                                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/20'
                                : 'text-slate-400 hover:text-white hover:bg-slate-800'
                                }`}
                        >
                            <tab.icon size={16} />
                            <span className="hidden sm:inline">{tab.label}</span>
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
