//


// Script support for QUEUE in ame
// Requires Adobe Media Encoder 11.0.
/*
var resultFile = new File( "" );
var renderQueue = app.project.renderQueue;
var render = renderQueue.items.add( comp )
render.outputModules[ 1 ].file = result;
if ( app.project.renderQueue.canQueueInAME == true ) {
      // Send queued items to AME, but do not start rendering
      app.project.renderQueue.queueInAME( false );
}
*/

function renderToAME() {}

renderToAME.prototype = {
      run: function( cfg ) {
            var path = new File( cfg[ "renderPath" ] );
            var comp = app.project.comp( cfg[ "compName" ] )
            var autorender = cfg["autorender"];

            var aeQueue = app.project.renderQueue;
            var render = aeQueue.items.add( comp )
            // define new path of file
            render.outputModules[ 1 ].file = path;


            if ( app.project.renderQueue.canQueueInAME == true ) {
                  // Send queued items to AME, but do not start rendering
                  app.project.renderQueue.queueInAME( autorender );
            }
      }
}
