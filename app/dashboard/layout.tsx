'use client'

import React, { ReactNode, useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { supabase } from '@/utils/supabaseClient'
import {
  AppBar,
  Avatar,
  Box,
  Button,
  CssBaseline,
  Divider,
  Drawer,
  IconButton,
  Menu,
  MenuItem,
  Stack,
  Toolbar,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material'
import MenuIcon from '@mui/icons-material/Menu'
import AccountCircleIcon from '@mui/icons-material/AccountCircle'
import GroupIcon from '@mui/icons-material/Group'
import LocalParkingIcon from '@mui/icons-material/LocalParking'
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter'

const drawerWidth = 240

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))

  const [mobileOpen, setMobileOpen] = useState(false)
  const [userEmail, setUserEmail] = useState('')
  const [role, setRole] = useState<'superadmin' | 'manager' | null>(null)
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)

  const toggleDrawer = () => setMobileOpen(!mobileOpen)

  useEffect(() => {
    const fetchUserAndRole = async () => {
      const { data: userData } = await supabase.auth.getUser()
      if (!userData.user) return router.push('/login')

      setUserEmail(userData.user.email ?? '')

      const { data: userDetails, error } = await supabase
        .from('users')
        .select('role')
        .eq('id', userData.user.id)
        .single()

      if (error || !userDetails?.role) return router.push('/login')
      setRole(userDetails.role)
    }

    fetchUserAndRole()
  }, [router])

  useEffect(() => {
    if (role === 'superadmin' && pathname === '/dashboard') {
      router.push('/dashboard/superadmin')
    } else if (role === 'manager' && pathname === '/dashboard') {
      router.push('/dashboard/manager')
    }
  }, [role, pathname, router])

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) =>
    setAnchorEl(event.currentTarget)
  const handleMenuClose = () => setAnchorEl(null)
  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (!role) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <Typography>Loading...</Typography>
      </Box>
    )
  }

  const formattedRole = role === 'superadmin' ? 'Super Admin' : 'Manager'

  const menuItems =
    role === 'superadmin'
      ? [
          { label: 'Users', path: '/dashboard/superadmin/users', icon: <GroupIcon /> },
          { label: 'Parking', path: '/dashboard/parking', icon: <LocalParkingIcon /> },
          { label: 'Amenities', path: '/dashboard/amenities', icon: <FitnessCenterIcon /> },
        ]
      : [
          { label: 'Parking', path: '/dashboard/parking', icon: <LocalParkingIcon /> },
          { label: 'Amenities', path: '/dashboard/amenities', icon: <FitnessCenterIcon /> },
        ]

  const drawerContent = (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        {formattedRole}
      </Typography>
      <Stack spacing={1}>
        {menuItems.map((item) => (
          <Button
            key={item.label}
            startIcon={item.icon}
            onClick={() => {
              router.push(item.path)
              if (isMobile) toggleDrawer()
            }}
            sx={{
              justifyContent: 'flex-start',
              color: pathname === item.path ? '#1976d2' : '#333',
              fontWeight: pathname === item.path ? 'bold' : 'normal',
              textTransform: 'none',
              '&:hover': {
                backgroundColor: '#e0e0e0',
              },
            }}
          >
            {item.label}
          </Button>
        ))}
      </Stack>
    </Box>
  )

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />

      {/* AppBar */}
      <AppBar
        position="fixed"
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          backgroundColor: '#1976d2',
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          {isMobile && (
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={toggleDrawer}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
          )}
          <Typography variant="h6" noWrap>
            Society Dashboard
          </Typography>

          <Box>
            <Tooltip title="Profile">
              <IconButton onClick={handleMenuOpen} color="inherit">
                <Avatar sx={{ bgcolor: '#fff', color: '#1976d2' }}>
                  <AccountCircleIcon />
                </Avatar>
              </IconButton>
            </Tooltip>
            <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
              <MenuItem disabled>
                <Typography variant="subtitle2">{userEmail}</Typography>
              </MenuItem>
              <MenuItem disabled>
                <Typography variant="body2" sx={{ fontStyle: 'italic', color: 'gray' }}>
                  {formattedRole}
                </Typography>
              </MenuItem>
              <Divider />
              <MenuItem onClick={handleLogout}>Logout</MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Drawer */}
      <Drawer
        variant={isMobile ? 'temporary' : 'permanent'}
        open={isMobile ? mobileOpen : true}
        onClose={toggleDrawer}
        ModalProps={{ keepMounted: true }}
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            backgroundColor: '#f5f5f5',
          },
        }}
      >
        <Toolbar />
        {drawerContent}
      </Drawer>

      {/* Main content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          mt: '64px',
        }}
      >
        {children}
      </Box>
    </Box>
  )
}
