
import React, { useState } from 'react';
import { School } from '../types.ts';
import { onboardNewSchool } from '../services/authService.ts';

interface OnboardingFlowProps {
  schoolData: Partial<School>;
  onComplete: () => void;
}

const OnboardingFlow: React.FC<OnboardingFlowProps> = ({ schoolData, onComplete }) => {
    const [step, setStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async () => {
        setIsLoading(true);
        try {
            await onboardNewSchool(schoolData);
            onComplete();
        } catch (error) {
            console.error("Onboarding failed:", error);
            alert("Could not complete onboarding. Please try again.");
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
                <div className="p-6">
                    <h2 className="text-2xl font-bold text-center">Welcome to FeePilot AI, {schoolData.name}!</h2>
                    <p className="text-center text-gray-600">Let's get your school set up.</p>

                    <div className="my-6">
                        {/* A real onboarding flow would have multiple steps here */}
                        <p>Step {step}: This is a placeholder for the onboarding process. Click Finish to create your school.</p>
                    </div>

                    <div className="flex justify-end">
                        <button 
                            onClick={handleSubmit} 
                            disabled={isLoading}
                            className="btn btn-primary"
                        >
                            {isLoading && <span className="loading loading-spinner"></span>}
                            Finish Setup
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OnboardingFlow;
