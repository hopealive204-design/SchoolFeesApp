import React from 'react';
import { View } from '../types.ts';

interface HeaderProps {
  view: View;
  schoolName?: string;
  adminName?: string;
  isImpersonating?: boolean;
}

const Header: React.FC<HeaderProps> = ({ view, schoolName, adminName, isImpersonating }) => {

  const viewTitle = view;

  return (
    <header className={`navbar fixed right-0 bg-base-100/80 backdrop-blur-lg border-b border-base-300/50 h-16 z-40
      ${isImpersonating ? 'top-10' : 'top-0'} 
      left-0 md:left-64`}>
       <div className="flex-none lg:hidden">
        <label htmlFor="my-drawer-2" aria-label="open sidebar" className="btn btn-square btn-ghost">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-6 h-6 stroke-current"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
        </label>
      </div>
      <div className="flex-1">
        <h1 className="text-xl font-bold text-secondary capitalize">{view === 'More' ? 'Menu' : viewTitle}</h1>
      </div>

      <div className="flex-none gap-2">
        <div className="form-control hidden md:block">
          <input type="text" placeholder="Search..." className="input input-bordered w-24 md:w-auto input-sm" />
        </div>
        <button className="btn btn-ghost btn-circle">
          <div className="indicator">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
            <span className="badge badge-xs badge-primary indicator-item"></span>
          </div>
        </button>
        <div className="dropdown dropdown-end">
          <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar">
            <div className="w-10 rounded-full">
              <img
                src={`https://picsum.photos/seed/${adminName || 'admin'}/80/80`}
                alt={adminName || 'Admin'}
              />
            </div>
          </div>
          <ul tabIndex={0} className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52">
             <li>
                <div className="flex flex-col items-start pointer-events-none">
                  <p className="font-bold text-secondary">{schoolName || 'SchoolFees.NG'}</p>
                  <p className="text-xs text-gray-500">{adminName || 'Admin'}</p>
                </div>
             </li>
             <div className="divider my-1"></div>
            <li><a>Profile</a></li>
            <li><a>Settings</a></li>
          </ul>
        </div>
      </div>
    </header>
  );
};

export default Header;
