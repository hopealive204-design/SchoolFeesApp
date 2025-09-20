import React, { useState, useEffect, useMemo } from 'react';
import useSchoolData from './hooks/useSchoolData.ts';
import useThemeManager from './hooks/useThemeManager.ts';
import { CurrentUser, View, School, Student } from './types.ts';
import { onAuthStateChange, signOut, signIn } from './services/authService.ts';
import AuthPage from './components/AuthPage.tsx';
import SchoolLandingPage from './components/SchoolLandingPage.tsx';
import Dashboard from './components/Dashboard.tsx';
import { DesktopSidebar } from './components/DesktopSidebar.tsx';
import Header from './components/Header.tsx';
import StudentsView from './components/StudentsView.tsx';
import TeamPage from './components/TeamPage.tsx';
import ReportsPage from './components/ReportsPage.tsx';
import CommunicationPage from './components/CommunicationPage.tsx';
import PrintCenter from './components/PrintCenter.tsx';
import SettingsPage from './components/SettingsPage.tsx';
import AiInsightsPage from './components/AiInsightsPage.tsx';
import AiChatbot from './components/AiChatbot.tsx';
import AdmissionsPage from './components/AdmissionsPage.tsx';
import BursaryPage from './components/BursaryPage.tsx';
import KnowledgeBasePage from './components/KnowledgeBasePage.tsx';
import ParentDashboard from './components/ParentDashboard.tsx';
import TeacherDashboard from './components/TeacherDashboard.tsx';
import StaffDashboard from './components/StaffDashboard.tsx';
import ImpersonationBanner from './components/ImpersonationBanner.tsx';

const LoadingSpinner: React.FC = () => (
    <div className="flex items-center justify-center h-screen bg-base-100">
        <div className="flex flex-col items-center">
            <div className="loading loading-spinner loading-lg text-primary"></div>
            <p className="mt-4 text-secondary">Loading Application...</p>
        </div>
    </div>
);

const App: React.FC = () => {
    const { schools, platformConfig, isLoading, error, refreshData } = useSchoolData();
    const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
    const [authLoading, setAuthLoading] = useState(true);
    const [activeView, setActiveView] = useState<View>('Dashboard');
    const [schoolForSubdomain, setSchoolForSubdomain] = useState<School | null>(null);

    // Super admin impersonation state
    const [impersonatedSchool, setImpersonatedSchool] = useState<School | null>(null);

    // Apply dynamic theme from platformConfig
    useThemeManager(platformConfig?.websiteContent.theme);

    // Check for school-specific subdomain on initial load
    useEffect(() => {
        const hostname = window.location.hostname;
        const parts = hostname.split('.');
        const potentialSubdomain = parts[0];
        
        if (potentialSubdomain && potentialSubdomain !== 'localhost' && potentialSubdomain !== 'www' && schools.length > 0) {
            const school = schools.find(s => s.slug === potentialSubdomain);
            if (school) {
                setSchoolForSubdomain(school);
            }
        }
    }, [schools]);

    // Authentication state listener
    useEffect(() => {
        const subscription = onAuthStateChange((user) => {
            setCurrentUser(user);
            setAuthLoading(false);
            if (user?.role === 'schoolAdmin') setActiveView('Dashboard');
        });
        return () => subscription.unsubscribe();
    }, []);

    const handleLogout = async () => {
        await signOut();
        setCurrentUser(null);
        setActiveView('Dashboard');
    };

    const handleLogin = async (email: string, pass: string) => {
        await signIn(email, pass);
    };

    const handleEnrollStudent = (student: Student) => {
        // Navigate to the new student's profile after enrollment
        setActiveView('Students');
    };

    const activeSchool = useMemo(() => {
        if (impersonatedSchool) return impersonatedSchool;
        if (currentUser && 'schoolId' in currentUser) {
            return schools.find(s => s.id === currentUser.schoolId);
        }
        return null;
    }, [currentUser, schools, impersonatedSchool]);

    if (isLoading || authLoading) {
        return <LoadingSpinner />;
    }

    if (error) {
        return <div className="p-4 text-center text-red-600 bg-red-100">{error}</div>;
    }

    // Unauthenticated Views
    if (!currentUser) {
        if (schoolForSubdomain) {
            return <SchoolLandingPage school={schoolForSubdomain} onLogin={handleLogin} />;
        }
        if (platformConfig) {
            return <AuthPage platformConfig={platformConfig} />;
        }
        return <LoadingSpinner />;
    }
    
    // Authenticated Views for specific roles
    if (activeSchool) {
         if (currentUser.role === 'parent') {
            return <ParentDashboard school={activeSchool} currentUser={currentUser} onLogout={handleLogout} refreshData={refreshData} />;
        }
        if (currentUser.role === 'teacher') {
            return <TeacherDashboard school={activeSchool} currentUser={currentUser} onLogout={handleLogout} />;
        }
        if (currentUser.role === 'staff') {
            return <StaffDashboard school={activeSchool} currentUser={currentUser} onLogout={handleLogout} />;
        }
    }

    // Main Admin Dashboard View
    if (currentUser.role === 'schoolAdmin' && activeSchool && platformConfig) {
        const renderMainContent = () => {
            switch (activeView) {
                case 'Dashboard': return <Dashboard school={activeSchool} platformConfig={platformConfig} />;
                case 'Students': return <StudentsView school={activeSchool} refreshData={refreshData} />;
                case 'Team': return <TeamPage school={activeSchool} refreshData={refreshData} />;
                case 'Reports': return <ReportsPage school={activeSchool} />;
                case 'Communication': return <CommunicationPage school={activeSchool} platformConfig={platformConfig} />;
                case 'Printing': return <PrintCenter school={activeSchool} platformConfig={platformConfig} />;
                case 'Settings': return <SettingsPage school={school} refreshData={refreshData} />;
                case 'AI Insights': return <AiInsightsPage school={activeSchool} plan={platformConfig.pricingPlans.find(p => p.id === activeSchool.planId)} onUpgrade={() => alert('Upgrade flow not implemented.')} />;
                case 'Admissions': return <AdmissionsPage school={activeSchool} refreshData={refreshData} onEnrollStudent={handleEnrollStudent} />;
                case 'Knowledge Base': return <KnowledgeBasePage articles={platformConfig.knowledgeBaseArticles} />;
                case 'Bursary': // Fallback for bursary parent view
                case 'Student Payments':
                case 'Invoices & Receipts':
                case 'Other Income':
                case 'Expenditures':
                case 'Payroll':
                case 'Reconciliation':
                case 'Fee Structure':
                    return <BursaryPage school={activeSchool} refreshData={refreshData} activeSubView={activeView} setActiveView={setActiveView} />;
                default: return <Dashboard school={activeSchool} platformConfig={platformConfig} />;
            }
        };

        return (
            <div className="drawer lg:drawer-open bg-base-200">
                <input id="my-drawer-2" type="checkbox" className="drawer-toggle" />
                <div className="drawer-content flex flex-col">
                    {impersonatedSchool && <ImpersonationBanner schoolName={impersonatedSchool.name} onStop={() => setImpersonatedSchool(null)} />}
                    <Header view={activeView} schoolName={activeSchool.name} adminName={currentUser.name} isImpersonating={!!impersonatedSchool} />
                    <main className={`flex-grow p-6 pt-24 ${impersonatedSchool ? 'mt-10' : ''}`}>
                        {renderMainContent()}
                    </main>
                </div>
                <div className="drawer-side">
                    <label htmlFor="my-drawer-2" aria-label="close sidebar" className="drawer-overlay"></label>
                    <DesktopSidebar activeView={activeView} setActiveView={setActiveView} onLogout={handleLogout} />
                </div>
                <AiChatbot school={activeSchool} platformConfig={platformConfig} onGuideRequest={setActiveView} activeView={activeView} />
            </div>
        );
    }
    
    // SuperAdmin View
    if (currentUser.role === 'superAdmin' && platformConfig) {
       // Placeholder for the SuperAdmin CMS dashboard
        return <div>Super Admin CMS Dashboard not yet implemented.</div>;
    }


    return <LoadingSpinner />;
};

export default App;