

import React, { useState, useMemo, useEffect } from 'react';
import { School, Student } from '../types.ts';
import ModalHeader from './ModalHeader.tsx';

type ActionType = 'reminder' | 'receipt' | 'general';
interface CommunicationModalProps {
  school: School;
  action: {
      type: ActionType,
      title: string;
      students: Student[];
  },
  onClose: () => void;
}

const CommunicationModal: React.FC<CommunicationModalProps> = ({ school, action, onClose }) => {
    const [channel, setChannel] = useState<'sms' | 'email'>('sms');
    const [selectedStudents, setSelectedStudents] = useState<Set<string>>(() => new Set(action.students.map(s => s.id)));
    
    const [selectedTemplateId, setSelectedTemplateId] = useState<string>('custom');
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');

    const placeholders = "{student_name}, {parent_name}, {outstanding_amount}, {due_date}, {school_name}";

    const relevantTemplates = useMemo(() => {
        const smsTemplates = (school.smsSettings.manualTemplates || [])
            .filter(t => t.type === action.type)
            .map(t => ({ id: t.id, name: t.name, subject: '', body: t.body, channel: 'sms' }));
        
        const emailTemplates = school.communicationSettings.manualTemplates
             .filter(t => t.type === action.type)
             .map(t => ({ id: t.id, name: t.name, subject: t.subject, body: t.body, channel: 'email' }));
        
        // Also add the transactional email as a receipt template
        if (action.type === 'receipt') {
            const pa = school.communicationSettings.transactionalNotifications.paymentConfirmation;
            emailTemplates.unshift({ id: 'transactional_receipt', name: 'Default Payment Confirmation', subject: pa.emailSubject, body: pa.emailTemplate, channel: 'email' });
        }

        return [...smsTemplates, ...emailTemplates];
    }, [school, action.type]);
    
    useEffect(() => {
        // Set a default template when the modal opens or when channel changes
        const defaultTemplate = relevantTemplates.find(t => t.channel === channel);
        if (defaultTemplate) {
            setSelectedTemplateId(defaultTemplate.id);
            setSubject(defaultTemplate.subject);
            setMessage(defaultTemplate.body);
        } else {
            setSelectedTemplateId('custom');
            setSubject('');
            setMessage('');
        }
    }, [action.type, channel, relevantTemplates]);

    const handleTemplateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const templateId = e.target.value;
        setSelectedTemplateId(templateId);
        const template = relevantTemplates.find(t => t.id === templateId);
        if (template) {
            setSubject(template.subject);
            setMessage(template.body);
        } else {
            setSubject('');
            setMessage('');
        }
    };
    
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
            alert('Please select at least one recipient.');
            return;
        }
        if (!message || (channel === 'email' && !subject)) {
            alert('Message and subject (for email) cannot be empty.');
            return;
        }
        alert(`SIMULATION: Sending message via ${channel} to ${selectedStudents.size} parents.`);
        onClose();
    };

    return (
         <div className="fixed inset-0 bg-black bg-opacity-50 z-50 p-4 overflow-y-auto" role="dialog" aria-modal="true">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl my-8 mx-auto transform transition-all">
                <ModalHeader 
                    title={action.title}
                    subtitle="Compose and send your message to the selected parents."
                    onClose={onClose}
                />
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                         <div>
                            <label className="block text-sm font-medium text-gray-700">Channel</label>
                            <div className="mt-1 flex space-x-2 rounded-lg bg-gray-100 p-1">
                                <button onClick={() => setChannel('sms')} className={`w-full py-2 text-sm font-semibold rounded-md ${channel === 'sms' ? 'bg-white shadow text-primary' : 'text-gray-600'}`}>SMS</button>
                                <button onClick={() => setChannel('email')} className={`w-full py-2 text-sm font-semibold rounded-md ${channel === 'email' ? 'bg-white shadow text-primary' : 'text-gray-600'}`}>Email</button>
                            </div>
                        </div>
                        <div>
                            <label htmlFor="template-select" className="block text-sm font-medium text-gray-700">Template</label>
                             <select id="template-select" value={selectedTemplateId} onChange={handleTemplateChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm">
                                <option value="custom">-- Custom Message --</option>
                                {relevantTemplates.filter(t => t.channel === channel).map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                             </select>
                        </div>
                         {channel === 'email' && (
                            <div>
                                <label htmlFor="subject" className="block text-sm font-medium text-gray-700">Subject</label>
                                <input type="text" id="subject" value={subject} onChange={e => { setSubject(e.target.value); setSelectedTemplateId('custom'); }} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"/>
                            </div>
                        )}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Message Content</label>
                            <textarea
                                value={message}
                                onChange={e => { setMessage(e.target.value); setSelectedTemplateId('custom'); }}
                                rows={channel === 'email' ? 10 : 5}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                            />
                            <p className="mt-1 text-xs text-gray-500">Placeholders: <span className="font-mono">{placeholders}</span></p>
                        </div>
                    </div>
                    <div className="border rounded-lg overflow-hidden flex flex-col">
                        <div className="p-2 bg-gray-50 border-b">
                            <h4 className="font-semibold text-sm">Recipients ({selectedStudents.size}/{action.students.length})</h4>
                        </div>
                        <div className="overflow-y-auto">
                            {action.students.map(student => (
                                <label key={student.id} className="flex items-center space-x-3 p-3 border-b cursor-pointer hover:bg-gray-50">
                                    <input type="checkbox" checked={selectedStudents.has(student.id)} onChange={() => handleSelectStudent(student.id)} className="w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary"/>
                                    <div className="text-sm">
                                        <p className="font-medium text-gray-800">{student.name}</p>
                                        <p className="text-xs text-gray-500">{student.parentName} &middot; <span className="font-mono">{student.parentPhone}</span></p>
                                    </div>
                                </label>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="px-6 py-4 bg-gray-50 flex justify-end space-x-3 flex-shrink-0">
                    <button type="button" onClick={onClose} className="px-4 py-2 bg-white text-sm font-medium text-gray-700 border border-gray-300 rounded-md shadow-sm hover:bg-gray-50">Cancel</button>
                    <button type="button" onClick={handleSend} className="px-4 py-2 bg-primary text-sm font-medium text-white border border-transparent rounded-md shadow-sm hover:bg-green-700">Send to {selectedStudents.size} Parents</button>
                </div>
            </div>
        </div>
    );
};

export default CommunicationModal;
