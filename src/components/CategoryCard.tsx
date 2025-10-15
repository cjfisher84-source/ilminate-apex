'use client'
import { Tooltip, Card, CardContent, Typography, Box } from '@mui/material'
import Link from 'next/link'

export default function CategoryCard({ label, value, description }:{label:string; value:number; description:string}){
  const slug = label.toLowerCase()
  
  return (
    <Tooltip title={`Click to view ${label} details. ${description}`} arrow placement="top">
      <Link href={`/threats/${slug}`} style={{ textDecoration: 'none' }}>
        <Card sx={{ 
          bgcolor: '#FFFFFF', 
          border: '2px solid #E0E4E8',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          '&:hover': { 
            borderColor: '#007070',
            boxShadow: '0 8px 24px rgba(0, 112, 112, 0.2)',
            transform: 'translateY(-4px)'
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
      </Link>
    </Tooltip>
  )
}

