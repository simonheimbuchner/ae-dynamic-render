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
