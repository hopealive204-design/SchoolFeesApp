import React from 'react';
import { School, Student } from '../../types.ts';
import CompactInvoice from './CompactInvoice.tsx';

interface InvoiceSheetProps {
    students: Student[];
    school: School;
    themeColor: string;
}

const InvoiceSheet: React.FC<InvoiceSheetProps> = ({ students, school, themeColor }) => {
    return (
        <div className="p-4 bg-white text-gray-800" style={{ width: '210mm', height: '297mm', boxSizing: 'border-box' }}>
            <header className="text-center mb-4 pb-2 border-b">
                <h2 className="text-xl font-bold">{school.name} - Student Invoices</h2>
                <p className="text-xs text-gray-500">Date Printed: {new Date().toLocaleDateString()}</p>
            </header>
            
            <div className="grid grid-cols-2 grid-rows-2 gap-4" style={{ height: 'calc(100% - 50px)' }}>
                {students.map(student => (
                    <CompactInvoice key={student.id} student={student} school={school} themeColor={themeColor} />
                ))}
                {/* Fill empty slots to maintain grid structure */}
                {Array.from({ length: 4 - students.length }).map((_, i) => <div key={`empty-${i}`} className="border border-dashed border-gray-200 rounded-lg"></div>)}
            </div>

            <style>{`
                @media print {
                    @page {
                        size: A4;
                        margin: 0;
                    }
                    body {
                        -webkit-print-color-adjust: exact;
                        print-color-adjust: exact;
                    }
                }
            `}</style>
        </div>
    );
};

export default InvoiceSheet;