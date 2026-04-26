import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import './NotificationCenter.css';

const NotificationCenter = () => {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // Connect to notification-socket path defined in nginx
    const socket = io('/', {
      path: '/notification-socket/',
      transports: ['websocket']
    });

    socket.on('connect', () => {
      console.log('✅ Connected to Notifications');
    });

    socket.on('notification', (notif) => {
      setNotifications(prev => [notif, ...prev].slice(0, 50));
      if (!isOpen) {
        setUnreadCount(prev => prev + 1);
        showToast(notif);
      }
    });

    return () => socket.disconnect();
  }, [isOpen]);

  const showToast = (notif) => {
    // Basic browser notification if permitted
    if (Notification.permission === "granted") {
      new Notification(notif.title, { body: notif.message });
    }
  };

  const toggleOpen = () => {
    setIsOpen(!isOpen);
    if (!isOpen) setUnreadCount(0);
  };

  return (
    <div className="notification-wrapper">
      <button className="notification-trigger" onClick={toggleOpen}>
        <span className="icon">🔔</span>
        {unreadCount > 0 && <span className="badge">{unreadCount}</span>}
      </button>

      {isOpen && (
        <div className="notification-panel glass">
          <div className="panel-header">
            <h3>Notifications</h3>
            <button onClick={() => setNotifications([])}>Clear</button>
          </div>
          <div className="panel-content">
            {notifications.length === 0 ? (
              <p className="empty-state">No new notifications</p>
            ) : (
              notifications.map((n, i) => (
                <div key={i} className={`notif-item ${n.type.toLowerCase()}`}>
                  <div className="notif-icon">
                    {n.type === 'BOOKING' ? '📅' : '✍️'}
                  </div>
                  <div className="notif-body">
                    <h4>{n.title}</h4>
                    <p>{n.message}</p>
                    <span className="time">{new Date(n.timestamp).toLocaleTimeString()}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationCenter;
