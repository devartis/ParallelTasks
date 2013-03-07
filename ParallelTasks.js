"use strict";

define([
    'underscore',
    'libs/asyncTasksManagement/Task'
], function (_, Task) {

    var ParallelTasks = function () {
        this.initialize();
    };
    _.extend(ParallelTasks.prototype, {

        initialize: function() {
            this.taskOrder = 0;
            this.successCallback = undefined;
            this.errorCallback = undefined;
            this.successResponses = [];
            this.errorResponses = [];
            this.taskCounter = 0;
            this.tasks = [];
        },

        add: function (functionToCall) {
            var task = new Task(this.taskOrder++, this);
            task.callable = functionToCall;
            this._register(task);
            return this;
        },

        doForEachElement: function(collection, functionToCall) {
            if (collection !== undefined) {
                var task;
                var self = this;
                collection.forEach(function(element) {
                    task = new Task(self.taskOrder++, self);
                    task.callable = function(options) { functionToCall(element, options) };
                    self._register(task);
                });
            }
            return this;
        },

        addSuccessResult: function (orderNumber, response) {
            this.taskCounter--;
            this.successResponses.push({orderNumber: orderNumber, response: response});
            this._fireIfFinished();
        },

        addErrorResult: function (orderNumber, response) {
            this.taskCounter--;
            this.errorResponses.push({orderNumber: orderNumber, response: response});
            this._fireIfFinished();
        },

        start: function(options) {
            this.successCallback = options.allSuccess;
            this.errorCallback = options.anyError || function(e) { throw e; };
            this._start();
        },

        _fireIfFinished: function () {
            if (this.taskCounter === 0) {
                if (this.errorResponses.length === 0) {
                    this.successCallback.call(this, this._sortAndGetResponse(this.successResponses));
                } else {
                    this.errorCallback.call(this, this._sortAndGetResponse(this.errorResponses));
                }
            }
        },

        _start: function() {
            if (this.tasks.length === 0) {
                this.successCallback([]);
            } else {
                this.tasks.forEach(function(task) {
                    task.run();
                });
            }
        },

        _register: function(task) {
            this.taskCounter++;
            this.tasks.push(task);
        },

        _sortAndGetResponse: function(collection) {
            return collection.sort(this._byOrder).map(function (result) {
                return result.response;
            })
        },

        _byOrder: function(aResult, anotherResult) {
            return aResult.orderNumber - anotherResult.orderNumber;
        }

    });

    return ParallelTasks;

});


