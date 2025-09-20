import React, { useState, useMemo } from 'react';
import { School, Student, RiskLevel } from '../types';
import { addStudent as addStudentService } from '../services/schoolService';
import AllStudentsTable from './AllStudentsTable';
import StudentDetailsPane from './StudentDetailsPane';
import AddStudentModal, { NewStudentData } from './AddStudentModal';

interface StudentsViewProps {
    school: School;
    refreshData: () => Promise<void>;
}

const StudentsView: React.FC<StudentsViewProps> = ({ school, refreshData }) => {
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
    const [isAddModalOpen, setAddModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterClass, setFilterClass] = useState('all');

    const uniqueClasses = useMemo(() => ['all', ...Array.from(new Set(school.students.map(s => s.class)))], [school.students]);

    const filteredStudents = useMemo(() => {
        return school.students.filter(student => {
            const searchLower = searchTerm.toLowerCase();
            const classMatch = filterClass === 'all' || student.class === filterClass;
            const searchMatch = !searchLower || 
                student.name.toLowerCase().includes(searchLower) ||
                student.admissionNumber.toLowerCase().includes(searchLower);
            return classMatch && searchMatch;
        }).sort((a,b) => a.name.localeCompare(b.name));
    }, [school.students, searchTerm, filterClass]);

    const handleAddStudent = async (studentData: NewStudentData) => {
         const newStudent: Omit<Student, 'id'> = {
            name: studentData.name,
            class: studentData.class,
            dateOfBirth: studentData.dateOfBirth,
            parentName: studentData.parentName,
            parentEmail: studentData.parentEmail,
            parentPhone: studentData.parentPhone,
            admissionNumber: `ADM${Date.now().toString().slice(-5)}`,
            parentRelationship: studentData.parentRelationship,
            preferredPaymentMethod: studentData.preferredPaymentMethod,
            totalFees: 0, // Will be calculated based on fees
            amountPaid: 0,
            outstandingFees: 0,
            lastPaymentDate: null,
            debtRisk: RiskLevel.Low,
            fees: [],
            payments: [],
            discounts: [],
        };
        
        try {
            const createdStudent = await addStudentService(school.id, newStudent);
            await refreshData();
            setSelectedStudent(createdStudent);
        } catch (error) {
            console.error("Failed to add student:", error);
            alert("Could not add the new student. Please try again.");
        }
    };

    return (
        <div className="flex flex-col lg:flex-row h-full gap-6">
            <div className={`transition-all duration-300 w-full ${selectedStudent ? 'lg:w-2/3' : 'lg:w-full'}`}>
                <div className="card bg-base-100 shadow h-full">
                    <div className="card-body">
                      <div className="flex justify-between items-center mb-4 flex-wrap gap-4">
                          <div>
                              <h3 className="card-title text-secondary">All Students ({school.students.length})</h3>
                          </div>
                          <button onClick={() => setAddModalOpen(true)} className="btn btn-primary btn-sm">
                              Add New Student
                          </button>
                      </div>
                       <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                          <input
                              type="text"
                              placeholder="Search by name or admission no..."
                              value={searchTerm}
                              onChange={e => setSearchTerm(e.target.value)}
                              className="input input-bordered md:col-span-2 w-full"
                          />
                          <select value={filterClass} onChange={e => setFilterClass(e.target.value)} className="select select-bordered w-full">
                              {uniqueClasses.map(c => <option key={c} value={c}>{c === 'all' ? 'All Classes' : c}</option>)}
                          </select>
                      </div>
                      <div className="flex-grow overflow-y-auto -mx-6 -mb-6">
                          <AllStudentsTable 
                              students={filteredStudents} 
                              selectedStudent={selectedStudent} 
                              onSelectStudent={setSelectedStudent} 
                          />
                      </div>
                    </div>
                </div>
            </div>
            {selectedStudent && (
                 <div className="w-full lg:w-1/3 flex-shrink-0 animate-fade-in">
                    <StudentDetailsPane 
                        student={selectedStudent}
                        schoolId={school.id}
                        onClose={() => setSelectedStudent(null)} 
                        refreshData={refreshData}
                    />
                </div>
            )}
            {isAddModalOpen && (
                <AddStudentModal 
                    school={school} 
                    onClose={() => setAddModalOpen(false)} 
                    onAddStudent={handleAddStudent} 
                />
            )}
        </div>
    );
};

export default StudentsView;