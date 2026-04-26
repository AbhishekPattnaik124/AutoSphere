import React, { useState, useEffect } from 'react';
import Header from '../../components/Header/Header';
import './AuditAdmin.css';

const AuditAdmin = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/audit-api/logs')
      .then(res => res.json())
      .then(data => {
        setLogs(data);
        setLoading(false);
      })
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="audit-admin-page">
      <Header />
      <div className="audit-container">
        <header className="audit-header">
          <h1>Security Audit Trail</h1>
          <p>Real-time immutable log of all critical system actions.</p>
        </header>

        {loading ? (
          <div className="audit-loader">Retrieving Security Logs...</div>
        ) : (
          <div className="audit-list glass">
            <table className="audit-table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Action</th>
                  <th>Service</th>
                  <th>User</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {logs.map(log => (
                  <tr key={log._id}>
                    <td className="time">{new Date(log.timestamp).toLocaleString()}</td>
                    <td className="action-cell">
                      <span className={`action-badge ${log.action.toLowerCase()}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="service">{log.service}</td>
                    <td className="user">{log.user_id || 'System'}</td>
                    <td>
                      <span className={`status-badge ${log.status.toLowerCase()}`}>
                        {log.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuditAdmin;
