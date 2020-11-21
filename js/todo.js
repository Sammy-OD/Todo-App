let db;
const addTodo = document.getElementById('add-todo');
const todo = document.getElementById('todo');
const todos = document.querySelector('.todos');
const info = document.getElementById('info');

window.onload = () => {
    let request = window.indexedDB.open('todoDB', 1)

    request.onerror = () => {
        //console.log('Database failed to open');
    }

    request.onsuccess = () => {
        //console.log('Database opened successfully');

        db = request.result;
        displayTodo();
    }

    request.onupgradeneeded = (e) => {
        let db = e.target.result;

        let objectStore = db.createObjectStore('todo_os', { keyPath: 'id', autoIncrement: true });

        objectStore.createIndex('title', 'title', { unique: false });
        objectStore.createIndex('completed', 'completed', { unique: false });

        //console.log('Database setup complete');
    }

    addTodo.addEventListener('submit', (e) => {
        e.preventDefault();

        if (todo.value !== '') {
            let newTodo = { title: todo.value, completed: false }
            let transaction = db.transaction(['todo_os'], 'readwrite');
            let objectStore = transaction.objectStore('todo_os');
            let request = objectStore.add(newTodo);

            request.onsuccess = () => {
                todo.value = '';
                todo.focus();
            }
    
            transaction.oncomplete = () => {
                //console.log('Transaction completed: Database modification successful');
                displayTodo();
            }
    
            transaction.onerror = () => {
                //console.log('Transaction failed to open due to error');
            }
        } else {
            todo.value = '';
            todo.focus();
        }
    });

    function displayTodo() {
        info.style.display = 'block';
        info.style.padding = '10px';
        while (todos.firstChild) {
            todos.removeChild(todos.firstChild);
        }

        let objectStore = db.transaction('todo_os').objectStore('todo_os');

        objectStore.openCursor().onsuccess = (e) => {
            let cursor = e.target.result;

            if (cursor) {
                const todoItem = document.createElement('p');
                const checkBox = document.createElement('input');
                const deleteBtn = document.createElement('button');
                const span = document.createElement('span');

                checkBox.type = "checkbox";
                deleteBtn.className = "btn";
                deleteBtn.innerText = "X";
                deleteBtn.onclick = delTodo;

                todoItem.appendChild(checkBox);
                todoItem.appendChild(span)
                todoItem.appendChild(deleteBtn);
                todos.appendChild(todoItem);

                span.innerText = ' ' + cursor.value.title;

                todoItem.setAttribute('data-todo-id', cursor.value.id);

                cursor.continue();
            } else {
                if (!todos.firstChild) {
                    const div = document.createElement('div');
                    div.innerText = 'No todo available';
                    div.id = 'msg';
                    todos.appendChild(div);
                    info.style.display = 'none';
                }
            }
        }
    }

    function delTodo(e) {
        let todoId = Number(e.target.parentNode.getAttribute('data-todo-id'));

        let transaction = db.transaction(['todo_os'], 'readwrite');
        let objectStore = transaction.objectStore('todo_os');
        objectStore.delete(todoId);

        transaction.oncomplete = () => {
            e.target.parentNode.parentNode.removeChild(e.target.parentNode);

            if (!todos.firstChild) {
                const div = document.createElement('div');
                div.innerText = 'No todo available';
                div.id = 'msg';
                todos.appendChild(div);
                info.style.display = 'none';
            }
        }
    }
};