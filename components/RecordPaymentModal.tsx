import React, { useState, useMemo } from 'react';
import { Student, Payment, PaymentAllocation } from '../types.ts';
import ModalHeader from './ModalHeader';

interface RecordPaymentModalProps {
  student: Student;
  onClose: () => void;
  onSave: (paymentData: { totalAmount: number, date: string, method: Payment['method'], allocations: PaymentAllocation[] }) => void;
}

const paymentMethods: Payment['method'][] = ['Manual Bank Transfer', 'Card', 'Mobile Money', 'Bank Transfer'];

const RecordPaymentModal: React.FC<RecordPaymentModalProps> = ({ student, onClose, onSave }) => {
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [method, setMethod] = useState<Payment['method']>('Manual Bank Transfer');
  const [allocations, setAllocations] = useState<{[feeId: string]: string}>({});

  const unpaidFees = useMemo(() => student.fees.filter(f => f.amount > f.paidAmount), [student.fees]);
  
  const totalPayment = useMemo(() => {
    // FIX: Explicitly type `amount` to resolve type inference issue with Object.values.
    return Object.values(allocations).reduce((sum, amount: string) => sum + (parseFloat(amount) || 0), 0);
  }, [allocations]);

  const handleAllocationChange = (feeId: string, value: string, maxAmount: number) => {
    const numericValue = parseFloat(value);
    const finalValue = isNaN(numericValue) ? '' : Math.max(0, Math.min(numericValue, maxAmount)).toString();
    setAllocations(prev => ({ ...prev, [feeId]: finalValue }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (totalPayment <= 0) {
      alert('Please enter a payment amount for at least one fee item.');
      return;
    }
    
    const finalAllocations: PaymentAllocation[] = Object.entries(allocations)
        .map(([feeId, amount]: [string, string]) => ({ feeId, amount: parseFloat(amount) || 0 }))
        .filter(alloc => alloc.amount > 0);

    onSave({ totalAmount: totalPayment, date, method, allocations: finalAllocations });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" role="dialog" aria-modal="true" aria-labelledby="record-payment-title">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl transform transition-all max-h-[90vh] flex flex-col">
        <form onSubmit={handleSubmit} className="flex flex-col h-full">
          <ModalHeader 
            title={`Record Payment for ${student.name}`}
            subtitle={`Outstanding Balance: ₦${student.outstandingFees.toLocaleString()}`}
            onClose={onClose}
          />
          <div className="p-6 flex-grow overflow-y-auto space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="date" className="block text-sm font-medium text-gray-700">Payment Date</label>
                <input type="date" id="date" value={date} onChange={(e) => setDate(e.target.value)} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"/>
              </div>
              <div>
                <label htmlFor="method" className="block text-sm font-medium text-gray-700">Payment Method</label>
                <select id="method" value={method} onChange={(e) => setMethod(e.target.value as Payment['method'])} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm">
                  {paymentMethods.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
            </div>
            
            <div>
                <h4 className="text-lg font-medium text-gray-900 mb-2">Fee Allocation</h4>
                <div className="border rounded-lg overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 text-left text-gray-600">
                            <tr>
                                <th className="p-2 font-semibold">Fee Item</th>
                                <th className="p-2 font-semibold text-right">Balance</th>
                                <th className="p-2 font-semibold text-right">Payment Amount (₦)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {unpaidFees.map(fee => {
                                const balance = fee.amount - fee.paidAmount;
                                return (
                                    <tr key={fee.id} className="border-b last:border-0">
                                        <td className="p-2 font-medium">{fee.type}</td>
                                        <td className="p-2 text-right font-mono text-gray-500">₦{balance.toLocaleString()}</td>
                                        <td className="p-2">
                                            <input 
                                                type="number" 
                                                value={allocations[fee.id] || ''}
                                                onChange={e => handleAllocationChange(fee.id, e.target.value, balance)}
                                                placeholder="0.00"
                                                min="0"
                                                max={balance}
                                                className="w-full text-right font-mono rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                                            />
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                     {unpaidFees.length === 0 && <p className="text-center py-4 text-gray-500">No outstanding fees.</p>}
                </div>
            </div>

            <details>
                <summary className="text-sm font-medium text-primary cursor-pointer">View Payment History ({student.payments.length})</summary>
                <div className="mt-2 p-3 bg-gray-50 rounded-md max-h-40 overflow-y-auto text-sm space-y-2">
                    {student.payments.length > 0 ? [...student.payments].reverse().map(p => (
                        <div key={p.id} className="flex justify-between border-b pb-1">
                            <span>{new Date(p.date).toLocaleDateString()} via {p.method}</span>
                            <span className="font-mono font-semibold">₦{p.amount.toLocaleString()}</span>
                        </div>
                    )) : <p className="text-gray-500">No payments recorded yet.</p>}
                </div>
            </details>

          </div>
          <div className="px-6 py-4 bg-gray-50 flex justify-between items-center flex-shrink-0 border-t">
            <div className="text-lg font-bold text-secondary">
                Total Payment: <span className="font-mono text-primary">₦{totalPayment.toLocaleString()}</span>
            </div>
            <div className="space-x-3">
                <button type="button" onClick={onClose} className="px-4 py-2 bg-white text-sm font-medium text-gray-700 border border-gray-300 rounded-md shadow-sm hover:bg-gray-50">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-primary text-sm font-medium text-white border border-transparent rounded-md shadow-sm hover:bg-green-700">Save Payment</button>
            </div>
        </form>
      </div>
    </div>
  );
};

export default RecordPaymentModal;