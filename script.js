// Simple task tracker with localStorage persistence
const form = document.getElementById('task-form');
const input = document.getElementById('task-input');
const list = document.getElementById('task-list');
const pendingCountEl = document.getElementById('pending-count');
const completedCountEl = document.getElementById('completed-count');
const clearCompletedBtn = document.getElementById('clear-completed');
const clearAllBtn = document.getElementById('clear-all');

let tasks = loadTasks();

render();

form.addEventListener('submit', e => {
  e.preventDefault();
  const text = input.value.trim();
  if (!text) return;
  addTask(text);
  input.value = '';
});

clearCompletedBtn.addEventListener('click', () => {
  tasks = tasks.filter(t => !t.completed);
  saveAndRender();
});

clearAllBtn.addEventListener('click', () => {
  if (!confirm('Clear all tasks?')) return;
  tasks = [];
  saveAndRender();
});

// Functions

function addTask(text){
  const task = {
    id: Date.now().toString(),
    text,
    completed: false,
    createdAt: Date.now()
  };
  // Pending tasks at front
  tasks = [task, ...tasks.filter(t => !t.completed), ...tasks.filter(t => t.completed)];
  saveAndRender();
}

function toggleTask(id){
  tasks = tasks.map(t => t.id === id ? {...t, completed: !t.completed} : t);
  // Move completed tasks to end while keeping order among groups
  const pending = tasks.filter(t => !t.completed);
  const completed = tasks.filter(t => t.completed);
  tasks = [...pending, ...completed];
  saveAndRender();
}

function deleteTask(id){
  tasks = tasks.filter(t => t.id !== id);
  saveAndRender();
}

function render(){
  // Clear
  list.innerHTML = '';
  // Render tasks in order (pending first, completed at end)
  tasks.forEach(task => {
    const li = document.createElement('li');
    li.className = 'task-item';
    li.dataset.id = task.id;

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = task.completed;
    checkbox.setAttribute('aria-label', task.completed ? 'Mark as not completed' : 'Mark as complete');
    checkbox.addEventListener('change', () => toggleTask(task.id));

    const text = document.createElement('div');
    text.className = 'task-text' + (task.completed ? ' completed' : '');
    text.textContent = task.text;
    text.title = task.text;

    // allow clicking text to toggle as well
    text.addEventListener('click', () => toggleTask(task.id));
    text.style.cursor = 'pointer';

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'icon-btn delete';
    deleteBtn.setAttribute('aria-label', 'Delete task');
    deleteBtn.textContent = 'Delete';
    deleteBtn.addEventListener('click', () => {
      if (confirm('Delete this task?')) deleteTask(task.id);
    });

    li.appendChild(checkbox);
    li.appendChild(text);
    li.appendChild(deleteBtn);
    list.appendChild(li);
  });

  updateCounts();
}

function updateCounts(){
  const pending = tasks.filter(t => !t.completed).length;
  const completed = tasks.filter(t => t.completed).length;
  pendingCountEl.textContent = `Pending: ${pending}`;
  completedCountEl.textContent = `Completed: ${completed}`;
}

function saveAndRender(){
  saveTasks();
  render();
}

function saveTasks(){
  try {
    localStorage.setItem('task-tracker/tasks', JSON.stringify(tasks));
  } catch (e) {
    console.error('Failed to save tasks', e);
  }
}

function loadTasks(){
  try {
    const raw = localStorage.getItem('task-tracker/tasks');
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load tasks', e);
    return [];
  }
}
