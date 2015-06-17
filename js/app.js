//info for markers to be placed on a map
var initialMarkers = [
{
	name: 'Shedd Aquarium‎',
	longitute :41.8675241,
	latitude: -87.6138598,
  wikiTitle: 'Shedd Aquarium‎',
  category: 'museum'
},
{
	name: 'Art Institute of Chicago‎',
	longitute :41.8795473,
	latitude: -87.6237238,
  wikiTitle: 'Art Institute of Chicago‎',
  category: 'museum'
},
{
	name: 'The Field Museum',
	longitute :41.8661733,
	latitude: -87.6169862,
  wikiTitle: 'The Field Museum Of Natural History',
  category: 'museum'
},
{
	name: 'Museum of Contemporary Art',
	longitute :41.8971555,
	latitude: -87.6212870,
  wikiTitle: 'Museum of Contemporary Art, Chicago‎',
  category: 'museum'
},
{
	name: 'Adler Planetarium',
	longitute :41.8663805,
	latitude: -87.6068281,
  wikiTitle: 'Adler Planetarium',
  category: 'museum'

},
{
	name: 'Millennium Park',
	longitute :41.883112,
	latitude: -87.621845,
  wikiTitle: 'Millennium Park',
  category: 'park'

},
{
	name: 'Grant Park',
	longitute :41.884324,
	latitude: -87.619372,
  wikiTitle: 'Grant Park (Chicago)',
  category: 'park'
},
{
	name: 'Burnham Park',
	longitute :41.875789,
	latitude: -87.618975,
  wikiTitle: 'Burnham Park  (Chicago)',
  category: 'park'
},
]

var markers = [];

var theSummary = "";
var theArticles = "";

//default map options with coordinates for Chicago downtown
var mapOptions = {
    zoom: 14,
    center: new google.maps.LatLng(41.875, -87.60),
    mapTypeControl: true,
    mapTypeControlOptions: {
      style: google.maps.MapTypeControlStyle.DEFAULT,
      mapTypeIds: [
        google.maps.MapTypeId.ROADMAP,
        google.maps.MapTypeId.TERRAIN
      ]
    },
    zoomControl: true,
    zoomControlOptions: {
      style: google.maps.ZoomControlStyle.SMALL
    }
};


//initialize map and display within map-canvas div
var map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);

var infowindow = new google.maps.InfoWindow();

var SearchViewModel = function(){

  var self = this;

	//initialize an array
	this.attractionsList = ko.observableArray([]);

	//loop over markers and store them into array
	initialMarkers.forEach(function(attractionItem){
		self.attractionsList.push( new Attraction(attractionItem));
	});


	this.currentAttraction = ko.observable(this.attractionsList()[0]);

	//triggered when list element is clicked
	this.setAttraction = function(clickedAttraction){

    //clear out all markers
    for (var i in markers) {
      markers[i].setMap(null);
    }

    self.currentAttraction(clickedAttraction);
    colorMarker(self.currentAttraction().category());

    markerCurrent = new google.maps.Marker({
              position: new google.maps.LatLng(self.currentAttraction().longitute(), self.currentAttraction().latitude()),
              map: map,
              icon: icon,
              animation: google.maps.Animation.DROP,

    });


    markers.push(markerCurrent);

 		//display attraction name in the info window
		infowindow.setContent(self.currentAttraction().name());
		//open up info window
    infowindow.open(map, markerCurrent);


    //close info window after 10 secs
    setTimeout(function () { infowindow.close(); }, 10000);

     //clear out search box
    document.getElementById('search').value = '';

    var $wikiElem = $('#wikipedia-links');

    //display a msg if data is not recieved back within 8 secs
    var wikiRequestTimeout = setTimeout(function(){
        $wikiElem.text('Additional information thru wikipedia is currently unavailale');
    }, 8000);

    //wiki end point url plus params to search on
    var wikiURL = 'http://en.wikipedia.org//w/api.php?action=opensearch&format=json&search='+self.currentAttraction().wikiTitle();

    // clear out old data before new request
    $wikiElem.text("");

    //make an ajax call to wiki api
    $.ajax({
        url: wikiURL,
        dataType: "jsonp",
        success: function(response){

          theSummary = response[2];
          theArticles = response[1];

            //if summary is empty, display an instruction to click on a link
            if(JSON.stringify(theSummary).length == 4){
                 theSummary= 'Click on the link above for more info';
            }else if(JSON.stringify(theSummary).length >400){
                theSummary = JSON.stringify(theSummary).substring(2,400) + '...';
            }

            articleStr = theArticles[0];

            //disply ordered list containing link to an attraction selected and a short description
            var url = 'http://en.wikipedia.org/wiki/' + articleStr;
                 $wikiElem.append('<li class="article">' +
                     '<a href="' + url+ '">' +articleStr + '</a></li>'+
                     '<li>' + theSummary + '</li>');

            //trigger user friendly error msg if error/or takes too long
            clearTimeout(wikiRequestTimeout);

        },
    });
	};


    //filter display markers on radio button filter selection
    this.filterClick = function(box, type) {

      //clear out map markers
      setAllMap(null);

      //clear markers array of existing values
      markers=[];


         for (var i=0; i< markers.length; i++) {
            marker = new google.maps.Marker({
            position: new google.maps.LatLng(markers[i].longitute,  markers[i].latitude),
            map: map,
            icon: icon,
            visible: false,
             })
        }

      //clear out search box
      document.getElementById('search').value = '';

      //clear wiki description
      var $wikiElem = $('#wikipedia-links');
      $wikiElem.text("");


      //loop over markers array
      for (var i=0; i<initialMarkers.length; i++) {

         //icon locgic based on category
          if(initialMarkers[i].category == 'park') {
                  icon = 'http://maps.google.com/mapfiles/ms/icons/green-dot.png';
          } else {
                  icon = 'http://maps.google.com/mapfiles/ms/icons/red-dot.png';
          }


          if(type == 'all' || initialMarkers[i].category == type){
            marker = new google.maps.Marker({
            position: new google.maps.LatLng(initialMarkers[i].longitute, initialMarkers[i].latitude),
            map: map,
            icon: icon,
            visible: true,
             })

          }else{
            marker = new google.maps.Marker({
            position: new google.maps.LatLng(initialMarkers[i].longitute, initialMarkers[i].latitude),
            map: map,
            icon: icon,
            visible: false,
             })
        }


         google.maps.event.addListener(marker, 'click', (function(marker, i) {
          return function() {
              infowindow.setContent(initialMarkers[i].name);
              infowindow.open(map, marker);
              }
       })(marker, i));

         //store new filetered markers into array
          markers.push(marker);

    }

        //display markers on the map
       setAllMap(map);




  }


    //triggered when value is entered into search box and search button is clicked
    this.searchClick = function() {
         var theSearch = $('#search').val().toUpperCase();
         //clear out map markers
         setAllMap(null);
         //clear markers array of existing values
         markers=[];

         document.getElementById('all').checked=true;

         //clear wiki description
         var $wikiElem = $('#wikipedia-links');
         $wikiElem.text("");


         //loop over markers array
         for (var i=0; i<initialMarkers.length; i++) {
            //look in name attribute of each marker and if a match, proceed
            if (initialMarkers[i].name.toUpperCase().indexOf(theSearch) !== -1) {

             if(initialMarkers[i].category == 'park') {
                icon = 'http://maps.google.com/mapfiles/ms/icons/green-dot.png';
             } else {
                    icon = 'http://maps.google.com/mapfiles/ms/icons/red-dot.png';
             }


             marker = new google.maps.Marker({
                position: new google.maps.LatLng(initialMarkers[i].longitute, initialMarkers[i].latitude),
                map: map,
                icon: icon,
                visible: true,

            });


               google.maps.event.addListener(marker, 'click', (function(marker, i) {
                return function() {
                    infowindow.setContent(initialMarkers[i].name);
                    infowindow.open(map, marker);
                    }
             })(marker, i));


            //store new filetered markers into array
            markers.push(marker);

            }
        }

          //display markers on the map
          setAllMap(map);


    }


    this.setAllMap = function(map) {
      for (var i = 0; i < markers.length; i++) {
        markers[i].setMap(map);
      }

    }


}


var Attraction = function(data){
	this.name = ko.observable(data.name);
	this.longitute = ko.observable(data.longitute);
	this.latitude = ko.observable(data.latitude);
  this.wikiTitle = ko.observable(data.wikiTitle);
  this.category = ko.observable(data.category);

}

var colorMarker = function(type){
  if(type == 'park') {
      icon = 'http://maps.google.com/mapfiles/ms/icons/green-dot.png';
   } else {
          icon = 'http://maps.google.com/mapfiles/ms/icons/red-dot.png';
   }

}




// runs on page load
function initialize() {
        var  marker, i;

  //loop over markers and place on maps
  for (i = 0; i < initialMarkers.length; i++) {

       // change to differentiate marker type based on category
      if (initialMarkers[i].category == 'park') {
          icon = 'http://maps.google.com/mapfiles/ms/icons/green-dot.png';
      } else {
          icon = 'http://maps.google.com/mapfiles/ms/icons/red-dot.png';
      }

      marker = new google.maps.Marker({
          position: new google.maps.LatLng(initialMarkers[i].longitute, initialMarkers[i].latitude),
          map: map,
          icon: icon,
          visible: true,

      });



      // open up info window on marker click
      google.maps.event.addListener(marker, 'click', (function(marker, i) {

          return function() {
              infowindow.setContent(initialMarkers[i].name);
              infowindow.open(map, marker);
              }
       })(marker, i));

      //store markers into array
      markers.push(marker);

   };
}


google.maps.event.addDomListener(window, 'load', initialize);
ko.applyBindings(SearchViewModel);

