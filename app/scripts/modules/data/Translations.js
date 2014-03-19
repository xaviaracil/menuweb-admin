// reference the module we declared earlier
angular.module('ExternalDataServices')

// add a factory
.factory('TranslationService', ['ParseQueryAngular', function(ParseQueryAngular) {

	var Translation = Parse.Object.extendAngular({
		className:"Translation",
		setLanguage: function(language) {
			this.set('language',language);
			return this;
		},
		getLanguage: function() {
			return this.get('language');
		},
		setRestaurant: function(restaurant) {
    		this.set('restaurant', restaurant);
    		return this;
		},
		getRestaurant: function() {
    		return this.get('restaurant');
		},
		setCompleted: function(completed) {
    		this.set('completed', completed);
		},
		getCompleted: function() {
    		return this.get('completed');
		},
		destroyParse:function(){
			return ParseQueryAngular(this,{functionToCall:"destroy"});
		}
	});

	var Translations = Parse.Collection.extendAngular({
		model: Translation,
		comparator: function(model) {
			return -model.createdAt.getTime();
		},
		loadTranslations: function() {
			this.query = (new Parse.Query(Translation));
			this.query.descending('name');
			this.query.include('restaurant');
			// use the enhanced load() function to fetch the collection
			return this.load();
		},
		addTranslation: function(language) {
	 		// save request_id to Parse
	 		var _this = this;

			var translation = new Translation;
			translation.setLanguage(language);
			translation.setCompleted(false);

			// use the extended Parse SDK to perform a save and return the promised object back into the Angular world
			return translation.saveParse().then(function(data){
				_this.add(data);
			})
	 	},
	 	removeTranslation:function(translation) {
	 		if (!this.get(translation)) return false;
	 		var _this = this;
	 		return translation.destroyParse().then(function(){
	 			_this.remove(translation);
	 		});
	 	}
	});

	// Return a simple API : model or collection.
	return {
		model: Translation,
		collection: Translations
	};

}]);