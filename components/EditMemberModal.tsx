import React, { useState, useEffect } from 'react';
import { TeamMember } from '../types.ts';
import { ALL_SCHOOL_CLASSES } from '../services/constants.ts';
import ModalHeader from './ModalHeader.tsx';

export interface MemberData {
    name: string;
    email: string;
    role: string;
    assignedClasses?: string[];
}

interface EditMemberModalProps {
  member: TeamMember | null;
  onClose: () => void;
  onSave: (data: MemberData, memberId?: string) => void;
}

const EditMemberModal: React.FC<EditMemberModalProps> = ({ member, onClose, onSave }) => {
  const [formData, setFormData] = useState<MemberData>({
    name: '',
    email: '',
    role: 'Teacher',
    assignedClasses: [],
  });

  useEffect(() => {
    if (member) {
      setFormData({
        name: member.name,
        email: member.email,
        role: member.role,
        assignedClasses: member.assignedClasses || [],
      });
    }
  }, [member]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const isTeacher = name === 'role' ? value === 'Teacher' : formData.role === 'Teacher';
    setFormData(prev => ({ 
        ...prev, 
        [name]: value,
        assignedClasses: isTeacher ? prev.assignedClasses : [] // Clear classes if role is not Teacher
    }));
  };
  
  const handleClassToggle = (className: string) => {
      setFormData(prev => {
          const newClasses = new Set(prev.assignedClasses);
          if (newClasses.has(className)) {
              newClasses.delete(className);
          } else {
              newClasses.add(className);
          }
          return { ...prev, assignedClasses: Array.from(newClasses) };
      });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData, member?.id);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
        <form onSubmit={handleSubmit}>
          <ModalHeader title={member ? 'Edit Staff Member' : 'Add Staff Member'} onClose={onClose} />
          <div className="p-6 space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">Full Name</label>
              <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address</label>
              <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
            </div>
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700">Role</label>
              <input type="text" id="role" name="role" value={formData.role} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
            </div>
            {formData.role === 'Teacher' && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Assigned Classes</label>
                <div className="mt-2 p-2 border rounded-md grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
                    {ALL_SCHOOL_CLASSES.map(c => (
                        <label key={c} className="flex items-center space-x-2 text-sm p-1 hover:bg-gray-50 rounded-md cursor-pointer">
                            <input
                                type="checkbox"
                                checked={formData.assignedClasses?.includes(c)}
                                onChange={() => handleClassToggle(c)}
                                className="rounded text-primary focus:ring-primary/50"
                            />
                            <span>{c}</span>
                        </label>
                    ))}
                </div>
              </div>
            )}
          </div>
          <div className="px-6 py-4 bg-gray-50 flex justify-end space-x-3">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-white text-sm font-medium text-gray-700 border border-gray-300 rounded-md shadow-sm hover:bg-gray-50">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-primary text-sm font-medium text-white border border-transparent rounded-md shadow-sm hover:bg-green-700">Save Changes</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditMemberModal;