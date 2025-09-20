import React from 'react';

interface StatCardProps {
  title: string;
  value: string;
  change: string;
  color?: 'orange' | 'red';
  icon: 'revenue' | 'outstanding' | 'students' | 'overdue';
  trend?: 'up' | 'down';
}

const icons: Record<StatCardProps['icon'], React.ReactElement> = {
    revenue: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" x2="12" y1="2" y2="22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>,
    outstanding: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5.1H7.1C5.4 5.1 4 6.5 4 8.2v7.7c0 1.7 1.4 3.1 3.1 3.1h10c1.7 0 3.1-1.4 3.1-3.1V8.2C20.1 6.5 18.7 5.1 17 5.1z"/><path d="M9.1 12.1h6"/></svg>,
    students: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
    overdue: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>,
};


const StatCard: React.FC<StatCardProps> = ({ title, value, change, color, icon }) => {
    let valueColorClass = "text-primary";
    let iconColorClass = "text-primary";
    
    if (color === 'orange') {
        valueColorClass = "text-orange-500";
        iconColorClass = "text-orange-500";
    }
    if (color === 'red') {
        valueColorClass = "text-error";
        iconColorClass = "text-error";
    }
    
  return (
    <div className="card bg-base-100 shadow">
      <div className="card-body p-4">
        <div className="stat">
          <div className={`stat-figure ${iconColorClass}`}>
            {React.cloneElement(icons[icon], { className: "w-8 h-8"})}
          </div>
          <div className="stat-title">{title}</div>
          <div className={`stat-value ${valueColorClass}`}>{value}</div>
          <div className="stat-desc">{change}</div>
        </div>
      </div>
    </div>
  );
};

export default StatCard;
