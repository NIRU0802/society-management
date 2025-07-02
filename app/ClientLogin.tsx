'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/utils/supabaseClient'
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Container,
  Alert,
} from '@mui/material'

export default function ClientLogin() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleLogin = async () => {
    setError('')
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (authError) {
      setError(authError.message)
      return
    }

    // Get user role from your Supabase table 'users'
    const userId = authData.user?.id
    if (!userId) {
      setError('User not found after login.')
      return
    }

    const { data: userDetails, error: roleError } = await supabase
      .from('users')
      .select('role')
      .eq('id', userId)
      .single()

    if (roleError || !userDetails?.role) {
      setError('Role not found. Contact admin.')
      return
    }

    const role = userDetails.role
    if (role === 'superadmin') router.push('/dashboard/superadmin')
    else if (role === 'manager') router.push('/dashboard/manager')
    else setError('Invalid role assigned.')
  }

  return (
    <Container maxWidth="sm">
      <Paper sx={{ p: 4, mt: 8, borderRadius: 3 }}>
        <Typography variant="h4" gutterBottom textAlign="center">
          Society Login
        </Typography>

        <Box sx={{ mt: 3 }}>
          <TextField
            label="Email"
            type="email"
            fullWidth
            margin="normal"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            label="Password"
            type="password"
            fullWidth
            margin="normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}

          <Button
            variant="contained"
            fullWidth
            color="primary"
            size="large"
            sx={{ mt: 3 }}
            onClick={handleLogin}
          >
            Login
          </Button>
        </Box>
      </Paper>
    </Container>
  )
}
