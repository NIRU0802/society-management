'use client'

import { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Button,
  TextField,
  Alert,
  CircularProgress,
} from '@mui/material'
import { supabase } from '@/utils/supabaseClient'

export default function ManageManagers() {
  const [managers, setManagers] = useState<{ id: string; email: string }[]>([])
  const [loading, setLoading] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    fetchManagers()
  }, [])

  async function fetchManagers() {
    setLoading(true)
    const { data, error } = await supabase
      .from('users')
      .select('id, email')
      .eq('role', 'manager')

    if (error) {
      setError(error.message)
    } else {
      setManagers(data)
    }
    setLoading(false)
  }

  async function addManager() {
    setError('')
    setSuccess('')

    if (!email || !password) {
      setError('Email and password are required')
      return
    }

    try {
      setCreating(true)
      const res = await fetch('/api/create-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          role: 'manager',
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Failed to create manager')
      } else {
        setSuccess('Manager created successfully')
        setEmail('')
        setPassword('')
        fetchManagers() // Refresh the list
      }
    } catch (err) {
      setError('An error occurred while creating the manager.')
    }

    setCreating(false)
  }

  async function deleteManager(id: string) {
    setError('')
    setSuccess('')

    // ⚠️ You must implement this on the server as well (optional)
    setError('Deleting managers must be done via backend API with admin privileges.')
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom fontWeight="bold">
        Manage Managers
      </Typography>

      {/* Add Manager Section */}
      <Paper sx={{ p: 2, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Add Manager
        </Typography>
        <TextField
          label="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          fullWidth
          margin="normal"
        />
        <Button
          variant="contained"
          onClick={addManager}
          sx={{ mt: 2 }}
          disabled={creating}
        >
          {creating ? 'Creating...' : 'Add Manager'}
        </Button>
        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" sx={{ mt: 2 }}>
            {success}
          </Alert>
        )}
      </Paper>

      {/* Manager List Section */}
      <Typography variant="h6" gutterBottom fontWeight="bold">
        Manager List
      </Typography>
      {loading ? (
        <CircularProgress />
      ) : (
        <Paper>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Email</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {managers.map((manager) => (
                <TableRow key={manager.id}>
                  <TableCell>{manager.email}</TableCell>
                  <TableCell>
                    <Button
                      variant="outlined"
                      color="error"
                      onClick={() => deleteManager(manager.id)}
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      )}
    </Box>
  )
}
