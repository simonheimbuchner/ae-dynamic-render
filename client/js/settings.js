/* 1) Create an instance of CSInterface. */
var csInterface = new CSInterface();

// receives ConfigData from eventHandlers.js
csInterface.addEventListener( "com.dynamicrender.displaySettings", function( evt ) {
      var ConfigData = evt.data; // output: already parsed ConfigData

      // INITIAL DOM MANIPULATIONS

      // set value of config input
      document.getElementById( "configFileInput" ).value = ConfigData[ "configFilePath" ];




      // create pathAssemble
      var rawConfigDir = ConfigData[ "rawRenderDir" ];
      var rawConfigName = ConfigData[ "rawRenderName" ];

      // parse regex string into RegExp
      var regex = ConfigData[ "storageVariableRegex" ];
      var regParts = regex.match( /^\/(.*?)\/([gim]*)$/ );
      // the parsed pattern had delimiters and modifiers. handle them.
      var regex = new RegExp( regParts[ 1 ], regParts[ 2 ] );


      var storageVariables = ConfigData[ "storageVariables" ];
      var htmlPathAssemble = document.getElementById( "pathAssemble" );
      var htmlSpanDeleteX = document.createElement( "span" );
      htmlSpanDeleteX.className = "delete";
      htmlSpanDeleteX.appendChild( document.createTextNode( "x" ) )

      for ( i = 0; i < rawConfigDir.length; i++ ) {
            // set up storageVariable html
            if ( rawConfigDir[ i ].match( regex ) ) {
                  var htmlSpan = document.createElement( "span" );
                  htmlSpan.className = "sortable storageVariable";
                  var htmlSelect = document.createElement( "select" );
                  htmlSelect.className = "selectVariable";
                  // create an option for each possible storage variable
                  for ( var key in storageVariables ) {
                        var htmlOption = document.createElement( "option" );
                        htmlOption.innerHTML = key; // var
                        htmlOption.value = "((" + key + "))"; // ((var))
                        htmlSelect.appendChild( htmlOption );
                  }

                  htmlSpan.appendChild( htmlSelect );
                  htmlSpan.appendChild( htmlSpanDeleteX )
                  // finally add it to html
                  htmlPathAssemble.appendChild( htmlSpan );
                  // set <select> to correct <option>s
                  htmlSelect.value = rawConfigDir[ i ];
            }
            else {
                  var htmlSpan = document.createElement( "span" );
                  htmlSpan.className = "sortable";
                  var htmlCustomText = document.createElement( "span" );
                  //htmlCustomText.contenteditable = true;
                  htmlCustomText.className = "customText";
                  var htmlTextNode = document.createTextNode( rawConfigDir[ i ] )
                  htmlCustomText.appendChild( htmlTextNode );

                  htmlSpan.appendChild( htmlCustomText )
                  htmlSpan.appendChild( htmlSpanDeleteX )
                  // finally add it to html
                  htmlPathAssemble.appendChild( htmlSpan );
            }
      }

} );

// open settings Window
csInterface.evalScript( "openSettingsWindow()" );

$('select').change(function(){
  alert("f")
  var text = $(this).find('option:selected').text()
  var $aux = $('<select/>').append($('<option/>').text(text))
  $(this).after($aux)
  $(this).width($aux.width())
  $aux.remove()
}).change()

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
