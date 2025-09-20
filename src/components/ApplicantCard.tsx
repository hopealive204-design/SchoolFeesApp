
import React from 'react';
import { Applicant, ApplicationStatus } from '../types.ts';

interface ApplicantCardProps {
  applicant: Applicant;
  onDragStart: (e: React.DragEvent<HTMLDivElement>, applicantId: string) => void;
  onClick: () => void;
  onEnroll: () => void;
}

const ApplicantCard: React.FC<ApplicantCardProps> = ({ applicant, onDragStart, onClick, onEnroll }) => {
  const handleEnrollClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent the modal from opening when the button is clicked
    onEnroll();
  };
  
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

      {applicant.status === ApplicationStatus.OfferedAdmission && (
          <div className="mt-2 pt-2 border-t">
              <button 
                onClick={handleEnrollClick}
                className="btn btn-xs btn-success text-white w-full"
              >
                Enroll Student
              </button>
          </div>
      )}
    </div>
  );
};

export default ApplicantCard;
