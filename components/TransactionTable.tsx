import React from 'react';
import { Income, Expenditure } from '../types.ts';

type Transaction = Income | Expenditure;

interface TransactionTableProps {
  transactions: Transaction[];
  type: 'income' | 'expenditure';
  onEdit: (transaction: Transaction) => void;
  onDelete: (id: string) => void;
}

const TransactionTable: React.FC<TransactionTableProps> = ({ transactions, type, onEdit, onDelete }) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left text-gray-600">
        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3">Date</th>
            <th scope="col" className="px-6 py-3">Description</th>
            <th scope="col" className="px-6 py-3">Category</th>
            <th scope="col" className="px-6 py-3 text-right">Amount</th>
            <th scope="col" className="px-6 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((transaction) => (
            <tr key={transaction.id} className="bg-white border-b hover:bg-gray-50">
              <td className="px-6 py-4">{new Date(transaction.date).toLocaleDateString()}</td>
              <td className="px-6 py-4 font-medium text-gray-900">{transaction.description}</td>
              <td className="px-6 py-4">{transaction.category}</td>
              <td className={`px-6 py-4 text-right font-mono font-semibold ${type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                {type === 'expenditure' ? '- ' : ''}₦{transaction.amount.toLocaleString()}
              </td>
              <td className="px-6 py-4 text-right space-x-2">
                 <button onClick={() => onEdit(transaction)} className="font-medium text-primary hover:underline">Edit</button>
                 <button onClick={() => onDelete(transaction.id)} className="font-medium text-red-600 hover:underline">Delete</button>
              </td>
            </tr>
          ))}
          {transactions.length === 0 && (
            <tr>
                <td colSpan={5} className="text-center py-8 text-gray-500">No {type} records found.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default TransactionTable;