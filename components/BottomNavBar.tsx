import React from 'react';
import { View, BursarySubView } from '../types.ts';

interface BottomNavBarProps {
  activeView: View;
  setActiveView: (view: View) => void;
}

const NavItem: React.FC<{
    // Fix: Update icon type to allow passing className.
    icon: React.ReactElement<{ className?: string }>;
    label: View;
    active: boolean;
    onClick: () => void;
}> = ({ icon, label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`flex flex-col items-center justify-center w-full pt-2 pb-1 transition-colors duration-200 ${
      active ? 'text-primary' : 'text-gray-500 hover:text-primary'
    }`}
    aria-label={label}
    aria-current={active ? "page" : undefined}
  >
    {React.cloneElement(icon, { className: 'w-6 h-6' })}
    <span className="text-xs mt-1">{label}</span>
  </button>
);

const BottomNavBar: React.FC<BottomNavBarProps> = ({ activeView, setActiveView }) => {
    
    // Fix: Replace JSX.Element with React.ReactElement to avoid namespace error.
    const primaryNavItems: { label: View, icon: React.ReactElement }[] = [
        { label: 'Dashboard', icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg> },
        { label: 'Students', icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> },
        { label: 'Bursary', icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg> },
        { label: 'More', icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg> },
    ];

    const secondaryViews: View[] = ['Staff', 'Reports', 'Communication', 'Printing', 'AI Insights', 'Knowledge Base', 'Settings'];
    const isMoreActive = secondaryViews.includes(activeView) || activeView === 'More';
    
    const bursarySubViews: BursarySubView[] = ['Student Payments', 'Invoices & Receipts', 'Other Income', 'Expenditures', 'Payroll', 'Reconciliation', 'Fee Structure'];
    const isBursaryActive = activeView === 'Bursary' || (bursarySubViews as string[]).includes(activeView);

    return (
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg flex md:hidden z-40 h-16">
            {primaryNavItems.map(item => {
                const isActive = 
                    item.label === 'Bursary' ? isBursaryActive :
                    item.label === 'More' ? isMoreActive : 
                    activeView === item.label;
                
                const destinationView = item.label === 'Bursary' ? 'Student Payments' : item.label;

                return (
                    <NavItem
                        key={item.label}
                        label={item.label}
                        icon={item.icon}
                        active={isActive}
                        onClick={() => setActiveView(destinationView)}
                    />
                );
            })}
        </nav>
    );
};

export default BottomNavBar;