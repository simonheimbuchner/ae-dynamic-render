
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


function openSettingsWindow() {
      // output: config file as string
      var configFile = new getConfigFile().run();
      if ( configFile instanceof Error ) {
            alertError( configFile )
            return;
      }
      // output: config data as string
      var ConfigData = new parseConfigData().run( configFile );
      if ( ConfigData instanceof Error ) {
            alertError( ConfigData )
            return;
      }
      // output: config data as object
      ConfigData = new formatConfigData().forSettings( ConfigData, configFile );
      if ( ConfigData instanceof Error ) {
            alertError( ConfigData )
            return;
      }

      // send data to settings.js
      try {
            var xLib = new ExternalObject( "lib:\PlugPlugExternalObject" );
      }
      catch ( e ) {
            alert( e )
      }
      if ( xLib ) {
            var output = JSON.stringify( ConfigData );
            var eventObj = new CSXSEvent();
            eventObj.type = "com.dynamicrender.displaySettings";
            eventObj.data = output;
            eventObj.dispatch();
      }


}
