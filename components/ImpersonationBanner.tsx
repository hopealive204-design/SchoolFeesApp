import React from 'react';

interface ImpersonationBannerProps {
    schoolName: string;
    onStop: () => void;
}

const ImpersonationBanner: React.FC<ImpersonationBannerProps> = ({ schoolName, onStop }) => {
    return (
        <div className="fixed top-0 right-0 bg-accent text-white h-10 text-center z-[100] flex items-center justify-center shadow-lg left-0 md:left-64">
            <div className="flex items-center space-x-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="hidden md:block"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
                <p className="text-sm font-semibold">
                    You are currently impersonating: <strong>{schoolName}</strong>
                </p>
                <button onClick={onStop} className="bg-white text-accent font-bold py-1 px-3 rounded-md hover:bg-gray-200 transition-colors text-xs">
                    Return to Admin
                </button>
            </div>
        </div>
    );
};

export default ImpersonationBanner;