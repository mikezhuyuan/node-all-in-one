// Dependencies
var express = require('express')
  , app = module.exports = express.createServer()
  , _ = require('underscore')
  , db = require('mongodb')
  , connect = db.connect
  , Db = require('mongodb').Db
  , Connection = require('mongodb').Connection
  , Server = require('mongodb').Server;

// Configuration
app.configure(function(){
    app.set('views', __dirname + '/views');
    app.set('view engine', 'jade');
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(app.router);
    app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
	app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
	app.use(express.errorHandler());
});

// Routes
app.get('/', function(req, res){
	res.redirect('/index.html');
});

app.get('/todo', function(req, res){	
	new Todos().all(function(result){
		res.json(result);
	});   
});

app.get('/todo/:id', function(req, res){	
	var id = req.params.id;
	
	new Todos().get(id, function(result){
		res.json(result);
	});    
});

app.put('/todo/:id', function(req, res){	
	var id = req.params.id;
	var todo = req.body;
		
	new Todos().update(id, todo, function(result){
		res.json(result);
	});  
});

app.post('/todo', function(req, res){		
	var todo = req.body;
	
	new Todos().add(todo, function(result){
		res.json(result[0]);
	});
});

app.delete('/todo/:id', function(req, res){	
	var id = req.params.id;
	
	new Todos().remove(id, function(result){
		res.json(result);
	});
});

// Data Access
var Todos = function(){	
	this.client = new Db('todos', new Server('localhost', 4444, {}));
}

Todos.prototype = {
	get : function(id, callback){
		this.db_helper('findOne', {_id:this.client.bson_serializer.ObjectID(id)}, callback);
	}, 
	
	all : function(callback){
		this.db_helper('findAll', callback);
	}, 
	
	remove : function(id, callback){
		this.db_helper('remove', {_id:this.client.bson_serializer.ObjectID(id)}, callback);
	},
	
	add : function(todo, callback){
		this.db_helper('insert', todo, callback);
	},
	
	update : function(id, todo, callback){
		//trick: clone so will not modify original values and remove _id, otherwise unable to update
		todo = _.extend({}, todo);
		delete todo._id;
		
		this.db_helper('update'
			, {_id:this.client.bson_serializer.ObjectID(id)}
			, {$set: todo}
			, callback);
	},
	
	db_helper : function(crud_name){	
		var client = this.client;
		
		var args = Array.prototype.slice.apply(arguments)
			, params = args.slice(1)
			, callback = params[params.length - 1];
		
		client.open(function(err, client) {	
			params[params.length - 1] = function(err, result){
				console.log(crud_name);
				console.log(result);
								
				callback(result);	
				console.log('client closed');			
				client.close();
			};
			
			client.collection('items', function(err, collection) {
				//insert, findOne, update, findAll
				if(crud_name === 'findAll') {
					var find = collection.find();
					find.toArray.apply(find, params);
				//forward method to mongo
				} else {
					collection[crud_name].apply(collection, params);
				}
			});
		});
	}
};

//Start
app.listen(3333);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);