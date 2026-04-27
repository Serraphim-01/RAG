import React, { useState, useEffect } from 'react';
import './App.css';
import { FaCompass, FaSun, FaRegSun, FaMoon } from 'react-icons/fa';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function App() {
  const [name, setName] = useState('');
  const [assignments, setAssignments] = useState([]);
  const [stats, setStats] = useState({ total: 0, north: 0, east: 0, south: 0, west: 0 });
  const [shuffling, setShuffling] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [result, setResult] = useState('');
  const [showCard, setShowCard] = useState(false);
  const [assignedGroup, setAssignedGroup] = useState('');

  useEffect(() => {
    fetchAssignments();
    fetchStats();
  }, []);

  const fetchAssignments = async () => {
    try {
      const response = await fetch(`${API_URL}/api/assignments`);
      const data = await response.json();
      setAssignments(data);
    } catch (error) {
      console.error('Error fetching assignments:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch(`${API_URL}/api/stats`);
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const showMessage = (text, type) => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 3000);
  };

  const spinRoulette = async () => {
    if (!name.trim()) {
      showMessage('Please enter your name!', 'error');
      return;
    }

    if (shuffling) return;

    setShuffling(true);
    setResult('');
    setShowCard(false);

    try {
      const response = await fetch(`${API_URL}/api/assignments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim() })
      });

      const data = await response.json();

      if (response.ok) {
        setAssignedGroup(data.group_name);
        
        // Show card after shuffling animation
        setTimeout(() => {
          setShowCard(true);
          setResult(`${data.name} assigned to ${data.group_name}!`);
          showMessage(`Successfully assigned ${data.name} to ${data.group_name} group!`, 'success');
          setName('');
        }, 2000);
        
        await fetchAssignments();
        await fetchStats();
      } else {
        if (response.status === 409) {
          showMessage(data.error, 'error');
        } else {
          showMessage(data.error || 'Failed to assign group', 'error');
        }
      }
    } catch (error) {
      console.error('Error:', error);
      showMessage('Failed to connect to server', 'error');
    } finally {
      setTimeout(() => {
        setShuffling(false);
      }, 4000);
    }
  };

  const handleClearAll = async () => {
    if (!window.confirm('Are you sure you want to clear all assignments?')) return;

    try {
      const response = await fetch(`${API_URL}/api/assignments`, {
        method: 'DELETE'
      });

      if (response.ok) {
        showMessage('All assignments cleared!', 'success');
        await fetchAssignments();
        await fetchStats();
        setResult('');
      }
    } catch (error) {
      console.error('Error:', error);
      showMessage('Failed to clear assignments', 'error');
    }
  };

  const downloadCSV = () => {
    if (assignments.length === 0) {
      showMessage('No data to download!', 'error');
      return;
    }

    const headers = ['Number', 'Name', 'Group', 'Timestamp'];
    const csvContent = [
      headers.join(','),
      ...assignments.map((entry, index) => [
        index + 1,
        `"${entry.name}"`,
        entry.group_name,
        `"${new Date(entry.created_at).toLocaleString()}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `group_assignments_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showMessage('CSV downloaded successfully!', 'success');
  };

  const getGroupClass = (groupName) => {
    return `group-${groupName.toLowerCase()}`;
  };

  return (
    <div className="container">
      <h1>Group Assignment Roulette</h1>
      
      <div className="input-section">
        <h2>Enter Your Name</h2>
        <div className="input-group">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && spinRoulette()}
            placeholder="Enter your name..."
            maxLength="50"
            disabled={shuffling}
          />
          <button onClick={spinRoulette} disabled={shuffling || !name.trim()}>
            {shuffling ? 'Shuffling...' : 'Shuffle Cards!'}
          </button>
        </div>
        {message.text && (
          <div className={`message ${message.type}`}>{message.text}</div>
        )}
      </div>

      <div className="shuffle-section">
        <h2>Card Shuffle</h2>
        
        <div className="cards-container">
          {/* Shuffling animation cards */}
          {shuffling && (
            <div className="shuffle-animation">
              <div className="shuffle-card card-1"></div>
              <div className="shuffle-card card-2"></div>
              <div className="shuffle-card card-3"></div>
              <div className="shuffle-card card-4"></div>
            </div>
          )}
          
          {/* Result card */}
          {showCard && (
            <div className="result-card-wrapper">
              <div className={`result-card ${getGroupClass(assignedGroup)} card-flip`}>
                <div className="card-front">
                  <div className="card-content">
                    <h3>{assignedGroup}</h3>
                    <div className="card-icon">
                      {assignedGroup === 'North' && <FaCompass />}
                      {assignedGroup === 'East' && <FaSun />}
                      {assignedGroup === 'South' && <FaRegSun />}
                      {assignedGroup === 'West' && <FaMoon />}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {result && <div className="result-display success">{result}</div>}
        
        <div className="stats">
          <div className="stat-card">
            <h3>North</h3>
            <p>{stats.north || 0}</p>
          </div>
          <div className="stat-card">
            <h3>East</h3>
            <p>{stats.east || 0}</p>
          </div>
          <div className="stat-card">
            <h3>South</h3>
            <p>{stats.south || 0}</p>
          </div>
          <div className="stat-card">
            <h3>West</h3>
            <p>{stats.west || 0}</p>
          </div>
          <div className="stat-card">
            <h3>Total</h3>
            <p>{stats.total || 0}</p>
          </div>
        </div>
      </div>

      <div className="table-section">
        <h2>Group Assignments</h2>
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Name</th>
              <th>Group</th>
              <th>Timestamp</th>
            </tr>
          </thead>
          <tbody>
            {assignments.map((entry, index) => (
              <tr key={entry.id} className={getGroupClass(entry.group_name)}>
                <td>{index + 1}</td>
                <td>{entry.name}</td>
                <td>{entry.group_name}</td>
                <td>{new Date(entry.created_at).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
        
        <div className="csv-section">
          <button onClick={downloadCSV}>Download CSV</button>
          <button onClick={handleClearAll}>Clear All Data</button>
        </div>
      </div>
    </div>
  );
}

export default App;
