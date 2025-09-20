
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { School, PlatformConfig, Student } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
const model = 'gemini-2.5-flash';

// --- AI DEBT ANALYSIS ---
export const getAiDebtAnalysis = async (highRiskStudents: Student[]): Promise<{ summary: string, recommendations: string[] }> => {
    if (!process.env.API_KEY) {
        // Return mock data if API key is not available
        return new Promise(resolve => setTimeout(() => resolve({
            summary: "Based on the data, there is a significant concentration of debt among a few students with a history of late payments. Proactive communication is key.",
            recommendations: [
                "Initiate personalized payment plan discussions with parents of students owing over ₦100,000.",
                "Send a targeted SMS reminder to all high-risk parents this week.",
                "Consider a small, temporary discount for immediate full settlement of outstanding fees.",
                "Review the fee structure for the upcoming term to identify potential affordability issues."
            ]
        }), 1500));
    }
    
    const studentData = highRiskStudents.map(s => ` - ${s.name}: Owes NGN ${s.outstandingFees.toLocaleString()}, Parent: ${s.parentName}, Last Paid: ${s.lastPaymentDate ? new Date(s.lastPaymentDate).toLocaleDateString() : 'N/A'}`).join('\n');

    const prompt = `
        You are a financial analyst for a Nigerian school.
        Analyze the following list of high-risk student debtors and provide a brief summary and 3-4 actionable recommendations to reduce debt.
        
        Student Debt Data:
        ${studentData}
        
        Provide your response in a JSON object with two keys: "summary" (a string) and "recommendations" (an array of strings).
    `;

    try {
        const response = await ai.models.generateContent({
            model,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
            }
        });
        
        const jsonString = response.text;
        const result = JSON.parse(jsonString);
        return result;
    } catch (error) {
        console.error("Error fetching AI debt analysis:", error);
        throw new Error("The AI analysis service is currently unavailable.");
    }
};

// --- AI CHATBOT RESPONSE ---
export const getAiChatResponse = async (
    school: School,
    platformConfig: PlatformConfig,
    history: { role: 'user' | 'model', parts: { text: string }[] }[],
    userMessage: string
): Promise<string> => {
     if (!process.env.API_KEY) {
        return new Promise(resolve => setTimeout(() => resolve("This is a mock AI response as the API key is not configured."), 500));
    }

    const systemInstruction = `
        You are FeePilot AI, a helpful assistant for school administrators using the SchoolFees.NG platform.
        Your goal is to be helpful, concise, and guide users to perform actions.
        You can provide information based on the school's data and trigger actions using special tags.
        
        Available Actions:
        - Guide a user to a page: [GUIDE:ViewName] (e.g., [GUIDE:Students])
        - Trigger a print action: [ACTION:PRINT:docType:studentId1,studentId2] (docType can be 'invoice' or 'receipt')
        - Trigger an SMS reminder: [ACTION:SEND_SMS:studentId]
        
        School Data Context:
        - School Name: ${school.name}
        - Current Term: ${school.currentTerm}, ${school.currentSession}
        - Total Students: ${school.students.length}
        - Total Outstanding Fees: NGN ${school.students.reduce((sum, s) => sum + s.outstandingFees, 0).toLocaleString()}
    `;

    try {
        const chat = ai.chats.create({
            model,
            config: { systemInstruction },
            history,
        });

        const response: GenerateContentResponse = await chat.sendMessage({ message: userMessage });
        return response.text;
    } catch (error) {
        console.error("Error fetching AI chat response:", error);
        throw new Error("The AI chat service is currently unavailable.");
    }
};
