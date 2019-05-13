sendToAME = function() {
      this.requiredContext = "\tMedia Encoder must be running";
}

// Instance to check if requirements are met to run the script
sendToAME.prototype.canRun = function() {
      // Adobe Media Encoder must be running
      if ( BridgeTalk.isRunning( "ame" ) ) {
            return true;
      }
      else {
            // Fail if these preconditions are not met
            $.writeln( "ERROR:: Cannot run sendToAME" );
            alert( this.requiredContext );
            return false;
      }
}

sendToAME.prototype.getScriptAsString = function() {
      // get script file to be executed in ame and turn it into a string

      // name of the script to send to ame
      var scriptName = "scriptToExecuteInAME.jsx";

      var thisFile = File( $.fileName );
      var thisDirectory = thisFile.parent.toString();

      var scriptToExecuteInAME = File( thisDirectory + "/" + scriptName );

      // read the file contents
      scriptToExecuteInAME.open( "r", undefined, undefined ); // open to read
      scriptToExecuteInAME.encoding = "UTF-8";
      scriptToExecuteInAME.lineFeed = "Unix"; //convert to UNIX lineFeed

      var scriptStr = scriptToExecuteInAME.read(); // read the file

      // close the file
      scriptToExecuteInAME.close();

      return scriptStr;
}

sendToAME.prototype.run = function( cfg ) {
      var proceed = true;
      if ( !this.canRun() ) {
            proceed = false;
            return proceed;
      }

      var scriptStr = this.getScriptAsString();
      var cfgStr = "var cfg = new Object; cfg = " + JSON.stringify( cfg );

      scriptStr = cfgStr + "\n" + scriptStr;
      // send script to adobe media encoder
      var bridge = new BridgeTalk();
      bridge.target = 'ame';
      bridge.body = scriptStr;
      bridge.send();
      //return retval;
}
