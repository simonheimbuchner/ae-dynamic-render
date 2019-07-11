function renderToAME() {}

renderToAME.prototype = {
      createDirectory: function( dir ) {
            // goes through dir path and creates new folders
            var a = dir.split( "/" );
            for ( var i in a ) {
                  if ( i < 4 ) continue;
                  var thisDir = a.slice( 0, i ).join( "/" );
                  var testFolder = new Folder( thisDir );
                  if ( testFolder.exists ) {
                        continue;
                  }
                  else {
                        testFolder.create();
                        i--;
                  }
            }
      },
      addToRenderQueue: function( cfg ) {
            var path = cfg.renderPath;
            var comp = app.project.activeItem;
            //var autorender = cfg["autorender"];
            var aeQueue = app.project.renderQueue;
            var render = aeQueue.items.add( comp )
            // define new path of file
            cfg[ "renderPath" ] = cfg[ "renderPath" ].replace( ".", "-" );
            this.createDirectory( cfg[ "renderPath" ] );

            render.outputModules[ 1 ].file = new File( cfg[ "renderPath" ] );

            if ( app.project.renderQueue.canQueueInAME == true ) {
                  // Send queued items to AME, but do not start rendering
                  app.project.renderQueue.queueInAME( false );
            }

            //clear queue
            while ( app.project.renderQueue.numItems > 0 ) {
                  app.project.renderQueue.item( app.project.renderQueue.numItems ).remove();
            }

            app.project.activeItem.openInViewer();
      },
      run: function( cfg ) {
            this.addToRenderQueue( cfg );
      }
}
