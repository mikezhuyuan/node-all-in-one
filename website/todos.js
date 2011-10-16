var Db = require('mongodb').Db
	, Connection = require('mongodb').Connection
	, Server = require('mongodb').Server;
	
var client = new Db('test', new Server('localhost', 4444, {}));	
function db_helper(crud_name){
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
		
		client.collection('users', function(err, collection) {
			//insert, findOne, update, findAll
			if(crud_name === 'findAll') {
				var find = collection.find()
					find.toArray.apply(find, params);
			} else {
				collection[crud_name].apply(collection, params);
			}
		});
	});
}

module.todos = {
	get : function(id, callback){
		db_helper('findOne', {_id:client.bson_serializer.ObjectID(id)}, callback);
	}, 
	
	all : function(callback){
		db_helper('findAll', callback);
	}, 
	
	remove : function(id, callback){
		db_helper('remove', {_id:client.bson_serializer.ObjectID(id)}, callback);
	},
	
	add : function(todo, callback){
		db_helper('insert', todo, callback);
	},
	
	update : function(id, todo, callback){
		db_helper('update'
			, {_id:db.bson_serializer.ObjectID(id)}
			, {$set: todo}
			, callback);
	}
};

//exports.todos.get('4e950ddfc4ee807c36000001', function(result){});
//exports.todos.remove('4e950ddfc4ee807c36000001', function(result){console.log(result)});