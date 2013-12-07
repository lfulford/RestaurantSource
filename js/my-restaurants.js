            // Initialize the SDK by telling App Services which organization and application
            // this client app is making requests from.
            var client = new Apigee.Client({
                orgName:'lfulford', // Your organization name. You'll find this in the admin portal.
                appName:'sandbox' // Your App Services app name. It's in the admin portal.
            });
			
	    // GeoLocation Variable
	    var position;

	    // currently selected Restaurant for detail view
	    var currentRestaurant; 
	    
	    // Document Initialize Functions
	    $(document).ready(function(){
		    getRestaurants();
		    
		    // Add button event handler
		    $('#submit-button').click(function(){
			addRestaurant();
		    });
		    
							     
		    // Refresh the list of restaurants after any navigation.
		    $("#home-page").on( "pageshow", function(eventargs, toPage) {
			getRestaurants();
		    });
							    
		    // Get a specific restaurant detail on the detail page
		    $("#view-dialog").on( "pageshow", function(eventargs, toPage) {
			getCurrentRestaurant();
		    });
		    
		    // Delete button event handler
		    $('#delete-button').click(function(){
			deleteRestaurant();
		    })
		    
		    //navigator.geolocation.getCurrentPosition(geoSuccess, geoFailure);

								    
	    });
	    
	    function geoSuccess(result) {
			     position=result;
			     
	    }
	    function geoFailure(result){
			    //alert('failure'); 
	    }
	    
	    function getRestaurants() {
		$('#restaurant-list').empty();	
    			
                var restaurants = new Apigee.Collection({ "client":client, "type":"restaurants" });
                restaurants.fetch(
                    // Called if the collection request succeeds. Iterates through 
                    // the collection, displaying an alert message for each book.
                    function() {
    				
    			$('.restaurant-list').empty;
                        while(restaurants.hasNextEntity()) {
			    var restaurant = restaurants.getNextEntity();
			    var listControl = $('.restaurant-list');
    

			    var stringToAppend = '<li class="dataItem" data-theme="c" ' +
						 'data-name="' + restaurant.get("uuid") + '" ' +
						 '><a href="#view-dialog" data-transition="slide"><h3>' + 
						 restaurant.get("name") + 
						 '</h3><p>' + 
						 restaurant.get("city") + 
						 '</p></a></li>';
													  
    			    $('#restaurant-list').append(stringToAppend);
							
			    // Set the current item variable whenever a detailed list item is clicked
			    $('.dataItem').on("click", function(){
			       currentRestaurant = $(this).attr('data-name');
			    });						
    
                        }
    					
			$('#restaurant-list').listview("refresh");
                    // Called if the collection request fails. You'd probably want
                    // a more user-friendly and useful way to respond to this.
                    }, function() {
                        alert("Read failed.");
                    }
		);
			
	    };
			
	    function getCurrentRestaurant(){
               var properties = { 
                	'type':'restaurant',
                	'uuid': currentRestaurant
                }; 
                	
                client.getEntity(properties, function (error, response) { 
                	if (error) { 
                	  //error 
                	} else { 
			    var restaurantName, cityName;
			    restaurantName = response.get("name");
			    cityName = response.get("city"); 
			    
			    $('#name-display').text('Name: ' + restaurantName);
			    $('#city-display').text('City: ' + cityName);
					  
                	} 
                });
	    }
			
	    function addRestaurant(){
		var restaurantName = $('#name-field').val();
		var cityName = $('#city-field').val();
    
		var newRestaurant = {
			"name":restaurantName,
			"city":cityName
		}
		
		var restaurants = new Apigee.Collection({ "client":client, "type":"restaurants" });					 
					 
		// Send the new restaurant entity to App Services.
		restaurants.addEntity(newRestaurant, function (error, response) {
		    // If the attempt fails, display an error message.
		    if (error) {
			// You'll need a better message!
			alert("Write failed.");
		    } 
            });					 
					 
	
	}

	    function deleteRestaurant() {

	    //specify the properties of the entity to be deleted
	    //type is required. UUID or name of the entity to be deleted is also required
	    var properties = {
		    client:client,
		    data:{'type':'restaurant',
		    uuid: currentRestaurant
		    }
	    };

	    //create the entity object
	    var entity = new Apigee.Entity(properties);

	    //call destroy() to initiate the API DELETE request
	    entity.destroy(function (error) {
		    if (error) { 
			// Error
		    } else {
			currentRestaurant = null;
		    }
		}); 
	    }

