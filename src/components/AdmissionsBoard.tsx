
import React from 'react';
import { School, Applicant, ApplicationStatus } from '../types.ts';
import ApplicantCard from './ApplicantCard.tsx';

interface AdmissionsBoardProps {
  school: School;
  onOpenModal: (applicant: Applicant) => void;
  onEnroll: (applicant: Applicant) => void;
  onUpdateStatus: (applicantId: string, status: ApplicationStatus) => Promise<void>;
}

const columns: { status: ApplicationStatus, title: string, color: string }[] = [
    { status: ApplicationStatus.Applied, title: 'New Applicants', color: 'bg-blue-500' },
    { status: ApplicationStatus.AwaitingTest, title: 'Awaiting Test', color: 'bg-yellow-500' },
    { status: ApplicationStatus.OfferedAdmission, title: 'Admission Offered', color: 'bg-green-500' },
    { status: ApplicationStatus.AdmissionDeclined, title: 'Declined', color: 'bg-red-500' },
];

const BoardColumn: React.FC<{
    title: string;
    color: string;
    applicants: Applicant[];
    status: ApplicationStatus;
    onDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
    onDrop: (e: React.DragEvent<HTMLDivElement>, status: ApplicationStatus) => void;
    children: React.ReactNode;
}> = ({ title, color, applicants, status, onDragOver, onDrop, children }) => {
    return (
        <div 
            className="flex-1 flex flex-col bg-base-200 rounded-lg min-w-[280px]"
            onDragOver={onDragOver}
            onDrop={(e) => onDrop(e, status)}
        >
            <div className={`p-3 rounded-t-lg text-white font-semibold flex justify-between items-center ${color}`}>
                <span>{title}</span>
                <span className="bg-white/30 text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center">{applicants.length}</span>
            </div>
            <div className="p-2 space-y-2 overflow-y-auto flex-grow">
                {children}
            </div>
        </div>
    );
};

const AdmissionsBoard: React.FC<AdmissionsBoardProps> = ({ school, onOpenModal, onEnroll, onUpdateStatus }) => {

    const handleDragStart = (e: React.DragEvent<HTMLDivElement>, applicantId: string) => {
        e.dataTransfer.setData("applicantId", applicantId);
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
    };

    const handleDrop = async (e: React.DragEvent<HTMLDivElement>, newStatus: ApplicationStatus) => {
        e.preventDefault();
        const applicantId = e.dataTransfer.getData("applicantId");
        const applicant = school.applicants.find(a => a.id === applicantId);

        if (applicant && applicant.status !== newStatus) {
            await onUpdateStatus(applicantId, newStatus);
        }
    };

    return (
        <div className="flex h-full space-x-4 overflow-x-auto pb-4">
            {columns.map(col => {
                const applicantsInColumn = school.applicants.filter(a => a.status === col.status);
                return (
                    <BoardColumn
                        key={col.status}
                        title={col.title}
                        color={col.color}
                        applicants={applicantsInColumn}
                        status={col.status}
                        onDragOver={handleDragOver}
                        onDrop={handleDrop}
                    >
                        {applicantsInColumn.map(applicant => (
                            <ApplicantCard
                                key={applicant.id}
                                applicant={applicant}
                                onDragStart={handleDragStart}
                                onClick={() => onOpenModal(applicant)}
                                onEnroll={() => onEnroll(applicant)}
                            />
                        ))}
                        {applicantsInColumn.length === 0 && (
                            <div className="flex-1 flex items-center justify-center text-xs text-gray-400 p-4 border-2 border-dashed rounded-md">
                                Drag applicants here
                            </div>
                        )}
                    </BoardColumn>
                );
            })}
        </div>
    );
};

export default AdmissionsBoard;
