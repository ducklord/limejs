goog.provide('lime.SpriteSheet');

goog.require('lime.fill.Frame');
goog.require('lime.parser.JSON');

/**
 * @constructor
 */
lime.SpriteSheet = function(){
    /**
     * @type {Object.<string, lime.fill.Frame>}
     */
    this.cacheMap_ = {};
};

/**
 * @param {Image} image Spritemap Image.
 * @param metadata Data describing how the sprites should be cut.
 * @param {function(Object):Object=} p
 */
lime.SpriteSheet.prototype.prepareSprites = function(image, metadata, p) {
    var parser = goog.isDef(p) ? p : lime.parser.JSON,
        parsedData = parser(metadata.data());

    // Prepare all sprite frames.
    goog.object.forEach(parsedData, function(meta, name) {
        this.cacheMap_[name] = new lime.fill.Frame(image, meta[0], meta[1], meta[2], meta[3])
    }, this);
}

/**
 * Return the frame from the sprite sheet that has the given name.
 * @param {string} name The name of the frame.
 */
lime.SpriteSheet.prototype.getFrame = function(name){
    if(!goog.isDef(this.cacheMap_[name])) {
        throw 'Sprite not prepared on this spritemap: ' + name;
    }
    return this.cacheMap_[name];
};

/**
 * Returns true if the sprite sheete contains a frame with the given name.
 * @param {string} name The name to check if the sprite sheete contains.
 */
lime.SpriteSheet.prototype.hasFrame = function(name){
    return goog.isDef(this.cacheMap_[name]);
};
