// INCLUDES

#include "app/utils/formatDate.js";

#include "app/vendor/yaml.js";

#include "app/vendor/json.js"; // json library, includes json.parse(), json.stringify(), ...

#include "app/utils/getConfigFileContent.js";

#include "app/bridgetalk/sendToAME.jsx"

// ----------------------->®
//var configAEVars = establishConfigAEVars(configFile, aeProjDir);

// find config file, parse it, and run it
var cfg = new getCfg().run()
alert( JSON.stringify( cfg ) )
// send script to AME®
new sendToAME().run( cfg );
