
// INCLUDES

var Yaml = function() {};
Yaml.prototype = {
      spec: "1.2",
      setSpecVersion: function( a ) {
            if ( a != "1.1" && a != "1.2" ) {
                  throw new InvalidArgumentException( "Version " + a + " of the YAML specifications is not supported" )
            }
            this.spec = a
      },
      getSpecVersion: function() {
            return this.spec
      },
      loadFile: function( a, b ) {
            if ( b == undefined ) {
                  input = this.getFileContents( a );
                  return this.load( input )
            }
            this.getFileContents( a, function( c ) {
                  b( new Yaml().load( c ) )
            } )
      },
      load: function( a ) {
            var c = new YamlParser();
            var b = null;
            try {
                  b = c.parse( a )
            }
            catch ( d ) {
                  if ( d.name != undefined && d.name.toString == "TypeError" ) {
                        throw d
                  }
                  throw "Syntax error: " + d.message
            }
            return b
      },
      dump: function( b, a ) {
            if ( a == undefined ) {
                  a = 2
            }
            yaml = new YamlDumper();
            return yaml.dump( b, a )
      },
      getXHR: function() {
            if ( window.XMLHttpRequest ) {
                  return new XMLHttpRequest()
            }
            if ( window.ActiveXObject ) {
                  var c = [ "Msxml2.XMLHTTP.6.0", "Msxml2.XMLHTTP.3.0", "Msxml2.XMLHTTP", "Microsoft.XMLHTTP" ];
                  for ( var a = 0; a < 4; a++ ) {
                        try {
                              return new ActiveXObject( c[ a ] )
                        }
                        catch ( b ) {}
                  }
            }
            return null
      },
      getFileContents: function( a, c ) {
            var b = this.getXHR();
            if ( c == undefined ) {
                  b.open( "GET", a, false );
                  b.send( null );
                  if ( b.status == 200 || b.status == 0 ) {
                        return b.responseText
                  }
                  return null
            }
            b.onreadystatechange = function() {
                  if ( b.readyState == 4 ) {
                        if ( b.status == 200 || b.status == 0 ) {
                              c( b.responseText )
                        }
                        else {
                              c( null )
                        }
                  }
            };
            b.open( "GET", a, true );
            b.send( null )
      }
};
var YAML = {
      encode: function( a ) {
            return new Yaml().dump( a )
      },
      decode: function( a ) {
            return new Yaml().load( a )
      },
      load: function( a, b ) {
            return new Yaml().loadFile( a, b )
      }
};
if ( typeof( InvalidArgumentException ) == "undefined" ) {
      InvalidArgumentException = function( a ) {
            this.name = "InvalidArgumentException";
            this.message = a
      }
};
var YamlInline = function() {};
YamlInline.prototype = {
      i: null,
      load: function( b ) {
            var a = null;
            b = this.trim( b );
            if ( 0 == b.length ) {
                  return ""
            }
            switch ( b.charAt( 0 ) ) {
                  case "[":
                        a = this.parseSequence( b );
                        break;
                  case "{":
                        a = this.parseMapping( b );
                        break;
                  default:
                        a = this.parseScalar( b )
            }
            return a
      },
      dump: function( d ) {
            var b;
            var a;
            var c = new Yaml();
            if ( "1.1" == c.getSpecVersion() ) {
                  b = [ "true", "on", "+", "yes", "y" ];
                  a = [ "false", "off", "-", "no", "n" ]
            }
            else {
                  b = [ "true" ];
                  a = [ "false" ]
            }
            if ( typeof( d ) == "object" && null != d ) {
                  return this.dumpObject( d )
            }
            if ( undefined == d || null == d ) {
                  return "null"
            }
            if ( typeof( d ) == "boolean" ) {
                  return d ? "true" : "false"
            }
            if ( /^\d+/.test( d ) ) {
                  return typeof( d ) == "string" ? "'" + d + "'" : parseInt( d )
            }
            if ( this.isNumeric( d ) ) {
                  return typeof( d ) == "string" ? "'" + d + "'" : parseFloat( d )
            }
            if ( typeof( d ) == "number" ) {
                  return d == Infinity ? ".Inf" : ( d == -Infinity ? "-.Inf" : ( isNaN( d ) ? ".NAN" : d ) )
            }
            if ( ( d + "" ).indexOf( "\n" ) != -1 || ( d + "" ).indexOf( "\r" ) != -1 ) {
                  return '"' + d.split( '"' ).join( '\\"' ).split( "\n" ).join( "\\n" ).split( "\r" ).join( "\\r" ) + '"'
            }
            if ( ( /[\s\'"\:\{\}\[\],&\*\#\?]/.test( d ) ) || ( /^[-?|<>=!%@`]/.test( d ) ) ) {
                  return "'" + d.split( "'" ).join( "''" ) + "'"
            }
            if ( "" == d ) {
                  return "''"
            }
            if ( this.getTimestampRegex().test( d ) ) {
                  return "'" + d + "'"
            }
            if ( this.inArray( d.toLowerCase(), b ) ) {
                  return "'" + d + "'"
            }
            if ( this.inArray( d.toLowerCase(), a ) ) {
                  return "'" + d + "'"
            }
            if ( this.inArray( d.toLowerCase(), [ "null", "~" ] ) ) {
                  return "'" + d + "'"
            }
            return d
      },
      dumpObject: function( e ) {
            var d = this.getKeys( e );
            var b = null;
            var c;
            var a = d.length;
            if ( e instanceof Array ) {
                  b = [];
                  for ( c = 0; c < a; c++ ) {
                        b.push( this.dump( e[ d[ c ] ] ) )
                  }
                  return "[" + b.join( ", " ) + "]"
            }
            b = [];
            for ( c = 0; c < a; c++ ) {
                  b.push( this.dump( d[ c ] ) + ": " + this.dump( e[ d[ c ] ] ) )
            }
            return "{ " + b.join( ", " ) + " }"
      },
      parseScalar: function( b, g, e, d, f ) {
            if ( g == undefined ) {
                  g = null
            }
            if ( e == undefined ) {
                  e = [ '"', "'" ]
            }
            if ( d == undefined ) {
                  d = 0
            }
            if ( f == undefined ) {
                  f = true
            }
            var a = null;
            var h = null;
            var c = null;
            if ( this.inArray( b[ d ], e ) ) {
                  a = this.parseQuotedScalar( b, d );
                  d = this.i
            }
            else {
                  if ( !g ) {
                        a = ( b + "" ).substring( d );
                        d += a.length;
                        h = a.indexOf( " #" );
                        if ( h != -1 ) {
                              a = a.substr( 0, h ).replace( /\s+$/g, "" )
                        }
                  }
                  else {
                        if ( c = new RegExp( "^(.+?)(" + g.join( "|" ) + ")" ).exec( ( b + "" ).substring( d ) ) ) {
                              a = c[ 1 ];
                              d += a.length
                        }
                        else {
                              throw new InvalidArgumentException( "Malformed inline YAML string (" + b + ")." )
                        }
                  }
                  a = f ? this.evaluateScalar( a ) : a
            }
            this.i = d;
            return a
      },
      parseQuotedScalar: function( b, d ) {
            var c = null;
            if ( !( c = new RegExp( "^" + YamlInline.REGEX_QUOTED_STRING ).exec( ( b + "" ).substring( d ) ) ) ) {
                  throw new InvalidArgumentException( "Malformed inline YAML string (" + ( b + "" ).substring( d ) + ")." )
            }
            var a = c[ 0 ].substr( 1, c[ 0 ].length - 2 );
            if ( '"' == ( b + "" ).charAt( d ) ) {
                  a = a.split( '\\"' ).join( '"' ).split( "\\n" ).join( "\n" ).split( "\\r" ).join( "\r" )
            }
            else {
                  a = a.split( "''" ).join( "'" )
            }
            d += c[ 0 ].length;
            this.i = d;
            return a
      },
      parseSequence: function( g, c ) {
            if ( c == undefined ) {
                  c = 0
            }
            var b = [];
            var a = g.length;
            c += 1;
            while ( c < a ) {
                  switch ( g.charAt( c ) ) {
                        case "[":
                              b.push( this.parseSequence( g, c ) );
                              c = this.i;
                              break;
                        case "{":
                              b.push( this.parseMapping( g, c ) );
                              c = this.i;
                              break;
                        case "]":
                              this.i = c;
                              return b;
                        case ",":
                        case " ":
                              break;
                        default:
                              isQuoted = this.inArray( g.charAt( c ), [ '"', "'" ] );
                              var d = this.parseScalar( g, [ ",", "]" ], [ '"', "'" ], c );
                              c = this.i;
                              if ( !isQuoted && ( d + "" ).indexOf( ": " ) != -1 ) {
                                    try {
                                          d = this.parseMapping( "{" + d + "}" )
                                    }
                                    catch ( f ) {
                                          if ( !( f instanceof InvalidArgumentException ) ) {
                                                throw f
                                          }
                                    }
                              }
                              b.push( d );
                              c--
                  }
                  c++
            }
            throw new InvalidArgumentException( "Malformed inline YAML string " + g )
      },
      parseMapping: function( d, f ) {
            if ( f == undefined ) {
                  f = 0
            }
            var c = {};
            var a = d.length;
            f += 1;
            var b = false;
            var g = false;
            while ( f < a ) {
                  g = false;
                  switch ( d.charAt( f ) ) {
                        case " ":
                        case ",":
                              f++;
                              g = true;
                              break;
                        case "}":
                              this.i = f;
                              return c
                  }
                  if ( g ) {
                        continue
                  }
                  var e = this.parseScalar( d, [ ":", " " ], [ '"', "'" ], f, false );
                  f = this.i;
                  b = false;
                  while ( f < a ) {
                        switch ( d.charAt( f ) ) {
                              case "[":
                                    c[ e ] = this.parseSequence( d, f );
                                    f = this.i;
                                    b = true;
                                    break;
                              case "{":
                                    c[ e ] = this.parseMapping( d, f );
                                    f = this.i;
                                    b = true;
                                    break;
                              case ":":
                              case " ":
                                    break;
                              default:
                                    c[ e ] = this.parseScalar( d, [ ",", "}" ], [ '"', "'" ], f );
                                    f = this.i;
                                    b = true;
                                    f--;
                        }++f;
                        if ( b ) {
                              g = true;
                              break
                        }
                  }
                  if ( g ) {
                        continue
                  }
            }
            throw new InvalidArgumentException( "Malformed inline YAML string " + d )
      },
      evaluateScalar: function( b ) {
            b = this.trim( b );
            var e;
            var d;
            var f = new Yaml();
            if ( "1.1" == f.getSpecVersion() ) {
                  e = [ "true", "on", "+", "yes", "y" ];
                  d = [ "false", "off", "-", "no", "n" ]
            }
            else {
                  e = [ "true" ];
                  d = [ "false" ]
            }
            var c = null;
            var a = null;
            if ( ( "null" == b.toLowerCase() ) || ( "" == b ) || ( "~" == b ) ) {
                  return null
            }
            if ( ( b + "" ).indexOf( "!str" ) != -1 ) {
                  return ( "" + b ).substring( 5 )
            }
            if ( ( b + "" ).indexOf( "! " ) != -1 ) {
                  return parseInt( this.parseScalar( ( b + "" ).substring( 2 ) ) )
            }
            if ( /^\d+/.test( b ) ) {
                  c = b;
                  a = parseInt( b );
                  return "0" == b.charAt( 0 ) ? this.octdec( b ) : ( ( "" + c == "" + a ) ? a : c )
            }
            if ( this.inArray( b.toLowerCase(), e ) ) {
                  return true
            }
            if ( this.inArray( b.toLowerCase(), d ) ) {
                  return false
            }
            if ( this.isNumeric( b ) ) {
                  return "0x" == ( b + "" ).substr( 0, 2 ) ? hexdec( $scalar ) : floatval( $scalar )
            }
            if ( b.toLowerCase() == ".inf" ) {
                  return Infinity
            }
            if ( b.toLowerCase() == ".nan" ) {
                  return NaN
            }
            if ( b.toLowerCase() == "-.inf" ) {
                  return -Infinity
            }
            if ( /^(-|\+)?[0-9,]+(\.[0-9]+)?$/.test( b ) ) {
                  return parseFloat( b.split( "," ).join( "" ) )
            }
            if ( this.getTimestampRegex().test( b ) ) {
                  return this.strtodate( b )
            }
            return "" + b
      },
      getTimestampRegex: function() {
            return new RegExp( "^([0-9][0-9][0-9][0-9])-([0-9][0-9]?)-([0-9][0-9]?)(?:(?:[Tt]|[ \t]+)([0-9][0-9]?):([0-9][0-9]):([0-9][0-9])(?:.([0-9]*))?(?:[ \t]*(Z|([-+])([0-9][0-9]?)(?::([0-9][0-9]))?))?)?$", "gi" )
      },
      trim: function( a ) {
            return ( a + "" ).replace( /^\s+/, "" ).replace( /\s+$/, "" )
      },
      isNumeric: function( a ) {
            return ( a - 0 ) == a && a.length > 0 && a.replace( /\s+/g, "" ) != ""
      },
      inArray: function( c, d ) {
            var b;
            var a = d.length;
            for ( b = 0; b < a; b++ ) {
                  if ( c == d[ b ] ) {
                        return true
                  }
            }
            return false
      },
      getKeys: function( c ) {
            var b = [];
            for ( var a in c ) {
                  if ( c.hasOwnProperty( a ) ) {
                        b.push( a )
                  }
            }
            return b
      },
      octdec: function( a ) {
            return parseInt( ( a + "" ).replace( /[^0-7]/gi, "" ), 8 )
      },
      hexdec: function( a ) {
            a = this.trim( a );
            if ( ( a + "" ).substr( 0, 2 ) == "0x" ) {
                  a = ( a + "" ).substring( 2 )
            }
            return parseInt( ( a + "" ).replace( /[^a-f0-9]/gi, "" ), 16 )
      },
      strtodate: function( a ) {
            var b = new Date();
            b.setTime( this.strtotime( a, new Date().getTime() ) );
            return b
      },
      strtotime: function( o, t ) {
            var q, p, i, m = "",
                  s = "";
            m = o;
            m = m.replace( /\s{2,}|^\s|\s$/g, " " );
            m = m.replace( /[\t\r\n]/g, "" );
            if ( m == "now" ) {
                  return ( new Date() ).getTime() / 1000
            }
            else {
                  if ( !isNaN( s = Date.parse( m ) ) ) {
                        return ( s / 1000 )
                  }
                  else {
                        if ( t ) {
                              t = new Date( t * 1000 )
                        }
                        else {
                              t = new Date()
                        }
                  }
            }
            m = m.toLowerCase();
            var r = {
                  day: {
                        sun: 0,
                        mon: 1,
                        tue: 2,
                        wed: 3,
                        thu: 4,
                        fri: 5,
                        sat: 6
                  },
                  mon: {
                        jan: 0,
                        feb: 1,
                        mar: 2,
                        apr: 3,
                        may: 4,
                        jun: 5,
                        jul: 6,
                        aug: 7,
                        sep: 8,
                        oct: 9,
                        nov: 10,
                        dec: 11
                  }
            };
            var v = this.strtotime;
            var u = function( a ) {
                  var c = ( a[ 2 ] && a[ 2 ] == "ago" );
                  var d = ( d = a[ 0 ] == "last" ? -1 : 1 ) * ( c ? -1 : 1 );
                  switch ( a[ 0 ] ) {
                        case "last":
                        case "next":
                              switch ( a[ 1 ].substring( 0, 3 ) ) {
                                    case "yea":
                                          t.setFullYear( t.getFullYear() + d );
                                          break;
                                    case "mon":
                                          t.setMonth( t.getMonth() + d );
                                          break;
                                    case "wee":
                                          t.setDate( t.getDate() + ( d * 7 ) );
                                          break;
                                    case "day":
                                          t.setDate( t.getDate() + d );
                                          break;
                                    case "hou":
                                          t.setHours( t.getHours() + d );
                                          break;
                                    case "min":
                                          t.setMinutes( t.getMinutes() + d );
                                          break;
                                    case "sec":
                                          t.setSeconds( t.getSeconds() + d );
                                          break;
                                    default:
                                          var e;
                                          if ( typeof( e = r.day[ a[ 1 ].substring( 0, 3 ) ] ) != "undefined" ) {
                                                var b = e - t.getDay();
                                                if ( b == 0 ) {
                                                      b = 7 * d
                                                }
                                                else {
                                                      if ( b > 0 ) {
                                                            if ( a[ 0 ] == "last" ) {
                                                                  b -= 7
                                                            }
                                                      }
                                                      else {
                                                            if ( a[ 0 ] == "next" ) {
                                                                  b += 7
                                                            }
                                                      }
                                                }
                                                t.setDate( t.getDate() + b )
                                          }
                              }
                              break;
                        default:
                              if ( /\d+/.test( a[ 0 ] ) ) {
                                    d *= parseInt( a[ 0 ], 10 );
                                    switch ( a[ 1 ].substring( 0, 3 ) ) {
                                          case "yea":
                                                t.setFullYear( t.getFullYear() + d );
                                                break;
                                          case "mon":
                                                t.setMonth( t.getMonth() + d );
                                                break;
                                          case "wee":
                                                t.setDate( t.getDate() + ( d * 7 ) );
                                                break;
                                          case "day":
                                                t.setDate( t.getDate() + d );
                                                break;
                                          case "hou":
                                                t.setHours( t.getHours() + d );
                                                break;
                                          case "min":
                                                t.setMinutes( t.getMinutes() + d );
                                                break;
                                          case "sec":
                                                t.setSeconds( t.getSeconds() + d );
                                                break
                                    }
                              }
                              else {
                                    return false
                              }
                              break
                  }
                  return true
            };
            p = m.match( /^(\d{2,4}-\d{2}-\d{2})(?:\s(\d{1,2}:\d{2}(:\d{2})?)?(?:\.(\d+))?)?$/ );
            if ( p != null ) {
                  if ( !p[ 2 ] ) {
                        p[ 2 ] = "00:00:00"
                  }
                  else {
                        if ( !p[ 3 ] ) {
                              p[ 2 ] += ":00"
                        }
                  }
                  i = p[ 1 ].split( /-/g );
                  for ( q in r.mon ) {
                        if ( r.mon[ q ] == i[ 1 ] - 1 ) {
                              i[ 1 ] = q
                        }
                  }
                  i[ 0 ] = parseInt( i[ 0 ], 10 );
                  i[ 0 ] = ( i[ 0 ] >= 0 && i[ 0 ] <= 69 ) ? "20" + ( i[ 0 ] < 10 ? "0" + i[ 0 ] : i[ 0 ] + "" ) : ( i[ 0 ] >= 70 && i[ 0 ] <= 99 ) ? "19" + i[ 0 ] : i[ 0 ] + "";
                  return parseInt( v( i[ 2 ] + " " + i[ 1 ] + " " + i[ 0 ] + " " + p[ 2 ] ) + ( p[ 4 ] ? p[ 4 ] / 1000 : "" ), 10 )
            }
            var n = "([+-]?\\d+\\s(years?|months?|weeks?|days?|hours?|min|minutes?|sec|seconds?|sun\\.?|sunday|mon\\.?|monday|tue\\.?|tuesday|wed\\.?|wednesday|thu\\.?|thursday|fri\\.?|friday|sat\\.?|saturday)|(last|next)\\s(years?|months?|weeks?|days?|hours?|min|minutes?|sec|seconds?|sun\\.?|sunday|mon\\.?|monday|tue\\.?|tuesday|wed\\.?|wednesday|thu\\.?|thursday|fri\\.?|friday|sat\\.?|saturday))(\\sago)?";
            p = m.match( new RegExp( n, "gi" ) );
            if ( p == null ) {
                  return false
            }
            for ( q = 0; q < p.length; q++ ) {
                  if ( !u( p[ q ].split( " " ) ) ) {
                        return false
                  }
            }
            return ( t.getTime() / 1000 )
      }
};
YamlInline.REGEX_QUOTED_STRING = "(?:\"(?:[^\"\\\\]*(?:\\\\.[^\"\\\\]*)*)\"|'(?:[^']*(?:''[^']*)*)')";
var YamlParser = function( a ) {
      this.offset = this.isDefined( a ) ? a : 0
};
YamlParser.prototype = {
      offset: 0,
      lines: [],
      currentLineNb: -1,
      currentLine: "",
      refs: {},
      parse: function( m ) {
            this.currentLineNb = -1;
            this.currentLine = "";
            this.lines = this.cleanup( m ).split( "\n" );
            var u = null;
            while ( this.moveToNextLine() ) {
                  if ( this.isCurrentLineEmpty() ) {
                        continue
                  }
                  if ( /^\t+/.test( this.currentLine ) ) {
                        throw new InvalidArgumentException( "A YAML file cannot contain tabs as indentation at line " + ( this.getRealCurrentLineNb() + 1 ) + " (" + this.currentLine + ")" )
                  }
                  var j = false;
                  var r = false;
                  var q = false;
                  var b = null;
                  var a = null;
                  var t = null;
                  var d = null;
                  var e = null;
                  var v = null;
                  var h = null;
                  var p = null;
                  var f = null;
                  if ( b = /^\-((\s+)(.+?))?\s*$/.exec( this.currentLine ) ) {
                        if ( !this.isDefined( u ) ) {
                              u = []
                        }
                        if ( !( u instanceof Array ) ) {
                              throw new InvalidArgumentException( "Non array entry at line " + ( this.getRealCurrentLineNb() + 1 ) + "." )
                        }
                        b = {
                              leadspaces: b[ 2 ],
                              value: b[ 3 ]
                        };
                        if ( this.isDefined( b.value ) && ( a = /^&([^ ]+) *(.*)/.exec( b.value ) ) ) {
                              a = {
                                    ref: a[ 1 ],
                                    value: a[ 2 ]
                              };
                              j = a.ref;
                              b.value = a.value
                        }
                        if ( !this.isDefined( b.value ) || "" == b.value.split( " " ).join( "" ) || this.trim( b.value ).charAt( 0 ) == "#" ) {
                              t = this.getRealCurrentLineNb() + 1;
                              d = new YamlParser( t );
                              d.refs = this.refs;
                              u.push( d.parse( this.getNextEmbedBlock() ) );
                              this.refs = d.refs
                        }
                        else {
                              if ( this.isDefined( b.leadspaces ) && " " == b.leadspaces && ( a = new RegExp( "^(" + YamlInline.REGEX_QUOTED_STRING + "|[^ '\"{].*?) *:(\\s+(.+?))?\\s*$" ).exec( b.value ) ) ) {
                                    a = {
                                          key: a[ 1 ],
                                          value: a[ 3 ]
                                    };
                                    t = this.getRealCurrentLineNb();
                                    d = new YamlParser( t );
                                    d.refs = this.refs;
                                    e = b.value;
                                    if ( !this.isNextLineIndented() ) {
                                          e += "\n" + this.getNextEmbedBlock( this.getCurrentLineIndentation() + 2 )
                                    }
                                    u.push( d.parse( e ) );
                                    this.refs = d.refs
                              }
                              else {
                                    u.push( this.parseValue( b.value ) )
                              }
                        }
                  }
                  else {
                        if ( b = new RegExp( "^(" + YamlInline.REGEX_QUOTED_STRING + "|[^ '\"].*?) *:(\\s+(.+?))?\\s*$" ).exec( this.currentLine ) ) {
                              if ( !this.isDefined( u ) ) {
                                    u = {}
                              }
                              if ( u instanceof Array ) {
                                    throw new InvalidArgumentException( "Non mapped entry at line " + ( this.getRealCurrentLineNb() + 1 ) + "." )
                              }
                              b = {
                                    key: b[ 1 ],
                                    value: b[ 3 ]
                              };
                              v = ( new YamlInline() ).parseScalar( b.key );
                              if ( "<<" == v ) {
                                    if ( this.isDefined( b.value ) && "*" == ( b.value + "" ).charAt( 0 ) ) {
                                          r = b.value.substring( 1 )
                                    }
                                    else {
                                          if ( this.isDefined( b.value ) && b.value != "" ) {
                                                m = b.value
                                          }
                                          else {
                                                m = this.getNextEmbedBlock()
                                          }
                                          t = this.getRealCurrentLineNb() + 1;
                                          d = new YamlParser( t );
                                          d.refs = this.refs;
                                          h = d.parse( m );
                                          this.refs = d.refs;
                                          var s = [];
                                          if ( !this.isObject( h ) ) {
                                                throw new InvalidArgumentException( "YAML merge keys used with a scalar value instead of an array at line " + ( this.getRealCurrentLineNb() + 1 ) + " (" + this.currentLine + ")" )
                                          }
                                          else {
                                                if ( this.isDefined( h[ 0 ] ) ) {
                                                      f = this.reverseArray( h );
                                                      p = f.length;
                                                      for ( var o = 0; o < p; o++ ) {
                                                            var l = f[ o ];
                                                            if ( !this.isObject( f[ o ] ) ) {
                                                                  throw new InvalidArgumentException( "Merge items must be arrays at line " + ( this.getRealCurrentLineNb() + 1 ) + " (" + f[ o ] + ")." )
                                                            }
                                                            s = this.mergeObject( f[ o ], s )
                                                      }
                                                }
                                                else {
                                                      s = this.mergeObject( s, h )
                                                }
                                          }
                                          q = s
                                    }
                              }
                              else {
                                    if ( this.isDefined( b.value ) && ( a = /^&([^ ]+) *(.*)/.exec( b.value ) ) ) {
                                          a = {
                                                ref: a[ 1 ],
                                                value: a[ 2 ]
                                          };
                                          j = a.ref;
                                          b.value = a.value
                                    }
                              }
                              if ( q ) {
                                    u = q
                              }
                              else {
                                    if ( !this.isDefined( b.value ) || "" == b.value.split( " " ).join( "" ) || this.trim( b.value ).charAt( 0 ) == "#" ) {
                                          if ( this.isNextLineIndented() ) {
                                                u[ v ] = null
                                          }
                                          else {
                                                t = this.getRealCurrentLineNb() + 1;
                                                d = new YamlParser( t );
                                                d.refs = this.refs;
                                                u[ v ] = d.parse( this.getNextEmbedBlock() );
                                                this.refs = d.refs
                                          }
                                    }
                                    else {
                                          if ( r ) {
                                                u = this.refs[ r ]
                                          }
                                          else {
                                                u[ v ] = this.parseValue( b.value )
                                          }
                                    }
                              }
                        }
                        else {
                              if ( 2 == this.lines.length && this.isEmpty( this.lines[ 1 ] ) ) {
                                    m = ( new YamlInline() ).load( this.lines[ 0 ] );
                                    if ( this.isObject( m ) ) {
                                          first = m[ 0 ];
                                          if ( "*" == ( first + "" ).substr( 0, 1 ) ) {
                                                u = [];
                                                p = m.length;
                                                for ( var o = 0; o < p; o++ ) {
                                                      u.push( this.refs[ m[ o ].substring( 1 ) ] )
                                                }
                                                m = u
                                          }
                                    }
                                    return m
                              }
                              throw new InvalidArgumentException( '"' + this.currentLine + '" at line ' + ( this.getRealCurrentLineNb() + 1 ) )
                        }
                  }
                  if ( j ) {
                        if ( u instanceof Array ) {
                              this.refs[ j ] = u[ u.length - 1 ]
                        }
                        else {
                              var g = null;
                              for ( var n in u ) {
                                    if ( u.hasOwnProperty( n ) ) {
                                          g = n
                                    }
                              }
                              this.refs[ j ] = u[ n ]
                        }
                  }
            }
            return this.isEmpty( u ) ? null : u
      },
      getRealCurrentLineNb: function() {
            return this.currentLineNb + this.offset
      },
      getCurrentLineIndentation: function() {
            return this.currentLine.length - this.currentLine.replace( /^ +/g, "" ).length
      },
      getNextEmbedBlock: function( d ) {
            this.moveToNextLine();
            var b = null;
            var a = null;
            if ( !this.isDefined( d ) ) {
                  b = this.getCurrentLineIndentation();
                  if ( !this.isCurrentLineEmpty() && 0 == b ) {
                        throw new InvalidArgumentException( "A Indentation problem at line " + ( this.getRealCurrentLineNb() + 1 ) + " (" + this.currentLine + ")" )
                  }
            }
            else {
                  b = d
            }
            var e = [ this.currentLine.substring( b ) ];
            while ( this.moveToNextLine() ) {
                  if ( this.isCurrentLineEmpty() ) {
                        if ( this.isCurrentLineBlank() ) {
                              e.push( this.currentLine.substring( b ) )
                        }
                        continue
                  }
                  a = this.getCurrentLineIndentation();
                  var c;
                  if ( c = /^( *)$/.exec( this.currentLine ) ) {
                        e.push( c[ 1 ] )
                  }
                  else {
                        if ( a >= b ) {
                              e.push( this.currentLine.substring( b ) )
                        }
                        else {
                              if ( 0 == a ) {
                                    this.moveToPreviousLine();
                                    break
                              }
                              else {
                                    throw new InvalidArgumentException( "B Indentation problem at line " + ( this.getRealCurrentLineNb() + 1 ) + " (" + this.currentLine + ")" )
                              }
                        }
                  }
            }
            return e.join( "\n" )
      },
      moveToNextLine: function() {
            if ( this.currentLineNb >= this.lines.length - 1 ) {
                  return false
            }
            this.currentLineNb++;
            this.currentLine = this.lines[ this.currentLineNb ];
            return true
      },
      moveToPreviousLine: function() {
            this.currentLineNb--;
            this.currentLine = this.lines[ this.currentLineNb ]
      },
      parseValue: function( c ) {
            if ( "*" == ( c + "" ).charAt( 0 ) ) {
                  if ( this.trim( c ).charAt( 0 ) == "#" ) {
                        c = ( c + "" ).substr( 1, c.indexOf( "#" ) - 2 )
                  }
                  else {
                        c = ( c + "" ).substring( 1 )
                  }
                  if ( this.refs[ c ] == undefined ) {
                        throw new InvalidArgumentException( 'Reference "' + c + '" does not exist (' + this.currentLine + ")." )
                  }
                  return this.refs[ c ]
            }
            var b = null;
            if ( b = /^(\||>)(\+|\-|\d+|\+\d+|\-\d+|\d+\+|\d+\-)?( +#.*)?$/.exec( c ) ) {
                  b = {
                        separator: b[ 1 ],
                        modifiers: b[ 2 ],
                        comments: b[ 3 ]
                  };
                  var a = this.isDefined( b.modifiers ) ? b.modifiers : "";
                  return this.parseFoldedScalar( b.separator, a.replace( /\d+/g, "" ), Math.abs( parseInt( a ) ) )
            }
            else {
                  return ( new YamlInline() ).load( c )
            }
      },
      parseFoldedScalar: function( c, h, f ) {
            if ( h == undefined ) {
                  h = ""
            }
            if ( f == undefined ) {
                  f = 0
            }
            c = "|" == c ? "\n" : " ";
            var j = "";
            var g = null;
            var b = this.moveToNextLine();
            while ( b && this.isCurrentLineBlank() ) {
                  j += "\n";
                  b = this.moveToNextLine()
            }
            if ( !b ) {
                  return ""
            }
            var d = null;
            if ( !( d = new RegExp( "^(" + ( f ? this.strRepeat( " ", f ) : " +" ) + ")(.*)$" ).exec( this.currentLine ) ) ) {
                  this.moveToPreviousLine();
                  return ""
            }
            d = {
                  indent: d[ 1 ],
                  text: d[ 2 ]
            };
            var a = d.indent;
            var e = 0;
            j += d.text + c;
            while ( this.currentLineNb + 1 < this.lines.length ) {
                  this.moveToNextLine();
                  if ( d = new RegExp( "^( {" + a.length + ",})(.+)$" ).exec( this.currentLine ) ) {
                        d = {
                              indent: d[ 1 ],
                              text: d[ 2 ]
                        };
                        if ( " " == c && e != d.indent ) {
                              j = j.substr( 0, j.length - 1 ) + "\n"
                        }
                        e = d.indent;
                        g = d.indent.length - a.length;
                        j += this.strRepeat( " ", g ) + d.text + ( g != 0 ? "\n" : c )
                  }
                  else {
                        if ( d = /^( *)$/.exec( this.currentLine ) ) {
                              j += d[ 1 ].replace( new RegExp( "^ {1," + a.length + "}", "g" ), "", d[ 1 ] ) + "\n"
                        }
                        else {
                              this.moveToPreviousLine();
                              break
                        }
                  }
            }
            if ( " " == c ) {
                  j = j.replace( / (\n*)$/g, "\n$1" )
            }
            switch ( h ) {
                  case "":
                        j = j.replace( /\n+$/g, "\n" );
                        break;
                  case "+":
                        break;
                  case "-":
                        j = j.replace( /\n+$/g, "" );
                        break
            }
            return j
      },
      isNextLineIndented: function() {
            var b = this.getCurrentLineIndentation();
            var c = this.moveToNextLine();
            while ( c && this.isCurrentLineEmpty() ) {
                  c = this.moveToNextLine()
            }
            if ( false == c ) {
                  return false
            }
            var a = false;
            if ( this.getCurrentLineIndentation() <= b ) {
                  a = true
            }
            this.moveToPreviousLine();
            return a
      },
      isCurrentLineEmpty: function() {
            return this.isCurrentLineBlank() || this.isCurrentLineComment()
      },
      isCurrentLineBlank: function() {
            return "" == this.currentLine.split( " " ).join( "" )
      },
      isCurrentLineComment: function() {
            var a = this.currentLine.replace( /^ +/g, "" );
            return a.charAt( 0 ) == "#"
      },
      cleanup: function( c ) {
            c = c.split( "\r\n" ).join( "\n" ).split( "\r" ).join( "\n" );
            if ( !/\n$/.test( c ) ) {
                  c += "\n"
            }
            var b = 0;
            var a = /^\%YAML[: ][\d\.]+.*\n/;
            while ( a.test( c ) ) {
                  c = c.replace( a, "" );
                  b++
            }
            this.offset += b;
            a = /^(#.*?\n)+/;
            if ( a.test( c ) ) {
                  trimmedValue = c.replace( a, "" );
                  this.offset += this.subStrCount( c, "\n" ) - this.subStrCount( trimmedValue, "\n" );
                  c = trimmedValue
            }
            a = /^\-\-\-.*?\n/;
            if ( a.test( c ) ) {
                  trimmedValue = c.replace( a, "" );
                  this.offset += this.subStrCount( c, "\n" ) - this.subStrCount( trimmedValue, "\n" );
                  c = trimmedValue;
                  c = c.replace( /\.\.\.\s*$/g, "" )
            }
            return c
      },
      isObject: function( a ) {
            return typeof( a ) == "object" && this.isDefined( a )
      },
      isEmpty: function( a ) {
            return a == undefined || a == null || a == "" || a == 0 || a == "0" || a == false
      },
      isDefined: function( a ) {
            return a != undefined && a != null
      },
      reverseArray: function( c ) {
            var b = [];
            var a = c.length;
            for ( var d = a - 1; d >= 0; d-- ) {
                  b.push( c[ d ] )
            }
            return b
      },
      merge: function( e, d ) {
            var f = {};
            for ( i in e ) {
                  if ( /^\d+$/.test( i ) ) {
                        f.push( e )
                  }
                  else {
                        f[ i ] = e[ i ]
                  }
            }
            for ( i in d ) {
                  if ( /^\d+$/.test( i ) ) {
                        f.push( d )
                  }
                  else {
                        f[ i ] = d[ i ]
                  }
            }
            return f
      },
      strRepeat: function( d, c ) {
            var b;
            var a = "";
            for ( b = 0; b < c; b++ ) {
                  a += d
            }
            return d
      },
      subStrCount: function( d, b, j, f ) {
            var h = 0;
            d = "" + d;
            b = "" + b;
            if ( j != undefined ) {
                  d = d.substr( j )
            }
            if ( f != undefined ) {
                  d = d.substr( 0, f )
            }
            var a = d.length;
            var g = b.length;
            for ( var e = 0; e < a; e++ ) {
                  if ( b == d.substr( e, g ) ) {
                        h++
                  }
            }
            return h
      },
      trim: function( a ) {
            return ( a + "" ).replace( /^\s+/, "" ).replace( /\s+$/, "" )
      }
};
YamlDumper = function() {};
YamlDumper.prototype = {
      dump: function( g, f, c ) {
            if ( f == undefined ) {
                  f = 0
            }
            if ( c == undefined ) {
                  c = 0
            }
            var b = "";
            var e = c ? this.strRepeat( " ", c ) : "";
            var i;
            if ( f <= 0 || !this.isObject( g ) || this.isEmpty( g ) ) {
                  i = new YamlInline();
                  b += e + i.dump( g )
            }
            else {
                  var d = !this.arrayEquals( this.getKeys( g ), this.range( 0, g.length - 1 ) );
                  var a;
                  for ( var h in g ) {
                        if ( g.hasOwnProperty( h ) ) {
                              a = f - 1 <= 0 || !this.isObject( g[ h ] ) || this.isEmpty( g[ h ] );
                              if ( d ) {
                                    i = new YamlInline()
                              }
                              b += e + "" + ( d ? i.dump( h ) + ":" : "-" ) + "" + ( a ? " " : "\n" ) + "" + this.dump( g[ h ], f - 1, ( a ? 0 : c + 2 ) ) + "" + ( a ? "\n" : "" )
                        }
                  }
            }
            return b
      },
      strRepeat: function( d, c ) {
            var b;
            var a = "";
            for ( b = 0; b < c; b++ ) {
                  a += d
            }
            return d
      },
      isObject: function( a ) {
            return typeof( a ) == "object" && this.isDefined( a )
      },
      isEmpty: function( a ) {
            return a == undefined || a == null || a == "" || a == 0 || a == "0" || a == false
      },
      isDefined: function( a ) {
            return a != undefined && a != null
      },
      getKeys: function( c ) {
            var b = [];
            for ( var a in c ) {
                  if ( c.hasOwnProperty( a ) ) {
                        b.push( a )
                  }
            }
            return b
      },
      range: function( d, a ) {
            if ( d > a ) {
                  return []
            }
            var b = [];
            for ( var c = d; c <= a; c++ ) {
                  b.push( c )
            }
            return b
      },
      arrayEquals: function( e, d ) {
            if ( e.length != d.length ) {
                  return false
            }
            var c = e.length;
            for ( var f = 0; f < c; f++ ) {
                  if ( e[ f ] != d[ f ] ) {
                        return false
                  }
            }
            return true
      }
};


//  json2.js
//  2017-06-12
//  Public Domain.
//  NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.

//  USE YOUR OWN COPY. IT IS EXTREMELY UNWISE TO LOAD CODE FROM SERVERS YOU DO
//  NOT CONTROL.

//  This file creates a global JSON object containing two methods: stringify
//  and parse. This file provides the ES5 JSON capability to ES3 systems.
//  If a project might run on IE8 or earlier, then this file should be included.
//  This file does nothing on ES5 systems.

//      JSON.stringify(value, replacer, space)
//          value       any JavaScript value, usually an object or array.
//          replacer    an optional parameter that determines how object
//                      values are stringified for objects. It can be a
//                      function or an array of strings.
//          space       an optional parameter that specifies the indentation
//                      of nested structures. If it is omitted, the text will
//                      be packed without extra whitespace. If it is a number,
//                      it will specify the number of spaces to indent at each
//                      level. If it is a string (such as "\t" or "&nbsp;"),
//                      it contains the characters used to indent at each level.
//          This method produces a JSON text from a JavaScript value.
//          When an object value is found, if the object contains a toJSON
//          method, its toJSON method will be called and the result will be
//          stringified. A toJSON method does not serialize: it returns the
//          value represented by the name/value pair that should be serialized,
//          or undefined if nothing should be serialized. The toJSON method
//          will be passed the key associated with the value, and this will be
//          bound to the value.

//          For example, this would serialize Dates as ISO strings.

//              Date.prototype.toJSON = function (key) {
//                  function f(n) {
//                      // Format integers to have at least two digits.
//                      return (n < 10)
//                          ? "0" + n
//                          : n;
//                  }
//                  return this.getUTCFullYear()   + "-" +
//                       f(this.getUTCMonth() + 1) + "-" +
//                       f(this.getUTCDate())      + "T" +
//                       f(this.getUTCHours())     + ":" +
//                       f(this.getUTCMinutes())   + ":" +
//                       f(this.getUTCSeconds())   + "Z";
//              };

//          You can provide an optional replacer method. It will be passed the
//          key and value of each member, with this bound to the containing
//          object. The value that is returned from your method will be
//          serialized. If your method returns undefined, then the member will
//          be excluded from the serialization.

//          If the replacer parameter is an array of strings, then it will be
//          used to select the members to be serialized. It filters the results
//          such that only members with keys listed in the replacer array are
//          stringified.

//          Values that do not have JSON representations, such as undefined or
//          functions, will not be serialized. Such values in objects will be
//          dropped; in arrays they will be replaced with null. You can use
//          a replacer function to replace those with JSON values.

//          JSON.stringify(undefined) returns undefined.

//          The optional space parameter produces a stringification of the
//          value that is filled with line breaks and indentation to make it
//          easier to read.

//          If the space parameter is a non-empty string, then that string will
//          be used for indentation. If the space parameter is a number, then
//          the indentation will be that many spaces.

//          Example:

//          text = JSON.stringify(["e", {pluribus: "unum"}]);
//          // text is '["e",{"pluribus":"unum"}]'

//          text = JSON.stringify(["e", {pluribus: "unum"}], null, "\t");
//          // text is '[\n\t"e",\n\t{\n\t\t"pluribus": "unum"\n\t}\n]'

//          text = JSON.stringify([new Date()], function (key, value) {
//              return this[key] instanceof Date
//                  ? "Date(" + this[key] + ")"
//                  : value;
//          });
//          // text is '["Date(---current time---)"]'

//      JSON.parse(text, reviver)
//          This method parses a JSON text to produce an object or array.
//          It can throw a SyntaxError exception.

//          The optional reviver parameter is a function that can filter and
//          transform the results. It receives each of the keys and values,
//          and its return value is used instead of the original value.
//          If it returns what it received, then the structure is not modified.
//          If it returns undefined then the member is deleted.

//          Example:

//          // Parse the text. Values that look like ISO date strings will
//          // be converted to Date objects.

//          myData = JSON.parse(text, function (key, value) {
//              var a;
//              if (typeof value === "string") {
//                  a =
//   /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*)?)Z$/.exec(value);
//                  if (a) {
//                      return new Date(Date.UTC(
//                         +a[1], +a[2] - 1, +a[3], +a[4], +a[5], +a[6]
//                      ));
//                  }
//                  return value;
//              }
//          });

//          myData = JSON.parse(
//              "[\"Date(09/09/2001)\"]",
//              function (key, value) {
//                  var d;
//                  if (
//                      typeof value === "string"
//                      && value.slice(0, 5) === "Date("
//                      && value.slice(-1) === ")"
//                  ) {
//                      d = new Date(value.slice(5, -1));
//                      if (d) {
//                          return d;
//                      }
//                  }
//                  return value;
//              }
//          );

//  This is a reference implementation. You are free to copy, modify, or
//  redistribute.

/*jslint
    eval, for, this
*/

/*property
    JSON, apply, call, charCodeAt, getUTCDate, getUTCFullYear, getUTCHours,
    getUTCMinutes, getUTCMonth, getUTCSeconds, hasOwnProperty, join,
    lastIndex, length, parse, prototype, push, replace, slice, stringify,
    test, toJSON, toString, valueOf
*/


// Create a JSON object only if one does not already exist. We create the
// methods in a closure to avoid creating global variables.

if (typeof JSON !== "object") {
    JSON = {};
}

(function () {
    "use strict";

    var rx_one = /^[\],:{}\s]*$/;
    var rx_two = /\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g;
    var rx_three = /"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g;
    var rx_four = /(?:^|:|,)(?:\s*\[)+/g;
    var rx_escapable = /[\\"\u0000-\u001f\u007f-\u009f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;
    var rx_dangerous = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;

    function f(n) {
        // Format integers to have at least two digits.
        return (n < 10)
            ? "0" + n
            : n;
    }

    function this_value() {
        return this.valueOf();
    }

    if (typeof Date.prototype.toJSON !== "function") {

        Date.prototype.toJSON = function () {

            return isFinite(this.valueOf())
                ? (
                    this.getUTCFullYear()
                    + "-"
                    + f(this.getUTCMonth() + 1)
                    + "-"
                    + f(this.getUTCDate())
                    + "T"
                    + f(this.getUTCHours())
                    + ":"
                    + f(this.getUTCMinutes())
                    + ":"
                    + f(this.getUTCSeconds())
                    + "Z"
                )
                : null;
        };

        Boolean.prototype.toJSON = this_value;
        Number.prototype.toJSON = this_value;
        String.prototype.toJSON = this_value;
    }

    var gap;
    var indent;
    var meta;
    var rep;


    function quote(string) {

// If the string contains no control characters, no quote characters, and no
// backslash characters, then we can safely slap some quotes around it.
// Otherwise we must also replace the offending characters with safe escape
// sequences.

        rx_escapable.lastIndex = 0;
        return rx_escapable.test(string)
            ? "\"" + string.replace(rx_escapable, function (a) {
                var c = meta[a];
                return typeof c === "string"
                    ? c
                    : "\\u" + ("0000" + a.charCodeAt(0).toString(16)).slice(-4);
            }) + "\""
            : "\"" + string + "\"";
    }


    function str(key, holder) {

// Produce a string from holder[key].

        var i;          // The loop counter.
        var k;          // The member key.
        var v;          // The member value.
        var length;
        var mind = gap;
        var partial;
        var value = holder[key];

// If the value has a toJSON method, call it to obtain a replacement value.

        if (
            value
            && typeof value === "object"
            && typeof value.toJSON === "function"
        ) {
            value = value.toJSON(key);
        }

// If we were called with a replacer function, then call the replacer to
// obtain a replacement value.

        if (typeof rep === "function") {
            value = rep.call(holder, key, value);
        }

// What happens next depends on the value's type.

        switch (typeof value) {
        case "string":
            return quote(value);

        case "number":

// JSON numbers must be finite. Encode non-finite numbers as null.

            return (isFinite(value))
                ? String(value)
                : "null";

        case "boolean":
        case "null":

// If the value is a boolean or null, convert it to a string. Note:
// typeof null does not produce "null". The case is included here in
// the remote chance that this gets fixed someday.

            return String(value);

// If the type is "object", we might be dealing with an object or an array or
// null.

        case "object":

// Due to a specification blunder in ECMAScript, typeof null is "object",
// so watch out for that case.

            if (!value) {
                return "null";
            }

// Make an array to hold the partial results of stringifying this object value.

            gap += indent;
            partial = [];

// Is the value an array?

            if (Object.prototype.toString.apply(value) === "[object Array]") {

// The value is an array. Stringify every element. Use null as a placeholder
// for non-JSON values.

                length = value.length;
                for (i = 0; i < length; i += 1) {
                    partial[i] = str(i, value) || "null";
                }

// Join all of the elements together, separated with commas, and wrap them in
// brackets.

                v = partial.length === 0
                    ? "[]"
                    : gap
                        ? (
                            "[\n"
                            + gap
                            + partial.join(",\n" + gap)
                            + "\n"
                            + mind
                            + "]"
                        )
                        : "[" + partial.join(",") + "]";
                gap = mind;
                return v;
            }

// If the replacer is an array, use it to select the members to be stringified.

            if (rep && typeof rep === "object") {
                length = rep.length;
                for (i = 0; i < length; i += 1) {
                    if (typeof rep[i] === "string") {
                        k = rep[i];
                        v = str(k, value);
                        if (v) {
                            partial.push(quote(k) + (
                                (gap)
                                    ? ": "
                                    : ":"
                            ) + v);
                        }
                    }
                }
            } else {

// Otherwise, iterate through all of the keys in the object.

                for (k in value) {
                    if (Object.prototype.hasOwnProperty.call(value, k)) {
                        v = str(k, value);
                        if (v) {
                            partial.push(quote(k) + (
                                (gap)
                                    ? ": "
                                    : ":"
                            ) + v);
                        }
                    }
                }
            }

// Join all of the member texts together, separated with commas,
// and wrap them in braces.

            v = partial.length === 0
                ? "{}"
                : gap
                    ? "{\n" + gap + partial.join(",\n" + gap) + "\n" + mind + "}"
                    : "{" + partial.join(",") + "}";
            gap = mind;
            return v;
        }
    }

// If the JSON object does not yet have a stringify method, give it one.

    if (typeof JSON.stringify !== "function") {
        meta = {    // table of character substitutions
            "\b": "\\b",
            "\t": "\\t",
            "\n": "\\n",
            "\f": "\\f",
            "\r": "\\r",
            "\"": "\\\"",
            "\\": "\\\\"
        };
        JSON.stringify = function (value, replacer, space) {

// The stringify method takes a value and an optional replacer, and an optional
// space parameter, and returns a JSON text. The replacer can be a function
// that can replace values, or an array of strings that will select the keys.
// A default replacer method can be provided. Use of the space parameter can
// produce text that is more easily readable.

            var i;
            gap = "";
            indent = "";

// If the space parameter is a number, make an indent string containing that
// many spaces.

            if (typeof space === "number") {
                for (i = 0; i < space; i += 1) {
                    indent += " ";
                }

// If the space parameter is a string, it will be used as the indent string.

            } else if (typeof space === "string") {
                indent = space;
            }

// If there is a replacer, it must be a function or an array.
// Otherwise, throw an error.

            rep = replacer;
            if (replacer && typeof replacer !== "function" && (
                typeof replacer !== "object"
                || typeof replacer.length !== "number"
            )) {
                throw new Error("JSON.stringify");
            }

// Make a fake root object containing our value under the key of "".
// Return the result of stringifying the value.

            return str("", {"": value});
        };
    }


// If the JSON object does not yet have a parse method, give it one.

    if (typeof JSON.parse !== "function") {
        JSON.parse = function (text, reviver) {

// The parse method takes a text and an optional reviver function, and returns
// a JavaScript value if the text is a valid JSON text.

            var j;

            function walk(holder, key) {

// The walk method is used to recursively walk the resulting structure so
// that modifications can be made.

                var k;
                var v;
                var value = holder[key];
                if (value && typeof value === "object") {
                    for (k in value) {
                        if (Object.prototype.hasOwnProperty.call(value, k)) {
                            v = walk(value, k);
                            if (v !== undefined) {
                                value[k] = v;
                            } else {
                                delete value[k];
                            }
                        }
                    }
                }
                return reviver.call(holder, key, value);
            }


// Parsing happens in four stages. In the first stage, we replace certain
// Unicode characters with escape sequences. JavaScript handles many characters
// incorrectly, either silently deleting them, or treating them as line endings.

            text = String(text);
            rx_dangerous.lastIndex = 0;
            if (rx_dangerous.test(text)) {
                text = text.replace(rx_dangerous, function (a) {
                    return (
                        "\\u"
                        + ("0000" + a.charCodeAt(0).toString(16)).slice(-4)
                    );
                });
            }

// In the second stage, we run the text against regular expressions that look
// for non-JSON patterns. We are especially concerned with "()" and "new"
// because they can cause invocation, and "=" because it can cause mutation.
// But just to be safe, we want to reject all unexpected forms.

// We split the second stage into 4 regexp operations in order to work around
// crippling inefficiencies in IE's and Safari's regexp engines. First we
// replace the JSON backslash pairs with "@" (a non-JSON character). Second, we
// replace all simple value tokens with "]" characters. Third, we delete all
// open brackets that follow a colon or comma or that begin the text. Finally,
// we look to see that the remaining characters are only whitespace or "]" or
// "," or ":" or "{" or "}". If that is so, then the text is safe for eval.

            if (
                rx_one.test(
                    text
                        .replace(rx_two, "@")
                        .replace(rx_three, "]")
                        .replace(rx_four, "")
                )
            ) {

// In the third stage we use the eval function to compile the text into a
// JavaScript structure. The "{" operator is subject to a syntactic ambiguity
// in JavaScript: it can begin a block or an object literal. We wrap the text
// in parens to eliminate the ambiguity.

                j = eval("(" + text + ")");

// In the optional fourth stage, we recursively walk the new structure, passing
// each name/value pair to a reviver function for possible transformation.

                return (typeof reviver === "function")
                    ? walk({"": j}, "")
                    : j;
            }

// If the text is not JSON parseable, then a SyntaxError is thrown.

            throw new SyntaxError("JSON.parse");
        };
    }
}());


function alertError( e ) {
      var msg = "";
      msg += "Error\n";
      msg += e.message + "\n";
      alert( msg );
}


function parseConfigData() {}

parseConfigData.prototype.Storage = new Object();

//
parseConfigData.prototype.addToStorage = function( key, value ) {
      this.Storage[ key ] = value;
};

// establishStorage(): adds most known variables to Storage
// return (success): nothing
// return (failure): Error()
parseConfigData.prototype.establishStorage = function( ConfigData ) {
      if ( app.project.activeItem == null ) return new Error( "There is no composition selected." )

      this.addToStorage( "ae_proj_directory", app.project.file.fsName.split( "/" ).slice( this.length, -1 ).join( "/" ) );
      this.addToStorage( "ae_proj_directory_name", app.project.file.parent.name );
      this.addToStorage( "ae_proj_directory_parent_name", app.project.file.parent.parent.name );
      this.addToStorage( "ae_proj_directory_parent_parent_name", app.project.file.parent.parent.parent.name );
      this.addToStorage( "ae_proj_name", app.project.file.name.replace( ".aep", "" ) );
      this.addToStorage( "ae_comp_name", app.project.activeItem.name );

      // get date formats specified in config
      // outputs look like: "YY-MM-DD"
      var formatdate = ConfigData[ "date_format" ][ "date" ];
      var formatae_proj_date = ConfigData[ "date_format" ][ "ae_proj_date" ];

      // format dates using the formatDate() methods
      var aeProjDate = app.project.file.modified;
      aeProjDate = this.formatDate( aeProjDate, formatae_proj_date )

      var todayDate = new Date();
      todayDate = this.formatDate( todayDate, formatdate );

      // check if any of the date formatting has gone wrong
      // by checking for leftover characters
      var dateReg = /[a-z]/i;
      if ( aeProjDate.match( dateReg ) || todayDate.match( dateReg ) ) {
            return new Error( "There was a problem parsing the date." )
      }
      else {
            // write dates into storage
            this.addToStorage( "ae_proj_date", aeProjDate );
            this.addToStorage( "date", todayDate );
      }
};
parseConfigData.prototype.formatDate = function( dateString, dateFormatting ) {
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

      // loop through possible date formats (like "yy", "dd")
      // and replace them with their object values (like DateFormats["dd"] = "31")
      for ( var i in DateFormats ) {
            // regex looks like /(yy)/ig
            var reg = "(" + i + ")";
            var re = new RegExp( reg, "ig" )
            dateFormatting = dateFormatting.replace( re, DateFormats[ i ].toString() );
      }

      return dateFormatting;

};
// recursive function
// loops though Storage and looks for strings
parseConfigData.prototype.loopThoughStorageValues = function( obj ) {
      for ( var key in obj ) {
            if ( typeof obj[ key ] == "object" ) {
                  // if function finds an object, it searches again with the new object as input
                  this.loopThoughStorageValues( obj[ key ] )
            }
            else if ( typeof obj[ key ] == "string" ) {
                  // if function finds string, it replaces it with the Storage variabe
                  obj[ key ] = this.findStorageValueAndConvert( obj[ key ] );
                  var returnedValue = obj[ key ];
                  if ( returnedValue instanceof Error ) {
                        throw returnedValue;
                  }
            }
            else {
                  // if unexpected input like arrays, skip
                  continue;
            }
      }
};
// purpose: fill the ((variables)) and replace with actual contents
// receives configFileContent as string
parseConfigData.prototype.findStorageValueAndConvert = function( str ) {
      // regex will find something like ((variable))
      var regex = /\(\((\S+?)\)\)/g;
      var Storage = this.Storage;
      try {
            // replace ((variable)) with variable from Storage
            str = str.replace( regex, function( match, capture ) {
                  // match = matched property / ((pseudo-variable))
                  // capture = $1 / pseudo-variable

                  // call constructor from outside, since "this" is unavailable in this scope
                  var pseudoVar = Storage[ capture ];
                  if ( pseudoVar == undefined ) {
                        throw new Error( "Unexpected Value: " + '"' + match + '"' );
                  }
                  else {
                        // return proper PseudoVars Variable
                        return pseudoVar;

                  };
            } );
      }
      catch ( e ) {
            return e;
      }
      return str;
};
parseConfigData.prototype.convert = function( ConfigData ) {
      var establishStorage = this.establishStorage( ConfigData );
      if ( establishStorage instanceof Error )
            return establishStorage;

      try {
            this.loopThoughStorageValues( ConfigData );
      }
      catch ( e ) {
            alertError( e )
            return;
      }

      return ConfigData;
};

// opens file from file path, reads it and parses it using YAML Syntax
// returns valid JSON Object
parseConfigData.prototype.run = function( configFile ) {
      openConfigFile = configFile.open( 'r', undefined, undefined );
      openConfigFile.encoding = "UTF-8";
      openConfigFile.lineFeed = "Unix"; //convert to UNIX lineFeed

      // success opening the file
      if ( openConfigFile == true ) {
            configFileContent = configFile.read();
            configFile.close();

            // Parse Data
            ConfigData = YAML.decode( configFileContent );
            if ( ConfigData == null ) return new Error( "The config file is empty." )
            // other error handling is done by yaml

            // convert pseudo variables and prepare for output
            ConfigData = this.convert( ConfigData );
            //if(ConfigData instanceof Error) return ConfigData;

            return ConfigData;
      }
      else {
            return new Error( 'Failed opening file "' + configFile.fsName + '".' );
      }
};


function formatConfigData() {}

formatConfigData.prototype.forRenderQueue = function( ConfigData ) {
      var ConfigDataOutput = new Object();
      // ConfigDataOutput["renderPath"]
      // ConfigDataOutput["autoRender"]

      // ConfigDataOutput["renderPath"]
      // make sure render dir begins and ends with "/"
      // input similar to: "../Render", output similar to: "/../Render/"
      var renderDir = ConfigData[ "render" ][ "render_dir" ];
      // eval first and last character and add "/" if missing
      if ( renderDir.substr( 0, 1 ) != "/" && renderDir.substr( 0, 1 ) != "~" ) renderDir = "/" + renderDir;
      if ( renderDir.substr( renderDir.length - 1, 1 ) != "/" ) renderDir = renderDir + "/";
      //combine paths and file name
      var renderPath = renderDir + ConfigData[ "render" ][ "render_name" ];
      renderPath = this.normalizePath( renderPath );
      // add to ConfigDataOutput
      ConfigDataOutput[ "renderPath" ] = renderPath;

      // ConfigDataOutput["autoRender"]
      // turn possible values into real true/false statements
      var autoRender = ConfigData[ "render" ][ "autorender" ];
      if ( autoRender == true || autoRender == "true" || autoRender == 1 || autoRender == "yes" )
            ConfigDataOutput[ "autoRender" ] = true;
      if ( autoRender == false || autoRender == "false" || autoRender == 0 || autoRender == "no" )
            ConfigDataOutput[ "autoRender" ] = false;

      return ConfigDataOutput;

}
// turns a combination of absolute and relative paths into a whole absolute path
formatConfigData.prototype.normalizePath = function( path ) {
      // path looks like: "~/Desktop/sub/../Trash"
      // pathArray looks like: ["~", "Desktop", "sub", "..", "Trash"]
      var pathArray = path.split( "/" );
      for ( var i in pathArray ) {
            if ( pathArray[ i ] == ".." ) {
                  // if element of pathArray is "..", remove last path element and this element
                  pathArray.splice( i - 2, 3 );
                  i = i - 1;
            }
            else {
                  continue;
            }
      }
      // pathArray looks like: ["~", "Desktop", "Trash"]
      // return looks like: "~/Desktop/Trash"
      return pathArray.join( "/" ).toString();
};




function getConfigFile() {}

getConfigFile.prototype.getAEProjDir = function() {
      // returns path of this after effects project file
      if ( app.project.file != null ) {
            return app.project.file.fsName;
      }
      else {
            return new Error( "Please save your file first." )
      }
};
// this function finds the nearest config.txt file and returns it
getConfigFile.prototype.getFile = function( aeProjPath ) {
      var configFileName = "config.txt";
      // from the ae project path, go this many folder layers up
      var maxSearchFolderLayers = 7;

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
                  new parseConfigData().addToStorage( "this_directory", configFile.parent )
                  //  parseConfigData().pseudoVars.Storage[ "this_directory" ] = configFile.parent;
                  break;
            }
      }
      if ( configFile.exists ) {
            return configFile;
      }
      else {
            return new Error( "No Config File found." )
      }
};

getConfigFile.prototype.run = function() {
      // return (success): AE Project Path, type string
      // return (failure):   Error()
      var aeProjPath = this.getAEProjDir();
      if ( aeProjPath instanceof Error ) {
            alertError( aeProjPath )
            return;
      }

      // return (success): config file, type file
      // return (failure):   Error()
      var configFile = this.getFile( aeProjPath );

      return configFile;
}


function renderToAME() {}

renderToAME.prototype = {
      createDirectory: function( dir ) {
            // goes through dir path and creates new folders
            var a = dir.split( "/" );
            for ( var i in a ) {
                  if ( i < 4 ) continue;
                  var thisDir = a.slice( 0, i ).join( "/" );
                  var testFolder = new Folder( thisDir );
                  if ( testFolder.exists ) {
                        continue;
                  }
                  else {
                        testFolder.create();
                        i--;
                  }
            }
      },
      addToRenderQueue: function( cfg ) {
            var path = cfg.renderPath;
            var comp = app.project.activeItem;
            //var autorender = cfg["autorender"];
            var aeQueue = app.project.renderQueue;
            var render = aeQueue.items.add( comp )
            // define new path of file
            cfg[ "renderPath" ] = cfg[ "renderPath" ].replace( ".", "-" );
            this.createDirectory( cfg[ "renderPath" ] );

            render.outputModules[ 1 ].file = new File( cfg[ "renderPath" ] );

            if ( app.project.renderQueue.canQueueInAME == true ) {
                  // Send queued items to AME, but do not start rendering
                  app.project.renderQueue.queueInAME( false );
            }

            //clear queue
            while ( app.project.renderQueue.numItems > 0 ) {
                  app.project.renderQueue.item( app.project.renderQueue.numItems ).remove();
            }

            app.project.activeItem.openInViewer();
      },
      run: function( cfg ) {
            this.addToRenderQueue( cfg );
      }
}


sendToAME = function() {
      this.requiredContext = "\tMedia Encoder must be running";
}

// Instance to check if requirements are met to run the script
sendToAME.prototype.canRun = function() {
      // Adobe Media Encoder must be running
      if ( BridgeTalk.isRunning( "ame" ) ) {
            return true;
      }
      else {
            // Fail if these preconditions are not met
            $.writeln( "ERROR:: Cannot run sendToAME" );
            alert( this.requiredContext );
            return false;
      }
}

sendToAME.prototype.getScriptAsString = function() {
      // get script file to be executed in ame and turn it into a string

      // name of the script to send to ame
      var scriptName = "scriptToExecuteInAME.jsx";

      var thisFile = File( $.fileName );
      var thisDirectory = thisFile.parent.toString();

      var scriptToExecuteInAME = File( thisDirectory + "/" + scriptName );

      // read the file contents
      scriptToExecuteInAME.open( "r", undefined, undefined ); // open to read
      scriptToExecuteInAME.encoding = "UTF-8";
      scriptToExecuteInAME.lineFeed = "Unix"; //convert to UNIX lineFeed

      var scriptStr = scriptToExecuteInAME.read(); // read the file

      // close the file
      scriptToExecuteInAME.close();

      return scriptStr;
}

sendToAME.prototype.run = function( cfg ) {
      var proceed = true;
      if ( !this.canRun() ) {
            proceed = false;
            return proceed;
      }

      var scriptStr = this.getScriptAsString();
      var cfgStr = "var cfg = new Object; cfg = " + JSON.stringify( cfg );

      scriptStr = cfgStr + "\n" + scriptStr;
      // send script to adobe media encoder
      var bridge = new BridgeTalk();
      bridge.target = 'ame';
      bridge.body = scriptStr;
      bridge.send();
      //return retval;
}




function render() {
      var configFile = new getConfigFile().run();
      if ( configFile instanceof Error ) {
            alertError( configFile )
            return;
      }

      var ConfigData = new parseConfigData().run( configFile );
      if ( ConfigData instanceof Error ) {
            alertError( ConfigData )
            return;
      }
      ConfigData = new formatConfigData().forRenderQueue( ConfigData );
      if ( ConfigData instanceof Error ) {
            alertError( ConfigData )
            return;
      }

      // returns final parsed JSON Object
      new renderToAME().run( ConfigData );

}

//render();

( function ScriptLauncher( thisObj ) {
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

            pal.render = pal.add('button', undefined, 'Render', {name:'ok'});

            // Properties for resizing and layouting window
            pal.layout.layout(true);
            pal.layout.resize();
            pal.onResizing = pal.onResize = function () {this.layout.resize();}

            pal.render.onClick = function() {
                render();
            }

      }
      return pal;
}


      // Build and show the palette
      var rdslPal = buildUI( thisObj );
      if ( rdslPal !== null ) {
            if ( rdslPal instanceof Window ) {
                  //rdslPal.center();
                  rdslPal.show();
            }
            else {
                  rdslPal.layout.layout( true );
            }
      }

} )( this );
