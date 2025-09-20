import React, { useState, useRef, useEffect } from 'react';
import { getAiChatResponse } from '../services/geminiService.ts';
import { School, PlatformConfig, View } from '../types.ts';
import { triggerPrint } from '../services/printService.ts';

interface AiChatbotProps {
  school: School;
  platformConfig: PlatformConfig;
  onGuideRequest: (view: View) => void;
  activeView: View;
}

type Action = {
    type: 'ACTION' | 'GUIDE';
    payload: string;
};

type Message = {
    sender: 'user' | 'ai';
    text: string;
    actions?: Action[];
}

const getSuggestionsForView = (view: View): string[] => {
    switch (view) {
        case 'Dashboard':
            return [
                "What's my school's debt risk profile?",
                "Identify my top 5 high-risk debtors.",
                "How can I improve my school's revenue?",
                "Summarize my financial performance this term.",
            ];
        case 'Students':
            return [
                "How do I add a new student?",
                "Show me all students in JSS1.",
                "Record a payment for a student.",
                "Find a student by admission number.",
            ];
        case 'Invoices & Receipts':
             return [
                "How do I view all overdue invoices?",
                "Print receipts for all fully paid students.",
                "What's the total outstanding amount for SSS3?",
            ];
        case 'Reports':
            return [
                "Generate a debt aging report.",
                "Show me a financial summary for this month.",
                "Compare fee collection across different classes.",
            ];
        case 'Settings':
            return [
                "How do I change the school's bank details?",
                "Update the automated reminder message.",
                "How do I add a new fee type?",
            ];
        case 'Bursary':
        case 'Student Payments':
        case 'Other Income':
        case 'Expenditures':
        case 'Payroll':
        case 'Reconciliation':
        case 'Fee Structure':
             return [
                "How do I run payroll for my staff?",
                "Record an expense for new books.",
                "Where can I see a list of all income?",
                "How do I set up the fee structure?",
            ];
        default:
            return [
                "How do I run payroll for my staff?",
                "Where can I record an expense for new books?",
                "Print invoices for all students with debt.",
                "How can I increase my school's revenue?",
            ];
    }
};

const AiChatbot: React.FC<AiChatbotProps> = ({ school, platformConfig, onGuideRequest, activeView }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        { sender: 'ai', text: `Hi! I'm your AI assistant. I can help with tasks and answer questions. My suggestions below will change based on the page you're on. How can I assist you today?` }
    ]);
    const [userInput, setUserInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [promptSuggestions, setPromptSuggestions] = useState<string[]>([]);
    
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages]);
    
    useEffect(() => {
        setPromptSuggestions(getSuggestionsForView(activeView));
    }, [activeView]);

    const handleAction = (type: string, payload: string) => {
        const [actionType, ...params] = payload.split(':');
        
        if (type === 'ACTION') {
            if (actionType === 'PRINT') {
                const [docType, studentIdsStr] = params;
                const studentIds = studentIdsStr.split(',');
                const studentsToPrint = school.students.filter(s => studentIds.includes(s.id));
                if (studentsToPrint.length > 0) {
                    triggerPrint(studentsToPrint, docType as any, school, platformConfig);
                }
            } else if (actionType === 'SEND_SMS') {
                const studentId = params[0];
                const student = school.students.find(s => s.id === studentId);
                alert(`SIMULATION: SMS reminder sent to ${student ? student.name : 'student'}'s parent.`);
            }
        }
    };
    
    const handleSend = async (messageToSend: string) => {
        if (!messageToSend.trim() || isLoading) return;
        
        const newMessages: Message[] = [...messages, { sender: 'user', text: messageToSend }];
        setMessages(newMessages);
        setUserInput('');
        setIsLoading(true);

        try {
            const chatHistory = newMessages.slice(0, -1).map(m => ({
                role: m.sender === 'user' ? 'user' : 'model',
                parts: [{ text: m.text }]
            })) as { role: 'user' | 'model', parts: { text: string }[] }[];

            const aiResponse = await getAiChatResponse(school, platformConfig, chatHistory, messageToSend);
            
            const tagRegex = /\[(ACTION|GUIDE):([^\]]+)\]/g;
            let cleanText = aiResponse;
            const responseActions: Action[] = [];
            let match;
            while ((match = tagRegex.exec(aiResponse)) !== null) {
                cleanText = cleanText.replace(match[0], '');
                responseActions.push({ type: match[1] as 'ACTION' | 'GUIDE', payload: match[2] });
            }
            cleanText = cleanText.trim();

            setMessages(prev => [...prev, { sender: 'ai', text: cleanText, actions: responseActions }]);

            // Automatically trigger actions that don't require user clicks
            responseActions.forEach(action => {
                if(action.type === 'ACTION') {
                   setTimeout(() => handleAction(action.type, action.payload), 100);
                }
            });

        } catch (error) {
            console.error("AI chat error:", error);
            const errorMessage = (error instanceof Error) ? error.message : "An unexpected error occurred.";
            setMessages(prev => [...prev, { sender: 'ai', text: `Sorry, I encountered a problem: ${errorMessage} Please try again later.` }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <button onClick={() => setIsOpen(!isOpen)} className="fixed bottom-20 right-6 md:bottom-6 bg-primary text-white w-16 h-16 rounded-full shadow-lg flex items-center justify-center hover:bg-primary/80 transition-transform transform hover:scale-110 z-50">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="m9 12 2 2 4-4"/></svg>
            </button>
            {isOpen && (
                <div className="fixed bottom-36 right-6 md:bottom-24 w-96 h-[32rem] bg-white rounded-xl shadow-2xl flex flex-col z-50 animate-fade-in-up">
                    <header className="bg-primary text-white p-4 rounded-t-xl flex justify-between items-center">
                        <h3 className="font-bold">FeePilot AI Assistant</h3>
                        <button onClick={() => setIsOpen(false)} className="text-white opacity-70 hover:opacity-100">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                        </button>
                    </header>
                    <div className="flex-1 p-4 overflow-y-auto">
                        <div className="space-y-4">
                            {messages.map((msg, index) => (
                                <div key={index} className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                                    <div className={`max-w-xs px-4 py-2 rounded-2xl ${msg.sender === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'}`}>
                                        <p style={{whiteSpace: 'pre-wrap'}}>{msg.text}</p>
                                    </div>
                                    {msg.actions && msg.actions.map((action, i) => {
                                        if (action.type === 'GUIDE') {
                                            return (
                                                <button key={i} onClick={() => { 
                                                    onGuideRequest(action.payload as View); 
                                                    setIsOpen(false); 
                                                }} className="mt-2 text-sm bg-accent/10 text-accent font-semibold px-3 py-1 rounded-lg hover:bg-accent/20">
                                                   Take me to {action.payload} &#8594;
                                                </button>
                                            )
                                        }
                                        return null;
                                    })}
                                </div>
                            ))}
                            {isLoading && (
                                <div className="flex justify-start">
                                    <div className="max-w-xs px-4 py-2 rounded-2xl bg-gray-200 text-gray-800">
                                        <div className="flex items-center space-x-1">
                                            <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse"></div>
                                            <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse [animation-delay:0.2s]"></div>
                                            <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse [animation-delay:0.4s]"></div>
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>
                    </div>
                    <div className="p-4 border-t">
                         {messages.length < 3 && !isLoading && (
                            <div className="mb-3 space-y-2 text-sm">
                                <p className="text-gray-500 font-medium">Try these prompts:</p>
                                {promptSuggestions.map((prompt, i) => (
                                    <button
                                        key={i}
                                        onClick={() => handleSend(prompt)}
                                        className="w-full text-left p-2 bg-gray-100 rounded-lg hover:bg-gray-200 text-primary transition-colors"
                                    >
                                       &#8594; {prompt}
                                    </button>
                                ))}
                            </div>
                        )}
                        <div className="flex space-x-2">
                            <input
                                type="text"
                                value={userInput}
                                onChange={e => setUserInput(e.target.value)}
                                onKeyPress={e => e.key === 'Enter' && handleSend(userInput)}
                                placeholder="Ask a financial question..."
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-1 focus:ring-primary"
                            />
                            <button onClick={() => handleSend(userInput)} className="bg-primary text-white rounded-full p-3 flex-shrink-0 disabled:bg-gray-400">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default AiChatbot;
