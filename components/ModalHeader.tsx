import React from 'react';

interface ModalHeaderProps {
  title: string;
  subtitle?: string;
  onClose: () => void;
}

const WindowControlButton: React.FC<{
  onClick?: () => void;
  'aria-label': string;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
}> = ({ onClick, 'aria-label': ariaLabel, children, className, disabled }) => (
  <button
    type="button"
    onClick={onClick}
    className={`w-6 h-6 flex items-center justify-center border rounded-sm transition-colors ${className}`}
    aria-label={ariaLabel}
    disabled={disabled}
  >
    {children}
  </button>
);


const ModalHeader: React.FC<ModalHeaderProps> = ({ title, subtitle, onClose }) => {
  // Minimize and Maximize are visually present but disabled as true functionality is complex for web modals.
  const handleMinimize = () => alert('Minimize functionality is not implemented.');
  const handleMaximize = () => alert('Maximize functionality is not implemented.');

  return (
    <div className="p-4 border-b flex justify-between items-center bg-gray-50 rounded-t-lg">
      <div>
        <h3 className="text-lg font-semibold text-secondary">{title}</h3>
        {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
      </div>
      <div className="flex items-center space-x-2">
        <WindowControlButton
          onClick={handleMinimize}
          aria-label="Minimize"
          className="border-gray-400 bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled
        >
          <svg className="w-4 h-4 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path d="M20 12H4" /></svg>
        </WindowControlButton>
        <WindowControlButton
          onClick={handleMaximize}
          aria-label="Maximize"
          className="border-gray-400 bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled
        >
          <svg className="w-3 h-3 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><rect x="6" y="6" width="12" height="12" /></svg>
        </WindowControlButton>
        <WindowControlButton
          onClick={onClose}
          aria-label="Close"
          className="border-red-600 bg-red-500 hover:bg-red-600"
        >
          <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path d="M6 18L18 6M6 6l12 12" /></svg>
        </WindowControlButton>
      </div>
    </div>
  );
};

export default ModalHeader;
