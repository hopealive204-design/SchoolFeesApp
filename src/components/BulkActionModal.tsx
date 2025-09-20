import React, { useState } from 'react';
import { School, Student } from '../types.ts';
import ModalHeader from './ModalHeader.tsx';

interface BulkActionModalProps {
  school: School;
  students: Student[];
  onClose: () => void;
}

const BulkActionModal: React.FC<BulkActionModalProps> = ({ school, students, onClose }) => {
  const [message, setMessage] = useState(school.smsSettings.reminderTemplate);
  const [selectedStudents, setSelectedStudents] = useState<Set<string>>(() => new Set(students.map(s => s.id)));

  const handleSelectStudent = (studentId: string) => {
    setSelectedStudents(prev => {
      const newSet = new Set(prev);
      if (newSet.has(studentId)) {
        newSet.delete(studentId);
      } else {
        newSet.add(studentId);
      }
      return newSet;
    });
  };

  const handleSend = () => {
    if (selectedStudents.size === 0) {
      alert('Please select at least one student.');
      return;
    }
    alert(`SIMULATION: Sending SMS reminders to ${selectedStudents.size} parents.`);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col">
        <ModalHeader title="Send Bulk Reminders" onClose={onClose} />
        <div className="p-6 flex-grow grid md:grid-cols-2 gap-6 overflow-y-auto">
          <div className="space-y-4">
            <h4 className="font-semibold text-secondary">Compose Message</h4>
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700">SMS Template</label>
              <textarea
                id="message"
                rows={8}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
              />
              <p className="mt-2 text-xs text-gray-500">
                Placeholders: {'{student_name}, {parent_name}, {outstanding_amount}, {school_name}'}
              </p>
            </div>
          </div>
          <div className="border rounded-lg overflow-hidden flex flex-col">
            <div className="p-2 bg-gray-50 border-b">
              <h4 className="font-semibold text-sm">Recipients ({selectedStudents.size}/{students.length})</h4>
            </div>
            <div className="overflow-y-auto">
              {students.map(student => (
                <label key={student.id} className="flex items-center space-x-3 p-3 border-b cursor-pointer hover:bg-gray-50">
                  <input
                    type="checkbox"
                    checked={selectedStudents.has(student.id)}
                    onChange={() => handleSelectStudent(student.id)}
                    className="w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary"
                  />
                  <div className="text-sm">
                    <p className="font-medium text-gray-800">{student.name}</p>
                    <p className="text-xs text-gray-500">{student.parentName} - <span className="font-mono text-red-600">₦{student.outstandingFees.toLocaleString()}</span></p>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>
        <div className="px-6 py-4 bg-gray-50 flex justify-end space-x-3">
          <button type="button" onClick={onClose} className="btn btn-ghost">Cancel</button>
          <button type="button" onClick={handleSend} className="btn btn-primary">
            Send to {selectedStudents.size} Parents
          </button>
        </div>
      </div>
    </div>
  );
};

export default BulkActionModal;
