import { 
    School,
    TeamMember,
    Payslip,
    Expenditure,
    PayrollSettings
} from '../types.ts';
import { updateSchool } from './schoolService.ts';

export const runPayrollForSchool = async (schoolId: string, payslips: Payslip[], totalPayroll: number): Promise<void> => {
    const payrollExpenditure: Expenditure = {
        id: `exp_payroll_${Date.now()}`,
        description: `Payroll for ${new Date(payslips[0].year, payslips[0].month).toLocaleString('default', { month: 'long', year: 'numeric' })}`,
        category: 'Salaries',
        amount: totalPayroll,
        date: new Date().toISOString(),
    };
    
    const schoolUpdater = (school: School): Partial<School> => {
        const updatedTeamMembers = school.teamMembers.map(member => {
            const memberPayslips = payslips.filter(p => p.teamMemberId === member.id);
            if (memberPayslips.length > 0 && member.salaryInfo) {
                return { 
                    ...member, 
                    salaryInfo: { 
                        ...member.salaryInfo, 
                        payslips: [...member.salaryInfo.payslips, ...memberPayslips] 
                    }
                };
            }
            return member;
        });
        
        return { 
            teamMembers: updatedTeamMembers, 
            expenditures: [...(school.expenditures || []), payrollExpenditure] 
        };
    };
    
    // The cast to `any` is a concession to the complexity of functional updates with deep objects in TypeScript.
    // A real backend would handle this transactionally, making this client-side complexity moot.
    await updateSchool(schoolId, schoolUpdater as any);
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