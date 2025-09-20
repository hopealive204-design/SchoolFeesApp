import React from 'react';
import { View, BursarySubView } from '../types.ts';

interface DesktopSidebarProps {
  activeView: View;
  setActiveView: (view: View) => void;
  onLogout: () => void;
}

const NavItem: React.FC<{
    // Fix: Update icon type to allow passing className.
    icon: React.ReactElement<{ className?: string }>;
    label: View | 'Logout';
    active: boolean;
    onClick: () => void;
    isSubItem?: boolean;
}> = ({ icon, label, active, onClick, isSubItem = false }) => (
    <button
        onClick={onClick}
        className={`flex items-center w-full px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
            active ? 'bg-primary/10 text-primary' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
        } ${isSubItem ? 'pl-9' : ''}`}
        aria-label={label}
        aria-current={active ? "page" : undefined}
    >
        {!isSubItem && React.cloneElement(icon, { className: 'w-6 h-6' })}
        <span className={`${isSubItem ? '' : 'ml-3'}`}>{label}</span>
    </button>
);

const LogoIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg width="40" height="40" viewBox="0 0 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);

export const DesktopSidebar: React.FC<DesktopSidebarProps> = ({ activeView, setActiveView, onLogout }) => {
    const mainNavItems: { label: View, icon: React.ReactElement }[] = [
        { label: 'Dashboard', icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24" fill="none" strokeWidth={2} stroke="currentColor"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg> },
        { label: 'Students', icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24" fill="none" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path strokeLinecap="round" strokeLinejoin="round" d="M22 21v-2a4 4 0 0 0-3-3.87"/><path strokeLinecap="round" strokeLinejoin="round" d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> },
        { label: 'Admissions', icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect width="8" height="4" x="8" y="2" rx="1"/><path d="m9 14 2 2 4-4"/></svg> },
        { label: 'Bursary', icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24" fill="none" strokeWidth={2} stroke="currentColor"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg> },
        { label: 'Reports', icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24" fill="none" strokeWidth={2} stroke="currentColor"><line x1="12" y1="20" x2="12" y2="10" /><line x1="18" y1="20" x2="18" y2="4" /><line x1="6" y1="20" x2="6" y2="16" /></svg> },
    ];
    
    const secondaryNavItems: { label: View, icon: React.ReactElement }[] = [
        { label: 'Staff', icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24" fill="none" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path strokeLinecap="round" strokeLinejoin="round" d="M22 21v-2a4 4 0 0 0-3-3.87"/><path strokeLinecap="round" strokeLinejoin="round" d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> },
        { label: 'Communication', icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24" fill="none" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg> },
        { label: 'Printing', icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24" fill="none" strokeWidth={2} stroke="currentColor"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect width="12" height="8" x="6" y="14"/></svg> },
        { label: 'AI Insights', icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24" fill="none" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/></svg> },
        { label: 'Knowledge Base', icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24" fill="none" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg> },
    ];

    const bursaryNavItems: { label: BursarySubView }[] = [
        { label: 'Student Payments' },
        { label: 'Invoices & Receipts' },
        { label: 'Other Income' },
        { label: 'Expenditures' },
        { label: 'Payroll' },
        { label: 'Reconciliation' },
        { label: 'Fee Structure' },
    ];
    
    const isBursaryActive = activeView === 'Bursary' || bursaryNavItems.some(item => item.label === activeView);

    return (
        <aside className="fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 flex-col hidden md:flex">
            <div className="flex items-center justify-center p-4 h-16 border-b">
                 <LogoIcon className="text-primary" />
                 <h1 className="text-xl font-bold ml-2 text-secondary">FeePilot AI</h1>
            </div>
            <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
                 <h3 className="px-3 pb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">Main Menu</h3>
                {mainNavItems.map(item => {
                    if (item.label === 'Bursary') {
                        return (
                            <div key={item.label}>
                                <NavItem
                                    label={item.label}
                                    icon={item.icon}
                                    active={isBursaryActive}
                                    onClick={() => setActiveView('Student Payments')}
                                />
                                {isBursaryActive && (
                                    <div className="pl-6 pt-1 space-y-1">
                                        {bursaryNavItems.map(subItem => (
                                            <NavItem
                                                key={subItem.label}
                                                label={subItem.label}
                                                icon={<></>} // No icon for sub-items
                                                active={activeView === subItem.label}
                                                onClick={() => setActiveView(subItem.label)}
                                                isSubItem={true}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    }
                    return (
                        <NavItem
                            key={item.label}
                            label={item.label}
                            icon={item.icon}
                            active={activeView === item.label}
                            onClick={() => setActiveView(item.label)}
                        />
                    );
                })}
                 <div className="pt-4 mt-4 border-t">
                    <h3 className="px-3 pb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">Tools</h3>
                     {secondaryNavItems.map(item => (
                        <NavItem
                            key={item.label}
                            label={item.label}
                            icon={item.icon}
                            active={activeView === item.label}
                            onClick={() => setActiveView(item.label)}
                        />
                    ))}
                 </div>
            </nav>
            <div className="mt-auto px-4 py-4 border-t">
                 <NavItem
                    label={'Settings'}
                    icon={<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24" fill="none" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 0 2.22l-.15.1a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l-.22-.38a2 2 0 0 0-.73-2.73l-.15-.1a2 2 0 0 1 0-2.22l.15-.1a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>}
                    active={activeView === 'Settings'}
                    onClick={() => setActiveView('Settings')}
                 />
                 <NavItem
                    label={'Logout'}
                    icon={<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24" fill="none" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>}
                    active={false}
                    onClick={onLogout}
                />
            </div>
        </aside>
    );
};