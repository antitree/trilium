"use strict";

const ws = require('./ws.js');

// taskId => TaskContext
const taskContexts = {};

class TaskContext {
    constructor(taskId, taskType, data) {
        this.taskId = taskId;
        this.taskType = taskType;
        this.data = data;

        // progressCount is meant to represent just some progress - to indicate the task is not stuck
        this.progressCount = 0;
        this.lastSentCountTs = Date.now();
    }

    /** @return {TaskContext} */
    static getInstance(taskId, taskType, data) {
        if (!taskContexts[taskId]) {
            taskContexts[taskId] = new TaskContext(taskId, taskType, data);
        }

        return taskContexts[taskId];
    }

    increaseProgressCount() {
        this.progressCount++;

        if (Date.now() - this.lastSentCountTs >= 300) {
            this.lastSentCountTs = Date.now();

            ws.sendMessageToAllClients({
                type: 'task-progress-count',
                taskId: this.taskId,
                taskType: this.taskType,
                data: this.data,
                progressCount: this.progressCount
            });
        }
    }

    reportError(message) {
        ws.sendMessageToAllClients({
            type: 'task-error',
            taskId: this.taskId,
            taskType: this.taskType,
            data: this.data,
            message: message
        });
    }

    taskSucceeded(result) {
        ws.sendMessageToAllClients({
            type: 'task-succeeded',
            taskId: this.taskId,
            taskType: this.taskType,
            data: this.data,
            result: result
        });
    }
}

module.exports = TaskContext;