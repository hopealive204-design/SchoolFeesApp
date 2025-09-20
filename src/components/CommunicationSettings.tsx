import React, { useState } from 'react';
import { School } from '../types';
import { updateSchool } from '../services/schoolService';

interface CommunicationSettingsProps {
    school: School;
    refreshData: () => Promise<void>;
}

const CommunicationSettingsComponent: React.FC<CommunicationSettingsProps> = ({ school, refreshData }) => {
    const [settings, setSettings] = useState(school.communicationSettings);
    const placeholders = ['{parent_name}', '{student_name}', '{outstanding_amount}', '{school_name}'];

    const handleSettingChange = (path: string, value: any) => {
        const keys = path.split('.');
        setSettings(prev => {
            const newSettings = JSON.parse(JSON.stringify(prev)); // Deep copy
            let current = newSettings;
            for (let i = 0; i < keys.length - 1; i++) {
                current = current[keys[i]];
            }
            current[keys[keys.length - 1]] = value;
            return newSettings;
        });
    };

    const handleSave = async () => {
        try {
            await updateSchool(school.id, { communicationSettings: settings });
            await refreshData();
            alert('Communication settings saved!');
        } catch (error) {
            console.error("Failed to save communication settings:", error);
            alert("Could not save settings. Please try again.");
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-xl font-semibold text-secondary">Communication Settings</h3>
                <p className="text-sm text-gray-500">Manage automated and transactional messages sent to parents.</p>
            </div>

            <div className="border rounded-lg p-4 space-y-4">
                <h4 className="font-semibold text-lg">Automated Reminders</h4>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                    <span>Enable automated reminders for overdue fees</span>
                     <label className="flex items-center space-x-2 cursor-pointer">
                        <div className="relative">
                            <input type="checkbox" className="sr-only" checked={settings.automatedReminders.enabled} onChange={() => handleSettingChange('automatedReminders.enabled', !settings.automatedReminders.enabled)}/>
                            <div className={`block w-10 h-6 rounded-full ${settings.automatedReminders.enabled ? 'bg-primary' : 'bg-gray-300'}`}></div>
                            <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${settings.automatedReminders.enabled ? 'transform translate-x-4' : ''}`}></div>
                        </div>
                    </label>
                </div>
            </div>
            
            <div className="border rounded-lg p-4 space-y-4">
                <h4 className="font-semibold text-lg">Transactional Notifications</h4>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                    <span>Send confirmation upon successful payment</span>
                     <label className="flex items-center space-x-2 cursor-pointer">
                        <div className="relative">
                            <input type="checkbox" className="sr-only" checked={settings.transactionalNotifications.paymentConfirmation.enabled} onChange={() => handleSettingChange('transactionalNotifications.paymentConfirmation.enabled', !settings.transactionalNotifications.paymentConfirmation.enabled)}/>
                            <div className={`block w-10 h-6 rounded-full ${settings.transactionalNotifications.paymentConfirmation.enabled ? 'bg-primary' : 'bg-gray-300'}`}></div>
                            <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${settings.transactionalNotifications.paymentConfirmation.enabled ? 'transform translate-x-4' : ''}`}></div>
                        </div>
                    </label>
                </div>
                {settings.transactionalNotifications.paymentConfirmation.enabled && (
                    <div className="p-4 border-t space-y-4 animate-fade-in">
                        <h5 className="font-semibold text-secondary">Payment Confirmation Email Template</h5>
                        <div>
                            <label htmlFor="emailSubject" className="block text-sm font-medium text-gray-700">Email Subject</label>
                            <input
                                type="text"
                                id="emailSubject"
                                value={settings.transactionalNotifications.paymentConfirmation.emailSubject || ''}
                                onChange={(e) => handleSettingChange('transactionalNotifications.paymentConfirmation.emailSubject', e.target.value)}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                            />
                        </div>
                        <div>
                            <label htmlFor="emailTemplate" className="block text-sm font-medium text-gray-700">Email Body</label>
                            <textarea
                                id="emailTemplate"
                                rows={10}
                                value={settings.transactionalNotifications.paymentConfirmation.emailTemplate}
                                onChange={(e) => handleSettingChange('transactionalNotifications.paymentConfirmation.emailTemplate', e.target.value)}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm font-mono"
                            />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500">Available Placeholders:</p>
                            <div className="flex flex-wrap gap-2 mt-1">
                                {placeholders.map(p => (
                                    <code key={p} className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded">{p}</code>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div className="flex justify-end border-t pt-4">
                <button onClick={handleSave} className="btn btn-primary">
                    Save Communication Settings
                </button>
            </div>
        </div>
    );
};

export default CommunicationSettingsComponent;