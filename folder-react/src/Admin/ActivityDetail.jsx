import React from 'react';
import { FaTimes, FaSearch } from 'react-icons/fa';

const ActivityDetail = ({ data, onClose }) => {
  if (!data) return null;

  const isPdf = data.file?.endsWith('.pdf');
  const isImage = /\.(jpeg|jpg|png|gif|webp)$/i.test(data.file || '');

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 9999
    }}>
      <div style={{
        backgroundColor: '#fff',
        padding: '24px',
        borderRadius: '12px',
        width: '500px',
        maxHeight: '80%',
        overflowY: 'auto',
        boxShadow: '0 4px 16px rgba(0,0,0,0.2)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '6px', margin: 0 }}>
            <FaSearch /> Detail Kegiatan
          </h3>
          <button onClick={onClose} style={{
            background: 'none',
            border: 'none',
            fontSize: '18px',
            cursor: 'pointer',
            color: '#4d44b5'
          }}><FaTimes /></button>
        </div>
        <hr />

        {/* Preview Bukti File */}
        <div style={{
          width: '100%',
          height: '200px',
          backgroundColor: '#f0f0f0',
          borderRadius: '8px',
          marginBottom: '20px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          overflow: 'hidden'
        }}>
          {isImage ? (
            <img src={`http://localhost:8000${data.file}`} alt="Bukti" style={{ maxHeight: '100%', maxWidth: '100%' }} />
          ) : isPdf ? (
            <iframe
              src={`http://localhost:8000${data.file}`}
              title="PDF Preview"
              style={{ width: '100%', height: '100%', border: 'none' }}
            />
          ) : (
            <p style={{ color: '#999', fontStyle: 'italic' }}>Tidak ada pratinjau file</p>
          )}
        </div>

        {/* Detail Info */}
        <p><strong>Judul:</strong> {data.judul}</p>
        <p><strong>Tanggal:</strong> {new Date(data.tanggal).toLocaleString('id-ID')}</p>
        <p><strong>Deskripsi:</strong> {data.deskripsi}</p>
        <p><strong>Status:</strong> {data.status}</p>
        <p><strong>Komentar:</strong> {data.komentar || '-'}</p>

        {/* Download link (opsional) */}
        {data.file && (
          <p>
            <strong>Unduh File:</strong>{' '}
            <a
              href={`http://localhost:8000${data.file}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: '#4d44b5', textDecoration: 'underline' }}
            >
              {data.nama_dokumen || 'Lihat Dokumen'}
            </a>
          </p>
        )}
      </div>
    </div>
  );
};

export default ActivityDetail;
