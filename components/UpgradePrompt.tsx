import React from 'react';

interface UpgradePromptProps {
  currentPlanName: string;
  onUpgrade: () => void;
}

const UpgradePrompt: React.FC<UpgradePromptProps> = ({ currentPlanName, onUpgrade }) => {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center bg-white p-12 rounded-xl shadow-lg max-w-2xl mx-auto">
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-primary/10">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                <path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="m9 12 2 2 4-4"/>
            </svg>
        </div>
        <h2 className="mt-4 text-2xl font-bold text-secondary">Unlock Advanced AI Insights</h2>
        <p className="mt-2 text-gray-600">
          Supercharge your decision-making with predictive analytics, debt reduction strategies, and growth forecasting.
          This powerful feature is exclusively available on our Advanced and Enterprise plans.
        </p>
        <p className="mt-4 text-sm text-gray-500">
          Your current plan is: <strong className="text-primary">{currentPlanName}</strong>
        </p>
        <button
          onClick={onUpgrade}
          className="mt-6 inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-primary hover:brightness-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
        >
          Upgrade Your Plan
        </button>
      </div>
    </div>
  );
};

export default UpgradePrompt;