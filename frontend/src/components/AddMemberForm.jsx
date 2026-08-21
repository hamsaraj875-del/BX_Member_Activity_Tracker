import './AddMemberForm.css'
import { useState } from 'react';
import axios from 'axios';

export default function AddMemberForm({ onClose, onMemberAdded }) {
  const [formData, setFormData] = useState({
    name: '', department: '', year: '', bxPosition: '',
    socials: []
  });

  const handleChange = (e) => setFormData({...formData, [e.target.name]: e.target.value });

  const handleSocialChange = (index, e) => {
    const newSocials = [...formData.socials];
    newSocials[index][e.target.name] = e.target.value;
    setFormData({...formData, socials: newSocials });
  };

  const addSocialField = () => setFormData({...formData, socials: [...formData.socials, { platform: '', username: '', url: '' }] });
  const removeSocialField = (index) => setFormData({...formData, socials: formData.socials.filter((_, i) => i!== index) });

  const handleSubmit = async (e) => {
    e.preventDefault();
    await axios.post('http://localhost:5000/api/members', formData);
    onMemberAdded();
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <h2>Add New Member</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group"><label>Full Name</label><input name="name" value={formData.name} onChange={handleChange} required /></div>
          <div className="form-group"><label>BX Position</label><input name="bxPosition" value={formData.bxPosition} onChange={handleChange} /></div>
          <div className="form-row">
            <div className="form-group"><label>Department</label><input name="department" value={formData.department} onChange={handleChange} /></div>
            <div className="form-group"><label>Year</label><input type="number" name="year" value={formData.year} onChange={handleChange} /></div>
          </div>

          <div className="form-group">
            <label>Social Profiles</label>
            {formData.socials.map((social, index) => (
              <div key={index} className="social-row">
                <input name="platform" placeholder="Platform" value={social.platform} onChange={(e) => handleSocialChange(index, e)} />
                <input name="username" placeholder="Username" value={social.username} onChange={(e) => handleSocialChange(index, e)} />
                <input name="url" placeholder="Profile Link" value={social.url} onChange={(e) => handleSocialChange(index, e)} />
                <button type="button" onClick={() => removeSocialField(index)}>X</button>
              </div>
            ))}
            <button type="button" className="btn-add-social" onClick={addSocialField}>+ Add Social Link</button>
          </div>
          
          <div className="btn-group">
            <button type="button" className="btn-cancel" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-save">Save Member</button>
          </div>
        </form>
      </div>
    </div>
  );
}
