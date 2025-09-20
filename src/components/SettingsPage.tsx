import React, { useState } from 'react';
import { School } from '../types.ts';
import AcademicSettings from './AcademicSettings.tsx';
import FeeStructureSettings from './FeeStructureSettings.tsx';
import CommunicationSettings from './CommunicationSettings.tsx';
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
                 return <CommunicationSettings school={school} refreshData={refreshData} />;
            case 'Payroll':
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
                <ul className="menu bg-base-100 rounded-box">
                    {navItems.map(item => (
                         <li key={item.id} onClick={() => setActiveTab(item.id)}>
                            <a className={activeTab === item.id ? 'active' : ''}>{item.name}</a>
                         </li>
                    ))}
                </ul>
            </aside>

            <div className="space-y-6 sm:px-6 lg:px-0 lg:col-span-9">
                <div className="card bg-base-100 shadow">
                  <div className="card-body">
                    {renderContent()}
                  </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;
