/* 1) Create an instance of CSInterface. */
var csInterface = new CSInterface();

// receives ConfigData from eventHandlers.js
csInterface.addEventListener( "com.dynamicrender.displaySettings", function( evt ) {
      var ConfigData = evt.data; // output: already parsed ConfigData
      // set value of config input
      document.getElementById( "configFileInput" ).value = ConfigData[ "configFilePath" ];
} );


csInterface.evalScript( "openSettingsWindow()" );
/*

  var slidesElem = document.querySelector('#pathAssemble');
  var slideSize = getSize( document.querySelector('.sortable') );
  var pckry = new Packery( slidesElem, {
    rowHeight: slideSize.outerHeight
  });
  // get item elements
  var itemElems = pckry.getItemElements();
  // for each item...
  for ( var i=0, len = itemElems.length; i < len; i++ ) {
    var elem = itemElems[i];
    // make element draggable with Draggabilly
    var draggie = new Draggabilly( elem, {
      axis: 'x'
    });
    // bind Draggabilly events to Packery
    pckry.bindDraggabillyEvents( draggie );
  }

  // re-sort DOM after item is positioned
  pckry.on( 'dragItemPositioned', function( _pckry, draggedItem ) {
    var index = pckry.items.indexOf( draggedItem );
    var nextItem = pckry.items[ index + 1 ];
    if ( nextItem ) {
      slidesElem.insertBefore( draggedItem, nextItem );
    } else {
      slidesElem.appendChild( draggedItem );
    }

  });
*/
