'use client'
import { Tooltip, Card, CardContent, Typography, Box } from '@mui/material'

export default function CategoryCard({ label, value, description }:{label:string; value:number; description:string}){
  return (
    <Tooltip title={description} arrow placement="top">
      <Card sx={{ 
        bgcolor: '#FFFFFF', 
        border: '2px solid #E0E4E8',
        cursor: 'help',
        transition: 'all 0.3s ease',
        '&:hover': { 
          borderColor: '#007070',
          boxShadow: '0 8px 24px rgba(0, 112, 112, 0.15)',
          transform: 'translateY(-2px)'
        }
      }}>
        <CardContent sx={{ p: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="caption" sx={{ textTransform: 'uppercase', color: '#666', fontWeight: 600, letterSpacing: 1 }}>
              Messages
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 700, mt: 0.5, color: '#1a1a1a' }}>
              {value.toLocaleString()}
            </Typography>
          </Box>
          <Typography variant="h6" sx={{ color: '#007070', fontWeight: 700 }}>
            {label}
          </Typography>
        </CardContent>
      </Card>
    </Tooltip>
  )
}

