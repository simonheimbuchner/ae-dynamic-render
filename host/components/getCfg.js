function parseConfigData() {
      this.storageVariableRegex = /\(\((\S+?)\)\)/g;
}

parseConfigData.prototype.Storage = new Object();

//
parseConfigData.prototype.addToStorage = function( key, value ) {
      this.Storage[ key ] = value;
};

// establishStorage(): adds most known variables to Storage
// return (success): nothing
// return (failure): Error()
parseConfigData.prototype.establishStorage = function( ConfigData ) {
      if ( app.project.activeItem == null ) return new Error( "There is no composition selected." )

      this.addToStorage( "ae_proj_directory", app.project.file.fsName.split( "/" ).slice( this.length, -1 ).join( "/" ) );
      this.addToStorage( "ae_proj_directory_name", app.project.file.parent.name );
      this.addToStorage( "ae_proj_directory_parent_name", app.project.file.parent.parent.name );
      this.addToStorage( "ae_proj_directory_parent_parent_name", app.project.file.parent.parent.parent.name );
      this.addToStorage( "ae_proj_name", app.project.file.name.replace( ".aep", "" ) );
      this.addToStorage( "ae_comp_name", app.project.activeItem.name );
      this.addToStorage( "ae_comp_folder", app.project.activeItem.parentFolder.name );

      // get date formats specified in config
      // outputs look like: "YY-MM-DD"
      var formatdate = ConfigData[ "date_format" ][ "date" ];
      var formatae_proj_date = ConfigData[ "date_format" ][ "ae_proj_date" ];

      // format dates using the formatDate() methods
      var aeProjDate = app.project.file.modified;
      aeProjDate = this.formatDate( aeProjDate, formatae_proj_date )

      var todayDate = new Date();
      todayDate = this.formatDate( todayDate, formatdate );

      // check if any of the date formatting has gone wrong
      // by checking for leftover characters
      var dateReg = /[a-z]/i;
      if ( aeProjDate.match( dateReg ) || todayDate.match( dateReg ) ) {
            return new Error( "There was a problem parsing the date." )
      }
      else {
            // write dates into storage
            this.addToStorage( "ae_proj_date", aeProjDate );
            this.addToStorage( "date", todayDate );
      }
};
parseConfigData.prototype.formatDate = function( dateString, dateFormatting ) {
      // create newDate from JS date string, like "Wed May 08 2019 22:16:00 GMT+0200"
      var newDate = new Date( dateString );

      // DateFormats contains all possible date formatting options
      DateFormats = new Object();
      DateFormats[ "dd" ] = newDate.getDate();
      DateFormats[ "mm" ] = newDate.getMonth() + 1;
      DateFormats[ "yyyy" ] = newDate.getFullYear();
      DateFormats[ "yy" ] = newDate.getFullYear().toString().substr( -2 )

      // polish month and date formats, e.g. "9" -> "09"
      if ( DateFormats[ "dd" ] < 10 ) {
            DateFormats[ "dd" ] = '0' + DateFormats[ "dd" ];
      }
      if ( DateFormats[ "mm" ] < 10 ) {
            DateFormats[ "mm" ] = '0' + DateFormats[ "mm" ];
      }

      // loop through possible date formats (like "yy", "dd")
      // and replace them with their object values (like DateFormats["dd"] = "31")
      for ( var i in DateFormats ) {
            // regex looks like /(yy)/ig
            var reg = "(" + i + ")";
            var re = new RegExp( reg, "ig" )
            dateFormatting = dateFormatting.replace( re, DateFormats[ i ].toString() );
      }

      return dateFormatting;

};
// recursive function
// loops though Storage and looks for strings
parseConfigData.prototype.loopThoughStorageValues = function( obj ) {
      for ( var key in obj ) {
            if ( typeof obj[ key ] == "object" ) {
                  // if function finds an object, it searches again with the new object as input
                  this.loopThoughStorageValues( obj[ key ] )
            }
            else if ( typeof obj[ key ] == "string" ) {
                  // if function finds string, it replaces it with the Storage variabe
                  obj[ key ] = this.findStorageValueAndConvert( obj[ key ] );
                  var returnedValue = obj[ key ];
                  if ( returnedValue instanceof Error ) {
                        throw returnedValue;
                  }
            }
            else {
                  // if unexpected input like arrays, skip
                  continue;
            }
      }
};
// purpose: fill the ((variables)) and replace with actual contents
// receives configFileContent as string
parseConfigData.prototype.findStorageValueAndConvert = function( str ) {
      // regex will find something like ((variable))
      var regex = this.storageVariableRegex;
      var Storage = this.Storage;
      try {
            // replace ((variable)) with variable from Storage
            str = str.replace( regex, function( match, capture ) {
                  // match = matched property / ((pseudo-variable))
                  // capture = $1 / pseudo-variable

                  // call constructor from outside, since "this" is unavailable in this scope
                  var pseudoVar = Storage[ capture ];
                  if ( pseudoVar == undefined ) {
                        throw new Error( "Unexpected Value: " + '"' + match + '"' );
                  }
                  else {
                        // return proper PseudoVars Variable
                        return pseudoVar;

                  };
            } );
      }
      catch ( e ) {
            return e;
      }
      return str;
};
parseConfigData.prototype.convert = function( ConfigData ) {
      var establishStorage = this.establishStorage( ConfigData );
      if ( establishStorage instanceof Error )
            return establishStorage;
      try {
            this.loopThoughStorageValues( ConfigData );
      }
      catch ( e ) {
            alertError( e )
            return;
      }

      return ConfigData;
};

parseConfigData.prototype.decode = function( configFile ) {
      openConfigFile = configFile.open( 'r', undefined, undefined );
      openConfigFile.encoding = "UTF-8";
      openConfigFile.lineFeed = "Unix"; //convert to UNIX lineFeed

      // success opening the file
      if ( openConfigFile == true ) {
            configFileContent = configFile.read();
            configFile.close();

            // other error handling is done by yaml
            // Parse Data
            ConfigData = YAML.decode( configFileContent );
            if ( ConfigData == null ) return new Error( "The config file is empty." )

            return ConfigData;
      }
      else {
            return new Error( 'Failed opening file "' + configFile.fsName + '".' );
      }
}

// opens file from file path, reads it and parses it using YAML Syntax
// returns valid JSON Object
parseConfigData.prototype.run = function( configFile ) {
      var RawConfigData = this.decode( configFile );
      // convert pseudo variables and prepare for output
      ConfigData = this.convert( RawConfigData );
      //if(ConfigData instanceof Error) return ConfigData;

      return ConfigData;

};


function formatConfigData() {}

formatConfigData.prototype.forRenderQueue = function( ConfigData ) {
      var ConfigDataOutput = new Object();
      // ConfigDataOutput["renderPath"]
      // ConfigDataOutput["autoRender"]

      // ConfigDataOutput["renderPath"]
      // make sure render dir begins and ends with "/"
      // input similar to: "../Render", output similar to: "/../Render/"
      var renderDir = ConfigData[ "render" ][ "render_dir" ];
      // eval first and last character and add "/" if missing
      if ( renderDir.substr( 0, 1 ) != "/" && renderDir.substr( 0, 1 ) != "~" ) renderDir = "/" + renderDir;
      if ( renderDir.substr( renderDir.length - 1, 1 ) != "/" ) renderDir = renderDir + "/";
      //combine paths and file name
      var renderPath = renderDir + ConfigData[ "render" ][ "render_name" ];
      renderPath = this.normalizePath( renderPath );
      // add to ConfigDataOutput
      ConfigDataOutput[ "renderPath" ] = renderPath;

      // ConfigDataOutput["autoRender"]
      // turn possible values into real true/false statements
      var autoRender = ConfigData[ "render" ][ "autorender" ];
      if ( autoRender == true || autoRender == "true" || autoRender == 1 || autoRender == "yes" )
            ConfigDataOutput[ "autoRender" ] = true;
      if ( autoRender == false || autoRender == "false" || autoRender == 0 || autoRender == "no" )
            ConfigDataOutput[ "autoRender" ] = false;

      return ConfigDataOutput;

}

formatConfigData.prototype.forSettings = function( RawConfigData, ConfigData, configFile, storage ) {
      var ConfigDataOutput = new Object();
      //ConfigDataOutput[ "RenderData" ] = ConfigData[ "render" ];
      ConfigDataOutput[ "configFilePath" ] = configFile.fsName;
      // regex to find ((variable))
      var regex = new parseConfigData().storageVariableRegex;

      // splits raw dir and name into arrays, like: "((var))/((var2))" -> "((var))", "/", "((var2))"
      // RawConfigData[ "render" ] -> RawConfigData[ "render" ]["render_dir"], RawConfigData[ "render" ]["render_name"];
      var rawRenderDir = RawConfigData[ "render" ][ "render_dir" ].split( regex );
      var rawRenderName = RawConfigData[ "render" ][ "render_name" ].split( regex );

      function removeEmptyStringsFromArray(el) {
            return el != "";
      }
      // clean up arrays
      rawRenderDir = rawRenderDir.filter(removeEmptyStringsFromArray)
      rawRenderName = rawRenderName.filter(removeEmptyStringsFromArray)
      // save cleaned arrays into ConfigDataOutput)
      ConfigDataOutput["storageVariableRegex"] = regex.toString();
      ConfigDataOutput["storageVariables"] = storage;
      ConfigDataOutput["rawRenderDir"] = rawRenderDir;
      ConfigDataOutput["rawRenderName"] = rawRenderName;

      return ConfigDataOutput;
}

// turns a combination of absolute and relative paths into a whole absolute path
formatConfigData.prototype.normalizePath = function( path ) {
      // path looks like: "~/Desktop/sub/../Trash"
      // pathArray looks like: ["~", "Desktop", "sub", "..", "Trash"]
      var pathArray = path.split( "/" );
      for ( var i in pathArray ) {
            if ( pathArray[ i ] == ".." ) {
                  // if element of pathArray is "..", remove last path element and this element
                  pathArray.splice( i - 2, 3 );
                  i = i - 1;
            }
            else {
                  continue;
            }
      }
      // pathArray looks like: ["~", "Desktop", "Trash"]
      // return looks like: "~/Desktop/Trash"
      return pathArray.join( "/" ).toString();
};




function getConfigFile() {}

getConfigFile.prototype.getAEProjDir = function() {
      // returns path of this after effects project file
      if ( app.project.file != null ) {
            return app.project.file.fsName;
      }
      else {
            return new Error( "Please save your file first." )
      }
};
// this function finds the nearest config.txt file and returns it
getConfigFile.prototype.getFile = function( aeProjPath ) {
      var configFileName = "config.txt";
      // from the ae project path, go this many folder layers up
      var maxSearchFolderLayers = 7;

      var configFile = undefined;
      aeProjPath = aeProjPath.split( "/" );

      // find config file from aeProjPath
      for ( var i = 0; i < maxSearchFolderLayers; i++ ) {
            // remove last folder of aeProjPath
            aeProjPath.pop();
            // currentPath is now aeProjPath minus one level
            currentPath = aeProjPath;
            // join back to string
            currentPath = currentPath.join( "/" );
            // append searched file name to string
            currentPath = currentPath + "/" + configFileName;
            // test for existing file: will return true when exists
            configFile = File( currentPath );
            if ( configFile.exists ) {
                  // store dir of configFile in PseudoVars
                  new parseConfigData().addToStorage( "this_directory", configFile.parent )
                  //  parseConfigData().pseudoVars.Storage[ "this_directory" ] = configFile.parent;
                  break;
            }
      }
      if ( configFile.exists ) {
            return configFile;
      }
      else {
            return new Error( "No Config File found." )
      }
};

getConfigFile.prototype.run = function() {
      // return (success): AE Project Path, type string
      // return (failure):   Error()
      var aeProjPath = this.getAEProjDir();
      if ( aeProjPath instanceof Error ) {
            alertError( aeProjPath )
            return;
      }

      // return (success): config file, type file
      // return (failure):   Error()
      var configFile = this.getFile( aeProjPath );


      return configFile;
}
