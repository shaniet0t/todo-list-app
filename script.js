const todoForm = document.getElementById('todo-form');
const todoInput = document.getElementById('todo-input');
const todoList = document.getElementById('todo-list');

// Load from localStorage on startup
document.addEventListener('DOMContentLoaded', loadTodos);

todoForm.addEventListener('submit', e => {
  e.preventDefault();
  addTodo(todoInput.value);
  todoInput.value = '';
});

function addTodo(text) {
  if (!text.trim()) return;
  const li = document.createElement('li');
  const span = document.createElement('span');
  span.textContent = text;

  span.onclick = function() {
    li.classList.toggle('completed');
    saveTodos();
  };

  const delBtn = document.createElement('button');
  delBtn.textContent = '✕';
  delBtn.className = 'delete';
  delBtn.onclick = function() {
    li.remove();
    saveTodos();
  };

  li.appendChild(span);
  li.appendChild(delBtn);
  todoList.appendChild(li);
  saveTodos();
}

function saveTodos() {
  const todos = [];
  todoList.querySelectorAll('li').forEach(li => {
    todos.push({
      text: li.querySelector('span').textContent,
      completed: li.classList.contains('completed')
    });
  });
  localStorage.setItem('todos', JSON.stringify(todos));
}

function loadTodos() {
  const todos = JSON.parse(localStorage.getItem('todos') || '[]');
  todos.forEach(todo => {
    addTodo(todo.text);
    if (todo.completed) {
      todoList.lastChild.classList.add('completed');
    }
  });
}
