import React, { useEffect, useState } from 'react';
import api from '../api';
import { Search, Plus, Filter, MoreHorizontal, Download, History, Database, AlertCircle } from 'lucide-react';

const Inventory = () => {
  const [books, setBooks] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newBook, setNewBook] = useState({ title: '', author: '', isbn: '', category: 'Fiction' });
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchBooks();
  }, [page, searchTerm]);

  const fetchBooks = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getBooksPaginated(page * 10, 10, searchTerm);
      setBooks(res.data.items || []);
      setTotal(res.data.total || 0);
    } catch (err) {
      console.error("Resource fetch failure:", err);
      setError("Unable to synchronize with the Resource Registry. Connection lost.");
      setBooks([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddBook = async (e) => {
    e.preventDefault();
    try {
      await api.createBook(newBook);
      setIsModalOpen(false);
      setNewBook({ title: '', author: '', isbn: '', category: 'Fiction' });
      fetchBooks();
    } catch (err) {
      console.error(err);
      alert("Terminal Failure: Unable to register new resource.");
    }
  };

  const handleDeleteBook = async (id) => {
    if (window.confirm("Are you sure you want to decommission this resource?")) {
      try {
        await api.deleteBook(id);
        fetchBooks();
      } catch (err) {
        console.error(err);
        alert("Authorization Failure: Unable to decommission resource.");
      }
    }
  };

  const handleExportCSV = () => {
    if (!books || books.length === 0) return alert("No active records available for export.");
    const headers = ['Title', 'Author', 'ISBN', 'Category', 'Status', 'Record Date'];
    const rows = books.map(b => [b.title, b.author, b.isbn, b.category, b.status, b.added_date]);
    let csvContent = "data:text/csv;charset=utf-8," + headers.join(",") + "\n" + rows.map(r => r.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "booklytics_registry_export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getBadgeClass = (status) => {
    switch (status) {
      case 'Available': return 'badge-success';
      case 'Issued': return 'badge-warning';
      case 'Lost': return 'badge-danger';
      default: return '';
    }
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh', color: 'var(--text-muted)' }}>Refreshing Registry...</div>;

  return (
    <div>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
        <div>
          <h1 style={{ marginBottom: '8px' }}>Resource Registry</h1>
          <div className="caption">Detailed inventory management and resource tracking.</div>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="cyber-action" onClick={handleExportCSV}>
            <Download size={16} /> Export CSV
          </button>
          <button className="primary-neon" onClick={() => setIsModalOpen(true)}>
            <Plus size={18} /> Add New Entry
          </button>
        </div>
      </header>

      <div style={{ display: 'flex', gap: '16px', marginBottom: '32px' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input 
            type="text" 
            placeholder="Search by title, author, or ISBN identifier..." 
            className="input-minimal"
            style={{ width: '100%', paddingLeft: '48px', height: '48px', fontSize: '1rem', background: 'var(--bg-card)', border: '1px solid var(--border-clean)', borderRadius: '8px', color: 'var(--text-main)' }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="cyber-action" style={{ height: '48px', padding: '0 24px', fontSize: '0.9375rem' }}>
          <Filter size={18} /> Filters
        </button>
      </div>

      <div className="bento-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '24px', borderBottom: '1px solid var(--border-clean)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.01)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Database size={20} color="var(--accent-main)" />
                <h2 style={{ fontSize: '1.1rem' }}>Active Registry</h2>
            </div>
            <div className="caption" style={{ fontWeight: 800 }}>{total} ENTRIES FOUND</div>
        </div>
        <table className="registry-table">
          <thead>
            <tr>
              <th style={{ width: '60px' }}>Ref</th>
              <th style={{ width: '35%' }}>Logical Resource</th>
              <th>Contributor</th>
              <th>Metadata</th>
              <th>Status</th>
              <th>Record Date</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {books.length > 0 ? books.map((book) => (
              <tr key={book.id}>
                <td>
                  <div style={{ width: '40px', height: '60px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden', border: '1px solid var(--border-clean)' }}>
                    {book.cover_url ? (
                      <img 
                        src={book.cover_url} 
                        alt="" 
                        style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.8 }} 
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                    ) : (
                      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.6rem', color: 'var(--text-muted)' }}>N/A</div>
                    )}
                  </div>
                </td>
                <td>
                  <div style={{ fontWeight: 800, color: 'var(--text-active)', fontSize: '1rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '400px' }} title={book.title}>{book.title}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '4px' }}>ISBN: {book.isbn}</div>
                </td>
                <td style={{ fontWeight: 600 }}>{book.author}</td>
                <td>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>{book.category}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '2px' }}>{book.publisher} • {book.pages}p</div>
                </td>
                <td>
                  <span className={`badge ${getBadgeClass(book.status)}`}>
                    {book.status}
                  </span>
                </td>
                <td style={{ fontSize: '0.875rem' }}>{book.added_date}</td>
                <td style={{ textAlign: 'right' }}>
                  <button style={{ background: 'transparent', border: 'none', color: 'var(--danger)', cursor: 'pointer', padding: '8px' }} onClick={() => handleDeleteBook(book.id)}>
                    <MoreHorizontal size={20} />
                  </button>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '64px', color: 'var(--text-muted)' }}>
                  <AlertCircle size={40} style={{ marginBottom: '16px', opacity: 0.2 }} />
                  <div>No resource entries found for the current search.</div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
        
        <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border-clean)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.01)' }}>
          <div className="caption" style={{ fontWeight: 800 }}>PAGE {page + 1} OF {Math.ceil(total / 10)}</div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="cyber-action" onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}>Previous</button>
            <button className="cyber-action" onClick={() => setPage(p => p + 1)} disabled={books.length < 10}>Next</button>
          </div>
        </div>
      </div>

      {/* Add Book Modal */}
      {isModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="bento-card" style={{ width: '450px', background: 'var(--bg-card)', border: '1px solid var(--accent-main)' }}>
            <h2 style={{ marginBottom: '24px' }}>Register New Resource</h2>
            <form onSubmit={handleAddBook} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label className="caption" style={{ display: 'block', marginBottom: '8px' }}>RESOURCE TITLE</label>
                <input className="input-minimal" style={{ width: '100%', height: '40px' }} value={newBook.title} onChange={e => setNewBook({...newBook, title: e.target.value})} required />
              </div>
              <div>
                <label className="caption" style={{ display: 'block', marginBottom: '8px' }}>CONTRIBUTOR / AUTHOR</label>
                <input className="input-minimal" style={{ width: '100%', height: '40px' }} value={newBook.author} onChange={e => setNewBook({...newBook, author: e.target.value})} required />
              </div>
              <div>
                <label className="caption" style={{ display: 'block', marginBottom: '8px' }}>ISBN IDENTIFIER</label>
                <input className="input-minimal" style={{ width: '100%', height: '40px' }} value={newBook.isbn} onChange={e => setNewBook({...newBook, isbn: e.target.value})} required />
              </div>
              <div>
                <label className="caption" style={{ display: 'block', marginBottom: '8px' }}>SECTOR CLASSIFICATION</label>
                <select className="input-minimal" style={{ width: '100%', height: '40px', background: 'var(--bg-app)' }} value={newBook.category} onChange={e => setNewBook({...newBook, category: e.target.value})}>
                  <option>Fiction</option>
                  <option>History</option>
                  <option>Physics</option>
                  <option>Mathematics</option>
                  <option>Computer Science</option>
                  <option>Biography</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                <button type="button" className="cyber-action" style={{ flex: 1 }} onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="primary-neon" style={{ flex: 1 }}>Submit Entry</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;

