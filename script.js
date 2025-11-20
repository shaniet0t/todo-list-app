const todoForm = document.getElementById('todo-form');
const todoInput = document.getElementById('todo-input');
const priorityInput = document.getElementById('priority-input');
const dateInput = document.getElementById('date-input');
const todoList = document.getElementById('todo-list');
const searchInput = document.getElementById('search-input');
const filterPriority = document.getElementById('filter-priority');
const progressBar = document.getElementById('progress');
let todos = [];

document.addEventListener('DOMContentLoaded', () => {
  loadTodos();
  renderTodos();
});

todoForm.addEventListener('submit', e => {
  e.preventDefault();
  addTodo(todoInput.value, priorityInput.value, dateInput.value);
  todoInput.value = '';
  priorityInput.value = 'Low';
  dateInput.value = '';
});

searchInput.addEventListener('input', renderTodos);
filterPriority.addEventListener('change', renderTodos);

function addTodo(text, priority, dueDate) {
  if (!text.trim()) return;
  todos.push({
    text,
    priority,
    dueDate,
    completed: false,
    createdAt: Date.now()
  });
  saveTodos();
  renderTodos();
}

function saveTodos() {
  localStorage.setItem('todos-v2', JSON.stringify(todos));
}

function loadTodos() {
  todos = JSON.parse(localStorage.getItem('todos-v2') || '[]');
}

function renderTodos() {
  let filtered = todos.filter(todo => {
    const matchesText = todo.text.toLowerCase().includes(searchInput.value.toLowerCase());
    const matchesPrio = !filterPriority.value || todo.priority === filterPriority.value;
    return matchesText && matchesPrio;
  });
  todoList.innerHTML = '';
  filtered.forEach((todo, idx) => {
    const li = document.createElement('li');
    if (todo.completed) li.classList.add('completed');
    li.setAttribute('data-idx', idx);

    // Complete toggle
    const completeBtn = document.createElement('span');
    completeBtn.className = 'complete';
    completeBtn.textContent = todo.completed ? '✔' : '○';
    completeBtn.setAttribute('role', 'button');
    completeBtn.setAttribute('tabindex', '0');
    completeBtn.setAttribute('aria-label', 'Toggle complete');
    completeBtn.onclick = () => toggleComplete(idx);

    if (li.classList.contains('editing')) {
      // Inline edit mode
      const editInput = document.createElement('input');
      editInput.type = 'text';
      editInput.value = todo.text;
      editInput.setAttribute('aria-label', 'Edit task text');

      const prioSelect = document.createElement('select');
      ['Low','Medium','High'].forEach(pr => {
        const opt = document.createElement('option');
        opt.value = pr;
        opt.textContent = pr;
        if (pr === todo.priority) opt.selected = true;
        prioSelect.appendChild(opt);
      });
      prioSelect.setAttribute('aria-label', 'Edit priority');

      const dateInp = document.createElement('input');
      dateInp.type = 'date';
      dateInp.value = todo.dueDate || '';
      dateInp.setAttribute('aria-label', 'Edit due date');

      const saveBtn = document.createElement('button');
      saveBtn.textContent = '💾';
      saveBtn.onclick = () => saveEdit(idx, editInput.value, prioSelect.value, dateInp.value);

      li.appendChild(editInput);
      li.appendChild(prioSelect);
      li.appendChild(dateInp);
      li.appendChild(saveBtn);
    } else {
      const taskSpan = document.createElement('span');
      taskSpan.className = 'task-text';
      taskSpan.textContent = todo.text;
      taskSpan.setAttribute('aria-label', 'Task text');
      taskSpan.title = todo.text;

      const prioSpan = document.createElement('span');
      prioSpan.className = 'priority ' + todo.priority;
      prioSpan.textContent = todo.priority;
      prioSpan.setAttribute('aria-label', `Priority: ${todo.priority}`);

      const dateSpan = document.createElement('span');
      dateSpan.className = 'due-date';
      dateSpan.textContent = todo.dueDate ? `Due: ${todo.dueDate}` : '';
      dateSpan.setAttribute('aria-label', todo.dueDate ? `Due date: ${todo.dueDate}` : '');

      // Edit button
      const editBtn = document.createElement('button');
      editBtn.className = 'edit';
      editBtn.textContent = '✎';
      editBtn.setAttribute('aria-label', 'Edit task');
      editBtn.onclick = () => enterEditMode(li, idx);

      // Delete button
      const delBtn = document.createElement('button');
      delBtn.className = 'delete';
      delBtn.textContent = '✕';
      delBtn.setAttribute('aria-label', 'Delete task');
      delBtn.onclick = () => deleteTodo(idx);

      li.appendChild(completeBtn);
      li.appendChild(taskSpan);
      li.appendChild(prioSpan);
      li.appendChild(dateSpan);
      li.appendChild(editBtn);
      li.appendChild(delBtn);
    }
    todoList.appendChild(li);
  });
  updateProgress();
}

function toggleComplete(idx) {
  todos[idx].completed = !todos[idx].completed;
  saveTodos();
  renderTodos();
}

function deleteTodo(idx) {
  todos.splice(idx, 1);
  saveTodos();
  renderTodos();
}

function enterEditMode(li, idx) {
  li.classList.add('editing');
  renderTodos(); // triggers re-render in edit mode
  setTimeout(() => {
    const editingLi = todoList.querySelector(`li[data-idx="${idx}"].editing input`);
    if (editingLi) editingLi.focus();
  }, 10);
}

function saveEdit(idx, text, prio, date) {
  if (!text.trim()) return;
  todos[idx].text = text;
  todos[idx].priority = prio;
  todos[idx].dueDate = date;
  saveTodos();
  todoList.querySelector(`li[data-idx="${idx}"]`).classList.remove('editing');
  renderTodos();
}

function updateProgress() {
  let total = todos.length;
  let completed = todos.filter(t => t.completed).length;
  let percent = total ? Math.round(completed / total * 100) : 0;
  progressBar.style.width = percent + '%';
  progressBar.title = `${percent}% completed`;
}
