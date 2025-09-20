import React, { useState, useMemo } from 'react';
import { Student } from '../types.ts';
import { ALL_SCHOOL_CLASSES } from '../services/constants.ts';
import ModalHeader from './ModalHeader.tsx';

interface PromoteStudentsModalProps {
    students: Student[];
    onClose: () => void;
    onPromote: (promotions: { studentId: string, toClass: string }[]) => void;
}

const getNextClass = (currentClass: string): string => {
    const currentIndex = ALL_SCHOOL_CLASSES.indexOf(currentClass);
    if (currentIndex === -1 || currentIndex === ALL_SCHOOL_CLASSES.length - 1) {
        return 'Graduated';
    }
    return ALL_SCHOOL_CLASSES[currentIndex + 1];
};

const PromoteStudentsModal: React.FC<PromoteStudentsModalProps> = ({ students, onClose, onPromote }) => {
    const [isComplete, setIsComplete] = useState(false);
    
    const studentsByClass = useMemo(() => {
        return students.reduce((acc, student) => {
            if (!acc[student.class]) {
                acc[student.class] = [];
            }
            acc[student.class].push(student);
            return acc;
        }, {} as Record<string, Student[]>);
    }, [students]);

    const sortedClasses = useMemo(() => Object.keys(studentsByClass).sort((a, b) => {
        const aIndex = ALL_SCHOOL_CLASSES.indexOf(a);
        const bIndex = ALL_SCHOOL_CLASSES.indexOf(b);
        if (aIndex === -1) return 1;
        if (bIndex === -1) return -1;
        return aIndex - bIndex;
    }), [studentsByClass]);

    const [promotions, setPromotions] = useState<Record<string, { toClass: string, selected: Set<string>}>>(() => {
        return sortedClasses.reduce((acc: Record<string, { toClass: string, selected: Set<string>}>, className) => {
            acc[className] = {
                toClass: getNextClass(className),
                selected: new Set<string>(),
            };
            return acc;
        }, {} as Record<string, { toClass: string, selected: Set<string>}>)
    });

    const handleClassTargetChange = (fromClass: string, toClass: string) => {
        setPromotions(prev => ({ ...prev, [fromClass]: { ...prev[fromClass], toClass } }));
    };

    const handleStudentSelect = (fromClass: string, studentId: string) => {
        setPromotions(prev => {
            const newSelected = new Set(prev[fromClass].selected);
            if (newSelected.has(studentId)) {
                newSelected.delete(studentId);
            } else {
                newSelected.add(studentId);
            }
            return { ...prev, [fromClass]: { ...prev[fromClass], selected: newSelected } };
        });
    };
    
    const handleSelectAll = (fromClass: string, studentIds: string[]) => {
        setPromotions(prev => {
            const currentSelected = prev[fromClass].selected;
            const allSelected = currentSelected.size === studentIds.length;
            const newSelected = allSelected ? new Set<string>() : new Set(studentIds);
            return { ...prev, [fromClass]: { ...prev[fromClass], selected: newSelected } };
        });
    };
    
    const totalSelected = useMemo(() => {
        return Object.values(promotions).reduce((sum: number, promo: { selected: Set<string> }) => sum + promo.selected.size, 0);
    }, [promotions]);

    const handleSubmit = () => {
        const finalPromotions: { studentId: string, toClass: string }[] = [];
        Object.values(promotions).forEach((promo: { selected: Set<string>, toClass: string }) => {
            promo.selected.forEach(studentId => {
                finalPromotions.push({ studentId, toClass: promo.toClass });
            });
        });
        if (finalPromotions.length === 0) {
            alert("No students selected for promotion.");
            return;
        }
        onPromote(finalPromotions);
        setIsComplete(true);
        setTimeout(() => {
            onClose();
        }, 2000); // Close modal after 2 seconds
    };

    const targetClassOptions = [...ALL_SCHOOL_CLASSES, 'Graduated', 'Repeat Class'];

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 p-4 overflow-y-auto" role="dialog" aria-modal="true" aria-labelledby="promote-students-title">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl my-8 mx-auto transform transition-all">
                 {isComplete ? (
                    <div className="flex flex-col items-center justify-center p-12 animate-fade-in">
                        <svg className="w-24 h-24 animate-scale-in" viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="26" cy="26" r="25" stroke="#22C55E" strokeWidth="2"/>
                            <path className="checkmark__check" d="M14 27L22 35L38 17" stroke="#22C55E" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                        </svg>
                        <h3 id="promote-students-title" className="text-2xl font-semibold text-secondary mt-4">Promotion Complete!</h3>
                        <p className="text-gray-500 mt-1">{totalSelected} student(s) have been successfully promoted.</p>
                    </div>
                ) : (
                    <>
                        <ModalHeader 
                            title="Promote Students"
                            subtitle="Select students to promote to the next class for the new session."
                            onClose={onClose}
                        />
                        <div className="p-6 space-y-4">
                            {sortedClasses.length > 0 ? sortedClasses.map(className => {
                                const classStudents = studentsByClass[className];
                                const classPromo = promotions[className];
                                const isAllSelected = classPromo.selected.size > 0 && classPromo.selected.size === classStudents.length;
                                return (
                                    <details key={className} className="border rounded-lg group" open>
                                        <summary className="p-4 cursor-pointer font-semibold text-lg flex justify-between items-center bg-gray-50 rounded-lg group-open:rounded-b-none hover:bg-gray-100 transition-colors">
                                            <div className="flex items-center">
                                                <span>{className} <span className="font-normal text-gray-600">({classStudents.length} students)</span></span>
                                                 <svg className="w-5 h-5 ml-2 text-gray-400 transform transition-transform group-open:rotate-180" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                                            </div>
                                            <div className="flex items-center space-x-2 text-base">
                                                <label htmlFor={`promote-to-${className}`} className="font-medium text-sm text-gray-700">Promote to:</label>
                                                <select
                                                    id={`promote-to-${className}`}
                                                    value={classPromo.toClass === 'Repeat Class' ? className : classPromo.toClass}
                                                    onClick={(e) => e.stopPropagation()}
                                                    onChange={(e) => handleClassTargetChange(className, e.target.value)}
                                                    className="text-sm rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                                                >
                                                    {targetClassOptions.map(opt => {
                                                        const value = opt === 'Repeat Class' ? className : opt;
                                                        return <option key={value} value={value}>{opt}</option>
                                                    })}
                                                </select>
                                            </div>
                                        </summary>
                                        <div className="p-2 border-t">
                                            <div className="overflow-x-auto">
                                                <table className="w-full text-sm text-left text-gray-600">
                                                    <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                                                        <tr>
                                                            <th scope="col" className="p-4">
                                                                <input type="checkbox" aria-label={`Select all students in ${className}`} checked={isAllSelected} onChange={() => handleSelectAll(className, classStudents.map(s => s.id))} className="w-4 h-4 text-primary bg-gray-100 border-gray-300 rounded focus:ring-primary" />
                                                            </th>
                                                            <th scope="col" className="px-6 py-3">Student Name</th>
                                                            <th scope="col" className="px-6 py-3">Outstanding Fees</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {classStudents.map(student => (
                                                            <tr key={student.id} className="bg-white border-b hover:bg-gray-50">
                                                                <td className="w-4 p-4">
                                                                    <input type="checkbox" aria-label={`Select student ${student.name}`} checked={classPromo.selected.has(student.id)} onChange={() => handleStudentSelect(className, student.id)} className="w-4 h-4 text-primary bg-gray-100 border-gray-300 rounded focus:ring-primary" />
                                                                </td>
                                                                <td className="px-6 py-4 font-medium text-gray-900">{student.name}</td>
                                                                <td className="px-6 py-4 font-mono text-red-600">₦{student.outstandingFees.toLocaleString()}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </details>
                                )
                            }) : (
                                <div className="text-center py-8 text-gray-500">No students available for promotion.</div>
                            )}
                        </div>
                        <div className="px-6 py-4 bg-gray-50 flex justify-between items-center flex-shrink-0 border-t">
                            <p className="text-sm font-semibold text-secondary">{totalSelected} student(s) selected.</p>
                            <div className="flex space-x-3">
                                <button type="button" onClick={onClose} className="px-4 py-2 bg-white text-sm font-medium text-gray-700 border border-gray-300 rounded-md shadow-sm hover:bg-gray-50">Cancel</button>
                                <button type="button" onClick={handleSubmit} className="px-4 py-2 bg-primary text-sm font-medium text-white border border-transparent rounded-md shadow-sm hover:bg-green-700 disabled:bg-gray-400" disabled={totalSelected === 0}>
                                    Confirm & Promote {totalSelected > 0 ? totalSelected : ''}
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default PromoteStudentsModal;
