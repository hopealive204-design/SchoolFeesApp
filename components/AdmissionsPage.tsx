import React, { useState, useMemo } from 'react';
import { School, Applicant, ApplicationStatus, Student, RiskLevel } from '../types.ts';
import { addApplicant as addApplicantService, updateApplicant as updateApplicantService, addStudent as addStudentService } from '../services/schoolService.ts';
import ApplicantFormModal, { ApplicantData } from './ApplicantFormModal.tsx';
import AdmissionsBoard from './AdmissionsBoard.tsx';

interface AdmissionsPageProps {
    school: School;
    refreshData: () => Promise<void>;
    onEnrollStudent: (student: Student) => void;
}

const createStudentFromApplicant = (applicant: ApplicantData, school: School): Omit<Student, 'id'> => {
    const applicableFees = school.feeDefinitions
        .flatMap(def => {
            const classFee = def.amounts.find(a => a.class === applicant.applyingForClass && (a.type === 'mandatory' || !a.type));
            return classFee ? [{ feeDef: def, classFee }] : [];
        })
        .map(({ feeDef, classFee }, index) => ({
            id: `newfee_${Date.now()}_${index}`,
            type: feeDef.name,
            amount: classFee.amount,
            paidAmount: 0,
            dueDate: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString(),
            session: school.currentSession,
            term: school.currentTerm,
        }));

    const totalFees = applicableFees.reduce((sum, fee) => sum + fee.amount, 0);

    return {
        name: applicant.name,
        admissionNumber: `ADM${Date.now().toString().slice(-5)}`,
        class: applicant.applyingForClass,
        dateOfBirth: applicant.dateOfBirth,
        parentName: applicant.parentName,
        parentEmail: applicant.parentEmail,
        parentPhone: applicant.parentPhone,
        parentRelationship: 'Guardian',
        preferredPaymentMethod: 'Manual Bank Transfer',
        totalFees,
        amountPaid: 0,
        outstandingFees: totalFees,
        lastPaymentDate: null,
        debtRisk: totalFees > 0 ? RiskLevel.Medium : RiskLevel.Low,
        fees: applicableFees,
        payments: [],
        discounts: [],
    };
};


const AdmissionsPage: React.FC<AdmissionsPageProps> = ({ school, refreshData, onEnrollStudent }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingApplicant, setEditingApplicant] = useState<Applicant | null>(null);

    const handleOpenModal = (applicant: Applicant | null = null) => {
        setEditingApplicant(applicant);
        setIsModalOpen(true);
    };

    const handleSaveApplicant = async (data: ApplicantData) => {
        try {
            if (editingApplicant) { // Editing existing applicant
                await updateApplicantService(editingApplicant.id, data);
            } else { // Adding new applicant
                const newApplicant: Omit<Applicant, 'id'> = {
                    ...data,
                    applicationDate: new Date().toISOString(),
                    status: ApplicationStatus.Applied,
                };
                await addApplicantService(school.id, newApplicant);
            }
            await refreshData();
        } catch (error) {
            console.error("Failed to save applicant:", error);
            alert("Could not save applicant details. Please try again.");
        } finally {
            setIsModalOpen(false);
            setEditingApplicant(null);
        }
    };
    
    const handleEnroll = async (applicant: Applicant) => {
         if (!confirm(`This will enroll ${applicant.name} as a student and generate their initial fees. Are you sure?`)) {
             return;
         }
        try {
            // 1. Create the new student object
            const newStudentData = createStudentFromApplicant(applicant, school);
            const newStudent = await addStudentService(school.id, newStudentData);
            
            // 2. Mark the applicant as enrolled
            await updateApplicantService(applicant.id, { status: ApplicationStatus.Enrolled });

            // 3. Refresh all data
            await refreshData();
            
            // 4. Trigger navigation/UI change in parent
            onEnrollStudent(newStudent);
        } catch (error) {
            console.error("Failed to enroll student:", error);
            alert("Enrollment failed. Please try again.");
        }
    };

    const handleUpdateStatus = async (applicantId: string, status: ApplicationStatus) => {
        try {
            await updateApplicantService(applicantId, { status });
            await refreshData();
        } catch (error) {
             console.error("Failed to update applicant status:", error);
             alert("Could not update status. Please try again.");
        }
    };
    
    const summaryStats = useMemo(() => {
        const stats = {
            [ApplicationStatus.Applied]: 0,
            [ApplicationStatus.AwaitingTest]: 0,
            [ApplicationStatus.OfferedAdmission]: 0,
            [ApplicationStatus.AdmissionDeclined]: 0,
        };
        school.applicants.forEach(app => {
            if (app.status in stats) {
                stats[app.status as keyof typeof stats]++;
            }
        });
        return stats;
    }, [school.applicants]);


    return (
        <div className="space-y-6 h-full flex flex-col">
             <div className="bg-white p-6 rounded-xl shadow-md flex-shrink-0">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold text-secondary">Admissions Pipeline ({school.applicants.filter(a => a.status !== ApplicationStatus.Enrolled).length})</h3>
                    <button onClick={() => handleOpenModal()} className="btn btn-primary btn-sm">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z" /></svg>
                        <span>Add Applicant</span>
                    </button>
                </div>
                <div className="flex items-center space-x-4 text-sm">
                    {Object.entries(summaryStats).map(([status, count]) => (
                        <div key={status} className="flex items-center space-x-2">
                            <span className="font-semibold text-gray-700">{status}:</span>
                            <span className="font-bold text-primary">{count}</span>
                        </div>
                    ))}
                </div>
             </div>
             <div className="flex-grow min-h-0">
                <AdmissionsBoard
                    school={school}
                    onOpenModal={handleOpenModal}
                    onEnroll={handleEnroll}
                    onUpdateStatus={handleUpdateStatus}
                />
             </div>
            {isModalOpen && <ApplicantFormModal applicant={editingApplicant} onClose={() => setIsModalOpen(false)} onSave={handleSaveApplicant} />}
        </div>
    );
};

export default AdmissionsPage;