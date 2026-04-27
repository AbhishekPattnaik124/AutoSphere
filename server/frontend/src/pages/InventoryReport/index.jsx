import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart3, Download, Printer, PieChart, Info, ChevronRight, Loader2 } from 'lucide-react';
import PageTransition from '../../components/PageTransition';
import './InventoryReport.css';

const InventoryReport = () => {
  const [dealers, setDealers] = useState([]);
  const [selectedDealer, setSelectedDealer] = useState('');
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch('/djangoapp/get_dealers')
      .then(res => res.json())
      .then(data => setDealers(data.dealers || []));
  }, []);

  const generateReport = async () => {
    if (!selectedDealer) return;
    setLoading(true);
    try {
      const res = await fetch(`/djangoapp/inventory/stats/${selectedDealer}`);
      const data = await res.json();
      setReportData(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const downloadCSV = () => {
    if (!reportData) return;
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Metric,Value\n"
      + `Total Cars,${reportData.summary?.total_cars}\n`
      + `Average Price,${reportData.summary?.avg_price}\n`
      + `Max Price,${reportData.summary?.max_price}\n`
      + `Average Mileage,${reportData.summary?.avg_mileage}\n`;
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `inventory_report_${selectedDealer}.csv`);
    document.body.appendChild(link);
    link.click();
  };

  return (
    <PageTransition>
      <div className="report-page">
        <div className="report-container">
          <header className="report-header">
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <span className="section-label">Enterprise Analytics</span>
              <h1>Inventory Intelligence.</h1>
              <p className="hero-desc">Generate detailed performance and health metrics for any dealership in the network.</p>
            </motion.div>
          </header>

          <div className="report-selector-card glass-card">
            <div className="selector-wrap">
              <div className="select-box">
                <PieChart size={18} className="select-icon" />
                <select value={selectedDealer} onChange={(e) => setSelectedDealer(e.target.value)}>
                  <option value="">Select a Dealership Hub</option>
                  {dealers.map(d => (
                    <option key={d.id} value={d.id}>{d.full_name}</option>
                  ))}
                </select>
              </div>
              <button 
                className="btn-luxury btn-gold" 
                onClick={generateReport} 
                disabled={!selectedDealer || loading}
              >
                {loading ? <Loader2 className="animate-spin" size={18} /> : 'Generate Analytics'}
                {!loading && <ChevronRight size={18} />}
              </button>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {reportData ? (
              <motion.div 
                key="results"
                className="report-results"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <div className="results-grid">
                  <div className="result-card glass-card">
                    <div className="card-top">
                      <BarChart3 size={20} className="gold-text" />
                      <span className="card-label">Stock Capacity</span>
                    </div>
                    <div className="big-num">{reportData.summary?.total_cars || 0}</div>
                    <p>Total units currently synchronized</p>
                  </div>
                  
                  <div className="result-card glass-card">
                    <div className="card-top">
                      <Info size={20} className="gold-text" />
                      <span className="card-label">Price Equilibrium</span>
                    </div>
                    <div className="big-num">${(reportData.summary?.avg_price || 0).toLocaleString()}</div>
                    <p>Average network listing price</p>
                  </div>

                  <div className="result-card glass-card full-width">
                    <div className="card-top">
                      <PieChart size={20} className="gold-text" />
                      <span className="card-label">Make Distribution</span>
                    </div>
                    <div className="make-diversity-grid">
                      {reportData.top_makes?.map((m, i) => (
                        <div key={m.make} className="make-pill">
                          <span className="make-name">{m.make}</span>
                          <span className="make-count">{m.count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="report-actions">
                  <button className="btn-luxury btn-outline" onClick={downloadCSV}>
                    <Download size={16} /> Export CSV
                  </button>
                  <button className="btn-luxury btn-outline" onClick={() => window.print()}>
                    <Printer size={16} /> Print Full PDF
                  </button>
                </div>
              </motion.div>
            ) : !loading && (
              <motion.div 
                key="empty"
                className="empty-report-state"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <div className="pulse-circle" />
                <p>Waiting for telemetry selection...</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </PageTransition>
  );
};

export default InventoryReport;
