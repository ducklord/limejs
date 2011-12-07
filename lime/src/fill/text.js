goog.provide('lime.fill.Text');

goog.require('lime.fill.Fill');

/**
 * Text fill.
 * @constructor
 * @param {string} text The text to render as fill.
 * @extends lime.fill.Fill
 */
lime.fill.Text = function(text) {
    lime.fill.Fill.call(this);

    this.setText(text);
    this.setFontFamily(lime.fill.Text.defaultFont);
    this.setFontSize(14);
    this.setFontColor('#000');
    this.setFontWeight('400');

    this.setShadow(null);
};
goog.inherits(lime.fill.Text, lime.fill.Fill);


/**
 * Default Font name for text fill
 * @type {string}
 */
lime.fill.Text.defaultFont = 'Arial';


/**
 * Returns label text as stirng
 * @return {string} Text contents.
 */
lime.fill.Text.prototype.getText = function() {
    return this.text_;
};

/**
 * Set label text
 * @param {string} txt New text contents.
 * @return {lime.fill.Text} object itself.
 */
lime.fill.Text.prototype.setText = function(txt) {
    this.text_ = txt + '';
    return this;
};

/**
 * Returns font used to draw the label
 * @return {string} Font name string.
 */
lime.fill.Text.prototype.getFontFamily = function() {
    return this.fontFamily_;
};

/**
 * Set font weight
 * @param {string} value New font weight value.
 * @return {lime.fill.Text} object itself.
 */
lime.fill.Text.prototype.setFontWeight = function(value) {
    this.fontWeight_ = value;
    return this;
};

/**
 * Returns font used to draw the label
 * @return {string} Font name string.
 */
lime.fill.Text.prototype.getFontWeight = function() {
    return this.fontWeight_;
};

/**
 * Set font name
 * @param {string} value New font family string.
 * @return {lime.fill.Text} object itself.
 */
lime.fill.Text.prototype.setFontFamily = function(value) {
    this.fontFamily_ = value;
    return this;
};

/**
 * Returns font size in pixels
 * @return {number} Font size in px.
 */
lime.fill.Text.prototype.getFontSize = function() {
    return this.fontSize_;
};

/**
 * Set the font size in pixels
 * @param {number} value New font size in px.
 * @return {lime.fill.Text} object itself.
 */
lime.fill.Text.prototype.setFontSize = function(value) {
    this.fontSize_ = value;
    return this;
};

/**
 * Returns font color as string
 * @return {string} Font color.
 */
lime.fill.Text.prototype.getFontColor = function() {
    return this.fontColor_;
};

/**
 * Sets the font color. Accepts #hex, rgb(), rgba() or plain color name.
 * @param {string} value New color.
 * @return {lime.fill.Text} object itself.
 */
lime.fill.Text.prototype.setFontColor = function(value) {
    this.fontColor_ = value;
    return this;
};


/**
 * Shorthand for adding shadow to a label. Calling setShadow(null) removes the shadow.
 * @param {?string} color Shadow color.
 * @param {number=} opt_blur Shadow blur radius.
 * @param {(number|goog.math.Vec2)=} opt_offsetX Shadow offset in X axis, or offset Vec2.
 * @param {number=} opt_offsetY Shadow offset in Y axis.
 * @return {lime.fill.Text} object itself.
 */
lime.fill.Text.prototype.setShadow = function(color, opt_blur, opt_offsetX, opt_offsetY){
    // provide method to reset the shadow
    if(arguments.length == 1 && goog.isNull(color)){
        this.setShadowColor('#ccc'); //default color
        this.setShadowBlur(0);
        this.setShadowOffset(0,0);
    }
    else if(arguments.length == 2) {
        this.setShadowColor(/** @type {!string}*/(color));
        this.setShadowBlur(/** @type {!number} */(opt_blur));
        this.setShadowOffset(new goog.math.Vec2(0,0));
    }
    else if(arguments.length == 3) {
        this.setShadowColor(/** @type {!string}*/(color));
        this.setShadowBlur(/** @type {!number} */(opt_blur));
        this.setShadowOffset(/** @type {!goog.math.Vec2} */(opt_offsetX));
    }
    else {
        this.setShadowColor(/** @type {!string}*/(color));
        this.setShadowBlur(/** @type {!number} */(opt_blur));
        this.setShadowOffset(/** @type {!(number|goog.math.Vec2)} */(opt_offsetX), opt_offsetY);
    }
    return this;
};

/**
 * Returns true if the label has a shadow.
 * @private
 */
lime.fill.Text.prototype.hasShadow_ = function(){
    return this.shadowBlur_ || this.shadowOffset_.x || this.shadowOffset_.y;
};

/**
 * Returns shadow color
 * @return {string} shadow color.
 */
lime.fill.Text.prototype.getShadowColor = function() {
    return this.shadowColor_;
};

/**
 * Returns shadow offset in px.
 * @return {goog.math.Vec2} shadow offset in px.
 */
lime.fill.Text.prototype.getShadowOffset = function() {
    return this.shadowOffset_;
};
    
/**
 * Set the shadow color.
 * @param {string} color The shadow color.
 */
lime.fill.Text.prototype.setShadowColor = function(color){
    this.shadowColor_ = color;
};

/**
 * Set the shadow blur radius.
 * @param {number} radius The shadow blur radius.
 */
lime.fill.Text.prototype.setShadowBlur = function(radius){
    this.shadowBlur_ = radius;
};

/**
 * Sets label shadow offset in px.
 * @param {(goog.math.Vec2|number)} offset Shadow offset.
 * @param {number=} opt_offsetY Optionaly set offset using x,y.
 * @return {lime.fill.Text} object itself.
 */
lime.fill.Text.prototype.setShadowOffset = function(offset, opt_offsetY) {
    if (arguments.length == 2) {
        this.shadowOffset_ = new goog.math.Vec2(arguments[0], arguments[1]);
    }
    else {
        this.shadowOffset_ = offset;
    }
    return this;
};

/**
 * Returns shadow blur radius in px.
 * @return {number} shadow blur radius in px.
 */
lime.fill.Text.prototype.getShadowBlur = function() {
    return this.shadowBlur_;
};

/**
 * Return the exsitimated size of the text.
 * @return {goog.math.Size} The size the text fills.
 */
lime.fill.Text.prototype.messureSize = function() {
    var cvs = document.createElement('canvas'),
        mContext = cvs.getContext('2d'),
        width,
        height;

    mContext.font = this.getFontSize() + 'px ' + this.getFontFamily();
    width = mContext.measureText(this.text_).width;
    height = this.getFontSize() * 2;
    return new goog.math.Size(width, height);
};


/**
 * Common name for text objects
 * @type {string}
 */
lime.fill.Text.prototype.id = 'text';

/**
 * @inheritDoc
 */
lime.fill.Text.prototype.initForSprite = function(sprite) {
    sprite.setRenderer(lime.Renderer.CANVAS);
    sprite.setSize(this.messureSize());
};

/** @inheritDoc */
lime.fill.Text.prototype.setDOMStyle = function(domEl, shape) {
    throw 'Not implemented';
};

/** @inheritDoc */
lime.fill.Text.prototype.setCanvasStyle = function(context, shape) {
    var size = this.messureSize();
    context.save();

    context.fillStyle = this.getFontColor();
    context.font = this.getFontWeight() + ' ' + this.getFontSize() +
        'px/' + this.getFontSize() + ' ' + this.getFontFamily();
    context.textBaseline = 'top';
    
    if(this.hasShadow_()){
        context.shadowColor = this.getShadowColor();
        context.shadowOffsetX = this.getShadowOffset().x;
        context.shadowOffsetY = this.getShadowOffset().y;
        context.shadowBlur = this.getShadowBlur();
    }
    
    context.fillText(this.text_, -size.width / 2, -size.height / 2);
    context.restore();
};
