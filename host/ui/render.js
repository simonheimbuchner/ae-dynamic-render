function render() {
      var configFile = new getConfigFile().run();
      if ( configFile instanceof Error ) {
            alertError( configFile )
            return;
      }

      // loop through selected compositions and render them
      for ( var i = 1; i <= app.project.numItems; i++ ) {
            // if selected and comp, forward to render
            if ( app.project.item( i ).selected && app.project.item( i ) instanceof CompItem ) {
                  // opens comp, because following code will use "activeItem" for simplicity's sake
                  app.project.item( i ).openInViewer();

                  var ConfigData = new parseConfigData().run( configFile );
                  if ( ConfigData instanceof Error ) {
                        alertError( ConfigData )
                        return;
                  }
                  ConfigData = new formatConfigData().forRenderQueue( ConfigData );
                  if ( ConfigData instanceof Error ) {
                        alertError( ConfigData )
                        return;
                  }
                  // returns final parsed JSON Object
                  new renderToAME().run( ConfigData );
            }
      }


}
