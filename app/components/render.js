function render() {
      var configFile = new getConfigFile().run();
      if ( configFile instanceof Error ) {
            alertError( configFile )
            return;
      }

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
