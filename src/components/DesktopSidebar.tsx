import React from 'react';
import { View, BursarySubView } from '../types.ts';

interface DesktopSidebarProps {
  activeView: View;
  setActiveView: (view: View) => void;
  onLogout: () => void;
}

const NavItem: React.FC<{
    label: View | 'Logout';
    active: boolean;
    onClick: () => void;
}> = ({ label, active, onClick}) => (
    <li onClick={onClick}>
        <a className={active ? 'active' : ''}>
            {label}
        </a>
    </li>
);

const LogoIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg width="40" height="40" viewBox="0 0 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="1.5"