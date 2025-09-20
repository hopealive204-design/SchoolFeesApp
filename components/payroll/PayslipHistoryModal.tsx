import React from 'react';
import { School, TeamMember } from '../../types.ts';
import { triggerPayslipPrint } from '../../services/printService.ts';
import ModalHeader from '../ModalHeader.tsx';

interface PayslipHistoryModalProps {
  member: TeamMember;
  school: School;
  onClose: () => void;
}

const PayslipHistoryModal: React.FC<PayslipHistoryModalProps> = ({ member, school, onClose }) => {
    
    const payslips = member.salaryInfo?.payslips || [];
    
    const handlePrint = (payslipId: string) => {
        const payslip = payslips.find(p => p.id === payslipId);
        if (payslip) {
            triggerPayslipPrint(payslip, member, school);
        }
    };
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" role="dialog" aria-modal="true">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl transform transition-all max-h-[90vh] flex flex-col">
                <ModalHeader title={`Payslip History for ${member.name}`} onClose={onClose} />
                <div className="p-6 flex-grow overflow-y-auto">
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
                        <div className="text-center py-12 text-gray-500">
                            <p>No payslips have been generated for this staff member yet.</p>
                        </div>
                    )}
                </div>
                 <div className="px-6 py-4 bg-gray-50 flex justify-end space-x-3">
                    <button type="button" onClick={onClose} className="px-4 py-2 bg-white text-sm font-medium text-gray-700 border border-gray-300 rounded-md shadow-sm hover:bg-gray-50">Close</button>
                </div>
            </div>
        </div>
    );
};

export default PayslipHistoryModal;