import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from 'axios';
import React from 'react';
import ActivityDetail from './ActivityDetail';
import { FaUserGraduate, FaIdCard, FaBook } from 'react-icons/fa';

function StudentDetail() {
  const { nim } = useParams();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState(null);

  useEffect(() => {
    const fetchStudent = async () => {
      const token = localStorage.getItem("access");

      try {
        const res = await axios.get(`http://localhost:8000/api/mahasiswa/${nim}/`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setStudent(res.data);
      } catch (err) {
        console.error('Gagal mengambil data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStudent();
  }, [nim]);

  if (loading) return <p style={{ marginLeft: '80px', padding: '20px' }}>Memuat data mahasiswa...</p>;
  if (!student) return <p style={{ marginLeft: '80px', padding: '20px' }}>Data tidak ditemukan</p>;

  return (
    <div style={{ marginLeft: '80px', padding: '20px', fontFamily: 'Poppins, sans-serif', color: '#333' }}>
      <h2 style={{ color: '#4d44b5', marginBottom: '24px' }}>
        <span role="img" aria-label="Detail Mahasiswa">📋</span> Detail Mahasiswa
      </h2>
      {student.foto_profil && (
        <img
          src={`http://localhost:8000${student.foto_profil}`}
          alt="Foto Mahasiswa"
          style={{
            width: '100px',
            height: '150px',
            borderRadius: '5%',
            objectFit: 'cover',
            marginBottom: '20px',
            border: '2px solid #4d44b5'
          }}
        />
      )}

      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        padding: '20px',
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
        marginBottom: '30px',
        maxWidth: '600px',
      }}>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <FaUserGraduate color="#4d44b5" />
          <span><strong>Nama:</strong> {student.nama}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <FaIdCard color="#4d44b5" />
          <span><strong>NIM:</strong> {student.nim}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <FaBook color="#4d44b5" />
          <span><strong>Topik:</strong> {student.topik}</span>
        </div>
      </div>

      <h3 style={{ color: '#4d44b5', marginBottom: '16px' }}>
        <span role="img" aria-label="Riwayat Bimbingan">📑</span> Riwayat Bimbingan
      </h3>

      <ul style={{ listStyleType: 'none', paddingLeft: 0, maxWidth: '700px' }}>
        {student.bimbingan.map((b, idx) => (
          <li key={idx} style={{
            border: '1px solid #e0e0e0',
            borderRadius: '10px',
            padding: '16px',
            marginBottom: '16px',
            backgroundColor: '#fdfdfd',
            boxShadow: '0 2px 6px rgba(0,0,0,0.03)'
          }}>
            <p style={{ marginBottom: '6px' }}><strong>Judul:</strong> {b.judul}</p>
            <p style={{ marginBottom: '10px' }}><strong>Tanggal:</strong> {new Date(b.tanggal).toLocaleDateString('id-ID', {
              day: 'numeric', month: 'long', year: 'numeric'
            })}</p>
            <button
              onClick={() => {
                setSelectedActivity(b);
                setModalOpen(true);
              }}
              style={{
                fontSize: '13px',
                padding: '6px 12px',
                border: '1px solid #4d44b5',
                backgroundColor: '#ffffff',
                color: '#4d44b5',
                borderRadius: '6px',
                cursor: 'pointer',
                transition: '0.2s',
              }}
              onMouseOver={(e) => e.target.style.backgroundColor = '#4d44b5'}
              onMouseOut={(e) => e.target.style.backgroundColor = '#ffffff'}
              onFocus={(e) => e.target.style.outline = 'none'}
            >
              Lihat Detail
            </button>
          </li>
        ))}
      </ul>

      {modalOpen && selectedActivity && (
        <ActivityDetail
          data={selectedActivity}
          onClose={() => {
            setModalOpen(false);
            setSelectedActivity(null);
          }}
        />
      )}
    </div>
  );
}

export default StudentDetail;
