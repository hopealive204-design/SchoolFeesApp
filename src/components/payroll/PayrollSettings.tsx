import React, { useState } from 'react';
import { School, PayrollSettings, PayeBracket } from '../../types';
import { updateSchool } from '../../services/schoolService';

interface PayrollSettingsProps {
    school: School;
    refreshData: () => Promise<void>;
}

const PayrollSettings: React.FC<PayrollSettingsProps> = ({ school, refreshData }) => {
    const [settings, setSettings] = useState<PayrollSettings>(school.payrollSettings);

    const handleRateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSettings(prev => ({ ...prev, employeePensionRate: Number(e.target.value) / 100 }));
    };

    const handleBracketChange = (index: number, field: keyof PayeBracket, value: string) => {
        const newBrackets = [...settings.payeBrackets];
        const numValue = Number(value);
        if (field === 'rate') {
             newBrackets[index][field] = numValue / 100;
        } else {
             newBrackets[index][field] = numValue;
        }
        setSettings(prev => ({ ...prev, payeBrackets: newBrackets }));
    };
    
    const handleSaveChanges = async () => {
        try {
            await updateSchool(school.id, { payrollSettings: settings });
            await refreshData();
            alert('Payroll settings saved!');
        } catch (error) {
            console.error("Failed to save payroll settings:", error);
            alert("Could not save settings. Please try again.");
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-xl font-semibold text-secondary">Payroll Settings</h3>
                <p className="text-sm text-gray-500">Configure statutory deductions for accurate salary calculations.</p>
            </div>

            <div className="border border-base-300 rounded-lg p-4 space-y-4 lg:w-2/3">
                 <div>
                    <label htmlFor="pension-rate" className="block text-sm font-medium text-gray-700">Employee Pension Contribution Rate (%)</label>
                    <input
                        type="number"
                        id="pension-rate"
                        value={settings.employeePensionRate * 100}
                        onChange={handleRateChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                    />
                </div>
            </div>
            
            <div className="border border-base-300 rounded-lg p-4 space-y-4 lg:w-2-3">
                <h4 className="text-lg font-medium text-gray-900">PAYE Tax Brackets (Annual)</h4>
                <div className="space-y-2">
                    {settings.payeBrackets.map((bracket, index) => (
                        <div key={index} className="grid grid-cols-2 gap-4 items-center">
                            <div>
                                <label className="block text-xs font-medium text-gray-600">Taxable up to (₦)</label>
                                <input 
                                    type="number" 
                                    value={isFinite(bracket.upTo) ? bracket.upTo : ''}
                                    placeholder="And above"
                                    disabled={!isFinite(bracket.upTo)}
                                    onChange={e => handleBracketChange(index, 'upTo', e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm"
                                />
                            </div>
                             <div>
                                <label className="block text-xs font-medium text-gray-600">Rate (%)</label>
                                <input 
                                    type="number" 
                                    value={bracket.rate * 100}
                                    onChange={e => handleBracketChange(index, 'rate', e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm"
                                />
                            </div>
                        </div>
                    ))}
                </div>
                <p className="text-xs text-gray-500">Note: Brackets are cumulative. The final bracket should have an empty "Taxable up to" field to represent infinity.</p>
            </div>
             <div className="flex justify-end border-t pt-4">
                <button 
                    onClick={handleSaveChanges} 
                    className="btn btn-primary"
                >
                    Save Payroll Settings
                </button>
            </div>
        </div>
    );
};

export default PayrollSettings;