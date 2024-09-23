import Container from '@mui/material/Container';
import Grid from '@mui/material/Unstable_Grid2';
import Typography from '@mui/material/Typography';
import AppWidgetSummary from '../../components/admin/elements/app-widget-summary';
import { baseUrl } from '../../utils/constants/Constants';
import axios from 'axios';
import Cookies from 'js-cookie';
import { useEffect, useRef, useState } from 'react';

export default function Dashboard() {
  const [adminData, setAdminData] = useState({
    total_orders: 0,
    total_revenue: 0,
    pending_orders: 0,
    completed_orders: 0,
  });

  const [loading, setLoading] = useState(true);  // Loading state
  const [error, setError] = useState(null);  // Error state

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        // const accessToken = Cookies.get('access');
        // if (!accessToken) {
        //   throw new Error('Access token not found');
        // }

        const response = await axios.get(`${baseUrl}/store/dashboard`, {
          // headers: {
          //   Authorization: `Bearer ${accessToken}`,
          // },
        });

        setAdminData(response.data);
      } catch (error) {
        console.error('Error fetching admin data:', error);
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);  // Always stop loading after fetch
      }
    };

    fetchAdminData();
  }, []);

  const summaryRef = useRef(null);

  const handlePrint = () => {
    if (summaryRef.current) {
      const printContents = summaryRef.current.innerHTML;
      const originalContents = document.body.innerHTML;
      document.body.innerHTML = printContents;
      window.print();
      document.body.innerHTML = originalContents;
      window.location.reload(); // Reload the page to restore the original content
    }
  };

  return (
    <Container maxWidth="xl">
      <Typography variant="h4" sx={{ mb: 5 }}>
        Hi, Welcome back 👋
      </Typography>

      {loading ? (
        <Typography variant="h6">Loading data...</Typography>
      ) : error ? (
        <Typography variant="h6" color="error">{error}</Typography>
      ) : (
        <div ref={summaryRef}>
          <Grid container spacing={3}>
            <Grid xs={12} sm={6} md={3}>
              <AppWidgetSummary
                title="Total Orders"
                total={adminData.total_orders}
                color="success"
                icon={<img alt="icon" src="/assets/icons/glass/ic_glass_bag.png" />}
              />
            </Grid>

            <Grid xs={12} sm={6} md={3}>
              <AppWidgetSummary
                title="Total Revenue"
                total={`$${adminData.total_revenue.toFixed(2)}`}
                color="info"
                icon={<img alt="icon" src="/assets/icons/glass/ic_glass_users.png" />}
              />
            </Grid>

            <Grid xs={12} sm={6} md={3}>
              <AppWidgetSummary
                title="Pending Orders"
                total={adminData.pending_orders}
                color="warning"
                icon={<img alt="icon" src="/assets/icons/glass/ic_glass_users.png" />}
              />
            </Grid>

            <Grid xs={12} sm={6} md={3}>
              <AppWidgetSummary
                title="Completed Orders"
                total={adminData.completed_orders}
                color="error"
                icon={<img alt="icon" src="/assets/icons/glass/ic_glass_message.png" />}
              />
            </Grid>
          </Grid>
        </div>
      )}

      <button
        onClick={handlePrint}
        style={{
          marginTop: '20px',
          padding: '10px 20px',
          fontSize: '16px',
          backgroundColor: '#007BFF',
          color: '#FFF',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
        }}
      >
        Print Summary
      </button>
    </Container>
  );
}
