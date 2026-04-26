import React, { useState, useEffect } from 'react';
import Header from '../../components/Header/Header';
import './Leaderboard.css';

const Leaderboard = () => {
  const [dealers, setDealers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/djangoapp/leaderboard')
      .then(res => res.json())
      .then(data => {
        setDealers(data.leaderboard || []);
        setLoading(false);
      })
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="leaderboard-page">
      <Header />
      <div className="leaderboard-container">
        <div className="leaderboard-header">
          <h1>Elite Dealer Leaderboard</h1>
          <p>Ranking our nationwide network by Trust Score and Customer Sentiment.</p>
        </div>

        {loading ? (
          <div className="leaderboard-loader">Ranking Dealerships...</div>
        ) : (
          <div className="leaderboard-list">
            <div className="list-header glass">
              <span className="rank">Rank</span>
              <span className="name">Dealership</span>
              <span className="location">Location</span>
              <span className="score">Trust Score</span>
              <span className="grade">Grade</span>
            </div>

            {dealers.map((d, i) => (
              <div key={d.id} className="leaderboard-item glass">
                <span className="rank">#{i + 1}</span>
                <div className="name-block">
                  <span className="name">{d.name}</span>
                  <span className="reviews">{d.review_count} Reviews</span>
                </div>
                <span className="location">{d.city}</span>
                <div className="score-block">
                  <div className="score-bar-bg">
                    <div className="score-bar-fill" style={{ width: `${d.trust_score}%` }}></div>
                  </div>
                  <span className="score">{d.trust_score}</span>
                </div>
                <span className={`grade grade-${d.grade[0].toLowerCase()}`}>{d.grade}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Leaderboard;
