import React, { useState } from 'react';
import { School, TeamMember } from '../types';
import { updateTeamMember, removeTeamMember } from '../services/schoolService';
import EditMemberModal, { MemberData } from './EditMemberModal';

interface TeamPageProps {
  school: School;
  refreshData: () => Promise<void>;
}

const TeamPage: React.FC<TeamPageProps> = ({ school, refreshData }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingMember, setEditingMember] = useState<TeamMember | null>(null);

    const handleOpenModal = (member: TeamMember | null = null) => {
        setEditingMember(member);
        setIsModalOpen(true);
    };

    const handleSaveMember = async (data: MemberData, memberId?: string) => {
        try {
            if (memberId) {
                await updateTeamMember(memberId, data);
            } else {
                // In a real app, this would be an `addTeamMember` service function
                console.log("SIMULATING: Add new team member", data);
            }
            await refreshData();
            setIsModalOpen(false);
            setEditingMember(null);
        } catch (error) {
            console.error("Failed to save team member:", error);
            alert("Could not save team member. Please try again.");
        }
    };
    
    const handleRemoveMember = async (memberId: string) => {
        if (confirm("Are you sure you want to remove this team member?")) {
            try {
                await removeTeamMember(memberId);
                await refreshData();
            } catch(error) {
                console.error("Failed to remove team member:", error);
                alert("Could not remove team member. Please try again.");
            }
        }
    };

    return (
        <div className="card bg-base-100 shadow">
            <div className="card-body">
              <div className="flex justify-between items-center mb-4">
                  <h3 className="card-title text-secondary">Team Management</h3>
                  <button onClick={() => handleOpenModal()} className="btn btn-primary btn-sm">
                      Add Member
                  </button>
              </div>
              <div className="overflow-x-auto">
                  <table className="table w-full">
                      <thead>
                          <tr>
                              <th>Name</th>
                              <th>Email</th>
                              <th>Role</th>
                              <th></th>
                          </tr>
                      </thead>
                      <tbody>
                          {school.teamMembers.map((member) => (
                              <tr key={member.id} className="hover">
                                  <td className="font-medium text-secondary">{member.name}</td>
                                  <td>{member.email}</td>
                                  <td>{member.role}</td>
                                  <td className="text-right space-x-2">
                                      <button onClick={() => handleOpenModal(member)} className="btn btn-ghost btn-xs">Edit</button>
                                      <button onClick={() => handleRemoveMember(member.id)} className="btn btn-ghost btn-xs text-error">Remove</button>
                                  </td>
                              </tr>
                          ))}
                      </tbody>
                  </table>
              </div>
            </div>
            {isModalOpen && <EditMemberModal member={editingMember} onClose={() => setIsModalOpen(false)} onSave={handleSaveMember} />}
        </div>
    );
};

export default TeamPage;