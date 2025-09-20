

import { getSupabase } from '../supabaseClient.ts';
import { 
    School, 
    PlatformConfig, 
    CurrentUser, 
    Student,
    TeamMember,
    Applicant,
    Fee,
    Income,
    Expenditure,
    Payslip,
    Payment,
    Discount,
    PaymentAllocation,
    UserRole,
    Term,
    PayrollSettings
} from '../types.ts';
import { NewSchoolRegistrationData } from '../components/SignUpPage.tsx';
import { mockPlatformConfig, mockSchools } from './mockData.ts';

export { ALL_SCHOOL_CLASSES } from './constants.ts';

// --- MOCK DATA & OFFLINE MODE LOGIC ---

// In-memory store for offline mode
let offlinePlatformConfig = JSON.parse(JSON.stringify(mockPlatformConfig));
let offlineSchools = JSON.parse(JSON.stringify(mockSchools));

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
        if (offlineSchools.some(s => s.slug === slug)) {
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

        offlineSchools.push(newSchool);
        mockUsers.push({ email: data.adminEmail, password: data.password, role: 'schoolAdmin', schoolId: newSchool.id, id: `user_new_${Date.now()}`, name: data.adminName });
        
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
        return !offlineSchools.some(s => s.slug === username.toLowerCase());
    }
    const { data, error } = await supabase.from('schools').select('slug').eq('slug', username.toLowerCase());
    if (error) {
        console.error("Error checking username:", error);
        return false;
    }
    return data.length === 0;
};

// --- DATA FETCHING ---

export const getPlatformConfig = async (): Promise<PlatformConfig> => {
    const supabase = getSupabase();
    if (!supabase) {
        console.log("Running in offline mode. Returning mock platform config.");
        return Promise.resolve(JSON.parse(JSON.stringify(offlinePlatformConfig)));
    }
    const { data, error } = await supabase.from('platform_config').select('data').limit(1).single();
    if (error) throw new Error("Failed to load platform configuration.");
    return data.data as PlatformConfig;
};

export const getSchools = async (): Promise<School[]> => {
    const supabase = getSupabase();
    if (!supabase) {
        console.log("Running in offline mode. Returning mock schools.");
        return Promise.resolve(JSON.parse(JSON.stringify(offlineSchools)));
    }
    const { data, error } = await supabase.from('schools').select('*');
    if (error) throw new Error("Failed to load school data.");
    return data as School[];
};

// --- DATA MUTATION ---
// Helper for safely updating JSONB data to avoid race conditions.
const updateSchoolData = async (schoolId: string, updateFn: (school: School) => Partial<School>): Promise<School> => {
    const supabase = getSupabase();
     if (!supabase) {
        console.log(`Offline mode: Updating school ${schoolId}`);
        const schoolIndex = offlineSchools.findIndex(s => s.id === schoolId);
        if (schoolIndex === -1) throw new Error("School not found in mock data.");
        const updates = updateFn(offlineSchools[schoolIndex]);
        offlineSchools[schoolIndex] = { ...offlineSchools[schoolIndex], ...updates };
        return offlineSchools[schoolIndex];
    }
    const { data: currentSchool, error: fetchError } = await supabase.from('schools').select('*').eq('id', schoolId).single();
    if (fetchError) throw fetchError;
    const updates = updateFn(currentSchool);
    const { data: updatedSchool, error: updateError } = await supabase.from('schools').update(updates).eq('id', schoolId).select().single();
    if (updateError) throw updateError;
    return updatedSchool;
};

export const updatePlatformConfig = async (newConfig: PlatformConfig): Promise<PlatformConfig> => {
    const supabase = getSupabase();
    if (!supabase) {
        console.log("Offline mode: Updating platform config.");
        offlinePlatformConfig = newConfig;
        return offlinePlatformConfig;
    }
    const { data, error } = await supabase.from('platform_config').update({ data: newConfig }).eq('id', 1).select().single();
    if (error) throw error;
    return data.data as PlatformConfig;
};

export const updateSchool = (schoolId: string, updates: Partial<School>): Promise<School> => {
    return updateSchoolData(schoolId, () => updates);
};

export const addStudent = async (schoolId: string, studentData: Omit<Student, 'id'>): Promise<Student> => {
    const newStudent = { ...studentData, id: `stu_${schoolId}_${Date.now()}` };
    await updateSchoolData(schoolId, school => ({ students: [...school.students, newStudent] }));
    return newStudent;
};

export const updateStudent = async (studentId: string, updates: Partial<Student>): Promise<Student> => {
    const schoolIndex = offlineSchools.findIndex(s => s.students.some(st => st.id === studentId));
    if (schoolIndex === -1 && getSupabase()) { // Online fallback
        const allSchools = await getSchools();
        const school = allSchools.find(s => s.students.some(st => st.id === studentId));
        if (!school) throw new Error("School for the given student not found.");
        let updatedStudent: Student | null = null;
        await updateSchoolData(school.id, s => ({
            students: s.students.map(st => st.id === studentId ? (updatedStudent = { ...st, ...updates }) : st)
        }));
        if (!updatedStudent) throw new Error("Student not found to update.");
        return updatedStudent;
    }

    // Offline logic
    let updatedStudent: Student | null = null;
    const school = offlineSchools[schoolIndex];
    const newStudents = school.students.map(st => {
        if (st.id === studentId) {
            updatedStudent = { ...st, ...updates };
            return updatedStudent;
        }
        return st;
    });
    offlineSchools[schoolIndex] = { ...school, students: newStudents };
    if (!updatedStudent) throw new Error("Student not found to update.");
    return updatedStudent;
};

export const addPayment = async (studentId: string, paymentData: Omit<Payment, 'id' | 'studentId'>): Promise<Payment> => {
     const schoolIndex = offlineSchools.findIndex(s => s.students.some(st => st.id === studentId));
     if (schoolIndex === -1) throw new Error("School not found for payment operation.");
    
    const newPayment = { ...paymentData, studentId, id: `pay_${Date.now()}`};
    const school = offlineSchools[schoolIndex];
    const newStudents = school.students.map(st => {
        if (st.id === studentId) {
            return { ...st, payments: [...st.payments, newPayment] };
        }
        return st;
    });
    offlineSchools[schoolIndex] = { ...school, students: newStudents };
    return newPayment;
};

export const addDiscount = async (studentId: string, discountData: Omit<Discount, 'id'>): Promise<Discount> => {
    const schoolIndex = offlineSchools.findIndex(s => s.students.some(st => st.id === studentId));
    if (schoolIndex === -1) throw new Error("School not found for discount operation.");
    
    const newDiscount = { ...discountData, id: `disc_${Date.now()}` };
    const school = offlineSchools[schoolIndex];
    const newStudents = school.students.map(st => {
        if (st.id === studentId) {
            return { ...st, discounts: [...st.discounts, newDiscount] };
        }
        return st;
    });
    offlineSchools[schoolIndex] = { ...school, students: newStudents };
    return newDiscount;
};

export const updateTeamMember = async (memberId: string, updates: Partial<TeamMember>): Promise<TeamMember> => {
    const schoolIndex = offlineSchools.findIndex(s => s.teamMembers.some(m => m.id === memberId));
    if (schoolIndex === -1) throw new Error("School for the given team member not found.");

    let updatedMember: TeamMember | null = null;
    const school = offlineSchools[schoolIndex];
    const newMembers = school.teamMembers.map(m => {
        if (m.id === memberId) {
            updatedMember = { ...m, ...updates };
            return updatedMember;
        }
        return m;
    });
    offlineSchools[schoolIndex] = { ...school, teamMembers: newMembers };
    if (!updatedMember) throw new Error("Team member not found to update.");
    return updatedMember;
};

export const removeTeamMember = async (memberId: string): Promise<void> => {
    const schoolIndex = offlineSchools.findIndex(s => s.teamMembers.some(m => m.id === memberId));
    if (schoolIndex === -1) throw new Error("School for the given team member not found.");
    
    const school = offlineSchools[schoolIndex];
    offlineSchools[schoolIndex] = { ...school, teamMembers: school.teamMembers.filter(m => m.id !== memberId) };
};

export const addApplicant = async (schoolId: string, applicantData: Omit<Applicant, 'id'>): Promise<Applicant> => {
    const newApplicant = { ...applicantData, id: `app_${schoolId}_${Date.now()}` };
    await updateSchoolData(schoolId, school => ({ applicants: [...school.applicants, newApplicant] }));
    return newApplicant;
};

export const updateApplicant = async (applicantId: string, updates: Partial<Applicant>): Promise<Applicant> => {
    const schoolIndex = offlineSchools.findIndex(s => s.applicants.some(a => a.id === applicantId));
    if (schoolIndex === -1) throw new Error("School for the given applicant not found.");

    let updatedApplicant: Applicant | null = null;
    const school = offlineSchools[schoolIndex];
    const newApplicants = school.applicants.map(a => {
        if (a.id === applicantId) {
            updatedApplicant = { ...a, ...updates };
            return updatedApplicant;
        }
        return a;
    });
    offlineSchools[schoolIndex] = { ...school, applicants: newApplicants };
    if (!updatedApplicant) throw new Error("Applicant not found to update.");
    return updatedApplicant;
};

export const addIncome = async (schoolId: string, incomeData: Omit<Income, 'id'>): Promise<Income> => {
    const newIncome = { ...incomeData, id: `inc_${Date.now()}` };
    await updateSchoolData(schoolId, school => ({ otherIncome: [...(school.otherIncome || []), newIncome] }));
    return newIncome;
};

export const addExpenditure = async (schoolId: string, expenditureData: Omit<Expenditure, 'id'>): Promise<Expenditure> => {
    const newExpenditure = { ...expenditureData, id: `exp_${Date.now()}` };
    await updateSchoolData(schoolId, school => ({ expenditures: [...(school.expenditures || []), newExpenditure] }));
    return newExpenditure;
};

export const runPayrollForSchool = async (schoolId: string, payslips: Payslip[], totalPayroll: number): Promise<void> => {
    const payrollExpenditure: Expenditure = {
        id: `exp_payroll_${Date.now()}`,
        description: `Payroll for ${new Date(payslips[0].year, payslips[0].month).toLocaleString('default', { month: 'long', year: 'numeric' })}`,
        category: 'Salaries',
        amount: totalPayroll,
        date: new Date().toISOString(),
    };
    await updateSchoolData(schoolId, school => {
        const updatedTeamMembers = school.teamMembers.map(member => {
            const memberPayslips = payslips.filter(p => p.teamMemberId === member.id);
            if (memberPayslips.length > 0 && member.salaryInfo) {
                return { ...member, salaryInfo: { ...member.salaryInfo, payslips: [...member.salaryInfo.payslips, ...memberPayslips] }};
            }
            return member;
        });
        return { teamMembers: updatedTeamMembers, expenditures: [...(school.expenditures || []), payrollExpenditure] };
    });
};

// --- ONBOARDING LOGIC ---

export const onboardNewSchool = async (newSchoolData: Partial<School>): Promise<School> => {
    console.log("Beginning onboarding flow for:", newSchoolData.name);
    return newSchoolData as School;
};


// --- REPORTING & CALCULATION LOGIC ---

export const generateFinancialSummary = (school: School, startDateISO: string, endDateISO: string) => {
    const startDate = new Date(startDateISO);
    const endDate = new Date(endDateISO);

    const paymentsInPeriod = school.students.flatMap(s => s.payments)
        .filter(p => {
            const paymentDate = new Date(p.date);
            return paymentDate >= startDate && paymentDate <= endDate;
        });

    const totalRevenue = paymentsInPeriod.reduce((sum, p) => sum + p.amount, 0);
    const studentIdsWithPayments = new Set(paymentsInPeriod.map(p => p.studentId));

    return {
        startDate: startDateISO,
        endDate: endDateISO,
        totalRevenue,
        paymentsCount: paymentsInPeriod.length,
        studentsWithNewPayments: studentIdsWithPayments.size,
        totalOutstanding: school.students.reduce((sum, s) => sum + s.outstandingFees, 0)
    };
};

export const generateDebtAgingReport = (school: School) => {
    const buckets = { '0-30': { amount: 0, count: 0 }, '31-60': { amount: 0, count: 0 }, '61-90': { amount: 0, count: 0 }, '91+': { amount: 0, count: 0 } };
    const today = new Date();
    school.students.forEach(student => {
        if (student.outstandingFees > 0) {
            const oldestDueDate = student.fees
                .filter(f => f.paidAmount < f.amount)
                .reduce((oldest, f) => (new Date(f.dueDate) < oldest ? new Date(f.dueDate) : oldest), new Date());
            
            const daysOverdue = Math.floor((today.getTime() - oldestDueDate.getTime()) / (1000 * 3600 * 24));
            
            if (daysOverdue <= 30) { buckets['0-30'].amount += student.outstandingFees; buckets['0-30'].count++; }
            else if (daysOverdue <= 60) { buckets['31-60'].amount += student.outstandingFees; buckets['31-60'].count++; }
            else if (daysOverdue <= 90) { buckets['61-90'].amount += student.outstandingFees; buckets['61-90'].count++; }
            else { buckets['91+'].amount += student.outstandingFees; buckets['91+'].count++; }
        }
    });
    return Object.entries(buckets).map(([range, data]) => ({ range, ...data }));
};

export const generateClassPerformanceReport = (school: School, session: string, term: Term) => {
    const classData: { [key: string]: { totalFeesForTerm: number, totalOutstanding: number, studentCount: number } } = {};
    school.students.forEach(student => {
        if (!classData[student.class]) { classData[student.class] = { totalFeesForTerm: 0, totalOutstanding: 0, studentCount: 0 }; }
        const feesForTerm = student.fees.filter(f => f.session === session && f.term === term).reduce((sum, f) => sum + f.amount, 0);
        classData[student.class].totalFeesForTerm += feesForTerm;
        classData[student.class].totalOutstanding += student.outstandingFees;
        classData[student.class].studentCount++;
    });
    return Object.entries(classData).map(([className, data]) => ({ className, ...data }));
};

export const calculatePayrollForMember = (member: TeamMember, year: number, month: number, settings: PayrollSettings): Payslip | null => {
    if (!member.salaryInfo || member.salaryInfo.baseSalary <= 0) return null;
    if (member.salaryInfo.payslips.some(p => p.year === year && p.month === month)) return null;

    const { baseSalary, allowances, deductions } = member.salaryInfo;
    const grossSalary = baseSalary + allowances.reduce((sum, a) => sum + a.amount, 0);
    const pension = baseSalary * settings.employeePensionRate;
    const annualTaxableIncome = (grossSalary - pension) * 12;

    let payeTaxAnnual = 0;
    let remainingIncome = annualTaxableIncome;
    let lastBracketLimit = 0;

    settings.payeBrackets.forEach(bracket => {
        if (remainingIncome > 0) {
            const taxableInBracket = Math.min(remainingIncome, bracket.upTo - lastBracketLimit);
            payeTaxAnnual += taxableInBracket * bracket.rate;
            remainingIncome -= taxableInBracket;
            lastBracketLimit = bracket.upTo;
        }
    });
    
    const payeTax = payeTaxAnnual / 12;
    const totalDeductions = payeTax + pension + deductions.reduce((sum, d) => sum + d.amount, 0);
    const netSalary = grossSalary - totalDeductions;
    
    return { 
        id: `payslip_${member.id}_${year}_${month}`, 
        teamMemberId: member.id, 
        year, 
        month, 
        baseSalary, 
        allowances, 
        deductions, 
        grossSalary, 
        payeTax, 
        pension, 
        totalDeductions, 
        netSalary 
    };
};