
import React, { useState, useCallback, useMemo } from 'react';
import { PlatformConfig, NewSchoolRegistrationData } from '../types.ts';
import { checkUsernameAvailability } from '../services/authService.ts';
import debounce from '../hooks/debounce.ts';

const LogoIcon = () => (
    <svg width="48" height="48" viewBox="0 0 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-primary">
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);

interface SignUpPageProps {
    platformConfig: PlatformConfig;
    onRegister: (data: NewSchoolRegistrationData & { password: string }) => Promise<void>;
    onNavigateToLogin: () => void;
}

const PasswordStrengthIndicator: React.FC<{ password?: string }> = ({ password = '' }) => {
    const checks = [
        { regex: /.{8,}/, text: "At least 8 characters" },
        { regex: /[A-Z]/, text: "At least one uppercase letter" },
        { regex: /[a-z]/, text: "At least one lowercase letter" },
        { regex: /[0-9]/, text: "At least one number" },
        { regex: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/, text: "At least one special character" },
    ];

    return (
        <div className="mt-2 text-xs text-gray-500 space-y-1">
            {checks.map((check, index) => {
                const isValid = check.regex.test(password);
                return (
                    <div key={index} className={`flex items-center transition-colors ${isValid ? 'text-green-600' : 'text-gray-500'}`}>
                        <svg className="w-4 h-4 mr-1 flex-shrink-0" fill="none" viewBox="0 0 24" stroke="currentColor">
                            {isValid ? (
                                <path strokeLinecap="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                            ) : (
                                <path strokeLinecap="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            )}
                        </svg>
                        <span>{check.text}</span>
                    </div>
                );
            })}
        </div>
    );
};

const UsernameAvailabilityIndicator: React.FC<{ status: 'idle' | 'checking' | 'available' | 'taken' }> = ({ status }) => {
    if (status === 'checking') {
        return <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none"><span className="loading loading-spinner loading-xs"></span></div>;
    }
    if (status === 'available') {
        return <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none"><svg className="h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24" stroke="currentColor"><path strokeLinecap="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg></div>;
    }
    if (status === 'taken') {
         return <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none"><svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24" stroke="currentColor"><path strokeLinecap="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg></div>;
    }
    return null;
}


const SignUpPage: React.FC<SignUpPageProps> = ({ platformConfig, onRegister, onNavigateToLogin }) => {
    const [formData, setFormData] = useState<NewSchoolRegistrationData>({
        schoolName: '',
        schoolAddress: '',
        schoolPhone: '',
        username: '',
        adminName: '',
        adminEmail: '',
    });
    
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [formError, setFormError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [usernameAvailability, setUsernameAvailability] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle');

    const checkUsername = useCallback(async (username: string) => {
        if (!username) {
            setUsernameAvailability('idle');
            return;
        }
        setUsernameAvailability('checking');
        const isAvailable = await checkUsernameAvailability(username);
        setUsernameAvailability(isAvailable ? 'available' : 'taken');
    }, []);

    const debouncedCheckUsername = useMemo(() => debounce(checkUsername, 500), [checkUsername]);

    const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '');
        setFormData({ ...formData, username: value });
        debouncedCheckUsername(value);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const validatePassword = (password: string): string[] => {
        const errors: string[] = [];
        if (password.length < 8) errors.push("at least 8 characters");
        if (!/[A-Z]/.test(password)) errors.push("an uppercase letter");
        if (!/[a-z]/.test(password)) errors.push("a lowercase letter");
        if (!/[0-9]/.test(password)) errors.push("a number");
        if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) errors.push("a special character");
        return errors;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormError('');
        setIsLoading(true);

        if (usernameAvailability !== 'available') {
            setFormError('Please choose an available school username.');
            setIsLoading(false);
            return;
        }
        if (password !== confirmPassword) {
            setFormError('Passwords do not match.');
            setIsLoading(false);
            return;
        }
        const strengthErrors = validatePassword(password);
        if (strengthErrors.length > 0) {
            setFormError(`Password is not strong enough. It must contain ${strengthErrors.join(', ')}.`);
            setIsLoading(false);
            return;
        }
        
        try {
            await onRegister({ ...formData, password });
        } catch (err) {
            const error = err as Error;
            setFormError(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-base-100 flex flex-col justify-center items-center p-4">
            <div className="w-full max-w-2xl">
                <div className="flex flex-col items-center mb-8">
                    <LogoIcon />
                    <h1 className="text-4xl font-bold ml-2 text-secondary mt-2">{platformConfig.websiteContent.siteTitle}</h1>
                    <p className="text-gray-500 mt-2">Start Managing Your School Fees Intelligently</p>
                </div>

                <div className="bg-white p-8 rounded-xl shadow-md">
                    <h2 className="text-2xl font-semibold text-center text-gray-800 mb-1">Create Your Account</h2>
                    <p className="text-sm text-center text-gray-500 mb-6">Join the future of school administration</p>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <fieldset className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                            <legend className="text-lg font-medium text-gray-900 col-span-full mb-2">School Details</legend>
                             <div className="md:col-span-1">
                                <label htmlFor="schoolName" className="label"><span className="label-text">School Name</span></label>
                                <input type="text" name="schoolName" id="schoolName" value={formData.schoolName} onChange={handleChange} required className="input input-bordered w-full"/>
                            </div>
                            <div className="md:col-span-1">
                                <label htmlFor="username" className="label"><span className="label-text">School Username</span></label>
                                <div className="mt-1 relative">
                                    <input type="text" name="username" id="username" value={formData.username} onChange={handleUsernameChange} required className="input input-bordered w-full pr-10"/>
                                    <UsernameAvailabilityIndicator status={usernameAvailability} />
                                </div>
                                <p className="mt-1 text-xs text-gray-500">
                                    Your portal: <span className="font-semibold text-primary">{formData.username || 'username'}.schoolfees.ng</span>
                                </p>
                            </div>
                            <div className="col-span-full">
                                <label htmlFor="schoolAddress" className="label"><span className="label-text">School Address</span></label>
                                <input type="text" name="schoolAddress" id="schoolAddress" value={formData.schoolAddress} onChange={handleChange} required className="input input-bordered w-full"/>
                            </div>
                             <div>
                                <label htmlFor="schoolPhone" className="label"><span className="label-text">School Phone</span></label>
                                <input type="tel" name="schoolPhone" id="schoolPhone" value={formData.schoolPhone} onChange={handleChange} required className="input input-bordered w-full"/>
                            </div>
                        </fieldset>
                        
                        <fieldset className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 pt-4 border-t">
                            <legend className="text-lg font-medium text-gray-900 col-span-full mb-2">Administrator Details</legend>
                            <div>
                                <label htmlFor="adminName" className="label"><span className="label-text">Your Full Name</span></label>
                                <input type="text" name="adminName" id="adminName" value={formData.adminName} onChange={handleChange} required className="input input-bordered w-full"/>
                            </div>
                            <div>
                                <label htmlFor="adminEmail" className="label"><span className="label-text">Your Email Address</span></label>
                                <input type="email" name="adminEmail" id="adminEmail" value={formData.adminEmail} onChange={handleChange} required className="input input-bordered w-full"/>
                            </div>
                            <div className="col-span-full">
                                <label htmlFor="password" className="label"><span className="label-text">Password</span></label>
                                <input type="password" name="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="input input-bordered w-full"/>
                                <PasswordStrengthIndicator password={password} />
                            </div>
                            <div className="col-span-full">
                                <label htmlFor="confirmPassword" className="label"><span className="label-text">Confirm Password</span></label>
                                <input type="password" name="confirmPassword" id="confirmPassword" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required className="input input-bordered w-full"/>
                            </div>
                             {formError && (
                                <div className="col-span-full text-sm text-red-600 bg-red-50 p-3 rounded-md border border-red-200">
                                    {formError}
                                </div>
                            )}
                        </fieldset>
                        
                        <div className="text-center">
                            <p className="text-xs text-gray-500 mb-4">By creating an account, you agree to our Terms of Service and Privacy Policy.</p>
                            <button type="submit" className="btn btn-primary w-full" disabled={isLoading}>
                               {isLoading && <span className="loading loading-spinner"></span>}
                                Start 7-Day Free Trial
                            </button>
                        </div>
                    </form>

                     <p className="mt-4 text-center text-sm text-gray-600">
                        Already have an account?{' '}
                        <button onClick={onNavigateToLogin} className="font-medium text-primary hover:underline">
                            Log In
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default SignUpPage;
