import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { getApiClient } from './apiClient';
import logo from './logo.svg';
import './App.css';
import EmergencyReport from './components/EmergencyReport';

// Type for metrics response from backend
interface MetricsResponse {
  activeRides: number;
  cpuUsage: number;
  memoryUsagePercent: number;
  locationUpdatesLastMinute: number;
  timestamp: string;
}

const mockMetricsData = [
  { time: '12:00', activeRides: 5, cpu: 25 },
  { time: '12:08', activeRides: 7, cpu: 35 },
  { time: '12:16', activeRides: 6, cpu: 30 },
];

const Dashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<MetricsResponse>({
    activeRides: 0,
    cpuUsage: 0,
    memoryUsagePercent: 0,
    locationUpdatesLastMinute: 0,
    timestamp: new Date().toISOString(),
  });

  const [chartData, setChartData] = useState<any[]>([]);

  const fetchMetrics = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.warn('No auth token found - metrics may fail');
      }

      const apiClient = getApiClient("booking-and-payment");
      const newData = await apiClient.get<MetricsResponse>('/api/admin/metrics');

      setMetrics(newData);

      // Append to chart (keep last 10 points)
      setChartData((prev) => {
        const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const newPoint = {
          time,
          activeRides: newData.activeRides,
          cpu: newData.cpuUsage,
        };
        const updated = [...prev, newPoint].slice(-10);
        return updated;
      });
    } catch (error) {
      console.error('Failed to fetch metrics:', error);
    }
  };

  useEffect(() => {
    fetchMetrics();
    const interval = setInterval(fetchMetrics, 8000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>Admin Dashboard - Picksy</h1>

      {/* Real-time summary cards */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', 
        gap: '20px', 
        marginBottom: '40px' 
      }}>
        <div style={{ background: '#e8f5e9', padding: '20px', borderRadius: '8px', textAlign: 'center' }}>
          <h3>Active Rides</h3>
          <p style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#2e7d32' }}>
            {metrics.activeRides}
          </p>
        </div>
        <div style={{ background: '#e3f2fd', padding: '20px', borderRadius: '8px', textAlign: 'center' }}>
          <h3>CPU Usage</h3>
          <p style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#1565c0' }}>
            {metrics.cpuUsage}%
          </p>
        </div>
        <div style={{ background: '#fff3e0', padding: '20px', borderRadius: '8px', textAlign: 'center' }}>
          <h3>Location Updates/min</h3>
          <p style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#ef6c00' }}>
            {metrics.locationUpdatesLastMinute}
          </p>
        </div>
      </div>

      <section style={{ marginBottom: '40px' }}>
        <h2>Live Ride List (mock for demo)</h2>
        <ul style={{ textAlign: 'left', maxWidth: '600px', margin: '0 auto' }}>
          <li>🚗 Ride ID: 1 - Status: <span style={{ color: '#4CAF50' }}>Active</span> - Driver: John</li>
          <li>✅ Ride ID: 2 - Status: <span style={{ color: '#2196F3' }}>Completed</span> - Driver: Jane</li>
          <li>🚗 Ride ID: 3 - Status: <span style={{ color: '#4CAF50' }}>Active</span> - Driver: Mike</li>
        </ul>
      </section>

      <section style={{ marginBottom: '40px' }}>
        <h2>System Metrics Over Time</h2>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <LineChart width={700} height={350} data={chartData.length > 0 ? chartData : mockMetricsData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="activeRides" stroke="#8884d8" name="Active Rides" />
            <Line type="monotone" dataKey="cpu" stroke="#82ca9d" name="CPU Usage %" />
          </LineChart>
        </div>
      </section>

      {/* Emergency Report Component */}
      <EmergencyReport />

      <section>
        <h2>Alert Logs (mock for demo)</h2>
        <ul style={{ textAlign: 'left', maxWidth: '600px', margin: '0 auto' }}>
          <li>✅ All systems operational</li>
          <li>⚠️ High CPU detected earlier - resolved</li>
        </ul>
      </section>

      <p style={{ marginTop: '40px', fontSize: '0.9rem', color: '#666', textAlign: 'center' }}>
        Last updated: {new Date(metrics.timestamp).toLocaleTimeString()}
      </p>
    </div>
  );
};

const PrivacySettings: React.FC = () => {
  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h1>Privacy Settings</h1>
      <p>Share location only during ride: <input type="checkbox" checked readOnly /></p>
      <p>Data retention period: 30 days</p>
      <p>Opt out of analytics: <input type="checkbox" /></p>
    </div>
  );
};

const Home: React.FC = () => {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <h1>Welcome to Storks Admin Panel</h1>
        <p>Security • Privacy • Observability</p>
        <div style={{ display: 'flex', gap: '20px', marginTop: '20px' }}>
          <Link to="/dashboard" style={{ color: '#61dafb', textDecoration: 'none' }}>
            Go to Dashboard →
          </Link>
        </div>
      </header>
    </div>
  );
};

function App() {
  return (
    <Router>
      <nav style={{ 
        padding: '12px 24px', 
        backgroundColor: '#1e293b', 
        color: 'white',
        display: 'flex',
        gap: '32px',
        justifyContent: 'center',
        boxShadow: '0 2px 10px rgba(0,0,0,0.2)'
      }}>
        <Link to="/" style={{ color: '#60a5fa', textDecoration: 'none', fontWeight: 500 }}>Home</Link>
        <Link to="/dashboard" style={{ color: '#60a5fa', textDecoration: 'none', fontWeight: 500 }}>Dashboard</Link>
        <Link to="/privacy" style={{ color: '#60a5fa', textDecoration: 'none', fontWeight: 500 }}>Privacy</Link>
      </nav>
      
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/privacy" element={<PrivacySettings />} />
      </Routes>
    </Router>
  );
}

export default App;