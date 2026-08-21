import { useEffect, useState } from 'react';
import axios from 'axios';
import AddMemberForm from './AddMemberForm';
import MemberCard from './MemberCard';
import './AddMemberForm.css'

export default function MembersList() {
  const [members, setMembers] = useState([]);
  const [showForm, setShowForm] = useState(false);

  const fetchMembers = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/members');
      setMembers(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => { fetchMembers(); }, []);

  return (
    <div className="members-container">
      <div className="header">
        <h1>BX Club Members</h1>
        <button className="btn-add" onClick={() => setShowForm(true)}>+ Add Member</button>
      </div>

      <div className="members-table">
        {/* HEADING ROW */}
        <div className="table-header">
          <div>NAME</div>
          <div>DEPARTMENT</div>
          <div>YEAR</div>
          <div>BX-POSITION</div>
          <div>SOCIALS</div>
        </div>

        {/* DATA ROWS */}
        {members.length === 0? (
          <div className="no-data">No members yet. Click + Add Member</div>
        ) : (
          members.map(member => <MemberCard key={member._id} member={member} />)
        )}
      </div>

      {showForm && <AddMemberForm onClose={() => setShowForm(false)} onMemberAdded={fetchMembers} />}
    </div>
  );
}