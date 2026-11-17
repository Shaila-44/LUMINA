import { useState, useEffect } from 'react';
import { documentAPI } from '../../services/api';
import { toast } from 'react-toastify';
import { HiOutlineDocumentText, HiOutlineDownload, HiOutlineSearch, HiOutlineCheckCircle } from 'react-icons/hi';

const typeIcons = { PHOTO: '📸', BILL: '🧾', VOUCHER: '📄', INSPECTION: '📋' };
const typeColors = { INSPECTION: 'badge-in-progress', PHOTO: 'badge-completed', BILL: 'badge-pending', VOUCHER: 'badge-delayed' };

export default function Documents() {
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('ALL');

  useEffect(() => { load(); }, []);

  const load = async () => {
    try { const res = await documentAPI.getAll(); setDocs(res.data); }
    catch { /* empty */ } finally { setLoading(false); }
  };

  const handleVerify = async (id) => {
    try {
      await documentAPI.verify(id);
      setDocs(prev => prev.map(d => d.id === id ? { ...d, status: 'VERIFIED' } : d));
      toast.success('Document verified');
    } catch { toast.error('Verification failed'); }
  };

  const filtered = docs.filter(d =>
    (filterType === 'ALL' || d.fileType === filterType) &&
    ((d.fileName || '').toLowerCase().includes(search.toLowerCase()) || (d.description || '').toLowerCase().includes(search.toLowerCase()))
  );

  if (loading) return (
    <div className="flex justify-center py-24">
      <div className="w-10 h-10 border-2 rounded-full animate-spin" style={{ borderColor: 'rgba(99,102,241,0.15)', borderTopColor: 'var(--primary)' }} />
    </div>
  );

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3 animate-fadeInUp">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.15)' }}>
          <HiOutlineDocumentText size={18} style={{ color: '#fbbf24' }} />
        </div>
        <div>
          <h1 className="text-xl font-black text-white">Agency Documents</h1>
          <p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>{docs.length} uploads</p>
        </div>
      </div>

      <div className="glass rounded-2xl p-4 flex flex-col sm:flex-row gap-3 animate-fadeInUp" style={{ animationDelay: '0.05s' }}>
        <div className="relative flex-1">
          <HiOutlineSearch className="absolute left-3.5 top-1/2 -translate-y-1/2" size={16} style={{ color: 'var(--text-muted)' }} />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} className="form-input pl-10" placeholder="Search documents..." />
        </div>
        <div className="flex gap-1.5">
          {['ALL', 'PHOTO', 'BILL', 'VOUCHER', 'INSPECTION'].map(t => (
            <button key={t} onClick={() => setFilterType(t)} className="px-3 py-2 rounded-lg text-xs font-bold transition-all" style={{ background: filterType === t ? 'var(--gradient-1)' : 'transparent', color: filterType === t ? 'white' : 'var(--text-muted)', border: filterType === t ? 'none' : '1px solid var(--border)' }}>
              {t === 'ALL' ? 'All' : `${typeIcons[t] || ''} ${t.charAt(0) + t.slice(1).toLowerCase()}`}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="glass rounded-2xl text-center py-16 animate-fadeInUp"><p className="text-sm" style={{ color: 'var(--text-muted)' }}>No documents found</p></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filtered.map((doc, i) => (
            <div key={doc.id} className="glass rounded-xl p-4 card-hover animate-fadeInUp" style={{ animationDelay: `${0.1 + i * 0.04}s` }}>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center text-lg flex-shrink-0" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)' }}>
                  {typeIcons[doc.fileType] || '📎'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate">{doc.fileName}</p>
                  <p className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>{doc.uploadedAt ? new Date(doc.uploadedAt).toLocaleDateString() : '—'} {doc.fileSize ? `• ${doc.fileSize}` : ''}</p>
                  {doc.description && <p className="text-[10px] mt-0.5" style={{ color: 'var(--text-secondary)' }}>{doc.description}</p>}
                  <div className="flex items-center gap-2 mt-2">
                    <span className={`badge ${typeColors[doc.fileType] || 'badge-pending'}`}>{doc.fileType}</span>
                    <span className={`badge ${doc.status === 'VERIFIED' ? 'badge-completed' : 'badge-pending'}`} style={{ fontSize: '0.6rem', padding: '0.1rem 0.4rem' }}>{doc.status}</span>
                  </div>
                </div>
                <div className="flex flex-col gap-1 flex-shrink-0">
                  {doc.status === 'PENDING' && (
                    <button onClick={() => handleVerify(doc.id)} className="p-1.5 rounded-lg transition-colors" style={{ color: '#34d399' }} title="Verify"
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(16,185,129,0.1)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      <HiOutlineCheckCircle size={15} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
