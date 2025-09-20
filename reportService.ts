import { School, TeamMember, Payslip, PayrollSettings, Term } from './types.ts';

/**
 * Generates a summary of financial activity within a given date range.
 */
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

/**
 * Generates a debt aging report by bucketing outstanding fees based on their due dates.
 */
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

/**
 * Generates a report comparing fee collection performance across different classes for a specific term.
 */
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

/**
 * Calculates a single payslip for a team member for a specific month and year.
 */
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
