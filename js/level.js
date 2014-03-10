var Level = function() {
	this._size = Game.MAP_SIZE;
	this._beings = {};
	this._items = {};
	this._cells = {};
	this._free = {};
	this._empty = Cell.empty;

	this._create();
}

Level.prototype.drawMemory = function() {
}

Level.prototype.activate = function() {
	for (var p in this._beings) {
		Game.scheduler.add(this._beings[p], true);
	}
	
	Game.display.clear();
	this.drawMemory();
	Game.status.update();
}

Level.prototype.deactivate = function() {
	Game.scheduler.clear();
}

Level.prototype.blocks = function(xy) {
	return (this._cells[xy] || this._empty).blocks();
}

Level.prototype.draw = function(xy) {
	var visual = this._visualAt(xy);
	var bg = this._getBackgroundColor(xy);
	Game.display.draw(xy.x, xy.y + Game.TEXT_HEIGHT, visual.ch, ROT.Color.toRGB(visual.fg), ROT.Color.toRGB(bg));
}

Level.prototype.getSize = function() {
	return this._size;
}

Level.prototype.getBeingAt = function(xy) {
	return this._beings[xy] || null;
}

Level.prototype.setBeing = function(being, xy) {
	/* remove from old position, draw */
	if (being.getLevel() == this) {
		var oldXY = being.getXY();
		delete this._beings[oldXY];
		if (Game.level == this) { this.draw(oldXY); }
	}

	being.setPosition(xy, this); /* propagate position data to the entity itself */

	/* set new position, draw */
	this._beings[xy] = being;
	if (Game.level == this) { this.draw(xy); }
}

Level.prototype._visualAt = function(xy) {
	return (this._beings[xy] || this._items[xy] || this._cells[xy] || this._empty).getVisual();
}

Level.prototype._create = function() {
	this._createWalls();
	this._createItems();
	this._createBeings();
}

Level.prototype._createWalls = function() {}
Level.prototype._createItems = function() {}
Level.prototype._createBeings = function() {}

Level.prototype._createFree = function() {
	var free = this._free;
	var cells = this._cells;

	/* start at center */
	var center = new XY(Math.round(this._size.x/2), Math.round(this._size.y/2));
	var dirs = ROT.DIRS[8];
	var radius = 0;

	while (center in cells) { /* find a starting free place */
		radius++;
		dirs.forEach(function(dir) {
			var c2 = new XY(center.x + radius * dir[0], center.y + radius * dir[1]);
			if (!(c2 in cells)) { center = c2; }
		});
	}

	/* flood fill free cells */
	var scan = function(xy) {
		free[xy] = xy;
		dirs.forEach(function(dir) {
			var xy2 = new XY(xy.x + dir[0], xy.y + dir[1]);
			if (xy2 in cells || xy2 in free) { return; }
			scan(xy2);
		});
	}
	scan(center);
}

Level.prototype._getBackgroundColor = function() {
}

Level.prototype._findFreeClosestTo = function(xy) {
	var best = null;
	var dist = Infinity;
	for (var id in this._free) {
		var d = this._free[id].dist8(xy);
		if (d < dist) {
			dist = d;
			best = this._free[id];
		}
	}
	
	return best;
}