import React, { useState } from 'react';
import { School } from '../types.ts';

interface ReconciliationProps {
  school: School;
}

const Reconciliation: React.FC<ReconciliationProps> = ({ school }) => {
  const [statementFile, setStatementFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setStatementFile(e.target.files[0]);
    }
  };
  
  const handleReconcile = () => {
    if (!statementFile) {
      alert("Please upload a bank statement file.");
      return;
    }
    alert(`SIMULATION: Reconciling statement "${statementFile.name}" with school records.`);
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-md">
      <h3 className="text-xl font-semibold text-secondary">Payment Reconciliation</h3>
      <p className="text-sm text-gray-500 mb-4">
        Upload a bank statement (CSV format) to automatically match transactions with student payments.
      </p>

      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center space-y-4">
        <div>
            <label htmlFor="statement-upload" className="cursor-pointer bg-primary text-white font-semibold px-4 py-2 rounded-lg hover:bg-green-700">
                Choose File
            </label>
            <input type="file" id="statement-upload" className="hidden" accept=".csv" onChange={handleFileChange} />
        </div>
        
        {statementFile && <p className="text-gray-600">Selected: {statementFile.name}</p>}

        <button onClick={handleReconcile} disabled={!statementFile} className="bg-primary/90 text-white px-6 py-2 rounded-lg hover:bg-primary transition-colors disabled:bg-gray-300">
            Start Reconciliation
        </button>
      </div>

       <div className="mt-6">
           <h4 className="font-semibold text-secondary">Reconciliation History</h4>
           <div className="text-center text-gray-500 py-8 border-2 border-dashed rounded-lg mt-2">
               Your reconciliation history will appear here.
           </div>
       </div>

    </div>
  );
};

export default Reconciliation;