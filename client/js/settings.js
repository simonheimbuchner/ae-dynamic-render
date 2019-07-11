/* 1) Create an instance of CSInterface. */
var csInterface = new CSInterface();

// receives ConfigData from eventHandlers.js
csInterface.addEventListener( "com.dynamicrender.displaySettings", function( evt ) {
      var ConfigData = evt.data; // output: already parsed ConfigData
      // set value of config input
      document.getElementById( "configFileInput" ).value = ConfigData[ "configFilePath" ];
} );


csInterface.evalScript( "openSettingsWindow()" );
