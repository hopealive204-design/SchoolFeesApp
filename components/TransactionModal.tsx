import React, { useState } from 'react';
import { Income, Expenditure } from '../types.ts';

type Transaction = Income | Expenditure;

interface TransactionModalProps {
  schoolId: string;
  config: {
      type: 'income' | 'expenditure';
      data?: Transaction;
  }
  onClose: () => void;
  onSave: (transaction: Transaction) => void;
}

const incomeCategories: Income['category'][] = ['Donation', 'Grant', 'Facility Rental', 'Other'];
const expenditureCategories: Expenditure['category'][] = ['Salaries', 'Utilities', 'Supplies', 'Maintenance', 'Other'];

const TransactionModal: React.FC<TransactionModalProps> = ({ schoolId, config, onClose, onSave }) => {
  const { type, data } = config;
  
  const [description, setDescription] = useState(data?.description || '');
  const [amount, setAmount] = useState<string>(data?.amount.toString() || '');
  const [date, setDate] = useState<string>(data?.date ? new Date(data.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]);
  const [category, setCategory] = useState(data?.category || (type === 'income' ? incomeCategories[0] : expenditureCategories[0]));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (!description.trim() || isNaN(numAmount) || numAmount <= 0) {
      alert('Please fill in all fields with valid values.');
      return;
    }
    
    const transactionData = {
        id: data?.id || `${type === 'income' ? 'inc' : 'exp'}_${schoolId}_${Date.now()}`,
        description,
        amount: numAmount,
        date,
        category,
    };
    
    onSave(transactionData as Transaction);
  };
  
  const categories = type === 'income' ? incomeCategories : expenditureCategories;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" role="dialog" aria-modal="true">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md transform transition-all">
        <form onSubmit={handleSubmit}>
          <div className="p-6 border-b">
            <h3 className="text-xl font-semibold text-secondary capitalize">{data ? 'Edit' : 'Add'} {type}</h3>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
              <input type="text" id="description" value={description} onChange={(e) => setDescription(e.target.value)} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"/>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="amount" className="block text-sm font-medium text-gray-700">Amount (₦)</label>
                  <input type="number" id="amount" value={amount} onChange={(e) => setAmount(e.target.value)} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"/>
                </div>
                <div>
                    <label htmlFor="date" className="block text-sm font-medium text-gray-700">Date</label>
                    <input type="date" id="date" value={date} onChange={(e) => setDate(e.target.value)} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"/>
                </div>
            </div>
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700">Category</label>
              <select id="category" value={category} onChange={(e) => setCategory(e.target.value as Income['category'] | Expenditure['category'])} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm">
                {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>
          </div>
          <div className="px-6 py-4 bg-gray-50 flex justify-end space-x-3">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-white text-sm font-medium text-gray-700 border border-gray-300 rounded-md shadow-sm hover:bg-gray-50">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-primary text-sm font-medium text-white border border-transparent rounded-md shadow-sm hover:bg-green-700">Save Record</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TransactionModal;