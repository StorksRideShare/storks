import React from 'react';

const EmergencyReport: React.FC = () => {
  // Demo Emergency Data for Viva 
  const demoEmergencies = [
    {
      id: "EM-001",
      type: "Route Deviation Alert",
      severity: "high",
      description: "Vehicle V-205 moved 2km outside the student safety zone.",
      timestamp: new Date().toISOString(),
      rideId: "RID-9921"
    },
    {
      id: "EM-002",
      type: "SOS Button Triggered",
      severity: "critical",
      description: "Passenger initiated emergency silent alarm. End-to-end encryption active.",
      timestamp: new Date().toISOString(),
      rideId: "RID-8840"
    }
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return '#dc2626';
      case 'high': return '#f97316';
      default: return '#94a3b8';
    }
  };

  return (
    <section style={{ marginBottom: '40px' }}>
      <h2 style={{ color: '#f97316' }}>Emergency Reports & Incidents </h2>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        {demoEmergencies.map((emergency) => (
          <div
            key={emergency.id}
            style={{
              background: '#1e293b',
              borderLeft: `6px solid ${getSeverityColor(emergency.severity)}`,
              padding: '20px',
              borderRadius: '8px',
              marginBottom: '15px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderTop: '1px solid #334155',
              borderRight: '1px solid #334155',
              borderBottom: '1px solid #334155'
            }}
          >
            <div>
              <div style={{ fontWeight: 'bold', fontSize: '1.2rem', color: '#f8fafc' }}>
                {emergency.type} 
                <span style={{ fontSize: '0.8rem', color: '#64748b', marginLeft: '10px' }}>ID: {emergency.id}</span>
              </div>
              <div style={{ fontSize: '0.95rem', color: '#cbd5e1', marginTop: '6px' }}>
                {emergency.description}
              </div>
              <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '10px' }}>
                Ride: {emergency.rideId} | Tracker Status: <span style={{ color: '#22c55e' }}>Live Monitoring Active</span> 
              </div>
            </div>
            <div style={{
              background: getSeverityColor(emergency.severity),
              color: 'white',
              padding: '8px 16px',
              borderRadius: '6px',
              fontWeight: '800',
              textTransform: 'uppercase',
              fontSize: '0.75rem'
            }}>
              {emergency.severity}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default EmergencyReport;