

import React, { useState, useMemo } from 'react';
import { School, Student } from '../types.ts';

interface InvoicesPageProps {
  school: School;
}

type PaymentStatusFilter = 'all' | 'paid' | 'unpaid' | 'overdue';

const InvoicesPage: React.FC<InvoicesPageProps> = ({ school }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterClass, setFilterClass] = useState('all');
    const [filterStatus, setFilterStatus] = useState<PaymentStatusFilter>('all');

    const uniqueClasses = useMemo(() => ['all', ...Array.from(new Set(school.students.map(s => s.class)))], [school.students]);

    const filteredStudents = useMemo(() => {
        return school.students.filter(student => {
            const searchLower = searchTerm.toLowerCase();
            const classMatch = filterClass === 'all' || student.class === filterClass;
            const searchMatch = !searchLower || student.name.toLowerCase().includes(searchLower);

            const statusMatch = () => {
                switch(filterStatus) {
                    case 'paid': return student.outstandingFees === 0;
                    case 'unpaid': return student.outstandingFees > 0;
                    case 'overdue': 
                        // Simplified: any outstanding fee is considered "overdue" for this demo
                        return student.outstandingFees > 0;
                    case 'all':
                    default:
                        return true;
                }
            };
            
            return classMatch && searchMatch && statusMatch();
        });
    }, [school.students, searchTerm, filterClass, filterStatus]);
    
    const getStatusBadge = (student: Student) => {
        if (student.outstandingFees === 0) {
            return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Paid</span>;
        }
        // Simplified overdue logic
        return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">Overdue</span>;

    };

    return (
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-md">
                <h3 className="text-xl font-semibold text-secondary">Invoices</h3>
                <p className="text-sm text-gray-500">View and manage all student invoices for the current term.</p>
                <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                     <input
                        type="text"
                        placeholder="Search by student name..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                     <select value={filterClass} onChange={e => setFilterClass(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50">
                        {uniqueClasses.map(c => <option key={c} value={c}>{c === 'all' ? 'All Classes' : c}</option>)}
                    </select>
                     <select value={filterStatus} onChange={e => setFilterStatus(e.target.value as PaymentStatusFilter)} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50">
                        <option value="all">All Statuses</option>
                        <option value="paid">Paid</option>
                        <option value="unpaid">Unpaid</option>
                        <option value="overdue">Overdue</option>
                    </select>
                </div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md">
                 <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-600">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3">Student</th>
                                <th scope="col" className="px-6 py-3">Total Fees</th>
                                <th scope="col" className="px-6 py-3">Amount Paid</th>
                                <th scope="col" className="px-6 py-3">Outstanding</th>
                                <th scope="col" className="px-6 py-3">Due Date</th>
                                <th scope="col" className="px-6 py-3">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredStudents.map(student => (
                                <tr key={student.id} className="bg-white border-b hover:bg-gray-50">
                                    <td className="px-6 py-4 font-medium text-gray-900">{student.name}<br/><span className="text-xs text-gray-500">{student.class}</span></td>
                                    <td className="px-6 py-4 font-mono">₦{student.totalFees.toLocaleString()}</td>
                                    <td className="px-6 py-4 font-mono">₦{student.amountPaid.toLocaleString()}</td>
                                    <td className="px-6 py-4 font-mono font-semibold text-red-600">₦{student.outstandingFees.toLocaleString()}</td>
                                    <td className="px-6 py-4">{student.fees[0] ? new Date(student.fees[0].dueDate).toLocaleDateString() : 'N/A'}</td>
                                    <td className="px-6 py-4">{getStatusBadge(student)}</td>
                                </tr>
                            ))}
                             {filteredStudents.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="text-center py-8 text-gray-500">No invoices match the current filters.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default InvoicesPage;