import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  Button,
  Card,
  CardContent,
  CardActions,
  Icon,
} from '@mui/material';
import {
  AddCircleOutline,
  ListAltOutlined,
  CheckCircleOutline,
  PaymentOutlined,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const quickActionCards = [
    {
      title: 'Create New Claim',
      description: 'Submit a new travel reimbursement claim',
      icon: AddCircleOutline,
      color: '#4caf50',
      action: () => navigate('/create-claim'),
      show: user?.role === 'EMPLOYEE',
    },
    {
      title: 'My Claims',
      description: 'View and track your submitted claims',
      icon: ListAltOutlined,
      color: '#2196f3',
      action: () => navigate('/my-claims'),
      show: user?.role !== 'HR',
    },
    {
      title: 'Pending Approvals',
      description: 'Review and approve claims from your team',
      icon: CheckCircleOutline,
      color: '#ff9800',
      action: () => navigate('/approvals'),
      show: user?.role === 'MANAGER',
    },
    {
      title: 'Process Payments',
      description: 'Mark approved claims as paid',
      icon: PaymentOutlined,
      color: '#9c27b0',
      action: () => navigate('/payments'),
      show: user?.role === 'HR',
    },
  ];

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#f5f5f5', paddingY: 4 }}>
      <Container maxWidth="lg">
        {/* Welcome Section */}
        <Box sx={{ marginBottom: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: 'bold', marginBottom: 1 }}>
            Welcome, {user?.firstName}! 👋
          </Typography>
          <Typography variant="subtitle1" sx={{ color: 'text.secondary' }}>
            Manage your travel reimbursement claims efficiently
          </Typography>
        </Box>

        {/* Stats Cards */}
        <Grid container spacing={2} sx={{ marginBottom: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ padding: 2, textAlign: 'center' }}>
              <Typography variant="h6" sx={{ color: '#2196f3', fontWeight: 'bold' }}>
                5
              </Typography>
              <Typography variant="caption">Total Claims</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ padding: 2, textAlign: 'center' }}>
              <Typography variant="h6" sx={{ color: '#ff9800', fontWeight: 'bold' }}>
                2
              </Typography>
              <Typography variant="caption">Pending</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ padding: 2, textAlign: 'center' }}>
              <Typography variant="h6" sx={{ color: '#4caf50', fontWeight: 'bold' }}>
                2
              </Typography>
              <Typography variant="caption">Approved</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ padding: 2, textAlign: 'center' }}>
              <Typography variant="h6" sx={{ color: '#f44336', fontWeight: 'bold' }}>
                $5,000
              </Typography>
              <Typography variant="caption">Total Amount</Typography>
            </Paper>
          </Grid>
        </Grid>

        {/* Quick Actions */}
        <Typography variant="h6" sx={{ fontWeight: 'bold', marginBottom: 2 }}>
          Quick Actions
        </Typography>

        <Grid container spacing={2}>
          {quickActionCards
            .filter((card) => card.show)
            .map((card, index) => {
              const IconComponent = card.icon;
              return (
                <Grid item xs={12} sm={6} md={3} key={index}>
                  <Card
                    sx={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      transition: 'all 0.3s',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
                      },
                    }}
                  >
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: 50,
                          height: 50,
                          backgroundColor: card.color,
                          borderRadius: '8px',
                          marginBottom: 2,
                        }}
                      >
                        <IconComponent sx={{ color: 'white', fontSize: 28 }} />
                      </Box>
                      <Typography variant="h6" sx={{ fontWeight: 600, marginBottom: 1 }}>
                        {card.title}
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        {card.description}
                      </Typography>
                    </CardContent>
                    <CardActions>
                      <Button
                        fullWidth
                        variant="outlined"
                        size="small"
                        onClick={card.action}
                        sx={{ textTransform: 'none' }}
                      >
                        Go →
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              );
            })}
        </Grid>

        {/* Info Box */}
        <Paper
          sx={{
            marginTop: 4,
            padding: 3,
            backgroundColor: '#e3f2fd',
            border: '1px solid #90caf9',
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 600, marginBottom: 1 }}>
            📌 How it works
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.6 }}>
            • Submit travel expense claims for approval<br />
            • Managers review and approve/reject claims<br />
            • HR processes approved claims and marks as paid<br />
            • Track all your claims in one place
          </Typography>
        </Paper>
      </Container>
    </Box>
  );
}

export default Dashboard;
