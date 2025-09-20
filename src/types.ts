
export enum RiskLevel {
    Low = 'Low',
    Medium = 'Medium',
    High = 'High',
}

export enum Term {
    First = 'First Term',
    Second = 'Second Term',
    Third = 'Third Term',
}

export interface Fee {
    id: string;
    type: string;
    amount: number;
    paidAmount: number;
    dueDate: string;
    session: string;
    term: Term;
    created_at?: string;
}

export interface PaymentAllocation {
    feeId: string;
    amount: number;
}

export interface Payment {
    id: string;
    studentId: string;
    amount: number;
    date: string;
    method: 'Card' | 'Bank Transfer' | 'Mobile Money' | 'Manual Bank Transfer' | 'Paystack' | 'Flutterwave';
    status: 'Completed' | 'Pending Verification' | 'Failed' | 'Rejected';
    description: string;
    allocations: PaymentAllocation[];
    proofOfPaymentUrl?: string;
    created_at?: string;
}

export interface Discount {
    id: string;
    description: string;
    amount: number;
    created_at?: string;
}

export interface Student {
    id: string;
    name: string;
    admissionNumber: string;
    class: string;
    dateOfBirth: string;
    parentName: string;
    parentEmail: string;
    parentPhone: string;
    parentRelationship: 'Father' | 'Mother' | 'Guardian';
    preferredPaymentMethod: 'Card' | 'Bank Transfer' | 'Mobile Money' | 'Manual Bank Transfer';
    totalFees: number;
    amountPaid: number;
    outstandingFees: number;
    lastPaymentDate: string | null;
    debtRisk: RiskLevel;
    fees: Fee[];
    payments: Payment[];
    discounts: Discount[];
    created_at?: string;
}

export enum ApplicationStatus {
    Applied = 'Applied',
    AwaitingTest = 'Awaiting Test',
    OfferedAdmission = 'Offered Admission',
    AdmissionDeclined = 'Admission Declined',
    Enrolled = 'Enrolled',
}

export interface Applicant {
    id: string;
    name: string;
    applyingForClass: string;
    dateOfBirth: string;
    parentName: string;
    parentEmail: string;
    parentPhone: string;
    applicationDate: string;
    status: ApplicationStatus;
    created_at?: string;
}


export interface FeeDefinition {
    id: string;
    name: string;
    amounts: { class: string; amount: number; type: 'mandatory' | 'optional' }[];
    created_at?: string;
}

export interface Allowance {
    id: string;
    type: 'allowance';
    name: string;
    amount: number;
}

export interface Deduction {
    id: string;
    type: 'deduction';
    name: string;
    amount: number;
}

export interface Payslip {
    id: string;
    teamMemberId: string;
    year: number;
    month: number;
    baseSalary: number;
    allowances: Allowance[];
    deductions: Deduction[];
    grossSalary: number;
    payeTax: number;
    pension: number;
    totalDeductions: number;
    netSalary: number;
    created_at?: string;
}

export interface SalaryInfo {
    baseSalary: number;
    allowances: Allowance[];
    deductions: Deduction[];
    payslips: Payslip[];
}

export interface TeamMember {
    id: string;
    name: string;
    email: string;
    role: string;
    salaryInfo?: SalaryInfo;
    assignedClasses?: string[];
    created_at?: string;
}

export interface PayeBracket {
    rate: number;
    upTo: number;
}

export interface PayrollSettings {
    employeePensionRate: number;
    payeBrackets: PayeBracket[];
}

export interface Income {
    id: string;
    description: string;
    category: 'Donation' | 'Grant' | 'Facility Rental' | 'Other';
    amount: number;
    date: string;
    created_at?: string;
}

export interface Expenditure {
    id: string;
    description: string;
    category: 'Salaries' | 'Utilities' | 'Supplies' | 'Maintenance' | 'Other';
    amount: number;
    date: string;
    created_at?: string;
}

export type Transaction = Income | Expenditure;

export interface School {
    id: string;
    slug: string;
    name: string;
    address: string;
    contactPhone: string;
    logoUrl?: string;
    students: Student[];
    teamMembers: TeamMember[];
    applicants: Applicant[];
    feeDefinitions: FeeDefinition[];
    adminUser: { name: string, email: string };
    planId: string;
    subscriptionEndDate: string | null;
    pendingPlanId: string | null;
    cancellationPending: boolean;
    paymentSettings: {
        enabledGateways: ('paystack' | 'flutterwave')[];
        gatewayCredentials: { [key: string]: any };
        bankDetails?: {
            bankName: string;
            accountName: string;
            accountNumber: string;
        }
    };
    smsSettings: {
        enabledGateway: string | null;
        gatewayCredentials: { [key: string]: any };
        reminderTemplate: string;
        manualTemplates: { id: string, name: string, body: string, type: 'reminder' | 'receipt' | 'general' }[];
    };
    communicationSettings: {
        emailProvider: 'feepilot' | 'smtp';
        smtpSettings: any;
        whatsappProvider: 'manual' | 'api';
        whatsappApiSettings: any;
        automatedReminders: { enabled: boolean, daysAfterDueDate: number };
        transactionalNotifications: {
            paymentConfirmation: {
                enabled: boolean;
                emailSubject: string;
                emailTemplate: string;
                smsTemplate: string;
                whatsappTemplate: string;
            }
        };
        manualTemplates: { id: string, name: string, subject: string, body: string, type: 'reminder' | 'receipt' | 'general' }[];
    };
    otherIncome: Income[];
    expenditures: Expenditure[];
    currentSession: string;
    currentTerm: Term;
    landingPageContent: {
        heroTitle: string;
        heroSubtitle: string;
        heroImageUrl?: string;
    };
    internalNotes?: string;
    payrollSettings: PayrollSettings;
    created_at?: string;
}

export type BursarySubView = 'Student Payments' | 'Invoices & Receipts' | 'Other Income' | 'Expenditures' | 'Payroll' | 'Reconciliation' | 'Fee Structure';

export type View =
    | 'Dashboard'
    | 'Students'
    | 'Admissions'
    | 'Team'
    | 'Reports'
    | 'Communication'
    | 'Printing'
    | 'AI Insights'
    | 'Knowledge Base'
    | 'Settings'
    | 'More'
    | 'Admin CMS'
    | 'Bursary'
    | BursarySubView;

export enum UserRole {
    Administrator = 'Administrator',
    Manager = 'Manager',
    Editor = 'Editor',
    Viewer = 'Viewer',
}

export type CurrentUser =
    | { role: 'superAdmin'; id: string; name: string; email: string; userRole: UserRole }
    | { role: 'schoolAdmin'; schoolId: string; id: string; name: string; email: string; }
    | { role: 'parent'; schoolId: string; id: string; name: string; email: string; childrenIds: string[] }
    | { role: 'teacher'; schoolId: string; id: string; name: string; email: string; assignedClasses: string[] }
    | { role: 'staff'; schoolId: string; id: string; name: string; email: string; };

export interface PricingPlan {
    id: string;
    name: string;
    prices: {
        monthly: number;
        termly: number;
        yearly: number;
    };
    studentLimit: number;
    teamMemberLimit: number;
    features: string[];
}

export interface Testimonial {
    quote: string;
    name: string;
    title: string;
}

export interface Feature {
    id: string;
    title: string;
    description: string;
    icon: 'Communication' | 'Payments' | 'Analytics';
    imageUrl: string;
}

export interface BlogPost {
    id: string;
    slug: string;
    title: string;
    excerpt: string;
    content: string;
    authorId: string;
    status: 'Draft' | 'Published';
    createdAt: string;
    imageUrl?: string;
}

export interface KnowledgeBaseArticle {
    id: string;
    slug: string;
    title: string;
    content: string;
    category: string;
    status: 'Draft' | 'Published';
    createdAt: string;
}

export interface LandingPageSection {
    id: 'hero' | 'features' | 'testimonials' | 'pricing' | 'cta' | 'blog' | 'howItWorks';
}

export interface PlatformConfig {
    websiteContent: {
        siteTitle: string;
        logoUrl: string;
        whatsappNumber?: string;
        trustedByLogos: string[];
        menuItems: { text: string; link: string }[];
        hero: {
            title: string;
            subtitle: string;
            backgroundImageUrl?: string;
        };
        features: Feature[];
        testimonials: {
            title: string;
            items: Testimonial[];
        };
        cta: {
            title: string;
            subtitle: string;
            buttonText: string;
        };
        theme: {
            primary: string;
            secondary: string;
            accent: string;
        };
        sectionOrder: LandingPageSection['id'][];
    };
    pricingPlans: PricingPlan[];
    coupons: {
        id: string;
        code: string;
        discountPercent: number;
        status: 'Active' | 'Expired';
        expiryDate: string | null;
    }[];
    paymentGateways: { id: string; name: string; logoUrl: string; isEnabled: boolean }[];
    smsGateways: { id: string; name: string; isEnabled: boolean }[];
    users: { id: string; name: string; email: string; role: UserRole }[];
    supportTickets: any[]; // Define more strictly if needed
    knowledgeBaseArticles: KnowledgeBaseArticle[];
    blogPosts: BlogPost[];
}

export interface NewSchoolRegistrationData {
    schoolName: string;
    schoolAddress: string;
    schoolPhone: string;
    username: string;
    adminName: string;
    adminEmail: string;
}
