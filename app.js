/**
* DB
*/
var mongoose = require( 'mongoose' );
var db = mongoose.connect( "mongodb://localhost/mysplashpage" );

var Schema = mongoose.Schema
	, ObjectId = Schema.ObjectId;

var ProjectIconSchema = new Schema({
	image : String ,
	target : String ,
	x : Number ,
	y : Number ,
	width : Number ,
	height : Number ,
	body : String
}); // ProjectIcon

var ProjectIcon = db.model( "ProjectIcon", ProjectIconSchema );

/**
 * Module dependencies.
 */

var app = require('express')()
  , server = require('http').createServer(app)
  , io = require('socket.io').listen(server);

server.listen(3123);

io.sockets.on( "connection", function(socket) { 
	ProjectIcon.find( {}, function(err, docs) { 
		socket.emit( "project icons down", docs );
		if ( err ) {
			socket.emit( "error down", err );
			console.log( err );
		} // if err
	} ); // find
	
	socket.on( "remove project icon up", function(id) { 
		ProjectIcon.findOneAndRemove( { _id : id }, function(err) { 
			console.log( err );
			socket.emit( "remove project icon down", err );
		} ); // findOneAndRemove
	} ); // remove project icon up
	
	socket.on( "project icon up", function(icon) { 
		if( icon['_id'] ) {
			var id = icon['_id']; 
			delete icon['_id'];
			ProjectIcon.findOneAndUpdate( { _id : id }, icon, function(err, doc) { 
				if ( err ) {
					socket.emit( "error down", err );
					console.log( err );
				} // if err
				socket.emit( "project icon down", doc )
			} ); // findOne
		} // if icon
		else { 
			(new ProjectIcon(icon) ).save( function(err) { 
				if ( err ) {
					socket.emit( "error down", err );
					console.log( err );
				} // if err
			} ); // save
		} // else
	} ); // on project icon up
} ); // on connection
