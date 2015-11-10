var cvs = document.getElementById("cv");
var ctx = cvs.getContext("2d");

ctx.font="bold 12px Century";
ctx.fillText("loading...",16,32);

var w = new Array();
var b;
var input_n = 128;
var output_s = 96;
var output_n = output_s * output_s *3;

var K = 32;

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
	input[i] = normRand( 0.0 , 0.25 );

    for( var j = 0; j < output_n; j++ )
	output[j] = 0.0;
    
    for( var i = 0; i < input_n; i++ )
	for( var j = 0; j < output_n; j++ )
	    output[j] += parseFloat(w[i][j]) * input[i];

    for( var j = 0; j < output_n; j++ )
	output[j] += parseFloat(b[j]);

    for( var j = 0; j < output_n; j++ )
	output[j] = sigmoid( output[j] );

    var avr = 0.0;
    for( var j = 0; j < output_n; j++ )
	avr += output[j];
    avr /= output_n;

    for( var j = 0; j < output_n; j++ )
	output[j] = Math.min( output[j] * 0.7 / avr , 1.0 );

    /*
    var minc = new Array(); minc[0] = minc[1] = minc[2] = 1.0;
    var maxc = new Array();
    for( var i = 0; i < output_s*output_s; i++ ){
	for( var k = 0; k < 3; k++ ){
	    minc[k] = Math.min( minc , output[i*3+k] );
	    maxc[k] = Math.max( maxc , output[i*3+k] );
	}
    }
    for( var i = 0; i < output_s*output_s; i++ ){
	for( var k = 0; k < 3; k++ ){
	    output[i*3+k] = ( output[i*3+k] - minc[k] ) / ( maxc[k] - minc[k] );
	}
    }
    */

    var cl = new Array();
    for( var i = 0; i < output_s * output_s; i++ )
	cl[i] = Math.floor( Math.random() * K );
    
    var ave = new Array();
    var cnt = new Array();
    for( var loop_cnt = 0; loop_cnt < 100; loop_cnt++ ){
	for( var i = 0; i < K; i++ ){
	    for( var j = 0; j < 3; j++ )
		ave[i*3+j] = 0.0;
	    cnt[i] = 0;
	}

	for( var i = 0; i < output_s*output_s; i++ ){
	    for( var j = 0; j < 3; j++ )
		ave[ cl[i]*3 + j ] += output[i*3+j];
	    cnt[ cl[i]*3 ]++;
	}

	for( var i = 0; i < K; i++ )
	    for( var j = 0; j < 3; j++ )
		if( cnt[i] > 0 ) ave[i*3+j] /= cnt[i];

	console.log( ave[0] );

	for( var i = 0; i < output_s*output_s; i++ ){
	    var minv = 3.0;
	    cl[i] = 0;
	    for( var j = 0; j < K; j++ ){
		var res = 0.0;
		for( var k = 0; k < 3; k++ )
		    res += Math.pow( output[i*3+k] - ave[j*3+k] , 2 );
		if( res < minv ){
		    minv = res;
		    cl[i] = j;
		}
	    }
	}
    }
    
    for( var i = 0; i < output_s; i++ ){
	for( var j = 0; j < output_s; j++ ){
	    var base = i * output_s + j;
	    pixels[base*4+0] = Math.floor( ave[cl[base]*3+0] * 256 );
	    pixels[base*4+1] = Math.floor( ave[cl[base]*3+1] * 256 );
	    pixels[base*4+2] = Math.floor( ave[cl[base]*3+2] * 256 );
	    pixels[base*4+3] = 255;
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

    xhr.open( "get" , "../dat" , true );
    xhr.send( null );
}
