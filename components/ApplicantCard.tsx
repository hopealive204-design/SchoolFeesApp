import React from 'react';
import { Applicant } from '../types.ts';

interface ApplicantCardProps {
  applicant: Applicant;
  onDragStart: (e: React.DragEvent<HTMLDivElement>, applicantId: string) => void;
  onClick: () => void;
}

const ApplicantCard: React.FC<ApplicantCardProps> = ({ applicant, onDragStart, onClick }) => {
  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, applicant.id)}
      onClick={onClick}
      className="bg-white p-3 rounded-lg shadow-sm border border-gray-200 cursor-grab hover:shadow-md hover:border-primary/50 transition-all active:cursor-grabbing"
    >
      <p className="font-semibold text-sm text-secondary">{applicant.name}</p>
      <p className="text-xs text-gray-500 mt-1">Applying for: {applicant.applyingForClass}</p>
      <p className="text-xs text-gray-500">Parent: {applicant.parentName}</p>
    </div>
  );
};

export default ApplicantCard;
