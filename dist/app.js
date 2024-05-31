"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
class Task {
    constructor(task, date, isComplete = false, id) {
        this.taskId = id || Date.now();
        this.taskName = task;
        this.taskDate = date;
        this.isComplete = isComplete;
    }
}
// Task Manager Class
class TaskManager {
    constructor(taskListElementId) {
        this.taskListElement = document.getElementById(taskListElementId);
    }
    addTask(task, date) {
        return __awaiter(this, void 0, void 0, function* () {
            const newTask = new Task(task, date);
            yield this.saveTaskToServer(newTask);
            this.updateTaskList();
        });
    }
    saveTaskToServer(task) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield fetch('http://localhost:3000/tasks', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(task),
            });
            if (!response.ok) {
                throw new Error('Failed to save task to server');
            }
        });
    }
    updateTaskOnServer(task) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield fetch(`http://localhost:3000/tasks/${task.taskId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(task),
            });
            if (!response.ok) {
                throw new Error('Failed to update task on server');
            }
        });
    }
    deleteTaskOnServer(taskId) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield fetch(`http://localhost:3000/tasks/${taskId}`, {
                method: 'DELETE',
            });
            if (!response.ok) {
                throw new Error('Failed to delete task from server');
            }
        });
    }
    fetchTasksFromServer() {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield fetch('http://localhost:3000/tasks');
            if (!response.ok) {
                throw new Error('Failed to fetch tasks from server');
            }
            return yield response.json();
        });
    }
    updateTaskList() {
        return __awaiter(this, void 0, void 0, function* () {
            const tasks = yield this.fetchTasksFromServer();
            //************clear task */
            this.taskListElement.innerHTML = '';
            // ***********************Create and append new task items*******************
            tasks.forEach(task => {
                const taskItem = document.createElement('div');
                taskItem.className = 'task-item';
                taskItem.innerHTML = `
                <p>Task: <span class="task-name">${task.taskName}</span></p>
                <p>Date: <span class="task-date">${task.taskDate}</span></p>
                <p>Status: <span class="task-status">${task.isComplete ? 'Complete' : 'Incomplete'}</span></p>
                <button class="edit-btn" data-id="${task.taskId}">Edit</button>
                <button class="delete-btn" data-id="${task.taskId}">Delete</button>
                <button class="complete-btn" data-id="${task.taskId}">${task.isComplete ? 'Undo' : 'Complete'}</button>
            `;
                this.taskListElement.appendChild(taskItem);
            });
            // Add event listeners for edit, delete, and complete buttons
            document.querySelectorAll('.edit-btn').forEach(button => {
                button.addEventListener('click', (event) => {
                    const taskId = event.target.getAttribute('data-id');
                    this.editTask(Number(taskId));
                });
            });
            document.querySelectorAll('.delete-btn').forEach(button => {
                button.addEventListener('click', (event) => {
                    const taskId = event.target.getAttribute('data-id');
                    this.deleteTask(Number(taskId));
                });
            });
            document.querySelectorAll('.complete-btn').forEach(button => {
                button.addEventListener('click', (event) => {
                    const taskId = event.target.getAttribute('data-id');
                    this.toggleCompleteTask(Number(taskId));
                });
            });
        });
    }
    editTask(taskId) {
        return __awaiter(this, void 0, void 0, function* () {
            const tasks = yield this.fetchTasksFromServer();
            const taskToEdit = tasks.find(task => task.taskId === taskId);
            if (taskToEdit) {
                const newTaskName = prompt('Edit Task', taskToEdit.taskName);
                const newTaskDate = prompt('Edit Date', taskToEdit.taskDate);
                if (newTaskName !== null && newTaskDate !== null) {
                    const updatedTask = new Task(newTaskName, newTaskDate, taskToEdit.isComplete, taskId);
                    yield this.updateTaskOnServer(updatedTask);
                    yield this.updateTaskList();
                }
            }
        });
    }
    deleteTask(taskId) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.deleteTaskOnServer(taskId);
            yield this.updateTaskList();
        });
    }
    toggleCompleteTask(taskId) {
        return __awaiter(this, void 0, void 0, function* () {
            const tasks = yield this.fetchTasksFromServer();
            const taskToToggle = tasks.find(task => task.taskId === taskId);
            if (taskToToggle) {
                taskToToggle.isComplete = !taskToToggle.isComplete;
                yield this.updateTaskOnServer(taskToToggle);
                yield this.updateTaskList();
            }
        });
    }
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.updateTaskList();
        });
    }
}
// Initialize the TaskManager
const taskManager = new TaskManager('taskList');
// Handle form submission
const inputForm = document.getElementById('inputForm');
inputForm.addEventListener('submit', (event) => __awaiter(void 0, void 0, void 0, function* () {
    event.preventDefault();
    const inputTask = document.getElementById('inputTask').value;
    const taskDate = document.getElementById('taskDate').value;
    if (inputTask && taskDate) {
        try {
            yield taskManager.addTask(inputTask, taskDate);
            inputForm.reset();
        }
        catch (error) {
            console.error('Error adding task:', error);
        }
    }
}));
// Load and display tasks on page load
window.addEventListener('load', () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield taskManager.init();
    }
    catch (error) {
        console.error('Error loading tasks:', error);
    }
}));
