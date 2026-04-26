import React, { useState, useEffect } from 'react';
import Header from '../../components/Header/Header';
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
      const res = await fetch(`/cars-api/cars/stats/${selectedDealer}`);
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
      + `Total Cars,${reportData.summary.total_cars}\n`
      + `Average Price,${reportData.summary.avg_price}\n`
      + `Max Price,${reportData.summary.max_price}\n`
      + `Average Mileage,${reportData.summary.avg_mileage}\n`;
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `inventory_report_${selectedDealer}.csv`);
    document.body.appendChild(link);
    link.click();
  };

  return (
    <div className="report-page">
      <Header />
      <div className="report-container">
        <header className="report-header">
          <h1>Inventory Health Reports</h1>
          <p>Generate detailed performance and health metrics for any dealership.</p>
        </header>

        <div className="report-selector glass">
          <select value={selectedDealer} onChange={(e) => setSelectedDealer(e.target.value)}>
            <option value="">-- Select a Dealership --</option>
            {dealers.map(d => (
              <option key={d.id} value={d.id}>{d.full_name}</option>
            ))}
          </select>
          <button className="btn-primary" onClick={generateReport} disabled={!selectedDealer || loading}>
            {loading ? 'Analyzing...' : 'Generate Intelligence Report'}
          </button>
        </div>

        {reportData && (
          <div className="report-results animate-fade-in">
            <div className="results-grid">
              <div className="result-card glass">
                <h3>Stock Status</h3>
                <div className="big-num">{reportData.summary.total_cars}</div>
                <p>Total units in inventory</p>
              </div>
              <div className="result-card glass">
                <h3>Pricing Health</h3>
                <div className="big-num">${reportData.summary.avg_price.toLocaleString()}</div>
                <p>Average listing price</p>
              </div>
              <div className="result-card glass">
                <h3>Make Diversity</h3>
                <ul className="make-list">
                  {reportData.top_makes.map(m => (
                    <li key={m.make}>
                      <span>{m.make}</span>
                      <span>{m.count}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="report-actions">
              <button className="btn-secondary" onClick={downloadCSV}>Download CSV Data</button>
              <button className="btn-secondary" onClick={() => window.print()}>Print Full PDF Report</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InventoryReport;
