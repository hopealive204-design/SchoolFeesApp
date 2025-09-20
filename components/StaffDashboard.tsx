import React, { useMemo } from 'react';
import { School, CurrentUser, TeamMember } from '../types.ts';
import MyPayrollView from './payroll/MyPayrollView.tsx';

interface StaffDashboardProps {
  school: School;
  currentUser: Extract<CurrentUser, { role: 'staff' }>;
  onLogout: () => void;
}

const StaffDashboard: React.FC<StaffDashboardProps> = ({ school, currentUser, onLogout }) => {
  
  const me = useMemo(() => {
    return school.teamMembers.find(m => m.id === currentUser.id);
  }, [school.teamMembers, currentUser.id]);

  return (
    <div className="min-h-screen bg-base-100">
        <header className="bg-white shadow-sm">
            <div className="container mx-auto px-6 py-4 flex justify-between items-center">
                <div className="flex items-center space-x-3">
                    {school.logoUrl && <img src={school.logoUrl} alt={school.name} className="h-10 w-auto" />}
                    <div>
                        <h1 className="text-xl font-bold text-secondary">{school.name}</h1>
                        <p className="text-sm text-gray-500">Staff Portal</p>
                    </div>
                </div>
                <div className="flex items-center space-x-4">
                    <div className="text-right">
                       <p className="font-semibold text-sm text-secondary">{currentUser.name}</p>
                       <p className="text-xs text-gray-500">{currentUser.email}</p>
                    </div>
                    <button onClick={onLogout} className="text-sm font-medium text-primary hover:underline">Logout</button>
                </div>
            </div>
        </header>

        <main className="container mx-auto p-6">
            {me ? (
                <MyPayrollView member={me} school={school} />
            ) : (
                <div className="text-center py-20 text-gray-600">
                    <h2 className="text-2xl font-bold">Welcome, {currentUser.name}!</h2>
                    <p>Your staff profile could not be loaded at this time. Please contact your administrator.</p>
                </div>
            )}
        </main>
    </div>
  );
};

export default StaffDashboard;
