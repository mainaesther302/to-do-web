class Task {
    taskId: number;
    taskName: string;
    taskDate: string;
    isComplete: boolean;

    constructor(task: string, date: string, isComplete = false, id?: number) {
        this.taskId = id || Date.now();
        this.taskName = task;
        this.taskDate = date;
        this.isComplete = isComplete;
    }
}

// Task Manager Class
class TaskManager {
    private taskListElement: HTMLElement;

    constructor(taskListElementId: string) {
        this.taskListElement = document.getElementById(taskListElementId) as HTMLElement;
    }

    async addTask(task: string, date: string): Promise<void> {
        const newTask = new Task(task, date);
        await this.saveTaskToServer(newTask);
        this.updateTaskList();
    }

    private async saveTaskToServer(task: Task): Promise<void> {
        const response = await fetch('http://localhost:3000/tasks', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(task),
        });

        if (!response.ok) {
            throw new Error('Failed to save task to server');
        }
    }

    private async updateTaskOnServer(task: Task): Promise<void> {
        const response = await fetch(`http://localhost:3000/tasks/${task.taskId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(task),
        });

        if (!response.ok) {
            throw new Error('Failed to update task on server');
        }
    }

    private async deleteTaskOnServer(taskId: number): Promise<void> {
        const response = await fetch(`http://localhost:3000/tasks/${taskId}`, {
            method: 'DELETE',
        });

        if (!response.ok) {
            throw new Error('Failed to delete task from server');
        }
    }

    private async fetchTasksFromServer(): Promise<Task[]> {
        const response = await fetch('http://localhost:3000/tasks');
        if (!response.ok) {
            throw new Error('Failed to fetch tasks from server');
        }
        return await response.json();
    }

    async updateTaskList(): Promise<void> {
        const tasks = await this.fetchTasksFromServer();

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
                const taskId = (event.target as HTMLElement).getAttribute('data-id');
                this.editTask(Number(taskId));
            });
        });

        document.querySelectorAll('.delete-btn').forEach(button => {
            button.addEventListener('click', (event) => {
                const taskId = (event.target as HTMLElement).getAttribute('data-id');
                this.deleteTask(Number(taskId));
            });
        });

        document.querySelectorAll('.complete-btn').forEach(button => {
            button.addEventListener('click', (event) => {
                const taskId = (event.target as HTMLElement).getAttribute('data-id');
                this.toggleCompleteTask(Number(taskId));
            });
        });
    }

    async editTask(taskId: number): Promise<void> {
        const tasks = await this.fetchTasksFromServer();
        const taskToEdit = tasks.find(task => task.taskId === taskId);

        if (taskToEdit) {
            const newTaskName = prompt('Edit Task', taskToEdit.taskName);
            const newTaskDate = prompt('Edit Date', taskToEdit.taskDate);

            if (newTaskName !== null && newTaskDate !== null) {
                const updatedTask = new Task(newTaskName, newTaskDate, taskToEdit.isComplete, taskId);
                await this.updateTaskOnServer(updatedTask);
                await this.updateTaskList();
            }
        }
    }

    async deleteTask(taskId: number): Promise<void> {
        await this.deleteTaskOnServer(taskId);
        await this.updateTaskList();
    }

    async toggleCompleteTask(taskId: number): Promise<void> {
        const tasks = await this.fetchTasksFromServer();
        const taskToToggle = tasks.find(task => task.taskId === taskId);

        if (taskToToggle) {
            taskToToggle.isComplete = !taskToToggle.isComplete;
            await this.updateTaskOnServer(taskToToggle);
            await this.updateTaskList();
        }
    }

    async init(): Promise<void> {
        await this.updateTaskList();
    }
}

// Initialize the TaskManager
const taskManager = new TaskManager('taskList');

// Handle form submission
const inputForm = document.getElementById('inputForm') as HTMLFormElement;
inputForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const inputTask = (document.getElementById('inputTask') as HTMLInputElement).value;
    const taskDate = (document.getElementById('taskDate') as HTMLInputElement).value;
    if (inputTask && taskDate) {
        try {
            await taskManager.addTask(inputTask, taskDate);
            inputForm.reset();
        } catch (error) {
            console.error('Error adding task:', error);
        }
    }
});

// Load and display tasks on page load
window.addEventListener('load', async () => {
    try {
        await taskManager.init();
    } catch (error) {
        console.error('Error loading tasks:', error);
    }
});
