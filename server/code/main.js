var _ = require('underscore');

// Update restaurant normalizedName for searching
Parse.Cloud.beforeSave("Restaurant", function(request, response) {
    var name = request.object.get("name");
    request.object.set("normalizedName", name.toLowerCase());
    response.success();
});

// prevent the creation of Translation of same restaurant and language
Parse.Cloud.beforeSave("Translation", function(request, response) {
    if (!request.object.isNew()) {
        console.log('object is not new');
        response.success();
    } else {
        var query = new Parse.Query("Translation");
        query.equalTo('restaurant', request.object.get("restaurant"));
        query.equalTo('language', request.object.get("language"));
        query.find({
            success: function(translations) {
                if (translations && translations.length > 0) {
                    response.error('Another translation for the same restaurant and language already exists');
                } else {
                    response.success();
                }
            },
            error: function(error) {
                console.error("Got an error " + error.code + " : " + error.message);
                response.error('Error validating tranlation: ' + error.message);
            }
        });
    }
});

// update translation calculated attributes in Restaurant
Parse.Cloud.afterSave("Translation", function(request, response) {
    var language = request.object.get("language");
    var restaurant = request.object.get("restaurant");
    var query = new Parse.Query("Translation");
    query.equalTo('restaurant', restaurant);
    query.find({
        success: function(translations) {
			var translated = true;
			_.each(translations, function(translation) {
				if (!translation.get("completed")) {
					translated = false;
				}
			});
			var restQuery = new Parse.Query("Restaurant");
			restQuery.get(restaurant.id, {
                success: function(restaurant) {
                    restaurant.set('translated', translated);
                    restaurant.set('translationNumber', _.size(translations));
                    restaurant.addUnique('languages', language);
                    restaurant.save(null, {
                        success: function(restaurant) {
                        },
                        error: function(restaurant, error) {
                            console.error("Got an error " + error.code + " : " + error.message);
                        }
                    });
                },
                error: function(error) {
                    console.error("Got an error " + error.code + " : " + error.message);
                }
			})
        },
        error: function(error) {
            console.error("Got an error " + error.code + " : " + error.message);
        }
    });
});

// delete translated dishes after deleting a dish
Parse.Cloud.afterDelete("Dish", function(request) {
    var query = new Parse.Query("TranslatedDish");
    query.equalTo("dish", request.object);
    query.find({
        success: function(translatedDishes) {
            Parse.Object.destroyAll(translatedDishes, {
               success: function() {},
               error: function(error) {
                   console.error("Error deleting translated dishes " + error.code + " : " + error.message);
               }
            });
        },
        error: function(error) {
            console.error("Error finding translated dishes " +  error.code + " : " + error.message);
        }
    });
});

Parse.Cloud.afterDelete("Translation", function(request) {
    // delete translated dishes after deleting a translation
    var query = new Parse.Query("TranslatedDish");
    query.equalTo("translation", request.object);
    query.find({
        success: function(translatedDishes) {
            Parse.Object.destroyAll(translatedDishes, {
               success: function() {},
               error: function(error) {
                   console.error("Error deleting translated dishes " + error.code + " : " + error.message);
               }
            });
        },
        error: function(error) {
            console.error("Error finding translated dishes " +  error.code + " : " + error.message);
        }
    });

    // delete translated categories after deleting a translation
    query = new Parse.Query("TranslatedCategory");
    query.equalTo("translation", request.object);
    query.find({
        success: function(translatedCategories) {
            Parse.Object.destroyAll(translatedCategories, {
               success: function() {},
               error: function(error) {
                   console.error("Error deleting translated categories " + error.code + " : " + error.message);
               }
            });
        },
        error: function(error) {
            console.error("Error finding translated categories " +  error.code + " : " + error.message);
        }
    });

    // update calculated field in restaurants table
    var restaurant = request.object.get("restaurant");
    var language = request.object.get("language");
		var restQuery = new Parse.Query("Restaurant");
		restQuery.get(restaurant.id, {
		  success: function(restaurant) {
		    restaurant.remove('languages', language);
		    restaurant.save();
		  },
      error: function(error) {
        console.error("Error finding restaurant " +  error.code + " : " + error.message);
      }
		});

});

Parse.Cloud.afterDelete("Restaurant", function(request) {
    // delete translations after deleting a Restaurant
    var query = new Parse.Query("Translation");
    query.equalTo("restaurant", request.object);
    query.find({
        success: function(translations) {
            Parse.Object.destroyAll(translations, {
               success: function() {},
               error: function(error) {
                   console.error("Error deleting translations " + error.code + " : " + error.message);
               }
            });
        },
        error: function(error) {
            console.error("Error finding translations " +  error.code + " : " + error.message);
        }
    });
    // delete categories after deleting a Restaurant
    var query = new Parse.Query("Category");
    query.equalTo("restaurant", request.object);
    query.find({
        success: function(categories) {
            Parse.Object.destroyAll(categories, {
               success: function() {},
               error: function(error) {
                   console.error("Error deleting categories " + error.code + " : " + error.message);
               }
            });
        },
        error: function(error) {
            console.error("Error finding categories " +  error.code + " : " + error.message);
        }
    });
});

// delete translated categories after deleting a Category
Parse.Cloud.afterDelete("Category", function(request) {
    var query = new Parse.Query("TranslatedCategory");
    query.equalTo("category", request.object);
    query.find({
        success: function(translatedCategories) {
            Parse.Object.destroyAll(translatedCategories, {
               success: function() {},
               error: function(error) {
                   console.error("Error deleting translated categories " + error.code + " : " + error.message);
               }
            });
        },
        error: function(error) {
            console.error("Error finding translated categories " +  error.code + " : " + error.message);
        }
    });
});

// two methods to retrieve languages and price ranges
Parse.Cloud.define("languages", function(request, response) {
    response.success([{id:'es', name:'Castellano'}, {id:'ca', name:'Català'}, {id:'en', name:'English'}, {id:'fr', name:'Française'}]);
});

Parse.Cloud.define("priceranges", function(request, response) {
    response.success([{id:0, name:'Hasta 15€'}, {id:1, name:'De 15€ a 25€'}, {id:2, name:'De 25€ a 35€'}, {id:3, name:'De 35€ a 50€'}, {id:4, name:'Más de 50€'}]);
});
