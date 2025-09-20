import { getSupabase } from '../supabaseClient.ts';
import { 
    School, 
    CurrentUser, 
    UserRole,
    Term,
    NewSchoolRegistrationData
} from '../types.ts';
import { mockSchools } from './mockData.ts';

// --- MOCK DATA & OFFLINE MODE LOGIC ---

// Mock users for offline authentication
const mockUsers = [
    { email: 'super@schoolfees.ng', password: 'password123', role: 'superAdmin', id: 'user_super_1', name: 'Super Admin', userRole: UserRole.Administrator },
    { email: 'admin@sunnydale.com', password: 'password123', role: 'schoolAdmin', schoolId: 'sch_sunnydale_123', id: 'user_sunnydale_admin', name: 'Mrs. Adebayo' },
    { email: 'parent@sunnydale.com', password: 'password123', role: 'parent', schoolId: 'sch_sunnydale_123', id: 'user_sunnydale_parent', name: 'Mr. Okoro', childrenIds: ['stu_sunnydale_123_1'] },
    { email: 'teacher@sunnydale.com', password: 'password123', role: 'teacher', schoolId: 'sch_sunnydale_123', id: 'tm_sunnydale_t1', name: 'Mr. James', assignedClasses: ['JSS1'] },
    { email: 'staff@sunnydale.com', password: 'password123', role: 'staff', schoolId: 'sch_sunnydale_123', id: 'tm_sunnydale_s1', name: 'Funke Akindele' },
];

let offlineUser: CurrentUser | null = null;
let authStateCallback: ((user: CurrentUser | null) => void) | null = null;

// --- AUTHENTICATION ---

export const onAuthStateChange = (callback: (user: CurrentUser | null) => void) => {
    const supabase = getSupabase();
    if (!supabase) {
        console.log("Offline mode: Setting up mock auth state listener.");
        authStateCallback = callback;
        // Set initial state after a short delay to mimic async behavior
        setTimeout(() => callback(offlineUser), 0);
        return { unsubscribe: () => { authStateCallback = null; } };
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
        if (!session?.user) {
            callback(null);
            return;
        }

        const user = session.user;
        const { role, schoolId, name, childrenIds, assignedClasses, userRole } = user.user_metadata;
        
        let currentUser: CurrentUser | null = null;
        
        if (role === 'superAdmin') {
            currentUser = { role: 'superAdmin', id: user.id, name, email: user.email!, userRole };
        } else if (schoolId) {
            switch (role) {
                case 'schoolAdmin':
                    currentUser = { role: 'schoolAdmin', schoolId, id: user.id, name, email: user.email! };
                    break;
                case 'parent':
                    currentUser = { role: 'parent', schoolId, id: user.id, name, email: user.email!, childrenIds: childrenIds || [] };
                    break;
                case 'teacher':
                    currentUser = { role: 'teacher', schoolId, id: user.id, name, email: user.email!, assignedClasses: assignedClasses || [] };
                    break;
                case 'staff':
                    currentUser = { role: 'staff', schoolId, id: user.id, name, email: user.email! };
                    break;
            }
        }
        callback(currentUser);
    });

    return subscription;
};

export const signIn = async (email: string, pass: string): Promise<void> => {
    const supabase = getSupabase();
    if (!supabase) {
        console.log("Offline mode: Simulating sign in.");
        const userCredentials = mockUsers.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === pass);
        if (!userCredentials) {
            throw new Error("Invalid login credentials");
        }
        
        const { password, ...userDetails } = userCredentials;
        offlineUser = userDetails as CurrentUser;

        if (authStateCallback) {
            authStateCallback(offlineUser);
        }
        return;
    }
    const { error } = await supabase.auth.signInWithPassword({ email, password: pass });
    if (error) throw error;
};

export const signOut = async (): Promise<void> => {
    const supabase = getSupabase();
    if (!supabase) { 
      console.log("Offline mode: Simulating sign out.");
      offlineUser = null;
      if (authStateCallback) {
          authStateCallback(null);
      }
      return;
    };
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
};

export const registerSchool = async (data: NewSchoolRegistrationData & {password: string}): Promise<School> => {
    const supabase = getSupabase();
     if (!supabase) {
        console.log("Offline mode: Simulating school registration.");
        const slug = data.username.toLowerCase();
        if (mockSchools.some(s => s.slug === slug)) {
            throw new Error("Username is already taken.");
        }
        
        const newSchool: School = {
            id: `sch_${slug}_${Date.now()}`,
            slug: slug,
            name: data.schoolName,
            address: data.schoolAddress,
            contactPhone: data.schoolPhone,
            students: [],
            teamMembers: [],
            applicants: [],
            feeDefinitions: [],
            adminUser: { name: data.adminName, email: data.adminEmail },
            planId: 'plan_starter',
            subscriptionEndDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            cancellationPending: false,
            currentSession: '2024/2025',
            currentTerm: Term.First,
            landingPageContent: { heroTitle: `Welcome to ${data.schoolName}`, heroSubtitle: 'Your new parent portal.', heroImageUrl: ''},
            otherIncome: [],
            expenditures: [],
            paymentSettings: { enabledGateways: ['paystack'], gatewayCredentials: {}, bankDetails: { bankName: 'First Bank', accountName: data.schoolName, accountNumber: '1234567890' }},
            payrollSettings: { employeePensionRate: 0.08, payeBrackets: []},
            smsSettings: { enabledGateway: null, gatewayCredentials: {}, reminderTemplate: '', manualTemplates: []},
            communicationSettings: { emailProvider: 'feepilot', smtpSettings: {}, whatsappProvider: 'manual', whatsappApiSettings: {}, automatedReminders: { enabled: false, daysAfterDueDate: 7}, transactionalNotifications: { paymentConfirmation: { enabled: true, emailSubject: 'Payment Confirmation', emailTemplate: 'Thank you for your payment.', smsTemplate: '', whatsappTemplate: '' }}, manualTemplates: []},
            pendingPlanId: null,
            created_at: new Date().toISOString()
        };

        mockSchools.push(newSchool);
        mockUsers.push({ email: data.adminEmail, password: data.password, role: 'schoolAdmin', schoolId: newSchool.id, id: `user_new_${Date.now()}`, name: data.adminName, userRole: UserRole.Administrator });
        
        return newSchool;
    }

    // This would be a transactional database function on the backend in a real-world app.
    const { data: { user }, error: signUpError } = await supabase.auth.signUp({
        email: data.adminEmail,
        password: data.password,
        options: { data: { name: data.adminName, role: 'schoolAdmin' } },
    });
    if (signUpError) throw signUpError;
    if (!user) throw new Error("User creation failed.");

    const newSchoolData: Omit<School, 'id' | 'created_at'> = {
        slug: data.username.toLowerCase(), name: data.schoolName, address: data.schoolAddress, contactPhone: data.schoolPhone,
        students: [], teamMembers: [], applicants: [], feeDefinitions: [],
        adminUser: { name: data.adminName, email: data.adminEmail }, planId: 'plan_starter',
        subscriptionEndDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    } as any;

    const { data: school, error: schoolError } = await supabase.from('schools').insert(newSchoolData).select().single();
    if (schoolError) {
        console.error("Failed to create school record, user was created but is now orphaned:", user.id);
        throw schoolError;
    }

    const { error: userUpdateError } = await supabase.auth.updateUser({ data: { ...user.user_metadata, schoolId: school.id } });
    if (userUpdateError) {
        console.error("User and school created, but failed to link user to school.");
        throw userUpdateError;
    }
    return school;
};

export const checkUsernameAvailability = async (username: string): Promise<boolean> => {
    const supabase = getSupabase();
     if (!supabase) {
        return !mockSchools.some(s => s.slug === username.toLowerCase());
    }
    const { data, error } = await supabase.from('schools').select('slug').eq('slug', username.toLowerCase());
    if (error) {
        console.error("Error checking username:", error);
        return false;
    }
    return data.length === 0;
};
export const onboardNewSchool = async (newSchoolData: Partial<School>): Promise<School> => {
    console.log("Beginning onboarding flow for:", newSchoolData.name);
    // This is where you would add logic for a multi-step onboarding process.
    // For now, it just returns the data as is.
    return newSchoolData as School;
};