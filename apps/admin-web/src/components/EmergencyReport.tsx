import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface Emergency {
  id: string;
  rideId: string;
  userId: string;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  timestamp: string;
  resolved: boolean;
}

const EmergencyReport: React.FC = () => {
  const [emergencies, setEmergencies] = useState<Emergency[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEmergencies();
  }, []);

  const fetchEmergencies = async () => {
    try {
      const token = localStorage.getItem('token');
      // Try to fetch from API, fallback to mock data if unavailable
      const response = await axios.get('http://localhost:8081/api/admin/emergencies', {
        headers: {
          Authorization: token ? `Bearer ${token}` : undefined,
        },
      }).catch(() => ({ data: [] }));

      setEmergencies(response.data || []);
    } catch (error) {
      console.warn('Could not fetch emergencies, displaying empty state:', error);
      setEmergencies([]);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return '#dc2626';
      case 'high':
        return '#ea580c';
      case 'medium':
        return '#f59e0b';
      case 'low':
        return '#3b82f6';
      default:
        return '#6b7280';
    }
  };

  return (
    <section style={{ marginBottom: '40px' }}>
      <h2>Emergency Reports</h2>
      {loading ? (
        <p>Loading emergency reports...</p>
      ) : emergencies.length === 0 ? (
        <div style={{
          background: '#dbeafe',
          padding: '20px',
          borderRadius: '8px',
          textAlign: 'center',
          color: '#0c4a6e'
        }}>
          ✅ No active emergencies reported
        </div>
      ) : (
        <div style={{
          maxWidth: '800px',
          margin: '0 auto'
        }}>
          {emergencies.map((emergency) => (
            <div
              key={emergency.id}
              style={{
                background: '#fff',
                border: `3px solid ${getSeverityColor(emergency.severity)}`,
                padding: '16px',
                borderRadius: '8px',
                marginBottom: '12px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <div>
                <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>
                  {emergency.type}
                </div>
                <div style={{ fontSize: '0.9rem', color: '#666', marginTop: '4px' }}>
                  {emergency.description}
                </div>
                <div style={{ fontSize: '0.85rem', color: '#999', marginTop: '8px' }}>
                  Ride ID: {emergency.rideId} | Time: {new Date(emergency.timestamp).toLocaleTimeString()}
                </div>
              </div>
              <div style={{
                background: getSeverityColor(emergency.severity),
                color: 'white',
                padding: '8px 12px',
                borderRadius: '4px',
                fontWeight: 'bold',
                textTransform: 'uppercase',
                fontSize: '0.75rem'
              }}>
                {emergency.severity}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default EmergencyReport;
