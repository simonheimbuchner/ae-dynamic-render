//
// Description:
// This function builds the user interface.
//
// Parameters:
// thisObj - Panel object (if script is launched from Window menu); null otherwise.
//
// Returns:
// Window or Panel object representing the built user interface.
//
function buildUI(thisObj) {
      var positionPal = (app.settings.haveSetting("settings", "ScriptLauncher_frameBounds") && !(thisObj instanceof Panel));
      if (positionPal) {
            var bounds = new Array();
            bounds = app.settings.getSetting("settings", "ScriptLauncher_frameBounds").split(",");
            for (i in bounds)
                  bounds[i] = parseInt(bounds[i], 10);
      }
      else {
            var bounds = undefined;
      }
      var pal = (thisObj instanceof Panel) ? thisObj : new Window("palette", "Autorender", bounds, {
            resizeable: true
      });
      if (pal !== null) {
            // build UI
            #include "userInterface.js";
            #include "eventHandler.js";
      }
      return pal;
}
