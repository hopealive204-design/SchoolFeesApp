

import React, { useState, useMemo } from 'react';
import ModalHeader from './ModalHeader.tsx';

interface InstallmentPlanModalProps {
  totalAmount: number;
  onClose: () => void;
  onSave: (installments: { amount: number, dueDate: string }[]) => void;
}

const InstallmentPlanModal: React.FC<InstallmentPlanModalProps> = ({ totalAmount, onClose, onSave }) => {
  const [numInstallments, setNumInstallments] = useState(2);

  const installmentPlan = useMemo(() => {
    if (numInstallments <= 0) return [];
    const amountPerInstallment = Math.ceil((totalAmount / numInstallments) / 100) * 100; // Round up to nearest 100
    const plan = [];
    let remaining = totalAmount;
    const today = new Date();

    for (let i = 0; i < numInstallments; i++) {
        const amount = (i === numInstallments - 1) ? remaining : Math.min(amountPerInstallment, remaining);
        if (amount <= 0) break;

        const dueDate = new Date(today);
        dueDate.setMonth(today.getMonth() + i + 1);
        
        plan.push({
            amount: amount,
            dueDate: dueDate.toLocaleDateString(),
        });
        remaining -= amount;
    }
    return plan;
  }, [totalAmount, numInstallments]);
  
  const handleSubmit = () => {
      onSave(installmentPlan);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" role="dialog" aria-modal="true">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg transform transition-all">
        <ModalHeader 
          title="Request an Installment Plan"
          subtitle={`Split your outstanding balance of ₦${totalAmount.toLocaleString()} into multiple payments.`}
          onClose={onClose}
        />
        <div className="p-6 space-y-4">
          <div>
            <label htmlFor="installments" className="block text-sm font-medium text-gray-700">How many payments would you like to make?</label>
            <div className="mt-2 flex items-center space-x-4">
                <input
                    type="range"
                    id="installments"
                    min="2"
                    max="6"
                    value={numInstallments}
                    onChange={(e) => setNumInstallments(parseInt(e.target.value, 10))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <span className="font-bold text-lg text-primary w-12 text-center">{numInstallments}</span>
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-gray-800">Proposed Payment Schedule</h4>
            <div className="mt-2 space-y-2 border rounded-lg p-3">
                {installmentPlan.map((inst, index) => (
                    <div key={index} className="flex justify-between items-center text-sm p-2 bg-gray-50 rounded">
                        <span className="font-medium">Payment {index + 1}</span>
                        <div className="text-right">
                           <p className="font-mono font-semibold">₦{inst.amount.toLocaleString()}</p>
                           <p className="text-xs text-gray-500">Due by {inst.dueDate}</p>
                        </div>
                    </div>
                ))}
            </div>
             <p className="text-xs text-gray-500 mt-2">Please note: This is a request. The school administration will review and approve your proposed plan.</p>
          </div>
        </div>
        <div className="px-6 py-4 bg-gray-50 flex justify-end space-x-3">
          <button type="button" onClick={onClose} className="px-4 py-2 bg-white text-sm font-medium text-gray-700 border border-gray-300 rounded-md shadow-sm hover:bg-gray-50">Cancel</button>
          <button type="button" onClick={handleSubmit} className="px-4 py-2 bg-primary text-sm font-medium text-white border border-transparent rounded-md shadow-sm hover:bg-green-700">Request Plan</button>
        </div>
      </div>
    </div>
  );
};

export default InstallmentPlanModal;
