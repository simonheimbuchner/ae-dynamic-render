function formatDate( dateString, dateFormatting ) {

      var newDate = new Date( dateString );

      // DateFormats contains all possible date formatting options
      DateFormats = new Object();
      DateFormats[ "dd" ] = newDate.getDate();
      DateFormats[ "mm" ] = newDate.getMonth() + 1;
      DateFormats[ "yyyy" ] = newDate.getFullYear();
      DateFormats[ "yy" ] = newDate.getFullYear().toString().substr( -2 )

      if ( DateFormats[ "dd" ] < 10 ) {
            DateFormats[ "dd" ] = '0' + DateFormats[ "dd" ];
      }
      if ( DateFormats[ "mm" ] < 10 ) {
            DateFormats[ "mm" ] = '0' + DateFormats[ "mm" ];
      }

      var possibleDateFormats = [ "yy", "yyyy", "mm", "dd" ];

      // dateFormatting
      for ( i in possibleDateFormats ) {
            var reg = "(" + possibleDateFormats[ i ] + ")";
            var re = new RegExp( reg, "ig" )
            dateFormatting = dateFormatting.replace( re, DateFormats[ possibleDateFormats[ i ] ].toString() );
      }
      return dateFormatting;

}
