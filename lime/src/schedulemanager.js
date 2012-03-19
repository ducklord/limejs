goog.provide('lime.scheduleManager');

goog.require('goog.array');
goog.require('goog.userAgent');
goog.require('lime');


/**
 * Unified timer provider class
 * Don't create instances of this class. Used the shared instance.
 * @constructor
 */
lime.ScheduleManager = function() {

    /**
     * Array of registered functions
     * @type {Array.<lime.ScheduleManager.Task>}
     * @private
     */
    this.taskStack_ = [];

    /**
     * ScheduleManager is active
     * @type {boolean}
     * @private
     */
    this.active_ = false;

    /**
     * Internal setInterval id
     * @type {number}
     * @private
     */
    this.intervalID_ = 0;

    /**
     * Maximum update rate in ms.
     * @type {number}
     * @private
     */
    this.displayRate_ = 1000 / 30;

    /**
     * Timer last fire timestamp
     * @type {number}
     * @private
     */
    this.lastRunTime_ = 0;

};

/**
 * Scheduled task
 * @param {number} maxdelta Timer wait value after iteration.
 * @param {number=} opt_limit Number of calls.
 * @constructor
 */
lime.ScheduleManager.Task = function(maxdelta, opt_limit) {
    this.delta = this.maxdelta = maxdelta;
    this.limit = goog.isDef(opt_limit) ? opt_limit : -1;
    this.functionStack_ = [];
};

/**
 * Handle iteration
 * @param {number} dt Delta time since last iteration.
 * @private
 */
lime.ScheduleManager.Task.prototype.step_ = function(dt) {
    if (!this.functionStack_.length) return;
    if (this.delta > dt) {
        this.delta -= dt;
    }
    else {
        var delta = this.maxdelta + dt - this.delta;
        this.delta = this.maxdelta - (dt - this.delta);
        if (this.delta < 0) this.delta = 0;
        var f;
        var i = this.functionStack_.length;
        while (--i >= 0) {
            f = this.functionStack_[i];
            if (f && f[0] && goog.isFunction(f[1]))
            (f[1]).call(f[2], delta);
        }
        if (this.limit != -1) {
            this.limit--;
            if (this.limit == 0) {
                lime.scheduleManager.unschedule(f[1], f[2]);
            }
        }
    }
};

/**
 * Returns maximum fire rate in ms. If you need FPS then use 1000/x
 * @this {lime.ScheduleManager}
 * @return {number} Display rate.
 */
lime.ScheduleManager.prototype.getDisplayRate = function() {
    //todo: bad name
    return this.displayRate_;
};

/**
 * Sets maximum fire rate for the scheduler in ms.
 * If you have FPS then send 1000/x
 * Note that if animation frame methods are used browser chooses
 * max display rate and this value has no effect.
 * @this {lime.ScheduleManager}
 * @param {number} value New display rate.
 */
lime.ScheduleManager.prototype.setDisplayRate = function(value) {
     this.displayRate_ = value;
     if (this.active_) {
         this.disable_();
         this.activate_();
     }
};

/**
 * Schedule a function. Passed function will be called on every frame
 * with delta time from last run time
 * @this {lime.ScheduleManager}
 * @param {function(number)} f Function to be called.
 * @param {Object} context The context used when calling function.
 * @param {lime.ScheduleManager.Task=} opt_task Task object.
 */
lime.ScheduleManager.prototype.schedule = function(f, context, opt_task) {
    var task = goog.isDef(opt_task) ? opt_task : this.taskStack_[0];
    goog.array.insert(task.functionStack_, [1, f, context]);
    goog.array.insert(this.taskStack_, task);
    if (!this.active_) {
        this.activate_();
    }
};

/**
 * Unschedule a function. For functions that have be previously scheduled
 * @this {lime.ScheduleManager}
 * @param {function(number)} f Function to be unscheduled.
 * @param {Object} context Context used when scheduling.
 */
lime.ScheduleManager.prototype.unschedule = function(f, context) {
    var j = this.taskStack_.length;
    while (--j >= 0) {
        var task = this.taskStack_[j],
            functionStack_ = task.functionStack_,
            fi, i = functionStack_.length;
        while (--i >= 0) {
            fi = functionStack_[i];
            if (fi[1] == f && fi[2] == context) {
                goog.array.remove(functionStack_, fi);

            }
        }
        if (functionStack_.length == 0 && j != 0) {
           goog.array.remove(this.taskStack_, task);
        }
    }
    // if no more functions: stop timers
    if (this.taskStack_.length == 1 &&
            this.taskStack_[0].functionStack_.length == 0) {
        this.disable_();
    }
};

/**
 * Start the internal timer functions
 * @this {lime.ScheduleManager}
 * @private
 */
lime.ScheduleManager.prototype.activate_ = function() {
    if (this.active_) return;
    
    this.lastRunTime_ = goog.now();
    
    if(goog.isDef(lime.scheduleManager.requestAnimationFrameFunction)){
        this.animationFrameHandlerBinded_ = goog.bind(this.animationFrameHandler_,this);
        this.animationFrameRequestID_ = lime.scheduleManager.requestAnimationFrameFunction(this.animationFrameHandlerBinded_);
    } else {
        this.intervalID_ = setInterval(goog.bind(this.stepTimer_, this), this.getDisplayRate());
    }
    this.active_ = true;
};



/**
 * Stop interval timer functions
 * @this {lime.ScheduleManager}
 * @private
 */
lime.ScheduleManager.prototype.disable_ = function() {
    if (!this.active_) return;
    
    if(goog.isDef(lime.scheduleManager.cancelRequestAnimationFrameFunction)){
        lime.scheduleManager.cancelRequestAnimationFrameFunction(this.animationFrameRequestID_);
    } else {
        clearInterval(this.intervalID_);
    }
    this.active_ = false;
};

/**
 * Webkit implemtation of requestAnimationFrame handler.
 * @this {lime.ScheduleManager}
 * @private
 */
lime.ScheduleManager.prototype.animationFrameHandler_ = function(time){
    if(!time) time=goog.now(); // no time parameter in Chrome10beta
    var delta = time - this.lastRunTime_;
    this.dispatch_(delta);
    this.lastRunTime_ = time;
    this.animationFrameRequestID = lime.scheduleManager.requestAnimationFrameFunction(this.animationFrameHandlerBinded_);
};

/**
 * Timer events step function that delegates to other objects waiting
 * @this {lime.ScheduleManager}
 * @private
 */
lime.ScheduleManager.prototype.stepTimer_ = function() {
    var t;
    var curTime = goog.now();
    var delta = curTime - this.lastRunTime_;
    if (delta < 0) delta = 1;
    this.dispatch_(delta);
    this.lastRunTime_ = curTime;
};

/**
 * Call all scheduled tasks
 * @this {lime.ScheduleManager}
 * @param {number} delta Milliseconds since last run.
 * @private
 */
lime.ScheduleManager.prototype.dispatch_ = function(delta){
    var i = this.taskStack_.length;
    while (--i >= 0) {
        this.taskStack_[i].step_(delta);
    }
    //hack to deal with FF4 CSS transformation issue https://bugzilla.mozilla.org/show_bug.cgi?id=637597
    if(lime.transformSet_ == 1 && (/Firefox\/4./).test(goog.userAgent.getUserAgentString()) &&
       !lime.FF4_USE_HW_ACCELERATION){
        if(this.odd_){
            document.body.style['MozTransform'] = '';
            this.odd_=0;
        }
        else {
            document.body.style['MozTransform'] = 'scale(1,1)';
            this.odd_=1;
        }
        lime.transformSet_=0;
    }
};

/**
 * Change director's activity. Used for pausing updates when director is paused
 * @this {lime.ScheduleManager}
 * @param {lime.Director} director Director.
 * @param {boolean} value Active or inactive?
 */
lime.ScheduleManager.prototype.changeDirectorActivity = function(director, value) {
    var t, context, f, d, i,
    j = this.taskStack_.length;
    while (--j >= 0) {

        t = this.taskStack_[j];
        i = t.functionStack_.length;
        while (--i >= 0) {
            f = t.functionStack_[i];
            context = f[2];
            if (goog.isFunction(context.getDirector)) {
                d = context.getDirector();
                if (d == director) {
                    f[0] = value;
                }
            }
        }
    }
};

/**
 * Set up function to be called once after a delay
 * @param {function(number)} f Function to be called.
 * @param {Object} context Context used when calling object.
 * @param {number} delay Delay before calling.
 */
lime.ScheduleManager.prototype.callAfter = function(f, context, delay) {
    this.scheduleWithDelay(f, context, delay, 1);
};

/**
 * Set up function to be called repeatedly after a delay
 * @param {function(number)} f Function to be called.
 * @param {Object} context Context used when calling object.
 * @param {number} delay Delay before calling.
 * @param {number=} opt_limit Number of times to call.
 * @this {lime.ScheduleManager}
 */
lime.ScheduleManager.prototype.scheduleWithDelay = function(f, context,
        delay, opt_limit) {
    var task = new lime.ScheduleManager.Task(delay, opt_limit);
    this.schedule(f, context, task);
};

lime.scheduleManager = new lime.ScheduleManager();
lime.scheduleManager.taskStack_.push(new lime.ScheduleManager.Task(0));

/**
 * The request animation frame function avaliable.
 * @type {function(function(number))}
 */
lime.scheduleManager.requestAnimationFrameFunction = (function() {
    var requestFunction = goog.global['requestAnimationFrame'] ||
            goog.global['webkitRequestAnimationFrame'] ||
            goog.global['mozRequestAnimationFrame'] ||
            goog.global['oRequestAnimationFrame'] ||
            goog.global['msRequestAnimationFrame'];
    return requestFunction ? goog.bind(requestFunction, goog.global) : undefined;
})();

/**
 * The cancel request animation fram function avaliable.
 * @type {function(number)}
 */
lime.scheduleManager.cancelRequestAnimationFrameFunction = (function() {
    var cancelFunction = goog.global['cancelAnimationFrame'] ||
            goog.global['webkitCancelRequestAnimationFrame'] ||
            goog.global['mozCancelRequestAnimationFrame'] ||
            goog.global['oCancelRequestAnimationFrame'] ||
            goog.global['msCancelRequestAnimationFrame'];
    return cancelFunction ? goog.bind(cancelFunction, goog.global) : undefined;
})();
