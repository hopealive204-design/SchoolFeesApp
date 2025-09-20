import React, { useState } from 'react';
import { School, PricingPlan } from '../../types';
import { updateSchool } from '../../services/schoolService';

interface SchoolDetailsPageProps {
    school: School;
    plans: PricingPlan[];
    onBack: () => void;
    refreshData: () => Promise<void>;
}

type DetailTab = 'Overview' | 'Subscription' | 'Notes';

const SchoolDetailsPage: React.FC<SchoolDetailsPageProps> = ({ school, plans, onBack, refreshData }) => {
    const [activeTab, setActiveTab] = useState<DetailTab>('Overview');
    const [internalNotes, setInternalNotes] = useState(school.internalNotes || '');

    const currentPlan = plans.find(p => p.id === school.planId);
    
    const handleSaveNotes = async () => {
        try {
            await updateSchool(school.id, { internalNotes });
            await refreshData();
            alert('Notes saved!');
        } catch(e) {
            console.error("Failed to save notes", e);
            alert("Could not save notes. Please try again.");
        }
    };
    
    const handleExtendSubscription = async () => {
        const days = prompt("Enter number of days to extend subscription:", "30");
        if (days && !isNaN(Number(days)) && school.subscriptionEndDate) {
            const newEndDate = new Date(school.subscriptionEndDate);
            newEndDate.setDate(newEndDate.getDate() + parseInt(days, 10));
            try {
                await updateSchool(school.id, { subscriptionEndDate: newEndDate.toISOString() });
                await refreshData();
            } catch (e) {
                console.error("Failed to extend subscription", e);
                alert("Could not extend subscription. Please try again.");
            }
        }
    };
    
    const handleCancelPendingAction = async () => {
        if (confirm("Are you sure you want to cancel the pending subscription change?")) {
            try {
                await updateSchool(school.id, { pendingPlanId: null, cancellationPending: false });
                await refreshData();
            } catch (e) {
                 console.error("Failed to cancel pending action", e);
                alert("Could not cancel pending action. Please try again.");
            }
        }
    };

    return (
        <div className="space-y-6">
             <button onClick={onBack} className="btn btn-ghost btn-sm">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                Back to All Schools
            </button>
            <div className="card bg-base-100 shadow">
                <div className="card-body">
                    <div className="flex items-center space-x-4">
                        <div className="avatar">
                            <div className="w-16 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                                <img src={school.logoUrl || `https://picsum.photos/seed/${school.slug}/128/128`} alt={school.name} />
                            </div>
                        </div>
                        <div>
                            <h2 className="card-title text-secondary">{school.name}</h2>
                            <p className="text-base-content/70">{school.address}</p>
                        </div>
                    </div>
                    <div role="tablist" className="tabs tabs-bordered mt-4">
                        {(['Overview', 'Subscription', 'Notes'] as DetailTab[]).map(tab => (
                            <a key={tab} role="tab" className={`tab ${activeTab === tab ? 'tab-active' : ''}`} onClick={() => setActiveTab(tab)}>{tab}</a>
                        ))}
                    </div>
                    <div className="mt-6">
                        {activeTab === 'Overview' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <p><strong>Admin Name:</strong> {school.adminUser.name}</p>
                            <p><strong>Admin Email:</strong> {school.adminUser.email}</p>
                            <p><strong>Contact Phone:</strong> {school.contactPhone}</p>
                            <p><strong>Total Students:</strong> {school.students.length}</p>
                            </div>
                        )}
                        {activeTab === 'Subscription' && (
                            <div>
                                <p><strong>Current Plan:</strong> <span className="font-semibold text-primary">{currentPlan?.name || 'N/A'}</span></p>
                                <p><strong>Renews On:</strong> {school.subscriptionEndDate ? new Date(school.subscriptionEndDate).toLocaleDateString() : 'N/A'}</p>
                                
                                {school.cancellationPending && <p className="text-red-600 font-semibold">Cancellation Pending</p>}
                                {school.pendingPlanId && <p className="text-orange-600 font-semibold">Downgrade to {plans.find(p => p.id === school.pendingPlanId)?.name} pending</p>}

                                <div className="mt-4 space-x-2">
                                    <button onClick={handleExtendSubscription} className="btn btn-sm btn-outline btn-primary">Extend Subscription</button>
                                    {(school.cancellationPending || school.pendingPlanId) && (
                                        <button onClick={handleCancelPendingAction} className="btn btn-sm btn-outline btn-error">Cancel Pending Action</button>
                                    )}
                                </div>
                            </div>
                        )}
                        {activeTab === 'Notes' && (
                            <div>
                                <label htmlFor="internalNotes" className="block text-sm font-medium text-gray-700">Internal Team Notes</label>
                                <textarea id="internalNotes" rows={8} value={internalNotes} onChange={e => setInternalNotes(e.target.value)} className="textarea textarea-bordered mt-1 block w-full"/>
                                <button onClick={handleSaveNotes} className="btn btn-sm btn-primary mt-2">Save Notes</button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SchoolDetailsPage;