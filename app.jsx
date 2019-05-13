// INCLUDES

#include "app/vendor/yaml.js";

#include "app/vendor/json.js"; // json library, includes json.parse(), json.stringify(), ...

#include "app/components/getCfg.js";

#include "app/components/renderToAME.js";

#include "app/components/sendToAME.jsx"

// ----------------------->®
//var configAEVars = establishConfigAEVars(configFile, aeProjDir);

// find config file, parse it, and run it

var doc = app.activeDocument; // get the current doc

var cfg = new getCfg().run()
/*
new renderToAME().run(cfg);*/
// send script to AME®®®
/*
new sendToAME().run( cfg );
*/
