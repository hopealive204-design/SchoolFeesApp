import ReactDOM from 'react-dom/client';
import React from 'react';
import { Student, School, PlatformConfig, Payslip, TeamMember } from '../types.ts';
import PrintableDocument from '../components/PrintableDocument.tsx';
import { TemplateId } from '../components/PrintCenter.tsx';
import PayslipTemplate from '../components/print_templates/PayslipTemplate.tsx';


/**
 * A centralized function to handle all document printing requests.
 * It opens a new window and renders the appropriate printable document component.
 * @param students The array of students to print documents for.
 * @param type The type of document to print ('invoice', 'receipt', 'reminder').
 * @param school The active school object.
 * @param platformConfig The global platform configuration.
 * @param template The visual template for full-page documents.
 * @param paperSaver A flag to indicate whether to use a compact, multi-document layout.
 */
export const triggerPrint = (
    students: Student[],
    type: 'invoice' | 'receipt' | 'reminder',
    school: School,
    platformConfig: PlatformConfig,
    template: TemplateId = 'Modern',
    paperSaver: boolean = false
) => {
    if (students.length === 0) {
        alert('No students selected for printing.');
        return;
    }

    // Filter out students who can't receive the document type
    let finalStudents = students;
    if (type === 'receipt') {
        finalStudents = students.filter(s => s.payments.length > 0);
        if (finalStudents.length === 0) {
            alert('None of the selected students have payment records to generate a receipt.');
            return;
        }
    }
    if (type === 'reminder') {
        finalStudents = students.filter(s => s.outstandingFees > 0);
         if (finalStudents.length === 0) {
            alert('None of the selected students have outstanding fees to send a reminder for.');
            return;
        }
    }

    const printWindow = window.open('', '_blank', 'height=800,width=800');
    if (!printWindow) {
        alert('Please allow popups for this site to print documents.');
        return;
    }

    printWindow.document.write(`<html><head><title>Printing Documents...</title><script src="https://cdn.tailwindcss.com"></script></head><body><div id="print-root">Loading...</div></body></html>`);
    printWindow.document.close();

    const printRootEl = printWindow.document.getElementById('print-root');
    if (printRootEl) {
        const root = ReactDOM.createRoot(printRootEl);
        root.render(React.createElement(PrintableDocument, {
            students: finalStudents,
            type: type,
            school: school,
            template: template,
            themeColor: platformConfig.websiteContent.theme.primary,
            paperSaver: paperSaver
        }));
        
        // Timeout allows React to render before the print dialog opens
        setTimeout(() => {
            printWindow.focus();
            printWindow.print();
        }, 500);
    }
};

export const triggerPayslipPrint = (
    payslip: Payslip,
    member: TeamMember,
    school: School,
) => {
    const printWindow = window.open('', '_blank', 'height=800,width=800');
    if (!printWindow) {
        alert('Please allow popups for this site to print documents.');
        return;
    }

    printWindow.document.write(`<html><head><title>Printing Payslip...</title><script src="https://cdn.tailwindcss.com"></script></head><body><div id="print-root">Loading...</div></body></html>`);
    printWindow.document.close();

    const printRootEl = printWindow.document.getElementById('print-root');
     if (printRootEl) {
        const root = ReactDOM.createRoot(printRootEl);
        root.render(React.createElement(PayslipTemplate, {
            payslip,
            member,
            school,
        }));
        
        setTimeout(() => {
            printWindow.focus();
            printWindow.print();
        }, 500);
    }
};