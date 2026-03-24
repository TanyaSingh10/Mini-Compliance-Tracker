import { useEffect, useState } from 'react';
import axios from 'axios';
import './App.css';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5050';

function App() {
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    dueDate: '',
    status: 'Pending',
    priority: 'Medium',
  });

  const fetchClients = async () => {
    const res = await axios.get(`${API_BASE}/api/clients`);
    setClients(res.data);
    if (res.data.length > 0 && !selectedClient) {
      setSelectedClient(res.data[0]);
    }
  };

  const fetchTasks = async (clientId, status = '', category = '') => {
    const params = {};
    if (status) params.status = status;
    if (category) params.category = category;

    const res = await axios.get(`${API_BASE}/api/clients/${clientId}/tasks`, {
      params,
    });
    setTasks(res.data);
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
  };

  const handleStatusChange = async (taskId, newStatus) => {
    await axios.patch(`${API_BASE}/api/tasks/${taskId}/status`, {
      status: newStatus,
    });

    fetchTasks(selectedClient.id, statusFilter, categoryFilter);
  };

  const isOverdue = (task) => {
    const today = new Date();
    const due = new Date(task.dueDate);
    return task.status !== 'Completed' && due < today;
  };

  const categories = [...new Set(tasks.map((task) => task.category))];

  return (
    <div className="app-container">
      <aside className="sidebar">
        <h2>Clients</h2>
        {clients.map((client) => (
          <div
            key={client.id}
            className={`client-card ${selectedClient?.id === client.id ? 'active' : ''}`}
            onClick={() => setSelectedClient(client)}
          >
            <h3>{client.companyName}</h3>
            <p>{client.country}</p>
            <p>{client.entityType}</p>
          </div>
        ))}
      </aside>

      <main className="main-content">
        <h1>Mini Compliance Tracker</h1>

        {selectedClient && (
          <>
            <section className="selected-client">
              <h2>{selectedClient.companyName}</h2>
              <p>{selectedClient.country} • {selectedClient.entityType}</p>
            </section>

            <section className="filters">
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="">All Statuses</option>
                <option value="Pending">Pending</option>
                <option value="Completed">Completed</option>
              </select>

              <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
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
              {tasks.length === 0 ? (
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
                      <p><strong>Due:</strong> {new Date(task.dueDate).toLocaleDateString()}</p>
                      <p><strong>Priority:</strong> {task.priority}</p>
                      <p><strong>Status:</strong> {task.status}</p>
                    </div>

                    <div>
                      <select
                        value={task.status}
                        onChange={(e) => handleStatusChange(task.id, e.target.value)}
                      >
                        <option value="Pending">Pending</option>
                        <option value="Completed">Completed</option>
                      </select>
                      {isOverdue(task) && <p className="overdue-text">Overdue</p>}
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
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
                <textarea
                  placeholder="Description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
                <input
                  type="text"
                  placeholder="Category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  required
                />
                <input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  required
                />
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <option value="Pending">Pending</option>
                  <option value="Completed">Completed</option>
                </select>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
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