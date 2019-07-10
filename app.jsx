// INCLUDES

#include "app/vendor/yaml.js";

#include "app/vendor/json.js"; // json library, includes json.parse(), json.stringify(), ...

#include "app/util/utils.js";

#include "app/components/getCfg.js";

#include "app/components/renderToAME.js";

#include "app/components/sendToAME.jsx"



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

//render();

( function ScriptLauncher( thisObj ) {
      #include 'app/ui/buildWindows.js'

      // Build and show the palette
      var rdslPal = buildUI( thisObj );
      if ( rdslPal !== null ) {
            if ( rdslPal instanceof Window ) {
                  //rdslPal.center();
                  rdslPal.show();
            }
            else {
                  rdslPal.layout.layout( true );
            }
      }

} )( this );
