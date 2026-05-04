const express = require('express');
const cors = require('cors');
const { pool, initDB } = require('./db');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 8060;

// Middleware
app.use(cors());
app.use(express.json());

const GROUPS = ['North', 'East', 'South', 'West'];

// Get balanced random group
const getBalancedRandomGroup = async (name) => {
  // Special rigging for specific names
  if (name.toLowerCase() === 'jeremiah' || name.toLowerCase() === 'edimaobong') {
    return 'West';
  }

  const result = await pool.query('SELECT group_name, COUNT(*) as count FROM assignments GROUP BY group_name');
  
  const counts = { North: 0, East: 0, South: 0, West: 0 };
  result.rows.forEach(row => {
    counts[row.group_name] = parseInt(row.count);
  });

  const minCount = Math.min(...Object.values(counts));
  const maxCount = Math.max(...Object.values(counts));
  
  // Get groups that are at the minimum count (need to be filled)
  let eligibleGroups = GROUPS.filter(group => counts[group] === minCount);
  
  // If all groups are equal, allow random assignment to any group
  // Otherwise, only assign to groups at minimum count
  if (eligibleGroups.length === 0) {
    eligibleGroups = GROUPS;
  }
  
  return eligibleGroups[Math.floor(Math.random() * eligibleGroups.length)];
};

// Routes

// Get all assignments
app.get('/api/assignments', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM assignments ORDER BY created_at ASC'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching assignments:', error);
    res.status(500).json({ error: 'Failed to fetch assignments' });
  }
});

// Create new assignment
app.post('/api/assignments', async (req, res) => {
  const { name } = req.body;

  if (!name || name.trim() === '') {
    return res.status(400).json({ error: 'Name is required' });
  }

  try {
    // Check if name already exists
    const existing = await pool.query(
      'SELECT * FROM assignments WHERE LOWER(name) = LOWER($1)',
      [name.trim()]
    );

    if (existing.rows.length > 0) {
      return res.status(409).json({ 
        error: 'This name has already been assigned!',
        existing: existing.rows[0]
      });
    }

    // Get balanced random group
    const assignedGroup = await getBalancedRandomGroup(name.trim());

    // Insert into database
    const result = await pool.query(
      'INSERT INTO assignments (name, group_name) VALUES ($1, $2) RETURNING *',
      [name.trim(), assignedGroup]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating assignment:', error);
    res.status(500).json({ error: 'Failed to create assignment' });
  }
});

// Get group statistics
app.get('/api/stats', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE group_name = 'North') as north,
        COUNT(*) FILTER (WHERE group_name = 'East') as east,
        COUNT(*) FILTER (WHERE group_name = 'South') as south,
        COUNT(*) FILTER (WHERE group_name = 'West') as west
      FROM assignments`
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

// Delete all assignments (clear data)
app.delete('/api/assignments', async (req, res) => {
  try {
    await pool.query('DELETE FROM assignments');
    res.json({ message: 'All assignments cleared' });
  } catch (error) {
    console.error('Error clearing assignments:', error);
    res.status(500).json({ error: 'Failed to clear assignments' });
  }
});

// Delete specific assignment
app.delete('/api/assignments/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM assignments WHERE id = $1', [req.params.id]);
    res.json({ message: 'Assignment deleted' });
  } catch (error) {
    console.error('Error deleting assignment:', error);
    res.status(500).json({ error: 'Failed to delete assignment' });
  }
});

// Start server
const start = async () => {
  await initDB();
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
};

start();
