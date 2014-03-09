var Player = function() {
	Being.call(this, {ch:"@", fg:[255, 232, 124]});
	
	this._promise = null;
	
	this._keys = {};
	this._keys[ROT.VK_K] = 0;
	this._keys[ROT.VK_UP] = 0;
	this._keys[ROT.VK_NUMPAD8] = 0;
	this._keys[ROT.VK_U] = 1;
	this._keys[ROT.VK_NUMPAD9] = 1;
	this._keys[ROT.VK_L] = 2;
	this._keys[ROT.VK_RIGHT] = 2;
	this._keys[ROT.VK_NUMPAD6] = 2;
	this._keys[ROT.VK_N] = 3;
	this._keys[ROT.VK_NUMPAD3] = 3;
	this._keys[ROT.VK_J] = 4;
	this._keys[ROT.VK_DOWN] = 4;
	this._keys[ROT.VK_NUMPAD2] = 4;
	this._keys[ROT.VK_B] = 5;
	this._keys[ROT.VK_NUMPAD1] = 5;
	this._keys[ROT.VK_H] = 6;
	this._keys[ROT.VK_LEFT] = 6;
	this._keys[ROT.VK_NUMPAD4] = 6;
	this._keys[ROT.VK_Y] = 7;
	this._keys[ROT.VK_NUMPAD7] = 7;
}
Player.extend(Being);

Player.prototype.act = function() {
	this._promise = new Promise();
	
	Game.textBuffer.write("It is your turn, press any relevant key.");
	Game.textBuffer.flush();
	
	this._listen();
	
	return this._promise;
}

Player.prototype.die = function() {
	Being.prototype.die.call(this);
	Game.over();
}

Player.prototype.handleEvent = function(e) {
	window.removeEventListener("keydown", this);
	var code = e.keyCode;

	if (code in this._keys) {
		Game.textBuffer.clear();

		var direction = this._keys[code];
		var dir = ROT.DIRS[8][direction];
		var xy = this._xy.plus(new XY(dir[0], dir[1]));
		var being = this._level.getBeingAt(xy);
		if (being) { /* attack */
		} else if (this._level.blocks(xy)) { /* collision, noop */
			return this._listen();
		} else { /* movement */
			this._level.setBeing(this, xy);
		}

		this._promise.fulfill();
	} else {
		switch (e.keyCode) {
			case ROT.VK_I:
				/* FIXME inventory */
			break;

			case ROT.VK_Q:
				/* FIXME quests */
			break;
			
			default: /* unrecognized key */
				this._listen();
			break;
		}
	}

}

Player.prototype.computeFOV = function() {
	var result = {};
	
	var level = this._level;
	var fov = new ROT.FOV.PreciseShadowcasting(function(x, y) {
		return !level.blocks(new XY(x, y));
	});
	fov.compute(this._xy.x, this._xy.y, 8 /* FIXME sight */, function(x, y, r, amount) {
		var xy = new XY(x, y);
		result[xy] = xy;
	});
	
	return result;
}

Player.prototype._listen = function(e) {
	window.addEventListener("keydown", this);
}
