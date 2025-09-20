import React, { useState, useMemo } from 'react';
import { School, Student, Fee, Payment, PaymentAllocation } from '../types.ts';
import ModalHeader from './ModalHeader.tsx';

type FeeWithStudentInfo = Fee & { studentName: string; studentId: string; };

interface ParentPaymentModalProps {
  school: School;
  myChildren: Student[];
  onClose: () => void;
  onSubmitPayment: (paymentData: Omit<Payment, 'id' | 'date'> & { date: Date }) => void;
}

const ParentPaymentModal: React.FC<ParentPaymentModalProps> = ({ school, myChildren, onClose, onSubmitPayment }) => {
  const { paymentSettings } = school;
  const [selectedFees, setSelectedFees] = useState<Record<string, number>>({});
  const [method, setMethod] = useState<Payment['method'] | ''>('');
  const [proofOfPaymentUrl, setProofOfPaymentUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const outstandingFees = useMemo(() => {
    return myChildren.flatMap(child =>
        child.fees
            .filter(f => (f.amount - f.paidAmount) > 0)
            .map(f => ({ ...f, studentName: child.name, studentId: child.id }))
    );
  }, [myChildren]);
  
  const totalToPay = useMemo(() => Object.values(selectedFees).reduce((sum, amount: number) => sum + amount, 0), [selectedFees]);

  const handleFeeSelection = (fee: FeeWithStudentInfo, isChecked: boolean) => {
      setSelectedFees(prev => {
          const newSelection = { ...prev };
          if (isChecked) {
              newSelection[fee.id] = fee.amount - fee.paidAmount;
          } else {
              delete newSelection[fee.id];
          }
          return newSelection;
      });
  };
  
  const handleAmountChange = (feeId: string, newAmount: number, maxAmount: number) => {
      setSelectedFees(prev => ({
          ...prev,
          [feeId]: Math.max(0, Math.min(newAmount, maxAmount))
      }));
  };
  
   const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && (file.type.startsWith('image/') || file.type === 'application/pdf')) {
            setIsUploading(true);
            const reader = new FileReader();
            reader.onloadend = () => {
                setProofOfPaymentUrl(reader.result as string);
                setIsUploading(false);
            };
            reader.readAsDataURL(file);
        } else {
            alert("Please upload a valid image or PDF file.");
        }
    };


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (totalToPay <= 0) {
      alert('Please select at least one fee item to pay.');
      return;
    }
    if (!method) {
        alert('Please select a payment method.');
        return;
    }
    if (method === 'Manual Bank Transfer' && !proofOfPaymentUrl) {
        alert('Please upload proof of payment for manual transfers.');
        return;
    }
    
    // Group allocations by student
    const allocationsByStudent: Record<string, PaymentAllocation[]> = {};
    const descriptions: string[] = [];

    for (const feeId in selectedFees) {
        const feeInfo = outstandingFees.find(f => f.id === feeId);
        if (feeInfo) {
            if (!allocationsByStudent[feeInfo.studentId]) {
                allocationsByStudent[feeInfo.studentId] = [];
            }
            allocationsByStudent[feeInfo.studentId].push({ feeId, amount: selectedFees[feeId] });
            descriptions.push(`${feeInfo.type} for ${feeInfo.studentName}`);
        }
    }

    // For simplicity, this demo creates one payment object even if for multiple students.
    // A real system might create separate payment records per student.
    const studentId = Object.keys(allocationsByStudent)[0];
    const allAllocations = Object.values(allocationsByStudent).flat();

    const paymentData: Omit<Payment, 'id' | 'date'> & { date: Date } = {
        studentId: studentId,
        amount: totalToPay,
        date: new Date(),
        method,
        status: method === 'Manual Bank Transfer' ? 'Pending Verification' : 'Completed',
        description: `Payment for ${[...new Set(descriptions)].join(', ')}`,
        allocations: allAllocations,
        proofOfPaymentUrl: proofOfPaymentUrl || undefined,
    };
    
    onSubmitPayment(paymentData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" role="dialog" aria-modal="true">
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-xl w-full max-w-2xl transform transition-all max-h-[90vh] flex flex-col">
          <ModalHeader title="Make a Payment" onClose={onClose} />
          <div className="p-6 flex-grow overflow-y-auto space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">1. Select Fee(s) to Pay</label>
                <div className="border rounded-lg max-h-60 overflow-y-auto">
                    {outstandingFees.map(fee => {
                        const balance = fee.amount - fee.paidAmount;
                        return (
                            <div key={fee.id} className="flex items-center p-3 border-b last:border-0">
                                <input type="checkbox" id={`fee_${fee.id}`} checked={!!selectedFees[fee.id]} onChange={e => handleFeeSelection(fee, e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"/>
                                <label htmlFor={`fee_${fee.id}`} className="ml-3 flex-grow">
                                    <p className="font-semibold text-gray-800">{fee.type} <span className="text-xs font-normal text-gray-500">({fee.studentName})</span></p>
                                    <p className="text-xs text-gray-500">Balance: ₦{balance.toLocaleString()}</p>
                                </label>
                                {selectedFees[fee.id] !== undefined && (
                                     <input type="number" value={selectedFees[fee.id]} onChange={e => handleAmountChange(fee.id, Number(e.target.value), balance)} max={balance} min="0" className="w-28 text-right font-mono p-1 border rounded-md"/>
                                )}
                            </div>
                        )
                    })}
                    {outstandingFees.length === 0 && <p className="text-center text-gray-500 p-4">No outstanding fees found.</p>}
                </div>
            </div>
             <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">2. Choose Payment Method</label>
                <div className="grid grid-cols-3 gap-2">
                    {paymentSettings.enabledGateways.map(gwId => <button type="button" key={gwId} onClick={() => setMethod((gwId.charAt(0).toUpperCase() + gwId.slice(1)) as Payment['method'])} className={`p-3 border rounded-lg text-sm font-semibold transition-colors capitalize ${method.toLowerCase() === gwId ? 'bg-primary/10 border-primary text-primary' : 'bg-white hover:bg-gray-50'}`}>{gwId}</button>)}
                    {paymentSettings.bankDetails && <button type="button" onClick={() => setMethod('Manual Bank Transfer')} className={`p-3 border rounded-lg text-sm font-semibold transition-colors ${method === 'Manual Bank Transfer' ? 'bg-primary/10 border-primary text-primary' : 'bg-white hover:bg-gray-50'}`}>Manual Transfer</button>}
                </div>
            </div>
            {method === 'Manual Bank Transfer' && (
                <div className="animate-fade-in space-y-3">
                    <div className="p-3 bg-blue-50 border-l-4 border-blue-400 text-blue-800 rounded-r-lg">
                        <h4 className="font-bold">Instructions</h4>
                        <ul className="mt-1 text-sm list-disc list-inside">
                            <li>Transfer <strong>₦{totalToPay.toLocaleString()}</strong> to the account below.</li>
                            <li>Use your child's full name as reference.</li>
                            <li>Upload a screenshot or photo of your receipt.</li>
                        </ul>
                         <p className="mt-2 text-sm"><strong>Bank:</strong> {paymentSettings.bankDetails?.bankName} | <strong>Account:</strong> {paymentSettings.bankDetails?.accountNumber} ({paymentSettings.bankDetails?.accountName})</p>
                    </div>
                     <div>
                        <label htmlFor="pop-upload" className="block text-sm font-medium text-gray-700">3. Upload Proof of Payment</label>
                        <input type="file" id="pop-upload" onChange={handleFileUpload} accept="image/*,application/pdf" className="mt-1 text-sm"/>
                        {isUploading && <p className="text-xs text-gray-500">Uploading...</p>}
                        {proofOfPaymentUrl && <p className="text-xs text-green-600 font-semibold mt-1">✓ File uploaded successfully.</p>}
                    </div>
                </div>
            )}
          </div>
          <div className="px-6 py-4 bg-gray-50 flex justify-between items-center flex-shrink-0 border-t">
            <div className="text-lg font-bold text-secondary">Total: <span className="font-mono text-primary">₦{totalToPay.toLocaleString()}</span></div>
            <div className="space-x-3"><button type="button" onClick={onClose} className="px-4 py-2 bg-white text-sm font-medium text-gray-700 border border-gray-300 rounded-md shadow-sm hover:bg-gray-50">Cancel</button><button type="submit" disabled={totalToPay <= 0 || !method} className="px-6 py-2 bg-primary text-sm font-medium text-white border border-transparent rounded-md shadow-sm hover:bg-green-700 disabled:bg-gray-400">Submit Payment</button></div>
          </div>
      </form>
    </div>
  );
};

export default ParentPaymentModal;
