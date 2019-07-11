/* 1) Create an instance of CSInterface. */
var csInterface = new CSInterface();

/* 2) Make a reference to your HTML button and add a click handler. */
var renderBtn = document.querySelector( "#btn-render" );
renderBtn.addEventListener( "click", render );

/* 3) Write a helper function to pass instructions to the ExtendScript side. */
function render() {
      csInterface.evalScript( "render()" );
}


var openSettingsBtn = document.querySelector( "#btn-settings" );
openSettingsBtn.addEventListener( "click", openSettingsWindow );

/* 3) Write a helper function to pass instructions to the ExtendScript side. */
function openSettingsWindow() {
      var extensin_Id = "com.dynamicrender.settings";
      var params = {};
      window.__adobe_cep__.requestOpenExtension( extensin_Id, params );
}
