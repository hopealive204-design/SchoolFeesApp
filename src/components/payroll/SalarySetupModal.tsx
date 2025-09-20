
import React, { useState } from 'react';
import { TeamMember, SalaryInfo, Allowance, Deduction } from '../../types.ts';
import { updateTeamMember } from '../../services/schoolService.ts';
import ModalHeader from '../ModalHeader.tsx';

interface SalarySetupModalProps {
  member: TeamMember;
  onClose: () => void;
  refreshData: () => Promise<void>;
}

const SalarySetupModal: React.FC<SalarySetupModalProps> = ({ member, onClose, refreshData }) => {
  const [salaryInfo, setSalaryInfo] = useState<SalaryInfo>(
    member.salaryInfo || { baseSalary: 0, allowances: [], deductions: [], payslips: [] }
  );
  
  const handleBaseSalaryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setSalaryInfo(prev => ({ ...prev, baseSalary: Number(e.target.value) }));
  };
  
  const handleItemChange = (
      type: 'allowances' | 'deductions',
      index: number,
      field: 'name' | 'amount',
      value: string
  ) => {
      setSalaryInfo(prev => {
          const newItems = [...prev[type]];
          newItems[index] = { ...newItems[index], [field]: field === 'amount' ? Number(value) : value };
          return { ...prev, [type]: newItems };
      });
  };

  const addItem = (type: 'allowances' | 'deductions') => {
       const newItem: Allowance | Deduction = {
           id: `${type.slice(0, 3)}_${Date.now()}`,
           type: type === 'allowances' ? 'allowance' : 'deduction',
           name: '',
           amount: 0
       };
       setSalaryInfo(prev => ({ ...prev, [type]: [...prev[type], newItem] }));
  };

  const removeItem = (type: 'allowances' | 'deductions', index: number) => {
      setSalaryInfo(prev => ({ ...prev, [type]: prev[type].filter((_, i) => i !== index) }));
  };
  
  const handleSave = async () => {
    try {
        await updateTeamMember(member.id, { salaryInfo });
        await refreshData();
        onClose();
    } catch (error) {
        console.error("Failed to save salary info:", error);
        alert("Could not save salary information. Please try again.");
    }
  };

  const totalAllowances = salaryInfo.allowances.reduce((sum, a) => sum + a.amount, 0);
  const totalDeductions = salaryInfo.deductions.reduce((sum, d) => sum + d.amount, 0);
  const grossSalary = salaryInfo.baseSalary + totalAllowances;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl transform transition-all max-h-[90vh] flex flex-col">
        <ModalHeader title={`Salary Setup for ${member.name}`} onClose={onClose} />
        <div className="p-6 flex-grow overflow-y-auto space-y-6">
            <div>
                <label htmlFor="baseSalary" className="block text-sm font-medium text-gray-700">Monthly Base Salary (₦)</label>
                <input type="number" id="baseSalary" value={salaryInfo.baseSalary} onChange={handleBaseSalaryChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ItemSection type="allowances" items={salaryInfo.allowances} onChange={handleItemChange} onAdd={addItem} onRemove={removeItem} />
                <ItemSection type="deductions" items={salaryInfo.deductions} onChange={handleItemChange} onAdd={addItem} onRemove={removeItem} />
            </div>

             <div className="p-4 bg-gray-50 border rounded-lg space-y-2">
                <div className="flex justify-between font-semibold"><p>Gross Salary:</p><p className="font-mono">₦{grossSalary.toLocaleString()}</p></div>
                <p className="text-xs text-gray-500">Net salary will be calculated during the payroll run, after statutory deductions (PAYE, Pension) are applied.</p>
            </div>
        </div>
        <div className="px-6 py-4 bg-gray-50 flex justify-end space-x-3">
          <button type="button" onClick={onClose} className="px-4 py-2 bg-white text-sm font-medium text-gray-700 border border-gray-300 rounded-md shadow-sm hover:bg-gray-50">Cancel</button>
          <button type="button" onClick={handleSave} className="px-4 py-2 bg-primary text-sm font-medium text-white border border-transparent rounded-md shadow-sm hover:bg-green-700">Save Salary</button>
        </div>
      </div>
    </div>
  );
};


const ItemSection: React.FC<{
    type: 'allowances' | 'deductions',
    items: (Allowance | Deduction)[],
    onChange: (type: any, index: number, field: any, value: any) => void,
    onAdd: (type: any) => void,
    onRemove: (type: any, index: number) => void
}> = ({ type, items, onChange, onAdd, onRemove }) => (
    <div className="space-y-3">
        <h4 className="font-semibold capitalize text-secondary">{type}</h4>
        {items.map((item, index) => (
            <div key={item.id} className="grid grid-cols-3 gap-2 items-center">
                <input type="text" placeholder="Name" value={item.name} onChange={(e) => onChange(type, index, 'name', e.target.value)} className="col-span-2 rounded-md border-gray-300 sm:text-sm"/>
                <input type="number" placeholder="Amount" value={item.amount} onChange={(e) => onChange(type, index, 'amount', e.target.value)} className="rounded-md border-gray-300 sm:text-sm"/>
                 <button type="button" onClick={() => onRemove(type, index)} className="col-start-3 justify-self-end text-xs text-red-500 hover:underline">Remove</button>
            </div>
        ))}
         <button type="button" onClick={() => onAdd(type)} className="text-sm font-semibold text-primary hover:text-green-700">+ Add {type === 'allowances' ? 'Allowance' : 'Deduction'}</button>
    </div>
);


export default SalarySetupModal;
