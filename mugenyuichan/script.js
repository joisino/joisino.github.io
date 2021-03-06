var cvs = document.getElementById("cv");
var ctx = cvs.getContext("2d");

ctx.font="bold 12px Century";
ctx.fillText("loading...",16,32);

var w = new Array();
var b;
var input_n = 128;
var output_s = 96;
var output_n = output_s * output_s *3;

var mag = 2;

var imageData = ctx.getImageData( 0 , 0 , cvs.width , cvs.height );
var pixels = imageData.data;

var sigmoid = function( x ){
    return 1.0 / ( 1.0 + Math.exp( -x ) );
}

var normRand = function( m , s ){
    var a = 1 - Math.random();
    var b = 1 - Math.random();
    var c = Math.sqrt( -2 * Math.log(a) );
    if( 0.5 - Math.random() > 0 ){
	return c * Math.sin( Math.PI * 2 * b ) * s + m;
    } else {
	return c * Math.cos( Math.PI * 2 * b ) * s + m;
    }
}

function ch(){
    var input = new Array();
    var output = new Array();
    for( var i = 0; i < input_n; i++ )
	input[i] = normRand( 0.0 , 0.20 );

    for( var j = 0; j < output_n; j++ )
	output[j] = 0.0;
    
    for( var i = 0; i < input_n; i++ )
	for( var j = 0; j < output_n; j++ )
	    output[j] += parseFloat(w[i][j]) * input[i];

    for( var j = 0; j < output_n; j++ )
	output[j] += parseFloat(b[j]);

    for( var j = 0; j < output_n; j++ )
	output[j] = sigmoid( output[j] );


    var minc = 1.0;
    var maxc = 0.0;
    for( var i = 0; i < output_n; i++ ){
	minc = Math.min( minc , output[i] );
	maxc = Math.max( maxc , output[i] );
    }
    for( var i = 0; i < output_s*output_s*3; i++ ){
	output[i] = ( output[i] - minc ) / ( maxc - minc );
    }
    

    for( var i = 0; i < output_s; i++ ){
	for( var j = 0; j < output_s; j++ ){
	    var base = i * output_s + j;
	    for( var k = 0; k < mag; k++ ){
		for( var l = 0; l < mag; l++ ){
		    var base2 = (i*mag+k) * output_s*mag + (j*mag+l);
		    pixels[base2*4+0] = Math.floor( output[base*3+0] * 256 );
		    pixels[base2*4+1] = Math.floor( output[base*3+1] * 256 );
		    pixels[base2*4+2] = Math.floor( output[base*3+2] * 256 );
		    pixels[base2*4+3] = 255;
		}
	    }
	}
    }

    ctx.putImageData( imageData , 0 , 0 );
}

window.onload = function(){
    var xhr = new XMLHttpRequest();
    xhr.onload = function(){
	var tempArray = xhr.responseText.split("\n");
	for( var i = 0; i < input_n; i++ )
	    w[i] = tempArray[i].split(",");
	b = tempArray[input_n].split(",");
	ch();
    };

    xhr.open( "get" , "dat" , true );
    xhr.send( null );
}
