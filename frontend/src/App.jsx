import { useEffect, useState } from 'react';
import axios from 'axios';
import './App.css';

const API_BASE =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:5050';

function App() {
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [error, setError] = useState('');
  const [loadingClients, setLoadingClients] = useState(false);
  const [loadingTasks, setLoadingTasks] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    dueDate: '',
    status: 'Pending',
    priority: 'Medium',
  });

  const fetchClients = async () => {
    try {
      setLoadingClients(true);
      setError('');

      const res = await axios.get(`${API_BASE}/api/clients`);
      setClients(res.data);

      if (res.data.length > 0) {
        setSelectedClient((prev) => prev || res.data[0]);
      }
    } catch (err) {
      console.error('Error fetching clients:', err);
      setError('Failed to load clients. Check backend URL and deployment.');
    } finally {
      setLoadingClients(false);
    }
  };

  const fetchTasks = async (clientId, status = '', category = '') => {
    try {
      setLoadingTasks(true);
      setError('');

      const params = {};
      if (status) params.status = status;
      if (category) params.category = category;

      const res = await axios.get(`${API_BASE}/api/clients/${clientId}/tasks`, {
        params,
      });

      setTasks(res.data);
    } catch (err) {
      console.error('Error fetching tasks:', err);
      setError('Failed to load tasks for selected client.');
      setTasks([]);
    } finally {
      setLoadingTasks(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  useEffect(() => {
    if (selectedClient) {
      fetchTasks(selectedClient.id, statusFilter, categoryFilter);
    }
  }, [selectedClient, statusFilter, categoryFilter]);

  const handleAddTask = async (e) => {
    e.preventDefault();

    if (!selectedClient) return;

    try {
      setError('');

      await axios.post(`${API_BASE}/api/tasks`, {
        clientId: selectedClient.id,
        ...formData,
      });

      setFormData({
        title: '',
        description: '',
        category: '',
        dueDate: '',
        status: 'Pending',
        priority: 'Medium',
      });

      fetchTasks(selectedClient.id, statusFilter, categoryFilter);
    } catch (err) {
      console.error('Error adding task:', err);
      setError('Failed to add task.');
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      setError('');

      await axios.patch(`${API_BASE}/api/tasks/${taskId}/status`, {
        status: newStatus,
      });

      fetchTasks(selectedClient.id, statusFilter, categoryFilter);
    } catch (err) {
      console.error('Error updating status:', err);
      setError('Failed to update task status.');
    }
  };

  const isOverdue = (task) => {
    const today = new Date();
    const due = new Date(task.dueDate);
    return task.status !== 'Completed' && due < today;
  };

  const categories = [...new Set(tasks.map((task) => task.category).filter(Boolean))];

  return (
    <div className="app-container">
      <aside className="sidebar">
        <h2>Clients</h2>

        {loadingClients && <p>Loading clients...</p>}

        {!loadingClients && clients.length === 0 && !error && (
          <p>No clients found.</p>
        )}

        {clients.map((client) => (
          <div
            key={client.id}
            className={`client-card ${selectedClient?.id === client.id ? 'active' : ''}`}
            onClick={() => setSelectedClient(client)}
          >
            <h3>{client.name || client.companyName}</h3>
            <p>{client.country || 'N/A'}</p>
            <p>{client.entityType || 'N/A'}</p>
          </div>
        ))}
      </aside>

      <main className="main-content">
        <h1>Mini Compliance Tracker</h1>

        {error && <p className="overdue-text">{error}</p>}

        {selectedClient && (
          <>
            <section className="selected-client">
              <h2>{selectedClient.name || selectedClient.companyName}</h2>
              <p>
                {selectedClient.country || 'N/A'} • {selectedClient.entityType || 'N/A'}
              </p>
            </section>

            <section className="filters">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">All Statuses</option>
                <option value="Pending">Pending</option>
                <option value="Completed">Completed</option>
              </select>

              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option value="">All Categories</option>
                {categories.map((cat, idx) => (
                  <option key={idx} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </section>

            <section className="task-list">
              <h2>Tasks</h2>

              {loadingTasks ? (
                <p>Loading tasks...</p>
              ) : tasks.length === 0 ? (
                <p>No tasks found.</p>
              ) : (
                tasks.map((task) => (
                  <div
                    key={task.id}
                    className={`task-card ${isOverdue(task) ? 'overdue' : ''}`}
                  >
                    <div>
                      <h3>{task.title}</h3>
                      <p>{task.description}</p>
                      <p><strong>Category:</strong> {task.category}</p>
                      <p>
                        <strong>Due:</strong>{' '}
                        {task.dueDate
                          ? new Date(task.dueDate).toLocaleDateString()
                          : 'N/A'}
                      </p>
                      <p><strong>Priority:</strong> {task.priority}</p>
                      <p><strong>Status:</strong> {task.status}</p>
                    </div>

                    <div>
                      <select
                        value={task.status}
                        onChange={(e) =>
                          handleStatusChange(task.id, e.target.value)
                        }
                      >
                        <option value="Pending">Pending</option>
                        <option value="Completed">Completed</option>
                      </select>

                      {isOverdue(task) && (
                        <p className="overdue-text">Overdue</p>
                      )}
                    </div>
                  </div>
                ))
              )}
            </section>

            <section className="task-form-section">
              <h2>Add Task</h2>

              <form className="task-form" onSubmit={handleAddTask}>
                <input
                  type="text"
                  placeholder="Title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  required
                />

                <textarea
                  placeholder="Description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                />

                <input
                  type="text"
                  placeholder="Category"
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  required
                />

                <input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) =>
                    setFormData({ ...formData, dueDate: e.target.value })
                  }
                  required
                />

                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value })
                  }
                >
                  <option value="Pending">Pending</option>
                  <option value="Completed">Completed</option>
                </select>

                <select
                  value={formData.priority}
                  onChange={(e) =>
                    setFormData({ ...formData, priority: e.target.value })
                  }
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>

                <button type="submit">Add Task</button>
              </form>
            </section>
          </>
        )}
      </main>
    </div>
  );
}

export default App;