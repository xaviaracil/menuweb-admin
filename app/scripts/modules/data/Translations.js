// reference the module we declared earlier
angular.module('ExternalDataServices')

// add a factory
.factory('TranslationService', ['ParseQueryAngular', 'DishesService', 'TranslatedDishesService', function(ParseQueryAngular, DishesService, TranslatedDishesService) {

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
		addTranslation: function(language, restaurant, $rootScope, modal) {
	 		// save request_id to Parse
	 		var _this = this;

			var translation = new Translation;
			translation.setLanguage(language);
			translation.setCompleted(false);
			translation.setRestaurant(restaurant);

            $rootScope.progessAction = 'Getting dishes of ' + restaurant.getName();
            $rootScope.progress = 0;
            var dishesService = new DishesService.collection();
            dishesService.loadDishesOfRestaurant(restaurant).then(function(dishes) {
                var steps = 1 + _.size(dishes.models);
                var currentStep = 1;
                $rootScope.progress = (currentStep * 100) / steps;
                
    
                $rootScope.progessAction = 'Creating translation for ' + language;
    			// use the extended Parse SDK to perform a save and return the promised object back into the Angular world
    			return translation.saveParse().then(function(data){
                    // create translated dish for each dish
                    _.each(dishes.models, function(dish) {
                        $rootScope.progress = (++currentStep * 100) / steps;
                        $rootScope.progessAction = 'Creating initial translation for ' + dish.getName();
                        
                        var translatedDish = new TranslatedDishesService.model();
                        translatedDish.setName(dish.getName());
                        translatedDish.setTranslation(data);
                        translatedDish.setDish(dish);
                        translatedDish.saveParse().then(function(savedTranslatedDish) {
                            if(currentStep == steps) {
                                $rootScope.progress = 100;
                                $rootScope.progessAction = 'Created!';
    
                                if (modal) {
                                    $(modal).modal('hide');
                                }
                            } 
                        });
                    });
                    _this.add(data);
    			})
            });
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