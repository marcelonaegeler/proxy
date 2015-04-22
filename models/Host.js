module.exports = function(mongoose) {

	var HostSchema = new mongoose.Schema({
		domain: { type: String }
		, port: { type: String }
	});
	var Host = mongoose.model('Host', HostSchema);

	function register(data, callback) {
		var newHost = new Host({
			domain: data.domain
			, port: data.port
		});

		newHost.save(function(err) {
			if(err)
				return callback(true);
			return callback(false);
		});
	}

	function listAll(callback) {
		Host.find({}, {}, function(err, docs) {
			callback(docs);
		});
	}

	function getData(id, callback) {
		Cliente.findOne({ _id: id }, {}, function(err, docs) {
			if(docs)
				return callback(docs);
			return callback(false);
		});
	}

	function deleteItem(id, callback) {
		Host.findOne({ _id: id }, function(err, docs) {
			if(docs) {
				docs.remove();
				return callback(false);
			}
			return callback(err);
		});
	}

	return {
		Host: Host
		, register: register
		, listAll: listAll
		, deleteItem: deleteItem
	}
}