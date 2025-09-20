

import React from 'react';
// Fix: Add .ts extension to import path.
import { School, Student } from '../../types.ts';

interface ReminderSheetProps {
    students: Student[];
    school: School;
}

const ReminderCard: React.FC<{ student: Student, school: School }> = ({ student, school }) => (
    <div className="border border-gray-300 p-4 rounded-lg h-full flex flex-col text-sm">
        <div className="flex items-start justify-between">
            <div>
                <h4 className="font-bold text-base">{student.name}</h4>
                <p className="text-xs text-gray-600">Class: {student.class}</p>
            </div>
            <div className="text-right flex-shrink-0">
                {school.logoUrl && <img src={school.logoUrl} alt="logo" className="h-8 w-8 rounded-full ml-auto" />}
                <p className="text-xs font-semibold mt-1">{school.name}</p>
            </div>
        </div>
        <div className="border-t my-2"></div>
        <p className="flex-grow text-xs">
            Dear <span className="font-semibold">{student.parentName}</span>,
            <br />
            This is a friendly reminder regarding an outstanding fee balance for the current term.
        </p>
        <div className="mt-2 text-center bg-red-50 text-red-800 p-2 rounded-md">
            <p className="font-semibold">Outstanding Balance:</p>
            <p className="text-xl font-bold font-mono">₦{student.outstandingFees.toLocaleString()}</p>
        </div>
        <div className="text-xs text-gray-500 mt-2 border-t pt-2">
            <p><strong>Payment Options:</strong></p>
            <p>1. Pay online via the parent portal.</p>
            {school.paymentSettings.bankDetails && (
                 <p>2. Bank Deposit: {school.paymentSettings.bankDetails.bankName} - {school.paymentSettings.bankDetails.accountNumber} ({school.paymentSettings.bankDetails.accountName})</p>
            )}
        </div>
    </div>
);

const ReminderSheet: React.FC<ReminderSheetProps> = ({ students, school }) => {
    return (
        <div className="p-8 bg-white text-gray-800">
            
            <div className="grid grid-cols-2 gap-4">
                {students.map(student => (
                    <ReminderCard key={student.id} student={student} school={school} />
                ))}
            </div>

            <footer className="text-center text-xs text-gray-400 mt-8 pt-4 border-t">
                Please cut and distribute these reminders accordingly.
            </footer>
        </div>
    );
};

export default ReminderSheet;