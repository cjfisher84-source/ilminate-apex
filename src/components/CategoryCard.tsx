'use client'
import { Tooltip, Card, CardContent, Typography, Box } from '@mui/material'

export default function CategoryCard({ label, value, description }:{label:string; value:number; description:string}){
  return (
    <Tooltip title={description} arrow placement="top">
      <Card sx={{ 
        bgcolor: 'rgba(15, 23, 42, 0.8)', 
        border: '1px solid rgba(71, 85, 105, 0.5)',
        cursor: 'help',
        '&:hover': { borderColor: '#006666' }
      }}>
        <CardContent sx={{ p: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="caption" sx={{ textTransform: 'uppercase', color: 'rgba(255,255,255,0.7)' }}>
              Messages
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 600, mt: 0.5 }}>
              {value.toLocaleString()}
            </Typography>
          </Box>
          <Typography variant="h6" sx={{ color: '#006666', fontWeight: 600 }}>
            {label}
          </Typography>
        </CardContent>
      </Card>
    </Tooltip>
  )
}

