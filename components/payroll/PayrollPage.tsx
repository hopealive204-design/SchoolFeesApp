

import React, { useMemo, useState } from 'react';
import { School, TeamMember, Payslip, Expenditure } from '../../types.ts';
// Fix: Correctly import calculatePayrollForMember from the payroll service.
import { calculatePayrollForMember, runPayrollForSchool } from '../../services/payrollService.ts';
import SalarySetupModal from './SalarySetupModal.tsx';
import PayslipHistoryModal from './PayslipHistoryModal.tsx';

interface PayrollPageProps {
  school: School;
  refreshData: () => Promise<void>;
}

const PayrollPage: React.FC<PayrollPageProps> = ({ school, refreshData }) => {
    const [isSetupModalOpen, setSetupModalOpen] = useState(false);
    const [isHistoryModalOpen, setHistoryModalOpen] = useState(false);
    const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);

    const today = new Date();
    const [payrollMonth, setPayrollMonth] = useState(today.getMonth());
    const [payrollYear, setPayrollYear] = useState(today.getFullYear());

    const membersWithSalary = useMemo(() => {
        return school.teamMembers.filter(m => m.salaryInfo && m.salaryInfo.baseSalary > 0);
    }, [school.teamMembers]);

    const handleOpenSetupModal = (member: TeamMember) => {
        setSelectedMember(member);
        setSetupModalOpen(true);
    };
    
    const handleOpenHistoryModal = (member: TeamMember) => {
        setSelectedMember(member);
        setHistoryModalOpen(true);
    };

    const handleRunPayroll = async () => {
        if (!confirm(`Are you sure you want to run payroll for ${new Date(payrollYear, payrollMonth).toLocaleString('default', { month: 'long', year: 'numeric' })}? This will generate payslips and record an expenditure.`)) {
            return;
        }

        const payslips: Payslip[] = [];
        let totalPayroll = 0;

        membersWithSalary.forEach(member => {
            const payslip = calculatePayrollForMember(member, payrollYear, payrollMonth, school.payrollSettings);
            if (payslip) {
                payslips.push(payslip);
                totalPayroll += payslip.netSalary;
            }
        });
        
        if (payslips.length === 0) {
            alert("No staff members with salary information found. Please set up salaries first.");
            return;
        }

        try {
            await runPayrollForSchool(school.id, payslips, totalPayroll);
            await refreshData();
            alert(`Payroll run successfully for ${payslips.length} staff members. Total payout: ₦${totalPayroll.toLocaleString()}`);
        } catch (error) {
            console.error("Failed to run payroll:", error);
            alert("An error occurred while running payroll. Please try again.");
        }
    };
    
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const yearOptions = [today.getFullYear() -1, today.getFullYear(), today.getFullYear() + 1];

    return (
        <div className="bg-white p-6 rounded-xl shadow-md">
            <div className="flex justify-between items-start mb-4 flex-wrap gap-4">
                <div>
                    <h3 className="text-xl font-semibold text-secondary">Payroll Management</h3>
                    <p className="text-sm text-gray-500">Set up staff salaries and run monthly payroll.</p>
                </div>
                <div className="flex items-center space-x-2 bg-gray-100 p-2 rounded-lg">
                    <select value={payrollMonth} onChange={e => setPayrollMonth(Number(e.target.value))} className="border-gray-300 rounded-md">
                        {monthNames.map((m, i) => <option key={i} value={i}>{m}</option>)}
                    </select>
                     <select value={payrollYear} onChange={e => setPayrollYear(Number(e.target.value))} className="border-gray-300 rounded-md">
                        {yearOptions.map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                     <button onClick={handleRunPayroll} className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-green-700 text-sm font-semibold">Run Payroll</button>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-600">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                        <tr>
                            <th className="px-6 py-3">Staff Name</th>
                            <th className="px-6 py-3">Role</th>
                            <th className="px-6 py-3">Base Salary (₦)</th>
                            <th className="px-6 py-3 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {school.teamMembers.map(member => (
                            <tr key={member.id} className="bg-white border-b hover:bg-gray-50">
                                <td className="px-6 py-4 font-semibold">{member.name}</td>
                                <td className="px-6 py-4">{member.role}</td>
                                <td className="px-6 py-4 font-mono">
                                    {member.salaryInfo?.baseSalary ? member.salaryInfo.baseSalary.toLocaleString() : <span className="text-gray-400 italic">Not Set</span>}
                                </td>
                                <td className="px-6 py-4 text-right space-x-2">
                                    <button onClick={() => handleOpenSetupModal(member)} className="text-sm font-medium text-primary hover:underline">Setup Salary</button>
                                    <button onClick={() => handleOpenHistoryModal(member)} className="text-sm font-medium text-accent hover:underline">View History</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            
            {isSetupModalOpen && selectedMember && (
                <SalarySetupModal 
                    member={selectedMember} 
                    onClose={() => setSetupModalOpen(false)}
                    refreshData={refreshData}
                />
            )}
             {isHistoryModalOpen && selectedMember && (
                <PayslipHistoryModal 
                    member={selectedMember} 
                    school={school}
                    onClose={() => setHistoryModalOpen(false)}
                />
            )}
        </div>
    );
};

export default PayrollPage;