'use client'

import React, { useEffect, useState } from 'react'
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  CircularProgress,
} from '@mui/material'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import DragIndicatorIcon from '@mui/icons-material/DragIndicator'
import PoolIcon from '@mui/icons-material/Pool'
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter'
import LocalParkingIcon from '@mui/icons-material/LocalParking'
import SportsEsportsIcon from '@mui/icons-material/SportsEsports'
import ChildCareIcon from '@mui/icons-material/ChildCare'
import SportsCricketIcon from '@mui/icons-material/SportsCricket';
import SportsFootballIcon from '@mui/icons-material/SportsFootball';
import SportsTennisIcon from '@mui/icons-material/SportsTennis';

const amenityIcons = {  
  'Swimming Pool': <PoolIcon color="primary" />,
  Gym: <FitnessCenterIcon color="primary" />,
  Parking: <LocalParkingIcon color="primary" />,
  'Club House': <SportsEsportsIcon color="primary" />,
  'Children Play Area': <ChildCareIcon color="primary" />,
  'Cricket Turf': <SportsCricketIcon color="primary" />,
  'Football Turf': <SportsFootballIcon color="primary" />,
  'Tennis Court': <SportsTennisIcon color="primary" />,
}

type Amenity = {
  id: number
  name: string
  order_index: number
}

export default function AmenitiesDnD() {
  const [amenities, setAmenities] = useState<Amenity[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAmenities()
  }, [])

  const fetchAmenities = async () => {
    setLoading(true)
    const res = await fetch('/api/amenities', { method: 'GET' })
    const data = await res.json()
    setAmenities(data)
    setLoading(false)
  }

  const handleDragEnd = async (result: any) => {
    if (!result.destination) return

    const reordered = Array.from(amenities)
    const [moved] = reordered.splice(result.source.index, 1)
    reordered.splice(result.destination.index, 0, moved)

    setAmenities(reordered)

    const orderedIds = reordered.map((a) => a.id)
    await fetch('/api/amenities', {
      method: 'POST',
      body: JSON.stringify({ orderedIds }),
    })
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box sx={{ maxWidth: 500, margin: 'auto', mt: 5 }}>
      <Typography variant="h5" align="center" fontWeight="bold" gutterBottom sx={{ textTransform: 'uppercase' }}>
        Amenities
      </Typography>

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="amenities-droppable">
          {(provided) => (
            <Paper
              elevation={4}
              ref={provided.innerRef}
              {...provided.droppableProps}
              sx={{
                bgcolor: 'background.paper',
                borderRadius: 2,
                p: 2,
                boxShadow: 3,
                minHeight: 300,
              }}
            >
              <List>
                {amenities.map(({ id, name }, index) => (
                  <Draggable key={id} draggableId={String(id)} index={index}>
                    {(provided, snapshot) => (
                      <ListItem
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        sx={{
                          mb: 1,
                          borderRadius: 1,
                          bgcolor: snapshot.isDragging ? 'primary.light' : 'grey.100',
                          boxShadow: snapshot.isDragging ? 4 : 1,
                          display: 'flex',
                          alignItems: 'center',
                          cursor: 'grab',
                        }}
                      >
                        <ListItemIcon sx={{ minWidth: 36 }}>
                          <DragIndicatorIcon />
                        </ListItemIcon>
                        <ListItemIcon sx={{ minWidth: 36 }}>
                          {amenityIcons[name] || <PoolIcon />}
                        </ListItemIcon>
                        <ListItemText primary={name} />
                      </ListItem>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </List>
            </Paper>
          )}
        </Droppable>
      </DragDropContext>
    </Box>
  )
}
