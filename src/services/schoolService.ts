import { getSupabase } from '../supabaseClient.ts';
import { 
    School, 
    Student,
    TeamMember,
    Applicant,
    Income,
    Expenditure,
    Payment,
    Discount,
    Term
} from '../types.ts';
import { mockSchools } from './mockData.ts';

let offlineSchools = JSON.parse(JSON.stringify(mockSchools));

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

// Helper for safely updating JSONB data to avoid race conditions.
const updateSchoolData = async (schoolId: string, updateFn: (school: School) => Partial<School>): Promise<School> => {
    const supabase = getSupabase();
     if (!supabase) {
        console.log(`Offline mode: Updating school ${schoolId}`);
        const schoolIndex = offlineSchools.findIndex((s: School) => s.id === schoolId);
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

export const updateSchool = (schoolId: string, updates: Partial<School>): Promise<School> => {
    return updateSchoolData(schoolId, () => updates);
};

export const addStudent = async (schoolId: string, studentData: Omit<Student, 'id'>): Promise<Student> => {
    const newStudent = { ...studentData, id: `stu_${schoolId}_${Date.now()}` };
    await updateSchoolData(schoolId, school => ({ students: [...school.students, newStudent] }));
    return newStudent;
};

export const updateStudent = async (studentId: string, updates: Partial<Student>): Promise<Student> => {
    const schoolIndex = offlineSchools.findIndex((s: School) => s.students.some(st => st.id === studentId));
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
    const newStudents = school.students.map((st: Student) => {
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
     const schoolIndex = offlineSchools.findIndex((s: School) => s.students.some(st => st.id === studentId));
     if (schoolIndex === -1) throw new Error("School not found for payment operation.");
    
    const newPayment = { ...paymentData, studentId, id: `pay_${Date.now()}`};
    const school = offlineSchools[schoolIndex];
    const newStudents = school.students.map((st: Student) => {
        if (st.id === studentId) {
            return { ...st, payments: [...st.payments, newPayment] };
        }
        return st;
    });
    offlineSchools[schoolIndex] = { ...school, students: newStudents };
    return newPayment;
};

export const addDiscount = async (studentId: string, discountData: Omit<Discount, 'id'>): Promise<Discount> => {
    const schoolIndex = offlineSchools.findIndex((s: School) => s.students.some(st => st.id === studentId));
    if (schoolIndex === -1) throw new Error("School not found for discount operation.");
    
    const newDiscount = { ...discountData, id: `disc_${Date.now()}` };
    const school = offlineSchools[schoolIndex];
    const newStudents = school.students.map((st: Student) => {
        if (st.id === studentId) {
            return { ...st, discounts: [...(st.discounts || []), newDiscount] };
        }
        return st;
    });
    offlineSchools[schoolIndex] = { ...school, students: newStudents };
    return newDiscount;
};

export const updateTeamMember = async (memberId: string, updates: Partial<TeamMember>): Promise<TeamMember> => {
    const schoolIndex = offlineSchools.findIndex((s: School) => s.teamMembers.some(m => m.id === memberId));
    if (schoolIndex === -1) throw new Error("School for the given team member not found.");

    let updatedMember: TeamMember | null = null;
    const school = offlineSchools[schoolIndex];
    const newMembers = school.teamMembers.map((m: TeamMember) => {
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
    const schoolIndex = offlineSchools.findIndex((s: School) => s.teamMembers.some(m => m.id === memberId));
    if (schoolIndex === -1) throw new Error("School for the given team member not found.");
    
    const school = offlineSchools[schoolIndex];
    offlineSchools[schoolIndex] = { ...school, teamMembers: school.teamMembers.filter((m: TeamMember) => m.id !== memberId) };
};

export const addApplicant = async (schoolId: string, applicantData: Omit<Applicant, 'id'>): Promise<Applicant> => {
    const newApplicant = { ...applicantData, id: `app_${schoolId}_${Date.now()}` };
    await updateSchoolData(schoolId, school => ({ applicants: [...school.applicants, newApplicant] }));
    return newApplicant;
};

export const updateApplicant = async (applicantId: string, updates: Partial<Applicant>): Promise<Applicant> => {
    const schoolIndex = offlineSchools.findIndex((s: School) => s.applicants.some(a => a.id === applicantId));
    if (schoolIndex === -1) throw new Error("School for the given applicant not found.");

    let updatedApplicant: Applicant | null = null;
    const school = offlineSchools[schoolIndex];
    const newApplicants = school.applicants.map((a: Applicant) => {
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


// --- REPORTING LOGIC ---

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