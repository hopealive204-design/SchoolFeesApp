import React, { useState } from 'react';
import { School, CurrentUser } from '../types.ts';
// Fix: Imported signIn service instead of the missing authenticateUser.
import { signIn } from '../services/authService';

interface SchoolLandingPageProps {
  school: School;
  // Fix: Added onLogin prop to handle authentication passed from App.tsx
  onLogin: (email: string, pass: string) => Promise<void>;
}

const SchoolLandingPage: React.FC<SchoolLandingPageProps> = ({ school, onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Fix: Refactored login handler to be async and use the proper signIn service from props.
  const handleSchoolLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
        await onLogin(email, password);
        // Successful login will be handled by the onAuthStateChange listener in App.tsx
    } catch (err) {
        const error = err as Error;
        if (error.message.includes('Invalid login credentials')) {
             setError('Invalid credentials for this school. Please try again.');
        } else {
            setError(error.message);
        }
    } finally {
        setIsLoading(false);
    }
  };
  
  const { heroTitle, heroSubtitle, heroImageUrl } = school.landingPageContent;

  return (
    <div className="min-h-screen flex flex-col">
        <header 
            className="relative h-96 flex items-center justify-center text-white bg-secondary bg-cover bg-center"
            style={{ backgroundImage: `linear-gradient(rgba(17, 24, 39, 0.7), rgba(17, 24, 39, 0.7)), url(${heroImageUrl || 'https://picsum.photos/1200/800'})` }}
        >
            <div className="text-center p-4">
                 {school.logoUrl && (
                    <img src={school.logoUrl} alt={`${school.name} Logo`} className="h-24 w-24 mx-auto mb-4 rounded-full bg-white p-2 shadow-lg" />
                 )}
                <h1 className="text-4xl md:text-5xl font-extrabold">{heroTitle}</h1>
                <p className="mt-4 text-lg text-gray-200 max-w-2xl mx-auto">{heroSubtitle}</p>
            </div>
        </header>

        <main className="flex-grow flex items-center justify-center bg-base-100 py-12">
            <div className="w-full max-w-md">
                 <div className="bg-white p-8 rounded-xl shadow-md -mt-32 relative z-10">
                    <h2 className="text-2xl font-semibold text-center text-gray-800 mb-6">Parent & Staff Login</h2>
                    
                    <form onSubmit={handleSchoolLogin} className="space-y-6">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address</label>
                            <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                            />
                        </div>

                        <div>
                            <div className="flex items-center justify-between">
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                            </div>
                            <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                            />
                        </div>

                        {error && <p className="text-sm text-red-600">{error}</p>}

                        <div>
                            <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:brightness-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:bg-gray-400"
                            >
                            {isLoading ? 'Logging in...' : 'Log In'}
                            </button>
                        </div>
                    </form>
                 </div>
                 <p className="mt-4 text-center text-xs text-gray-500">
                    Powered by <a href="/" className="font-semibold text-primary hover:underline">SchoolFees.NG</a>
                 </p>
            </div>
        </main>
    </div>
  );
};

export default SchoolLandingPage;