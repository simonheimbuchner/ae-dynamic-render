
pal.render = pal.add('button', undefined, 'Render', {name:'ok'});

// Properties for resizing and layouting window
pal.layout.layout(true);
pal.layout.resize();
pal.onResizing = pal.onResize = function () {this.layout.resize();}
