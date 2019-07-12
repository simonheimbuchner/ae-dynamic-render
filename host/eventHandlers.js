function render() {

      // find config file
      var configFile = new getConfigFile().run();
      if ( configFile instanceof Error ) {
            alertError( configFile )
            return;
      }
      var comps = new Array();
      // store selected compositions into comps-array
      for ( var i = 1; i <= app.project.numItems; i++ ) {
            if ( ( app.project.item( i ).selected && app.project.item( i ) instanceof CompItem ) ) {
                  comps.push( app.project.item( i ) )
            }
      }
      // if no composition is selected, store currently open composition in comps-array
      if ( comps.length == 0 ) comps[ 0 ] = app.project.activeItem;
      // loop through stored compositions and render them
      for ( var i = 0; i < comps.length; i++ ) {
            // opens each comp (following code will use "activeItem" for simplicity's sake)
            comps[ i ].openInViewer();
            // output: config data as string
            var ConfigData = new parseConfigData().run( configFile );
            if ( ConfigData instanceof Error ) {
                  alertError( ConfigData )
                  return;
            }
            // formats config data for render queue
            ConfigData = new formatConfigData().forRenderQueue( ConfigData );
            if ( ConfigData instanceof Error ) {
                  alertError( ConfigData )
                  return;
            }
            // renders to media encoder
            new renderToAME().run( ConfigData );
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
