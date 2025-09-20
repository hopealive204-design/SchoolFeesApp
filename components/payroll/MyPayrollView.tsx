import React from 'react';
import { School, TeamMember } from '../../types.ts';
import { triggerPayslipPrint } from '../../services/printService.ts';

interface MyPayrollViewProps {
  member: TeamMember;
  school: School;
}

const MyPayrollView: React.FC<MyPayrollViewProps> = ({ member, school }) => {
    
    const payslips = member.salaryInfo?.payslips || [];
    
    const handlePrint = (payslipId: string) => {
        const payslip = payslips.find(p => p.id === payslipId);
        if (payslip) {
            triggerPayslipPrint(payslip, member, school);
        }
    };
    
    return (
        <div className="p-6 bg-white rounded-xl shadow-md">
            <h3 className="text-xl font-semibold text-secondary">My Payslip History</h3>
            <p className="text-sm text-gray-500 mb-4">View and download your past payslips.</p>
             {payslips.length > 0 ? (
                <div className="border rounded-lg overflow-hidden">
                    <table className="w-full text-sm text-left text-gray-600">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                            <tr>
                                <th className="px-6 py-3">Period</th>
                                <th className="px-6 py-3">Gross Salary</th>
                                <th className="px-6 py-3">Net Salary</th>
                                <th className="px-6 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {payslips.sort((a,b) => new Date(b.year, b.month).getTime() - new Date(a.year, a.month).getTime()).map(payslip => (
                                <tr key={payslip.id} className="bg-white border-b hover:bg-gray-50">
                                    <td className="px-6 py-4 font-semibold">{new Date(payslip.year, payslip.month).toLocaleString('default', { month: 'long', year: 'numeric' })}</td>
                                    <td className="px-6 py-4 font-mono">₦{payslip.grossSalary.toLocaleString()}</td>
                                    <td className="px-6 py-4 font-mono text-primary font-bold">₦{payslip.netSalary.toLocaleString()}</td>
                                    <td className="px-6 py-4 text-right">
                                        <button onClick={() => handlePrint(payslip.id)} className="font-medium text-primary hover:underline">View/Print</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="text-center py-12 text-gray-500 border-2 border-dashed rounded-lg">
                    <p>No payslips have been generated for you yet.</p>
                </div>
            )}
        </div>
    );
};

export default MyPayrollView;
