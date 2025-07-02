'use client'

import { useEffect, useState } from 'react'
import {
  Box,
  Typography,
  Grid,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip,
  Paper,
} from '@mui/material'
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'

type ParkingSlot = {
  id: number
  slot_number: number
  is_occupied: boolean
  booked_by_name?: string | null
}

export default function ParkingComponent() {
  const [slots, setSlots] = useState<ParkingSlot[]>([])
  const [openDialog, setOpenDialog] = useState(false)
  const [selectedSlot, setSelectedSlot] = useState<ParkingSlot | null>(null)
  const [name, setName] = useState('')

  const fetchSlots = async () => {
    try {
      const res = await fetch('/api/parking')
      const data = await res.json()
      if (Array.isArray(data)) setSlots(data)
    } catch (err) {
      console.error('Failed to fetch parking slots', err)
    }
  }

  const handleSlotClick = (slot: ParkingSlot) => {
    if (slot.is_occupied) {
      toggleSlot(slot.id, false)
    } else {
      setSelectedSlot(slot)
      setOpenDialog(true)
    }
  }

  const confirmBooking = async () => {
    if (!selectedSlot) return
    await toggleSlot(selectedSlot.id, true, name)
    setOpenDialog(false)
    setName('')
    setSelectedSlot(null)
  }

  const toggleSlot = async (
    slotId: number,
    isOccupied: boolean,
    personName?: string
  ) => {
    try {
      const res = await fetch('/api/parking', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slotId,
          isOccupied,
          name: personName || null,
          userId: null,
        }),
      })
      const result = await res.json()
      if (result.success) fetchSlots()
    } catch (err) {
      console.error('Error updating slot', err)
    }
  }

  useEffect(() => {
    fetchSlots()
  }, [])

  return (
    <Box sx={{ p: { xs: 2, sm: 4 }, mt: -8, maxWidth: 600, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom align="center" fontWeight="bold">
        🚗 Parking Slot Booking
      </Typography>

      <Grid container direction="column" spacing={2}>
        {slots.map((slot) => (
          <Grid item xs={12} key={slot.id}>
            <Paper
              elevation={3}
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: 2,
                borderRadius: 2,
                backgroundColor: slot.is_occupied ? '#ffe6e6' : '#e8f5e9',
                transition: 'all 0.3s',
                cursor: 'pointer',
                '&:hover': {
                  boxShadow: 6,
                  transform: 'scale(1.01)',
                },
              }}
              onClick={() => handleSlotClick(slot)}
            >
              <Box display="flex" alignItems="center" gap={2}>
                <DirectionsCarIcon color={slot.is_occupied ? 'error' : 'success'} />
                <Typography variant="h6">
                  Slot {slot.slot_number}
                </Typography>
              </Box>

              {slot.is_occupied ? (
                <Chip
                  icon={<CheckCircleIcon />}
                  label={`Booked by ${slot.booked_by_name}`}
                  color="error"
                  variant="outlined"
                />
              ) : (
                <Chip
                  label="Available"
                  color="success"
                  variant="outlined"
                />
              )}
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Booking Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} fullWidth maxWidth="xs">
        <DialogTitle sx={{ fontWeight: 'bold' }}>
          Book Slot {selectedSlot?.slot_number}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            fullWidth
            label="Your Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            variant="outlined"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)} color="secondary">
            Cancel
          </Button>
          <Button
            onClick={confirmBooking}
            variant="contained"
            disabled={!name.trim()}
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
