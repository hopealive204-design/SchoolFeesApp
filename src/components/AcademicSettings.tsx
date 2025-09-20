import React, { useState } from 'react';
import { School, Student, Term } from '../types';
import { updateSchool, updateStudent } from '../services/schoolService';
import PromoteStudentsModal from './PromoteStudentsModal';

interface AcademicSettingsProps {
    school: School;
    refreshData: () => Promise<void>;
}

const AcademicSettings: React.FC<AcademicSettingsProps> = ({ school, refreshData }) => {
    const [currentSession, setCurrentSession] = useState(school.currentSession);
    const [currentTerm, setCurrentTerm] = useState(school.currentTerm);
    const [isPromoteModalOpen, setPromoteModalOpen] = useState(false);

    const handleSaveChanges = async () => {
        try {
            await updateSchool(school.id, { currentSession, currentTerm });
            await refreshData();
            alert('Academic settings saved!');
        } catch (error) {
            console.error("Failed to save academic settings:", error);
            alert("Could not save settings. Please try again.");
        }
    };
    
    const handlePromoteStudents = async (promotions: { studentId: string, toClass: string }[]) => {
        try {
            // In a real app, this should be a single backend transaction.
            const promotionPromises = promotions.map(({ studentId, toClass }) => 
                updateStudent(studentId, { class: toClass })
            );
            await Promise.all(promotionPromises);
            await refreshData();
        } catch (error) {
            console.error("Failed to promote students:", error);
            alert("Promotion failed. Please try again.");
        }
    };
    
    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-xl font-semibold text-secondary">Academic Settings</h3>
                <p className="text-sm text-gray-500">Manage the school's current session and term.</p>
            </div>

            <div className="border border-base-300 rounded-lg p-4 space-y-4 lg:w-2/3">
                 <div>
                    <label htmlFor="current-session" className="block text-sm font-medium text-gray-700">Current Academic Session</label>
                    <input
                        type="text"
                        id="current-session"
                        value={currentSession}
                        onChange={(e) => setCurrentSession(e.target.value)}
                        placeholder="e.g., 2024/2025"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                    />
                </div>
                 <div>
                    <label htmlFor="current-term" className="block text-sm font-medium text-gray-700">Current Term</label>
                    <select
                        id="current-term"
                        value={currentTerm}
                        onChange={(e) => setCurrentTerm(e.target.value as Term)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                    >
                        <option value={Term.First}>First Term</option>
                        <option value={Term.Second}>Second Term</option>
                        <option value={Term.Third}>Third Term</option>
                    </select>
                </div>
            </div>
            
            <div className="border border-base-300 rounded-lg p-4 lg:w-2/3">
                 <h4 className="text-lg font-medium text-gray-900">End of Session Actions</h4>
                 <p className="text-sm text-gray-500 mt-1 mb-3">Promote students to their next classes for the new academic session.</p>
                 <button 
                    onClick={() => setPromoteModalOpen(true)}
                    className="btn btn-accent btn-sm"
                 >
                    Promote Students
                </button>
            </div>

            <div className="flex justify-end border-t pt-4">
                <button 
                    onClick={handleSaveChanges} 
                    className="btn btn-primary"
                >
                    Save Academic Settings
                </button>
            </div>

            {isPromoteModalOpen && (
                <PromoteStudentsModal 
                    students={school.students} 
                    onClose={() => setPromoteModalOpen(false)}
                    onPromote={handlePromoteStudents}
                />
            )}
        </div>
    );
};

export default AcademicSettings;