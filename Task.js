"use strict";

define([
    'underscore'
], function(_) {

    var Task = function(orderNumber, tasksExecutor) {
        this.initialize(orderNumber, tasksExecutor);
    };
    _.extend(Task.prototype, {

        initialize: function(orderNumber, tasksExecutor) {
            this.orderNumber = orderNumber;
            this.tasksExecutor = tasksExecutor;
            this.callable = null;
        },

        success: function() {
            var self = this;
            return function(response) {
                self.tasksExecutor.addSuccessResult(self.orderNumber, response);
            }
        },

        error: function() {
            var self = this;
            return function(response) {
                self.tasksExecutor.addErrorResult(self.orderNumber, response);
            }
        },

        run: function() {
            this.callable({
                    success: this.success(),
                    error: this.error(),
                    orderNumber: this.orderNumber
            });
        }

    });

    return Task;

});
