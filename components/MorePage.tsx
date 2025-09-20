import React from 'react';
import { View, BursarySubView } from '../types.ts';

interface MorePageProps {
  setActiveView: (view: View) => void;
  onLogout: () => void;
}

const NavButton: React.FC<{
    label: string;
    // Fix: Update icon type to allow passing className.
    icon: React.ReactElement<{ className?: string }>;
    onClick: () => void;
    isDestructive?: boolean;
}> = ({ label, icon, onClick, isDestructive = false }) => (
    <button
        onClick={onClick}
        className={`w-full flex items-center p-4 rounded-lg transition-colors text-left ${
            isDestructive
            ? 'text-red-600 bg-red-50 hover:bg-red-100'
            : 'text-gray-700 bg-gray-50 hover:bg-gray-100'
        }`}
    >
        {React.cloneElement(icon, { className: 'w-6 h-6 mr-4 flex-shrink-0' })}
        <span className="font-semibold flex-grow">{label}</span>
        {!isDestructive && (
             <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-auto text-gray-400"><path d="m9 18 6-6-6-6"/></svg>
        )}
    </button>
);

const NavSection: React.FC<{ title: string, children: React.ReactNode }> = ({ title, children }) => (
    <div>
        <h3 className="px-4 pt-4 pb-2 text-sm font-semibold text-gray-500 uppercase tracking-wider">{title}</h3>
        <div className="space-y-2">
            {children}
        </div>
    </div>
);


const MorePage: React.FC<MorePageProps> = ({ setActiveView, onLogout }) => {
    
    // Fix: Replace JSX.Element with React.ReactElement to avoid namespace error.
    const managementItems: { label: View, icon: React.ReactElement }[] = [
        { label: 'Admissions', icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect width="8" height="4" x="8" y="2" rx="1"/><path d="m9 14 2 2 4-4"/></svg> },
        { label: 'Staff', icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> },
        { label: 'Reports', icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="20" x2="12" y2="10" /><line x1="18" y1="20" x2="18" y2="4" /><line x1="6" y1="20" x2="6" y2="16" /></svg> },
        { label: 'Communication', icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg> },
        { label: 'Printing', icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect width="12" height="8" x="6" y="14"/></svg> },
    ];
    
    // Fix: Replace JSX.Element with React.ReactElement to avoid namespace error.
    const bursaryItems: { label: BursarySubView, icon: React.ReactElement }[] = [
        { label: 'Student Payments', icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5.1H7.1C5.4 5.1 4 6.5 4 8.2v7.7c0 1.7 1.4 3.1 3.1 3.1h10c1.7 0 3.1-1.4 3.1-3.1V8.2C20.1 6.5 18.7 5.1 17 5.1z"/><path d="M9.1 12.1h6"/></svg> },
        { label: 'Invoices & Receipts', icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15.5 2H8.6c-.4 0-.8.2-1.1.5-.3.3-.5.7-.5 1.1V21c0 .4.2.8.5 1.1.3.3.7.5 1.1.5h7.8c.4 0 .8-.2 1.1-.5.3.3.5-.7.5-1.1V5.5L15.5 2z"/><path d="M15 2v4h4"/></svg> },
        { label: 'Other Income', icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg> },
        { label: 'Expenditures', icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="8" y1="12" x2="16" y2="12"/></svg> },
        { label: 'Payroll', icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg> },
        { label: 'Reconciliation', icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/><path d="M21 21v-5h-5"/></svg> },
        { label: 'Fee Structure', icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 0 2.22l-.15.1a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l-.22-.38a2 2 0 0 0-.73-2.73l-.15-.1a2 2 0 0 1 0-2.22l.15-.1a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg> },
    ];
    
    // Fix: Replace JSX.Element with React.ReactElement to avoid namespace error.
    const toolItems: { label: View, icon: React.ReactElement }[] = [
        { label: 'AI Insights', icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/></svg> },
        { label: 'Knowledge Base', icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg> },
    ];

    // Fix: Replace JSX.Element with React.ReactElement to avoid namespace error.
    const accountItems: { label: View, icon: React.ReactElement }[] = [
         { label: 'Settings', icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 0 2.22l-.15.1a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l-.22-.38a2 2 0 0 0-.73-2.73l-.15-.1a2 2 0 0 1 0-2.22l.15-.1a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg> },
    ]

    return (
        <div className="space-y-4">
             <NavSection title="Management">
                 {managementItems.map(item => <NavButton key={item.label} label={item.label} icon={item.icon} onClick={() => setActiveView(item.label)} />)}
             </NavSection>
             <NavSection title="Bursary">
                 {bursaryItems.map(item => <NavButton key={item.label} label={item.label} icon={item.icon} onClick={() => setActiveView(item.label)} />)}
             </NavSection>
             <NavSection title="Tools">
                 {toolItems.map(item => <NavButton key={item.label} label={item.label} icon={item.icon} onClick={() => setActiveView(item.label)} />)}
             </NavSection>
             <NavSection title="Account">
                 {accountItems.map(item => <NavButton key={item.label} label={item.label} icon={item.icon} onClick={() => setActiveView(item.label)} />)}
                <NavButton
                    label="Logout"
                    icon={<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>}
                    onClick={onLogout}
                    isDestructive
                />
            </NavSection>
        </div>
    );
};

export default MorePage;