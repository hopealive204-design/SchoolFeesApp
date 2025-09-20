import React from 'react';
import { Student, RiskLevel } from '../types.ts';

interface StudentsTableProps {
  students: Student[];
}

const RiskBadge: React.FC<{ level: RiskLevel }> = ({ level }) => {
  const colorClasses = {
    [RiskLevel.Low]: "badge-success",
    [RiskLevel.Medium]: "badge-warning",
    [RiskLevel.High]: "badge-error",
  };
  return <div className={`badge ${colorClasses[level]} badge-sm text-white`}>{level}</div>;
};

const StudentsTable: React.FC<StudentsTableProps> = ({ students }) => {
  return (
    <div className="overflow-x-auto">
      <table className="table table-zebra w-full">
        <thead>
          <tr>
            <th>Student Name</th>
            <th>Class</th>
            <th>Outstanding Fees</th>
            <th>Last Payment</th>
            <th>Risk Level</th>
          </tr>
        </thead>
        <tbody>
          {students.map((student) => (
            <tr key={student.id} className="hover">
              <td className="font-medium text-secondary whitespace-nowrap">
                {student.name}
              </td>
              <td>{student.class}</td>
              <td className="font-mono">₦{student.outstandingFees.toLocaleString()}</td>
              <td>
                {student.lastPaymentDate ? new Date(student.lastPaymentDate).toLocaleDateString() : 'N/A'}
              </td>
              <td>
                <RiskBadge level={student.debtRisk} />
              </td>
            </tr>
          ))}
           {students.length === 0 && (
              <tr>
                  <td colSpan={5} className="text-center py-4 text-gray-500">No students to display.</td>
              </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default StudentsTable;
