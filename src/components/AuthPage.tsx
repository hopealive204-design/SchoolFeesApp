
import React, { useState } from 'react';
import { PlatformConfig } from '../types.ts';
import SignUpPage from './SignUpPage.tsx';
import { signIn, registerSchool } from '../services/authService.ts';
import { NewSchoolRegistrationData } from '../types.ts';

interface AuthPageProps {
    platformConfig: PlatformConfig;
}

const AuthPage: React.FC<AuthPageProps> = ({ platformConfig }) => {
    const [view, setView] = useState<'login' | 'signup'>('login');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleLoginAttempt = async (email: string, pass: string) => {
        setError('');
        setIsLoading(true);
        try {
            await signIn(email, pass);
            // onAuthStateChange in App.tsx will handle the navigation
        } catch (err) {
            const error = err as Error;
            setError(error.message || "Invalid email or password.");
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleRegister = async (data: NewSchoolRegistrationData & { password: string }) => {
        setError('');
        setIsLoading(true);
        try {
            const newSchool = await registerSchool(data);
            alert(`Registration successful!\n\nYour school portal is now active at:\n${newSchool.slug}.schoolfees.ng\n\nYou can now log in with your email and password.`);
            setView('login');
        } catch (err) {
            const error = err as Error;
            setError(error.message || "An unexpected error occurred during registration.");
            // Re-throw to be caught in the SignUpPage component to update its local error state
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div>
            {view === 'login' ? (
                <LoginPage 
                    platformConfig={platformConfig} 
                    onLoginAttempt={handleLoginAttempt} 
                    onNavigateToSignUp={() => setView('signup')}
                    error={error}
                    isLoading={isLoading}
                />
            ) : (
                <SignUpPage 
                    platformConfig={platformConfig}
                    onRegister={handleRegister}
                    onNavigateToLogin={() => setView('login')}
                />
            )}
        </div>
    );
};

// Dummy LoginPage component since it's not provided
const LoginPage: React.FC<{
    platformConfig: PlatformConfig,
    onLoginAttempt: (email: string, pass: string) => Promise<void>,
    onNavigateToSignUp: () => void,
    error: string,
    isLoading: boolean,
}> = ({ platformConfig, onLoginAttempt, onNavigateToSignUp, error, isLoading }) => {
    const [email, setEmail] = useState('admin@sunnydale.com');
    const [password, setPassword] = useState('password123');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onLoginAttempt(email, password);
    };

    return (
        <div className="min-h-screen bg-base-100 flex items-center justify-center">
            <div className="w-full max-w-md">
                 <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-secondary">{platformConfig.websiteContent.siteTitle}</h1>
                 </div>
                <div className="bg-white p-8 rounded-xl shadow-md">
                    <h2 className="text-2xl font-semibold text-center text-gray-800 mb-6">Welcome Back</h2>
                     <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="label"><span className="label-text">Email</span></label>
                            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="input input-bordered w-full" />
                        </div>
                        <div>
                            <label className="label"><span className="label-text">Password</span></label>
                            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required className="input input-bordered w-full" />
                        </div>
                        {error && <div className="text-sm text-red-600">{error}</div>}
                        <button type="submit" disabled={isLoading} className="btn btn-primary w-full">
                            {isLoading && <span className="loading loading-spinner"></span>}
                            Log In
                        </button>
                        <p className="text-center text-sm">
                            Don't have an account? <button type="button" onClick={onNavigateToSignUp} className="font-medium text-primary hover:underline">Sign Up</button>
                        </p>
                    </form>
                </div>
            </div>
        </div>
    );
};


export default AuthPage;
