// apps/admin-web/src/components/EmergencyReport.tsx
import React, { useEffect, useState } from 'react';
import { getApiClient } from '../apiClient';

interface Alert {
  alertType: string;
  distanceKm?: number;
  driverId: string;
  parentId: string;
  timestamp: string;
}

const EmergencyReport = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);

  const fetchAlerts = async () => {
    const apiClient = getApiClient("booking-and-payment");
    const data = await apiClient.get<Alert[]>('/api/emergency/report');
    setAlerts(data);
  };

  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 5000); // refresh every 5s
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ marginTop: 30 }}>
      <h2>🚨 Live Emergency Alerts</h2>
      <table border={1} style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th>Type</th><th>Distance (km)</th><th>Driver ID</th><th>Parent ID</th><th>Time</th>
          </tr>
        </thead>
        <tbody>
          {alerts.map((a, i) => (
            <tr key={i}>
              <td>{a.alertType}</td>
              <td>{a.distanceKm ? a.distanceKm.toFixed(2) : 'N/A'}</td>
              <td>{a.driverId}</td>
              <td>{a.parentId}</td>
              <td>{new Date(a.timestamp).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default EmergencyReport;

export {};