// reference the module we declared earlier
angular.module('ExternalDataServices')

// add a factory
.factory('DishesService', ['ParseQueryAngular', function(ParseQueryAngular) {

	var Dish = Parse.Object.extendAngular({
		className:"Dish",
		setName: function(name) {
			this.set('name', name);
			return this;
		},
		getName: function() {
			return this.get('name');
		},
		destroyParse:function(){
			return ParseQueryAngular(this,{functionToCall:"destroy"});
		}
	});

	var Dishes = Parse.Collection.extendAngular({
		model: Dish,
		comparator: function(model) {
			return -model.createdAt.getTime();
		},
		addDish: function(name) {
	 		// save request_id to Parse
	 		var _this = this;

			var dish = new Dish;
			dish.setName(name);

			// use the extended Parse SDK to perform a save and return the promised object back into the Angular world
			return translation.saveParse().then(function(data){
				_this.add(data);
			})
	 	},
	 	removeDish:function(dish) {
	 		if (!this.get(dish)) return false;
	 		var _this = this;
	 		return dish.destroyParse().then(function(){
	 			_this.remove(dish);
	 		});
	 	}
	});

	// Return a simple API : model or collection.
	return {
		model: Dish,
		collection: Dishes
	};

}]);