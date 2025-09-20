


import React from 'react';
import { Student } from '../types';

interface AllStudentsTableProps {
  students: Student[];
  selectedStudent: Student | null;
  onSelectStudent: (student: Student) => void;
}

const AllStudentsTable: React.FC<AllStudentsTableProps> = ({ students, selectedStudent, onSelectStudent }) => {
  const handleRowClick = (student: Student) => {
    onSelectStudent(student);
  };

  return (
    <div className="overflow-x-auto">
      <table className="table table-zebra w-full">
        <thead>
          <tr>
            <th>Student</th>
            <th className="hidden md:table-cell">Admission No.</th>
            <th className="hidden md:table-cell">Parent</th>
            <th>Outstanding</th>
            <th>Status</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {students.map((student) => {
            const isSelected = selectedStudent?.id === student.id;
            return (
              <tr 
                key={student.id} 
                className={`cursor-pointer transition-colors 
                  ${isSelected ? 'is-active !bg-primary/10' : 'hover'}
                `}
                onClick={() => handleRowClick(student)}
              >
                <td>
                  <div className="font-medium text-secondary whitespace-nowrap">{student.name}</div>
                  <div className="text-xs text-base-content/70">{student.class}</div>
                </td>
                <td className="hidden md:table-cell">{student.admissionNumber}</td>
                <td className="hidden md:table-cell">{student.parentName}</td>
                <td className="font-mono">₦{student.outstandingFees.toLocaleString()}</td>
                <td>
                    {student.outstandingFees === 0 ? 
                        <div className="badge badge-success text-white badge-sm">Paid</div> :
                        <div className="badge badge-warning text-white badge-sm">Outstanding</div>
                    }
                </td>
                <td className="text-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400"><path d="m9 18 6-6-6-6"/></svg>
                </td>
              </tr>
            );
          })}
            {students.length === 0 && (
                <tr>
                    <td colSpan={7} className="text-center py-8 text-gray-500">No students found.</td>
                </tr>
            )}
        </tbody>
      </table>
    </div>
  );
};

export default AllStudentsTable;
