import React, { useState } from 'react';
// Fix: Add .ts extension to import path.
import { School } from '../types.ts';
// Fix: Add .tsx extension to import path.
import AcademicSettings from './AcademicSettings.tsx';
// Fix: Add .tsx extension to import path.
import FeeStructureSettings from './FeeStructureSettings.tsx';
// Fix: Add .tsx extension to import path.
import CommunicationSettings from './CommunicationSettings.tsx';
// Fix: Add .tsx extension to import path.
import PayrollSettings from './payroll/PayrollSettings.tsx';

interface SettingsPageProps {
  school: School;
  refreshData: () => Promise<void>;
}

type SettingsTab = 'Academic' | 'Fee Structure' | 'Communication' | 'Payroll';

const SettingsPage: React.FC<SettingsPageProps> = ({ school, refreshData }) => {
    const [activeTab, setActiveTab] = useState<SettingsTab>('Academic');

    const renderContent = () => {
        switch (activeTab) {
            case 'Academic':
                return <AcademicSettings school={school} refreshData={refreshData} />;
            case 'Fee Structure':
                return <FeeStructureSettings school={school} refreshData={refreshData} />;
            case 'Communication':
                 // Fix: Pass refreshData prop instead of setSchools
                 return <CommunicationSettings school={school} refreshData={refreshData} />;
            case 'Payroll':
                // Fix: Pass refreshData prop instead of setSchools
                return <PayrollSettings school={school} refreshData={refreshData} />;
            default:
                return null;
        }
    };
    
    const navItems: {id: SettingsTab, name: string}[] = [
        {id: 'Academic', name: 'Academic'},
        {id: 'Fee Structure', name: 'Fee Structure'},
        {id: 'Communication', name: 'Communication'},
        {id: 'Payroll', name: 'Payroll'},
    ];

    return (
        <div className="lg:grid lg:grid-cols-12 lg:gap-x-5">
            <aside className="py-6 px-2 sm:px-6 lg:py-0 lg:px-0 lg:col-span-3">
                <nav className="space-y-1">
                    {navItems.map(item => (
                         <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={`w-full text-left flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                                activeTab === item.id ? 'bg-gray-100 text-primary' : 'text-gray-900 hover:bg-gray-50'
                            }`}
                        >
                           <span className="truncate">{item.name}</span>
                        </button>
                    ))}
                </nav>
            </aside>

            <div className="space-y-6 sm:px-6 lg:px-0 lg:col-span-9">
                <div className="bg-white p-6 rounded-xl shadow-md">
                    {renderContent()}
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;