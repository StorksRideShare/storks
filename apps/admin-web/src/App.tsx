import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import './App.css';
import EmergencyReport from './components/EmergencyReport';

// Enhanced metrics to include SLA and Safety indicators 
interface MetricsResponse {
  activeRides: number;
  cpuUsage: number;
  systemHealth: string;
  slaUptime: string;
  timestamp: string;
}

const Dashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<MetricsResponse>({
    activeRides: 8,
    cpuUsage: 32,
    systemHealth: "Optimal",
    slaUptime: "99.98%",
    timestamp: new Date().toISOString(),
  });

  // Demo data for System Metrics Over Time 
  const chartData = [
    { time: '08:00', rides: 4, cpu: 20 },
    { time: '08:10', rides: 9, cpu: 45 },
    { time: '08:20', rides: 7, cpu: 30 },
    { time: '08:30', rides: 12, cpu: 55 },
    { time: '08:40', rides: 8, cpu: 32 },
  ];

  return (
    <div className="dashboard-container">
      <h1 className="dashboard-title">Observability Dashboard</h1>
      
      {/* Real-Time Monitoring & Alerting Section  */}
      <div className="metrics-grid">
        <div className="metric-card">
          <h3 className="metric-label">Active Rides</h3>
          <p className="metric-value">{metrics.activeRides}</p>
        </div>
        <div className="metric-card">
          <h3 className="metric-label">System Health</h3>
          <p className="metric-value-health">{metrics.systemHealth}</p>
        </div>
        <div className="metric-card">
          <h3 className="metric-label">SLA Uptime</h3>
          <p className="metric-value-small">{metrics.slaUptime}</p>
        </div>
        <div className="metric-card">
          <h3 className="metric-label">CPU Load</h3>
          <p className="metric-value">{metrics.cpuUsage}%</p>
        </div>
      </div>

      {/* Safety Oversight: Driver Scoring & Compliance  */}
      <section className="safety-section">
        <h2 className="section-title">Safety Oversight & Compliance</h2>
        <table className="safety-table">
          <thead>
            <tr className="table-header">
              <th className="table-header-cell">Driver/Vehicle</th>
              <th className="table-header-cell">Safety Score</th>
              <th className="table-header-cell">Status</th>
              <th className="table-header-cell">Compliance</th>
            </tr>
          </thead>
          <tbody>
            <tr className="table-row">
              <td className="table-cell">John Doe (V-102)</td>
              <td className="table-cell safety-score-high">4.9/5.0</td>
              <td className="table-cell">Active</td>
              <td className="table-cell compliance-verified">✅ Documents Verified</td>
            </tr>
            <tr className="table-row">
              <td className="table-cell">Jane Smith (V-205)</td>
              <td className="table-cell safety-score-warning">3.2/5.0</td>
              <td className="table-cell">Warning</td>
              <td className="table-cell compliance-warning">⚠️ Insurance Expires in 2 days</td>
            </tr>
          </tbody>
        </table>
      </section>

      {/* Observability: Performance Metrics  */}
      <section className="performance-section">
        <h2 className="performance-title">System Performance Metrics</h2>
        <LineChart width={800} height={300} data={chartData} className="chart-container">
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis dataKey="time" stroke="#94a3b8" />
          <YAxis stroke="#94a3b8" />
          <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155' }} />
          <Line type="monotone" dataKey="rides" stroke="#f97316" strokeWidth={3} />
          <Line type="monotone" dataKey="cpu" stroke="#64748b" />
        </LineChart>
      </section>

      <EmergencyReport />

      {/* Security Infrastructure: Access Logs  */}
      <section className="audit-section">
        <h3 className="audit-title">Security Audit Trail (Access Logging)</h3>
        <ul className="audit-list">
          <li>[09:15:02] User Admin: Updated Privacy Retention Policy </li>
          <li>[08:45:10] System: Automated Vulnerability Scan Completed - 0 Threats </li>
          <li>[08:00:00] Network: DDoS Protection Layer Re-initialized </li>
        </ul>
      </section>
    </div>
  );
};

// Privacy Framework 
const PrivacySettings: React.FC = () => {
  return (
    <div className="privacy-container">
      <h1 className="privacy-title">Privacy Protection Framework</h1>
      <div className="privacy-card">
        <div className="privacy-section">
          <h3>Data Anonymization</h3>
          <p className="privacy-section-title">Personal identifiers are masked in all analytics logs for GDPR compliance.</p>
          <button className="privacy-button">Enable Anonymizer</button>
        </div>
        <hr className="privacy-divider" />
        <div className="privacy-section-top">
          <h3>Retention Policy </h3>
          <p>Current Setting: <strong>30 Days</strong></p>
          <p className="retention-text">Logs older than 30 days are automatically purged from the encrypted vault.</p>
        </div>
      </div>
    </div>
  );
};

const Home: React.FC = () => {
  return (
    <div className="App">
      <header className="App-header">
        <h1 className="home-title">Storks <span className="home-accent">Admin</span></h1>
        <p className="home-subtitle">SECURITY • PRIVACY • OBSERVABILITY </p>
        <Link to="/dashboard" className="home-link">
          Launch Info Platform
        </Link>
      </header>
    </div>
  );
};

function App() {
  return (
    <Router>
      <nav className="nav">
        <Link to="/" className="nav-link">Home</Link>
        <Link to="/dashboard" className="nav-link-active">Observability</Link>
        <Link to="/privacy" className="nav-link">Privacy</Link>
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