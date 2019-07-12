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


/*
$.fn.textWidth = function(text, font) {

    if (!$.fn.textWidth.fakeEl) $.fn.textWidth.fakeEl = $('<span>').hide().appendTo(document.body);

    $.fn.textWidth.fakeEl.text(text || this.val() || this.text() || this.attr('placeholder')).css('font', font || this.css('font'));

    return $.fn.textWidth.fakeEl.width();
};

$('.width-dynamic').on('input', function() {
    var inputWidth = $(this).textWidth();
    $(this).css({
        width: inputWidth
    })
}).trigger('input');


function inputWidth(elem, minW, maxW) {
    elem = $(this);
    console.log(elem)
}

var targetElem = $('.width-dynamic');

inputWidth(targetElem);*/
