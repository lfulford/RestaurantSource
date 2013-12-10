            // Initialize the SDK by telling App Services which organization and application
            // this client app is making requests from.
            var client = new Apigee.Client({
                orgName:'lfulford', // Your organization name. You'll find this in the admin portal.
                appName:'sandbox' // Your App Services app name. It's in the admin portal.
            });
			
	    // GeoLocation Variable
	    var position;
	    var cheapHackLatitude = 33.8952734;
	    var cheapHackLongitude = -84.4955042;

	    var map;
	    var service;
	    var infowindow;
	    var googleRestaurant;
	    var searchName;

	    // currently selected Restaurant for detail view
	    var currentRestaurant;
	    var selectedPlaceDetail;
	    
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
		    
		    $('#find-button').click(function(){
			$('#add-map-canvas').show();
			var restaurantName = $('#name-field').val();
			var cityName = $('#city-field').val();
			searchForRestaurant(restaurantName);
		    })
		    
		    // Delete button event handler
		    $('#delete-button').click(function(){
			deleteRestaurant();
		    })
		    
		    // Locate current nearby position
		    navigator.geolocation.getCurrentPosition(geoSuccess, geoFailure);
		    

								    
	    });
	    
	    function geoSuccess(result) {
		position=result;
			     
	    }
	    function geoFailure(result){
		position = null; 
	    }

	    


	    function searchForRestaurant(restaurantName) {
	    
		googleRestaurant = null;
		searchName = restaurantName;
		
		if (position != null) {
		    cheapHackLatitude = position.coords.latitude;
		    cheapHackLongitude = position.coords.longitude;
		    //code
		}
		  var currentPlace = new google.maps.LatLng(cheapHackLatitude, cheapHackLongitude);
		
		  map = new google.maps.Map(document.getElementById('add-map-canvas'), {
		      center: currentPlace,
		      zoom: 10
		    });
		
		  var request = {
		    location: currentPlace,
		    radius: '500',
		    query: 'restaurant ' + restaurantName
		  };
	    
		service = new google.maps.places.PlacesService(map);
		service.textSearch(request, callback);
	    }
	    
	    function attachClickEvent(marker, place) {
		google.maps.event.addListener(marker, "click", function() {
		    // the reference to the marker will be saved in the closure
		    	    selectedPlaceDetail = place;
			     $('#submit-button .ui-btn-text').text('Found it!!!');
			     $('#name-field').val(selectedPlaceDetail.name);
			     $('#city-field').val(selectedPlaceDetail.formatted_address);
		});
	    }	    
	    
    
	    function callback(results, status) {
		if (status == google.maps.places.PlacesServiceStatus.OK) {
		    for (var i = 0; i < results.length; i++) {
			var place = results[i];
			if (place.name.toUpperCase().indexOf(searchName.toUpperCase()) != -1) {
			  googleRestaurant = place;
			}
			var marker = new google.maps.Marker({
			    map: map,
			    position: place.geometry.location,
			    title: place.name
			    });
			
			attachClickEvent(marker, place);
			
		    }
		}
		else {
		    console.log(status);
		}
	    }
	    
	    
	    function mapSearch() {
		
		//code
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
		
		// Clear the Add Map
		// $('#add-map-canvas').hide();
			
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
		
		searchForRestaurant(restaurantName);
		if (googleRestaurant != null) {
		    console.log(googleRestaurant);
		}
		
    
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

