

import { useState, useEffect } from 'react';
import './App.css';

function App() {
  const API_URL = 'http://localhost:5000/api/leads';

  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');

  const emptyForm = {
    name: '',
    email: '',
    phone: '',
    business: '',
    status: 'New',
  };

  const [form, setForm] = useState(emptyForm);

  // Fetch all leads from the database
  async function fetchLeads() {
    try {
      setError('');
      const response = await fetch(API_URL);

      if (!response.ok) {
        throw new Error('Unable to fetch leads.');
      }

      const data = await response.json();
      setLeads(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchLeads();
  }, []);

  // Open the form to add a lead
  function openAddForm() {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(true);
  }

  // Open the form to edit a lead
  function openEditForm(lead) {
    setEditingId(lead.id);
    setForm({
      name: lead.name,
      email: lead.email,
      phone: lead.phone,
      business: lead.business,
      status: lead.status,
    });
    setShowForm(true);
  }

  // Add or update a lead in the database
  async function handleSubmit(event) {
    event.preventDefault();

    try {
      const url = editingId !== null
        ? `${API_URL}/${editingId}`
        : API_URL;

      const response = await fetch(url, {
        method: editingId !== null ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form),
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || 'Could not save lead.');
      }

      const savedLead = await response.json();

      if (editingId !== null) {
        setLeads(leads.map(lead =>
          lead.id === editingId ? savedLead : lead
        ));
      } else {
        setLeads([savedLead, ...leads]);
      }

      setForm(emptyForm);
      setEditingId(null);
      setShowForm(false);
      setError('');
    } catch (err) {
      setError(err.message);
      alert(err.message);
    }
  }

  // Delete a lead from the database
  async function deleteLead(id) {
    const confirmed = window.confirm(
      'Are you sure you want to delete this lead?'
    );

    if (!confirmed) return;

    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || 'Could not delete lead.');
      }

      setLeads(leads.filter(lead => lead.id !== id));
    } catch (err) {
      alert(err.message);
    }
  }

  // Search and filter leads
  const filteredLeads = leads.filter(lead => {
    const matchesSearch =
      lead.name.toLowerCase().includes(search.toLowerCase()) ||
      lead.email.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      filter === 'All' || lead.status === filter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="app">
      <aside className="sidebar">
        <h1 className="logo">axl<span>.</span></h1>
        <p className="menu-label">MENU</p>

        <nav>
          <a className="nav-link active" href="#dashboard">
            ▦ Dashboard
          </a>
          <a className="nav-link" href="#leads">
            ♧ All Leads
          </a>
          <button className="nav-link" onClick={openAddForm}>
            ＋ Add New Lead
          </button>
        </nav>

        <div className="sidebar-bottom">
          <p>YOUR WORKSPACE</p>
          <strong>Personal CRM</strong>
        </div>
      </aside>

      <main className="main-content" id="dashboard">
        <header className="topbar">
          <span>Workspace / Dashboard</span>
          <div className="profile">
            <div className="avatar">A</div>
            <span>Admin</span>
          </div>
        </header>

        <section className="welcome">
          <div>
            <p className="eyebrow">OVERVIEW</p>
            <h2>Dashboard</h2>
            <p>Here's what's happening with your leads today.</p>
          </div>

          <button className="add-button" onClick={openAddForm}>
            ＋ Add New Lead
          </button>
        </section>

        <section className="stats">
          <div className="stat-card">
            <p>Total Leads</p>
            <h3>{leads.length}</h3>
            <span>All registered leads</span>
          </div>

          <div className="stat-card">
            <p>New Leads</p>
            <h3>
              {leads.filter(lead => lead.status === 'New').length}
            </h3>
            <span>Recently added leads</span>
          </div>

          <div className="stat-card">
            <p>Converted Customers</p>
            <h3>
              {leads.filter(lead => lead.status === 'Converted').length}
            </h3>
            <span>Successfully converted</span>
          </div>
        </section>

        <section className="leads-section" id="leads">
          <div className="section-heading">
            <div>
              <h3>All Leads</h3>
              <p>Search, filter and manage your prospects.</p>
            </div>
          </div>

          <div className="lead-controls">
            <input
              className="search-input"
              type="search"
              placeholder="Search by name or email..."
              value={search}
              onChange={event => setSearch(event.target.value)}
            />

            <select
              className="filter-select"
              value={filter}
              onChange={event => setFilter(event.target.value)}
            >
              <option value="All">All Statuses</option>
              <option value="New">New</option>
              <option value="Contacted">Contacted</option>
              <option value="Converted">Converted</option>
            </select>
          </div>

          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>NAME</th>
                  <th>BUSINESS</th>
                  <th>EMAIL</th>
                  <th>STATUS</th>
                  <th>ACTIONS</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="5" className="empty-message">
                      Loading leads...
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan="5" className="empty-message">
                      {error}
                    </td>
                  </tr>
                ) : (
                  <>
                    {filteredLeads.map(lead => (
                      <tr key={lead.id}>
                        <td><strong>{lead.name}</strong></td>
                        <td>{lead.business}</td>
                        <td>{lead.email}</td>
                        <td>
                          <span className={`status ${lead.status.toLowerCase()}`}>
                            {lead.status}
                          </span>
                        </td>
                        <td>
                          <div className="actions">
                            <button
                              className="edit-button"
                              onClick={() => openEditForm(lead)}
                            >
                              Edit
                            </button>

                            <button
                              className="delete-button"
                              onClick={() => deleteLead(lead.id)}
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}

                    {filteredLeads.length === 0 && (
                      <tr>
                        <td colSpan="5" className="empty-message">
                          No leads found. Try another search or filter.
                        </td>
                      </tr>
                    )}
                  </>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {showForm && (
          <div className="modal-overlay">
            <div className="lead-modal">
              <div className="modal-heading">
                <div>
                  <h3>
                    {editingId !== null ? 'Edit Lead' : 'Add New Lead'}
                  </h3>
                  <p>Enter the details of your prospect.</p>
                </div>

                <button
                  className="close-button"
                  onClick={() => setShowForm(false)}
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleSubmit}>
                <label>Full Name</label>
                <input
                  required
                  value={form.name}
                  onChange={event =>
                    setForm({ ...form, name: event.target.value })
                  }
                  placeholder="Enter full name"
                />

                <label>Email Address</label>
                <input
                  required
                  type="email"
                  value={form.email}
                  onChange={event =>
                    setForm({ ...form, email: event.target.value })
                  }
                  placeholder="Enter email address"
                />

                <label>Phone Number</label>
                <input
                  required
                  type="tel"
                  value={form.phone}
                  onChange={event =>
                    setForm({ ...form, phone: event.target.value })
                  }
                  placeholder="Enter phone number"
                />

                <label>Business Name</label>
                <input
                  required
                  value={form.business}
                  onChange={event =>
                    setForm({ ...form, business: event.target.value })
                  }
                  placeholder="Enter business name"
                />

                <label>Lead Status</label>
                <select
                  value={form.status}
                  onChange={event =>
                    setForm({ ...form, status: event.target.value })
                  }
                >
                  <option>New</option>
                  <option>Contacted</option>
                  <option>Converted</option>
                </select>

                <div className="form-actions">
                  <button
                    type="button"
                    className="cancel-button"
                    onClick={() => setShowForm(false)}
                  >
                    Cancel
                  </button>

                  <button type="submit" className="add-button">
                    {editingId !== null ? 'Save Changes' : 'Save Lead'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;

