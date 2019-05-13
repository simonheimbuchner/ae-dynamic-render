function getCfg() {}

getCfg.prototype = {
      getAEProjDir: function() {
            // this project directory
            var aeProjDir = app.project.file.fsName;
            if ( aeProjDir != undefined ) {
                  return aeProjDir;
            }
            else {
                  return false;
            }

      },
      pseudoVars: {
            Storage: new Object(),
            establishStorage: function( ConfigData ) {
                  this.Storage[ "ae_proj_directory" ] = app.project.file.fsName;
                  this.Storage[ "ae_proj_directory_name" ] = app.project.file.parent.name;
                  this.Storage[ "ae_proj_name" ] = app.project.file.name.replace( ".aep", "" );
                  this.Storage[ "ae_comp_name" ] = app.project.activeItem.name;

                  // get date formats specified in config
                  // outputs look like: "YY-MM-DD"
                  var formatdate = ConfigData[ "date_format" ][ "date" ];
                  var formatae_proj_date = ConfigData[ "date_format" ][ "ae_proj_date" ];

                  // format dates using the formatDate() methods
                  var ae_proj_date = app.project.file.modified;
                  ae_proj_date = this.formatDate( ae_proj_date, formatae_proj_date )
                  // write date into obj
                  this.Storage[ "ae_proj_date" ] = ae_proj_date;

                  var today = new Date();
                  today = this.formatDate( today, formatdate );
                  // write date into obj
                  this.Storage[ "date" ] = today;

                  // no output
            },
            formatDate: function( dateString, dateFormatting ) {
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

                  // push all DateFormats keys into array
                  // looks something like this: [ "yy", "yyyy", "mm", "dd" ]
                  var possibleDateFormats = [];
                  for ( var key in DateFormats ) {
                        possibleDateFormats.push( key );
                  }

                  // loop through possible date formats (like "yy", "dd")
                  // and replace them with their object values (like DateFormats["dd"])
                  for ( i in possibleDateFormats ) {
                        // regex looks like /(yy)/ig
                        var reg = "(" + possibleDateFormats[ i ] + ")";
                        var re = new RegExp( reg, "ig" )
                        dateFormatting = dateFormatting.replace( re, DateFormats[ possibleDateFormats[ i ] ].toString() );
                  }
                  return dateFormatting;

            },
            // recursive function
            // loops though Storage and looks for strings
            loopThoughStorageValues: function( obj ) {
                  for ( var key in obj ) {
                        if ( typeof obj[ key ] == "object" ) {
                              // if function finds an object, it searches again with the new object as input
                              this.loopThoughStorageValues( obj[ key ] )
                        }
                        else if ( typeof obj[ key ] == "string" ) {
                              // if function finds string, it replaces it with the Storage variabe
                              obj[ key ] = new getCfg().pseudoVars.findStorageValueAndConvert( obj[ key ] );
                        }
                        else {
                              // if unexpected input like arrays, skip
                              continue;
                        }
                  }
            },
            // purpose: fill the ((variables)) and replace with actual contents
            // receives configFileContent as string
            findStorageValueAndConvert: function( str ) {
                  // regex will find something like ((variable))
                  var regex = /\(\((\S+?)\)\)/g;
                  var Storage = this.Storage;
                  // replace ((variable)) with variable from Storage
                  str = str.replace( regex, function( match, capture ) {
                        // match = matched property / ((pseudo-variable))
                        // capture = $1 / pseudo-variable

                        // call constructor from outside, since "this" is unavailable in this scope
                        var pseudoVar = Storage[ capture ];
                        if ( pseudoVar != undefined ) {
                              // return proper PseudoVars Variable
                              return pseudoVar;
                        }
                        else {
                              // if unexpected input
                              return false;
                        };
                  } );
                  return str;
            },
            convert: function( ConfigData ) {

                  this.establishStorage( ConfigData );
                  this.loopThoughStorageValues( ConfigData );
                  this.prepareForOutput( ConfigData );
                  return ConfigData;
            },
            prepareForOutput: function( ConfigData ) {
                  var ConfigDataOutput = new Object();

                  var renderPath = this.Storage["ae_proj_directory"] + ConfigData[ "render" ][ "render_dir" ] + ConfigData[ "render" ][ "render_name" ];
                  ConfigDataOutput[ "renderPath" ] =  new File(renderPath).fsName;
                  alert( ConfigDataOutput[ "renderPath" ] )

                  return ConfigDataOutput;
            }
      },

      getFile: function( aeProjPath ) {
            var configFileName = "config.txt";
            // from the ae project path, go this many folder layers up
            var maxSearchFolderLayers = 5;

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
                        this.pseudoVars.Storage[ "this_directory" ] = configFile.parent;
                        break;
                  }
            }
            return configFile;

      },

      // opens file from file path, reads it and parses it using YAML Syntax
      // returns valid JSON Object
      parseFile: function( configFile ) {
            if ( configFile !== "" ) {
                  //Open the file
                  openConfigFile = configFile.open( 'r', undefined, undefined );
                  openConfigFile.encoding = "UTF-8";
                  openConfigFile.lineFeed = "Unix"; //convert to UNIX lineFeed
            }
            // success opening the file
            if ( openConfigFile == true ) {

                  configFileContent = configFile.read();
                  configFile.close();

                  // Parse Data
                  ConfigData = YAML.decode( configFileContent );
                  // convert
                  ConfigData = this.pseudoVars.convert( ConfigData );
                  //ConfigData = new getCfg().pseudoVars.Storage;
                  return ConfigData;
            }
            else {
                  return false;
            }
      },
      // runs the whole show
      run: function() {
            var aeProjPath = this.getAEProjDir();
            var configFile = this.getFile( aeProjPath );
            var ConfigData = this.parseFile( configFile );
            alert( JSON.stringify( ConfigData ) )
            // TODO make this nicer
            // returns final parsed JSON Object
            return ConfigData;

      }

}
