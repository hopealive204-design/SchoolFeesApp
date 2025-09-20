

import React, { useMemo, useState } from 'react';
import { School, CurrentUser } from '../types.ts';
import StatCard from './StatCard.tsx';
import MyPayrollView from './payroll/MyPayrollView.tsx';

interface TeacherDashboardProps {
  school: School;
  currentUser: Extract<CurrentUser, { role: 'teacher' }>;
  onLogout: () => void;
}

const TeacherDashboard: React.FC<TeacherDashboardProps> = ({ school, currentUser, onLogout }) => {
  const [activeTab, setActiveTab] = useState<'class' | 'payroll'>('class');
  const { assignedClasses } = currentUser;
  const [selectedClass, setSelectedClass] = useState<string | null>(assignedClasses.length > 0 ? assignedClasses[0] : null);

  const me = useMemo(() => {
      return school.teamMembers.find(m => m.id === currentUser.id);
  }, [school.teamMembers, currentUser.id]);

  const classStudents = useMemo(() => {
    if (!selectedClass) return [];
    return school.students.filter(s => s.class === selectedClass);
  }, [school.students, selectedClass]);

  const classStats = useMemo(() => {
    const totalFees = classStudents.reduce((acc, s) => acc + s.totalFees, 0);
    const outstandingFees = classStudents.reduce((acc, s) => acc + s.outstandingFees, 0);
    return {
      studentCount: classStudents.length,
      totalFees,
      outstandingFees,
    };
  }, [classStudents]);

  if (assignedClasses.length === 0) {
      return (
           <div className="min-h-screen bg-base-100 flex items-center justify-center p-4">
                <div className="text-center">
                     <h1 className="text-2xl font-bold text-secondary">Welcome, {currentUser.name}!</h1>
                    <p className="text-gray-500 mt-2">You are not currently assigned to any classes. Please contact your administrator.</p>
                     <button onClick={onLogout} className="mt-4 text-sm font-medium text-primary hover:underline">Logout</button>
                </div>
           </div>
      )
  }

  return (
    <div className="min-h-screen bg-base-100">
        <header className="bg-white shadow-sm">
            <div className="container mx-auto px-6 py-4 flex justify-between items-center">
                <div className="flex items-center space-x-3">
                    {school.logoUrl && <img src={school.logoUrl} alt={school.name} className="h-10 w-auto" />}
                    <div>
                        <h1 className="text-xl font-bold text-secondary">{school.name}</h1>
                        <p className="text-sm text-gray-500">Teacher Portal</p>
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

        <main className="container mx-auto p-6 space-y-6">
            <div className="bg-white p-2 rounded-xl shadow-md">
                 <nav className="flex space-x-1" aria-label="Tabs">
                    <button onClick={() => setActiveTab('class')} className={`flex-grow px-3 py-2 text-sm font-medium rounded-md ${activeTab === 'class' ? 'bg-primary text-white' : 'text-gray-500 hover:bg-gray-100'}`}>Class View</button>
                    <button onClick={() => setActiveTab('payroll')} className={`flex-grow px-3 py-2 text-sm font-medium rounded-md ${activeTab === 'payroll' ? 'bg-primary text-white' : 'text-gray-500 hover:bg-gray-100'}`}>My Payroll</button>
                </nav>
            </div>
           
           {activeTab === 'class' && (
            <div className="space-y-6 animate-fade-in">
                <div className="flex justify-between items-center flex-wrap gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-secondary">{selectedClass} Dashboard</h1>
                        <p className="text-gray-500">A financial overview of your selected class.</p>
                    </div>
                    {assignedClasses.length > 1 && (
                        <div>
                             <label htmlFor="class-selector" className="block text-sm font-medium text-gray-700">Switch Class</label>
                             <select id="class-selector" value={selectedClass || ''} onChange={e => setSelectedClass(e.target.value)} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md">
                                {assignedClasses.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                    )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <StatCard icon="students" title="Total Students" value={classStats.studentCount.toString()} change={`In ${selectedClass}`} trend="up" />
                    <StatCard icon="revenue" title="Total Class Fees" value={`₦${classStats.totalFees.toLocaleString()}`} change="For this term" trend="up" />
                    <StatCard icon="outstanding" title="Outstanding Class Fees" value={`₦${classStats.outstandingFees.toLocaleString()}`} change="To be collected" trend="up" color="orange" />
                </div>
                <div className="bg-white p-6 rounded-xl shadow-md">
                    <h2 className="text-xl font-semibold text-secondary mb-4">Class List</h2>
                    <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-600">
                        <thead className="text-xs text-gray-700 uppercase bg-base-200">
                        <tr>
                            <th scope="col" className="px-6 py-3">Student Name</th>
                            <th scope="col" className="px-6 py-3">Admission No.</th>
                            <th scope="col" className="px-6 py-3">Parent Name</th>
                            <th scope="col" className="px-6 py-3">Outstanding Fees</th>
                            <th scope="col" className="px-6 py-3">Payment Status</th>
                        </tr>
                        </thead>
                        <tbody>
                        {classStudents.map((student, index) => (
                            <tr key={student.id} className={`border-b border-base-300 ${index % 2 === 0 ? 'bg-white' : 'bg-base-100'} hover:bg-base-200`}>
                            <td className="px-6 py-4 font-medium text-secondary whitespace-nowrap">{student.name}</td>
                            <td className="px-6 py-4">{student.admissionNumber}</td>
                            <td className="px-6 py-4">{student.parentName}</td>
                            <td className="px-6 py-4 font-mono">₦{student.outstandingFees.toLocaleString()}</td>
                            <td className="px-6 py-4">
                                {student.outstandingFees === 0 ? 
                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Paid</span> :
                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-orange-100 text-orange-800">Outstanding</span>
                                }
                            </td>
                            </tr>
                        ))}
                        {classStudents.length === 0 && (
                            <tr>
                                <td colSpan={5} className="text-center py-8 text-gray-500">No students found for this class.</td>
                            </tr>
                        )}
                        </tbody>
                    </table>
                    </div>
                </div>
            </div>
           )}

           {activeTab === 'payroll' && (
               <div className="animate-fade-in">
                {me ? <MyPayrollView member={me} school={school} /> : <p>Your payroll information is not available.</p>}
               </div>
           )}
        </main>
    </div>
  );
};

export default TeacherDashboard;