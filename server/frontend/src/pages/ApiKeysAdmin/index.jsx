import React, { useState, useEffect } from 'react';
import Header from '../../components/Header/Header';
import './ApiKeys.css';

const ApiKeysAdmin = () => {
  const [keys, setKeys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newKeyData, setNewKeyData] = useState({ name: '', service_id: '' });

  useEffect(() => {
    fetchKeys();
  }, []);

  const fetchKeys = () => {
    fetch('/audit-api/keys')
      .then(res => res.json())
      .then(data => {
        setKeys(data);
        setLoading(false);
      });
  };

  const generateKey = async (e) => {
    e.preventDefault();
    const res = await fetch('/audit-api/keys/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newKeyData)
    });
    if (res.ok) {
      fetchKeys();
      setShowModal(false);
      setNewKeyData({ name: '', service_id: '' });
    }
  };

  return (
    <div className="apikeys-page">
      <Header />
      <div className="apikeys-container">
        <header className="apikeys-header">
          <div>
            <h1>API Management</h1>
            <p>Secure microservice-to-microservice authentication keys.</p>
          </div>
          <button className="btn-primary" onClick={() => setShowModal(true)}>
            Create New Key
          </button>
        </header>

        {loading ? (
          <div className="apikeys-loader">Loading Keys...</div>
        ) : (
          <div className="keys-grid">
            {keys.map(k => (
              <div key={k._id} className="key-card glass">
                <div className="key-header">
                  <h3>{k.name}</h3>
                  <span className="service-id">{k.service_id}</span>
                </div>
                <div className="key-body">
                  <div className="key-value-wrapper">
                    <code>{k.key.substring(0, 8)}••••••••••••••••</code>
                    <button onClick={() => navigator.clipboard.writeText(k.key)}>Copy</button>
                  </div>
                  <div className="key-meta">
                    <span>Created {new Date(k.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {showModal && (
          <div className="modal-overlay">
            <div className="modal glass">
              <h2>Generate New Key</h2>
              <form onSubmit={generateKey}>
                <div className="form-group">
                  <label>Key Name</label>
                  <input 
                    required 
                    placeholder="e.g. Inventory Service Production"
                    value={newKeyData.name}
                    onChange={e => setNewKeyData({ ...newKeyData, name: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Service ID</label>
                  <input 
                    required 
                    placeholder="e.g. inventory-api"
                    value={newKeyData.service_id}
                    onChange={e => setNewKeyData({ ...newKeyData, service_id: e.target.value })}
                  />
                </div>
                <div className="modal-actions">
                  <button type="button" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn-primary">Generate</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ApiKeysAdmin;
