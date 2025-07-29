import React, { useState } from 'react';
import MemberDirectory from '../components/MemberDirectory/MemberDirectory';

// PUBLIC_INTERFACE
/**
 * Roster page component for displaying and managing camp members.
 * Shows member directory with crew assignments, status, and buddy info.
 * Enhanced: UI for automatic crew assignment appears above the directory.
 */
const Roster = () => {
  // For demo, stub out crew with static/fake members
  const [setupCrew, setSetupCrew] = useState(['Alice', 'Bob']);
  const [strikeCrew, setStrikeCrew] = useState(['Carol']);
  const [assigning, setAssigning] = useState(false);
  const [status, setStatus] = useState('');

  // PUBLIC_INTERFACE
  const handleAutoAssign = (type) => {
    setAssigning(true);
    setStatus('');
    // Placeholder: Replace with actual backend call and update logic
    setTimeout(() => {
      setStatus(`Auto-assigned ${type === 'setup' ? 'Setup' : 'Strike'} crew from arrival/departure data.`);
      setAssigning(false);
      if (type === 'setup') setSetupCrew(['Alice', 'Bob']);
      else setStrikeCrew(['Carol']);
    }, 1000);
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h2 className="page-title">Member Roster</h2>
        <p className="page-description">
          View and manage camp members, crew assignments, and contact information.
        </p>
      </div>

      <div
        style={{
          padding: 18,
          marginBottom: 18,
          border: '1.5px solid #FF6F00',
          borderRadius: 7,
          background: '#fffbe7'
        }}
      >
        <h3 style={{ color: "#FF6F00", margin: 0 }}>
          Automatic Crew Assignment <span role="img" aria-label="spark">✨</span>
        </h3>
        <div style={{ marginBottom: 8 }}>
          <b>Setup Crew:</b> {setupCrew.length ? setupCrew.join(', ') : '(none)'}
          <button
            style={{
              marginLeft: 8,
              background: '#76FF03',
              border: 'none',
              borderRadius: 5,
              color: '#37474F',
              padding: '3px 14px',
              cursor: assigning ? 'not-allowed' : 'pointer'
            }}
            disabled={assigning}
            onClick={() => handleAutoAssign('setup')}
          >
            {assigning ? "Assigning..." : "Auto-Assign"}
          </button>
        </div>
        <div>
          <b>Strike Crew:</b> {strikeCrew.length ? strikeCrew.join(', ') : '(none)'}
          <button
            style={{
              marginLeft: 8,
              background: '#76FF03',
              border: 'none',
              borderRadius: 5,
              color: '#37474F',
              padding: '3px 14px',
              cursor: assigning ? 'not-allowed' : 'pointer'
            }}
            disabled={assigning}
            onClick={() => handleAutoAssign('strike')}
          >
            {assigning ? "Assigning..." : "Auto-Assign"}
          </button>
        </div>
        <div style={{ color: '#37474F', marginTop: 7, fontSize: '0.93em' }}>
          {status || (
            <>
              Crew will be auto-assigned to <b>setup</b> (pre-event) or <b>strike</b> (post-event)
              jobs using member arrival/departure data.
            </>
          )}
        </div>
      </div>

      <div className="page-content">
        <MemberDirectory />
      </div>
    </div>
  );
};

export default Roster;
