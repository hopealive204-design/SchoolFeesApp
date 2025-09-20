import React from 'react';

interface ModalHeaderProps {
  title: string;
  subtitle?: string;
  onClose: () => void;
}

const ModalHeader: React.FC<ModalHeaderProps> = ({ title, subtitle, onClose }) => {
  return (
    <div className="p-4 border-b flex justify-between items-start bg-base-200/50 rounded-t-lg">
      <div>
        <h3 id="modal-title" className="text-lg font-semibold text-secondary">{title}</h3>
        {subtitle && <p className="text-sm text-base-content/70 mt-1">{subtitle}</p>}
      </div>
       <button 
        type="button" 
        onClick={onClose} 
        className="btn btn-sm btn-circle btn-ghost"
        aria-label="Close"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
      </button>
    </div>
  );
};

export default ModalHeader;