import React from 'react';
import { Student } from '../types.ts';

interface PaymentCollectionTableProps {
  students: Student[];
  onRecordPayment: (student: Student) => void;
}

const PaymentCollectionTable: React.FC<PaymentCollectionTableProps> = ({ students, onRecordPayment }) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left text-gray-600">
        <thead className="text-xs text-gray-700 uppercase bg-base-200">
          <tr>
            <th scope="col" className="px-6 py-3">Student Name</th>
            <th scope="col" className="px-6 py-3">Class</th>
            <th scope="col" className="px-6 py-3">Outstanding Fees</th>
            <th scope="col" className="px-6 py-3">Payment Status</th>
            <th scope="col" className="px-6 py-3 text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          {students.map((student, index) => (
            <tr 
              key={student.id} 
              className={`border-b border-base-300 ${index % 2 === 0 ? 'bg-white' : 'bg-base-100'} hover:bg-base-200`}
            >
              <td className="px-6 py-4 font-medium text-secondary whitespace-nowrap">{student.name}</td>
              <td className="px-6 py-4">{student.class}</td>
              <td className="px-6 py-4 font-mono">₦{student.outstandingFees.toLocaleString()}</td>
              <td className="px-6 py-4">
                  {student.outstandingFees <= 0 ? 
                      (
                        <div className="flex items-center space-x-2">
                           <svg className="w-6 h-6 animate-scale-in" viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="26" cy="26" r="25" stroke="#22C55E" strokeWidth="2"/>
                                <path className="checkmark__check" d="M14 27L22 35L38 17" stroke="#22C55E" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                            </svg>
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Paid</span>
                        </div>
                      ) :
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-orange-100 text-orange-800">Outstanding</span>
                  }
              </td>
              <td className="px-6 py-4 text-center">
                <button 
                  onClick={() => onRecordPayment(student)} 
                  className="bg-primary text-white px-3 py-1 rounded-md text-xs font-semibold hover:bg-green-700 transition-colors"
                >
                  Record Payment
                </button>
              </td>
            </tr>
          ))}
            {students.length === 0 && (
                <tr>
                    <td colSpan={5} className="text-center py-8 text-gray-500">No students match your search.</td>
                </tr>
            )}
        </tbody>
      </table>
    </div>
  );
};

export default PaymentCollectionTable;