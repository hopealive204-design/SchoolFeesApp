import React, { useState } from 'react';
import { School, FeeDefinition } from '../types';
import { updateSchool } from '../services/schoolService';
import { ALL_SCHOOL_CLASSES } from '../services/constants';
import ModalHeader from './ModalHeader';

interface FeeStructureSettingsProps {
    school: School;
    refreshData: () => Promise<void>;
}

const FeeDefinitionModal: React.FC<{
    definition: FeeDefinition | null;
    onClose: () => void;
    onSave: (definition: FeeDefinition) => void;
}> = ({ definition, onClose, onSave }) => {
    const [name, setName] = useState(definition?.name || '');
    const [amounts, setAmounts] = useState<Record<string, { amount: string, type: 'mandatory' | 'optional' }>>(() => {
        const initial: Record<string, { amount: string, type: 'mandatory' | 'optional' }> = {};
        ALL_SCHOOL_CLASSES.forEach(c => {
            const existing = definition?.amounts.find(a => a.class === c);
            initial[c] = { amount: existing?.amount.toString() || '', type: existing?.type || 'mandatory' };
        });
        return initial;
    });

    const handleAmountChange = (className: string, value: string) => {
        setAmounts(prev => ({ ...prev, [className]: { ...prev[className], amount: value } }));
    };
    
    const handleTypeChange = (className: string, type: 'mandatory' | 'optional') => {
        setAmounts(prev => ({ ...prev, [className]: { ...prev[className], type } }));
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const finalAmounts = Object.entries(amounts)
            .map(([className, {amount, type}]: [string, {amount: string, type: 'mandatory' | 'optional'}]) => ({ class: className, amount: Number(amount) || 0, type }))
            .filter(a => a.amount > 0);

        const finalDefinition: FeeDefinition = {
            id: definition?.id || `fee_${Date.now()}`,
            name,
            amounts: finalAmounts,
        };
        onSave(finalDefinition);
    };

    return (
         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
                <ModalHeader title={definition ? 'Edit Fee Item' : 'Create New Fee Item'} onClose={onClose} />
                <div className="p-6 overflow-y-auto space-y-4">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">Fee Name</label>
                        <input type="text" id="name" value={name} onChange={e => setName(e.target.value)} placeholder="e.g., Tuition Fees" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
                    </div>
                    <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Set Amounts per Class</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {ALL_SCHOOL_CLASSES.map(className => (
                                <div key={className}>
                                    <label htmlFor={`amount-${className}`} className="block text-xs font-medium text-gray-600">{className}</label>
                                    <div className="mt-1 flex gap-2">
                                        <input
                                            type="number"
                                            id={`amount-${className}`}
                                            value={amounts[className].amount}
                                            onChange={e => handleAmountChange(className, e.target.value)}
                                            placeholder="0"
                                            className="block w-full rounded-md border-gray-300 shadow-sm sm:text-sm"
                                        />
                                        <select value={amounts[className].type} onChange={e => handleTypeChange(className, e.target.value as any)} className="block rounded-md border-gray-300 shadow-sm sm:text-sm">
                                            <option value="mandatory">Mandatory</option>
                                            <option value="optional">Optional</option>
                                        </select>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="px-6 py-4 bg-gray-50 flex justify-end space-x-3"><button type="button" onClick={onClose} className="px-4 py-2 bg-white text-sm font-medium text-gray-700 border border-gray-300 rounded-md shadow-sm hover:bg-gray-50">Cancel</button><button type="submit" className="px-4 py-2 bg-primary text-sm font-medium text-white border border-transparent rounded-md shadow-sm hover:bg-green-700">Save Definition</button></div>
            </form>
        </div>
    );
};

const FeeStructureSettings: React.FC<FeeStructureSettingsProps> = ({ school, refreshData }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingDefinition, setEditingDefinition] = useState<FeeDefinition | null>(null);

    const handleOpenModal = (def: FeeDefinition | null = null) => {
        setEditingDefinition(def);
        setIsModalOpen(true);
    };

    const handleSaveDefinition = async (definition: FeeDefinition) => {
        const newDefinitions = [...school.feeDefinitions];
        const existingIndex = newDefinitions.findIndex(d => d.id === definition.id);

        if (existingIndex > -1) {
            newDefinitions[existingIndex] = definition;
        } else {
            newDefinitions.push(definition);
        }
        
        try {
            await updateSchool(school.id, { feeDefinitions: newDefinitions });
            await refreshData();
            setIsModalOpen(false);
            setEditingDefinition(null);
        } catch (error) {
             console.error("Failed to save fee definition:", error);
             alert("Could not save fee structure. Please try again.");
        }
    };
    
    const handleDeleteDefinition = async (id: string) => {
        if(confirm("Are you sure you want to delete this fee item?")) {
            const newDefinitions = school.feeDefinitions.filter(d => d.id !== id);
             try {
                await updateSchool(school.id, { feeDefinitions: newDefinitions });
                await refreshData();
            } catch (error) {
                 console.error("Failed to delete fee definition:", error);
                 alert("Could not delete fee item. Please try again.");
            }
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="text-xl font-semibold text-secondary">Fee Structure</h3>
                    <p className="text-sm text-gray-500">Define all mandatory and optional fees for each class.</p>
                </div>
                 <button onClick={() => handleOpenModal()} className="btn btn-primary btn-sm">
                    Add Fee Item
                </button>
            </div>

            <div className="space-y-4">
                {school.feeDefinitions.map(def => (
                    <div key={def.id} className="collapse collapse-plus bg-base-200">
                        <input type="checkbox" /> 
                        <div className="collapse-title text-xl font-medium">
                           {def.name}
                        </div>
                        <div className="collapse-content"> 
                           <div className="p-4 grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                                {def.amounts.map(a => (
                                    <div key={a.class} className="flex justify-between p-2 rounded-md bg-base-100">
                                        <span className="font-medium text-gray-600">{a.class}</span>
                                        <span className="font-mono">₦{a.amount.toLocaleString()}</span>
                                    </div>
                                ))}
                            </div>
                             <div className="text-right mt-2">
                                <button onClick={() => handleOpenModal(def)} className="btn btn-ghost btn-xs">Edit</button>
                                <button onClick={() => handleDeleteDefinition(def.id)} className="btn btn-ghost btn-xs text-error">Delete</button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            {isModalOpen && <FeeDefinitionModal definition={editingDefinition} onClose={() => setIsModalOpen(false)} onSave={handleSaveDefinition} />}
        </div>
    );
};

export default FeeStructureSettings;