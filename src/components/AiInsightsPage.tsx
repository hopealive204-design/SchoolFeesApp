import React, { useState, useEffect, useMemo } from 'react';
import { School, Student, RiskLevel, PricingPlan } from '../types.ts';
import { getAiDebtAnalysis } from '../services/geminiService.ts';
import UpgradePrompt from './UpgradePrompt.tsx';

interface AiInsightsPageProps {
  school: School;
  plan?: PricingPlan | null;
  onUpgrade: () => void;
}

const AiInsightsPage: React.FC<AiInsightsPageProps> = ({ school, plan, onUpgrade }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [analysis, setAnalysis] = useState<{ summary: string, recommendations: string[] } | null>(null);
    const [error, setError] = useState<string | null>(null);
    
    const hasAccess = useMemo(() => plan && plan.name.toLowerCase() === 'enterprise', [plan]);

    const highRiskStudents = useMemo(() => {
        return school.students.filter(s => s.debtRisk === RiskLevel.High);
    }, [school.students]);

    useEffect(() => {
        if (!hasAccess) {
            setIsLoading(false);
            return;
        }

        const fetchAnalysis = async () => {
            if (highRiskStudents.length === 0) {
                setAnalysis({ summary: 'No high-risk debtors found. Your school\'s financial health is excellent in this regard!', recommendations: [] });
                setIsLoading(false);
                return;
            }

            try {
                setIsLoading(true);
                setError(null);
                const result = await getAiDebtAnalysis(highRiskStudents);
                setAnalysis(result);
            } catch (err) {
                const error = err as Error;
                setError(error.message || 'Failed to fetch AI analysis. Please try again later.');
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchAnalysis();
    }, [school.id, highRiskStudents, hasAccess]);

    if (!hasAccess) {
        return <UpgradePrompt currentPlanName={plan?.name || 'Basic'} onUpgrade={onUpgrade} />;
    }

    return (
        <div className="space-y-6">
             <div className="bg-white p-6 rounded-xl shadow-md">
                <div className="flex items-start space-x-4">
                     <div className="bg-primary/10 text-primary p-3 rounded-full flex-shrink-0">
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="m9 12 2 2 4-4"/></svg>
                    </div>
                    <div>
                        <h3 className="text-xl font-semibold text-secondary">AI Financial Health Analysis</h3>
                        <p className="text-sm text-gray-500">Powered by Gemini, this analysis focuses on high-risk debtors to provide actionable insights for improving fee collection.</p>
                    </div>
                </div>
            </div>

            {isLoading && (
                 <div className="bg-white p-12 rounded-xl shadow-md text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-4 font-semibold text-secondary">Analyzing your financial data...</p>
                    <p className="text-sm text-gray-500">This may take a few moments.</p>
                </div>
            )}
            
            {error && (
                <div className="bg-white p-6 rounded-xl shadow-md animate-fade-in">
                    <div className="text-center text-orange-700 bg-orange-100 p-4 rounded-lg">
                        <h4 className="font-bold">AI Analysis Unavailable</h4>
                        <p className="text-sm">{error}</p>
                    </div>
                    <div className="mt-6">
                        <h4 className="text-lg font-semibold text-secondary">Manual Review: High-Risk Students</h4>
                        <p className="text-sm text-gray-500 mb-4">The AI analysis could not be loaded. You can manually review the {highRiskStudents.length} high-risk students below.</p>
                        <div className="text-sm space-y-1 max-h-60 overflow-y-auto border rounded-md p-2">
                            {highRiskStudents.map(s => (
                                <div key={s.id} className="flex justify-between p-1 hover:bg-gray-50 rounded">
                                    <span className="text-gray-800">{s.name}</span>
                                    <span className="font-mono text-red-600">₦{s.outstandingFees.toLocaleString()}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
            
            {!isLoading && !error && analysis && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
                    <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-md">
                        <h4 className="text-lg font-semibold text-secondary mb-3">AI Recommendations</h4>
                        <ul className="space-y-4">
                            {analysis.recommendations.map((rec, index) => (
                                <li key={index} className="flex items-start space-x-3">
                                    <div className="flex-shrink-0 mt-1 w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                                        <svg className="w-3 h-3 text-green-600" fill="none" viewBox="0 0 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                                    </div>
                                    <p className="text-gray-700">{rec}</p>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-md space-y-4">
                        <h4 className="text-lg font-semibold text-secondary">Summary</h4>
                        <p className="text-gray-600">{analysis.summary}</p>
                        <div className="border-t pt-4">
                            <h5 className="font-semibold mb-2">High-Risk Students ({highRiskStudents.length})</h5>
                            <div className="text-sm space-y-1 max-h-48 overflow-y-auto">
                                {highRiskStudents.map(s => (
                                    <div key={s.id} className="flex justify-between">
                                        <span className="text-gray-800">{s.name}</span>
                                        <span className="font-mono text-red-600">₦{s.outstandingFees.toLocaleString()}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AiInsightsPage;
