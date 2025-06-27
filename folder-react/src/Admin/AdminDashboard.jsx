import React, { useEffect, useState } from 'react';
import axios from 'axios';

import Header from './Header.jsx';
import Sidebar from './Sidebar.jsx';
import MonitoringTugasAkhir from './MonitoringTugasAkhir.jsx';
import StudentTable from './StudentTable.jsx';
import ActivityDetail from './ActivityDetail.jsx';

function AdminDashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      const token = localStorage.getItem("access");

      if (!token) {
        setError("Token tidak ditemukan. Silakan login terlebih dahulu.");
        return;
      }

      try {
        const response = await axios.get("http://localhost:8000/api/admin-dashboard/", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setDashboardData(response.data);
      } catch (err) {
        console.error("Gagal fetch dashboard:", err);
        setError("Gagal mengambil data dari server.");
      }
    };

    fetchDashboardData();
  }, []);

  if (error) {
    return <div style={{ padding: '20px', color: 'red' }}>{error}</div>;
  }

  if (!dashboardData) {
    return <div style={{ padding: '20px' }}>Memuat data dashboard...</div>;
  }

  return (
    <>
      <Header />
      <Sidebar />
      <div style={{ flexGrow: 1, padding: '24px', backgroundColor: '#f3f4ff' }}>
        <MonitoringTugasAkhir 
          data={dashboardData} 
          milestoneChoices={dashboardData.milestone_choices}
        />
        <StudentTable data={dashboardData.mahasiswa_milestones} />
      </div>
      <ActivityDetail isOpen={false} onClose={() => {}} />
    </>
  );
}

export default AdminDashboard;
