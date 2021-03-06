module Controller {

    export class EditTripCtrl {

        showPreview = false;
        error = false;
        validationFails = false;

        setUpLocationsHasBeenFired:boolean = false;

        dateValid = true;

        tripId;
        myLocations = [];
        publicLocations = [];
        selectedLocations = [];

        slides = [];

        editDataAvailable = false;

        showCities:string = 'showCitiesCreate';
        showMoods:string = 'showMoodsCreate';
        showDays:string = 'showDaysCreate';

        moods:any;
        open:any;
        selectedMood:any;
        filledLocations;

        datePickerOnLinked = false;

        justShowMyLocations:boolean = false;

        cities:any;
        selectedCity:any;

        days:any;
        selectedDay:any;

        tripMeta:any = {
            title: '',
            persons: '',
            accommodation: false,
            description: '',
            start_date: '',
            end_date: '',
            accommodation_equipment: [],
            city: {}
        };

        accommodationEquipmentSelectable = true;
        dataAvailable:boolean = false;
        locationSearch = '';

        static $inject = ['$analytics', 'UtilityService', 'smoothScroll', '$q', 'lodash', '$scope', '$rootScope', '$state', '$location', 'InsertTripService', 'TripService', 'LocationService', 'DataService', 'HelperService', 'ErrorService'];

        constructor(private $analytics, private UtilityService, private smoothScroll, private $q, private lodash, private $scope, private $rootScope, private $state, private $location, private InsertTripService, private TripService, private LocationService, private DataService, private HelperService, private ErrorService) {

            if ($state.current.name === 'insertTrip') {
                this.$rootScope.breadcrumb = 'Trip einstellen';
                this.$scope.$emit('updateTitle', 'Trip einstellen');

                this.$scope.$emit('updateOgElements', {
                    title: 'Zeige deine Stadt!',
                    description: 'Erstelle einen Trip mit deinen Lieblingslocations und zeige Fremden oder Freunde deine Stadt',
                    url: window.location.href,
                    image: ''
                });
            }

            var moods = this.DataService.getMoods();
            var cities = this.DataService.getFixedCities();
            var days = this.DataService.getAvailableAmountOfDays();

            this.$q.all([moods, cities, days])
                .then((responsesArray) => {

                    this.moods = responsesArray[0].data;
                    this.cities = responsesArray[1].data;
                    this.days = responsesArray[2].data;
                    this.dataAvailable = true;


                    if (!this.$state.params.tripId) {
                        this.selectedMood = HelperService.getObjectByQueryName(this.moods, $state.params.moods) || this.moods[Math.floor((Math.random() * this.moods.length))];
                        this.selectedCity = HelperService.getCityByTitle(this.cities, $state.params.city) || this.cities[Math.floor((Math.random() * this.cities.length))];
                        this.selectedDay = HelperService.getObjectByQueryName(this.days, $state.params.days) || this.days[Math.floor((Math.random() * this.days.length))];

                        //this.fetchLocations();
                    }

                    if (this.$state.params.city) {
                        this.selectedCity = HelperService.getCityByTitle(this.cities, $state.params.city);
                    }


                    this.initEdit();

                    $scope.$watch(angular.bind(this, () => {
                        return this.selectedCity;
                    }), (newVal, oldVal) => {
                        if (newVal !== oldVal) {
                            this.setUpLocations();
                        }
                    });
                    if (!$state.params.tripId) this.setUpLocations();
                });
        }

        setUpLocations() {

            if (this.setUpLocationsHasBeenFired) {
                return;
            }

            this.setUpLocationsHasBeenFired = true;
            this.fetchLocations();
            this.selectedLocations = [];
            if (!this.$state.params.tripId) this.$location.search('city', this.selectedCity.title);
        }

        toggleAccommodation() {
            this.tripMeta.accommodation = !this.tripMeta.accommodation;
            if (this.tripMeta.accommodation) {
                this.accommodationEquipmentSelectable = true;
            } else {
                this.tripMeta.accommodationEquipment = [];
                this.accommodationEquipmentSelectable = false;
            }
        }

        fetchLocations() {

            var public_locations = this.LocationService.getLocationsByCity(this.selectedCity.place_id);
            var private_locations = this.LocationService.getMyLocationsByCity(this.selectedCity.place_id);

            this.$q.all([public_locations, private_locations])
                .then((responsesArray) => {

                    this.publicLocations = responsesArray[0].data;
                    this.myLocations = responsesArray[1].data;


                    if (this.$state.params.tripId) {
                        //get preselected trips
                        this.fillSelectedLocations();
                    }

                    if (this.InsertTripService.getStateStored() && this.$state.params.tmp) {
                        this.getStoredTripValues();
                    }

                });


        }

        selectLocation(location) {

            var _public = this._removeLocation(this.publicLocations, location);
            var _private = this._removeLocation(this.myLocations, location);

            location.opened = false;

            if (_public && _private) {
                this._addLocation(this.selectedLocations, location, 'both');

            } else if (_public) {
                this._addLocation(this.selectedLocations, location, 'public');

            } else if (_private) {
                this._addLocation(this.selectedLocations, location, 'private');
            }

            this.buildSlidesArray();

        }

        deSelectLocation(locationtodeselect) {

            this._removeLocation(this.selectedLocations, locationtodeselect);

            if (locationtodeselect.origin === 'both') {
                this.publicLocations.push(locationtodeselect);
                this.myLocations.push(locationtodeselect);

            } else if (locationtodeselect.origin === 'private') {
                this.myLocations.push(locationtodeselect);

            } else if (locationtodeselect.origin === 'public') {
                this.publicLocations.push(locationtodeselect);
            }

            this.buildSlidesArray();
        }

        _removeLocation(locations, locationtoremove) {
            var index = this.lodash.findIndex(locations, {'_id': locationtoremove._id});
            if (index === -1) return false;
            locations.splice(index, 1);
            return true;
        }

        _addLocation(locations, locationtoadd, origin) {
            locationtoadd.origin = origin;
            locations.push(locationtoadd);
        }

        getSelectedLocations() {

            var sl = {};
            this.selectedLocations.forEach(location => {
                sl[location._id] = location.images;
            });

            return sl;
        }

        buildSlidesArray() {

            this.slides = [];

            this.selectedLocations.forEach((location:any) => {
                if (location.images.picture) {
                    this.slides.push(location.images.picture);
                }
                this.slides.push(location.images.googlemap + '&size=640x375&scale=2');
            });

        }

        tripPreview() {

            this.$analytics.eventTrack('trigger trippreview');

            if (this.selectedLocations.length === 0) {

                this.error = true;


                var element = document.getElementById('page-top');
                this.smoothScroll(element, {offset: 60});

                return;
            } else {

                if (this.tripMeta.start_date && !this.tripMeta.end_date) {
                    this.tripMeta.end_date = this.tripMeta.start_date;
                }

                this.error = false;
            }


            this.showPreview = true;
            var element = document.getElementById('tripviewpreview');
            this.smoothScroll(element);
        }

        //optional
        dateValidation() {

            if (this.tripMeta.start_date === "Invalid date" || this.tripMeta.end_date === "Invalid date") {
                this.dateValid = false;
            } else if (this.tripMeta.start_date === "" || this.tripMeta.end_date === "") {
                this.dateValid = false;
            } else {
                this.dateValid = true;
            }

        }

        saveTrip() {
            var trip = this.tripMeta;
            trip.city = this.selectedCity;
            trip.days = this.selectedDay.id;
            trip.moods = [this.selectedMood.query_name];

            trip.locations = this.getSelectedLocations();

            if (this.tripMeta.title < 2 || this.tripMeta.description < 2) {
                this.validationFails = true;
                return;
            }

            // remove undefined or empty fields
            for (var key in trip) {
                if (trip.hasOwnProperty(key)) {

                    if (key !== 'accommodation') {
                        if (!trip[key]) {
                            delete trip[key];
                        }
                    }

                }
            }

            this.TripService.saveTrip(trip, this.tripId)
                .then(result => {

                    this.$rootScope.lastInsertedTripId = result.data.id;

                    //get an image for succes page
                    for (var prop in trip.locations) {
                        this.$rootScope.successImg = trip.locations[prop].picture || (trip.locations[prop].googlemap + '&size=640x375&scale=2');
                        break;
                    }

                    if (this.$state.params.tripId) {
                        this.$analytics.eventTrack('trip edit success');
                    } else {
                        this.$analytics.eventTrack('trip create success');
                    }

                    this.$state.go('editTripSuccess');

                })
                .catch(err => {
                    var timestamp = Date.now();
                    // set error with according timestamp
                    this.ErrorService.setError(timestamp, err.data);
                    // redirect to error-page and supply timestamp as param
                    this.$state.go('error', {
                        t: timestamp
                    });
                });
        }

        initEdit() {
            if (this.$state.params.tripId) {
                this.tripId = this.$state.params.tripId;
                this.datePickerOnLinked = true;

                this.TripService.getTripById(this.$state.params.tripId)
                    .then(result => {

                        this.tripMeta.start_date = result.data.start_date;
                        this.tripMeta.end_date = result.data.end_date;

                        this.tripMeta.description = result.data.description;
                        this.tripMeta.title = result.data.title;
                        this.tripMeta.persons = result.data.persons;
                        this.tripMeta.accommodation = result.data.accommodation;

                        this.selectedDay = this.HelperService.getObjectById(this.days, result.data.days);
                        this.selectedCity = this.HelperService.getCityByTitle(this.cities, result.data.city.title);
                        this.selectedMood = this.HelperService.getObjectByQueryName(this.moods, result.data.moods.join('.'));


                        this.$rootScope.breadcrumb = 'Trip bearbeiten | ' + this.tripMeta.title;
                        this.$scope.$emit('updateTitle', 'Trip bearbeiten');


                        this.filledLocations = result.data.locations;

                        //city is set, so get the locations for it
                        this.fetchLocations();

                        if (this.tripMeta.accommodation) {
                            this.tripMeta.accommodation_equipment = result.data.accommodation_equipment;
                            this.accommodationEquipmentSelectable = true;
                        }

                        this.editDataAvailable = true;


                    }).catch(err => {
                        console.info('error gettin trip', err);
                    })
            }
        }

        //this should be triggered when editing a trip
        fillSelectedLocations() {

            var allLocations;
            var alreadySortedIn = [];

            for (var key in this.filledLocations) {

                this.LocationService.getLocationById(key).then(result => {
                    this.selectLocation(result.data);
                    this.selectedLocations = this.uniqueList(this.selectedLocations);
                });
            }

        }

        //create new location and save context
        createNewLocation() {

            var data = {
                formData: this.tripMeta,
                city: this.selectedCity,
                day: this.selectedDay,
                mood: this.selectedMood,
                locations: this.selectedLocations,
                accommodation_equipment: this.tripMeta.accommodation_equipment,
                accommodation: this.tripMeta.accommodation,
                tripId: this.tripId
            };


            this.InsertTripService.setStateStored(true);
            this.InsertTripService.storeAllValues(data);

            this.$state.go('insertLocation', {tmp: 'true'});
        }


        getStoredTripValues() {

            var data = this.InsertTripService.getAllValues();

            this.tripMeta = data.formData;


            this.selectedDay = data.day;
            this.selectedMood = data.mood;

            this.editDataAvailable = true;
            this.datePickerOnLinked = true;

            this.tripMeta.accommodation_equipment = data.accommodation_equipment;
            this.tripMeta.accommodation = data.accommodation;

            //select stored locations
            data.locations.forEach(item => {
                this.selectLocation(item);
            });

            this.LocationService.getLocationById(this.InsertTripService.newCreatedLocationId).then(result => {
                this.selectLocation(result.data);
                this.selectedLocations = this.uniqueList(this.selectedLocations);

                var locationSelectable = !!this.lodash.findWhere(this.cities, {'place_id': result.data.city.place_id});
                if (!locationSelectable) {
                    this.UtilityService.betaMsg('Vielen Dank für deine Location', 'Du kannst momentan nur Trips in Konstanz erstellen. Sammle weiter Locations und Locator ist auch bald in deiner Stadt.');
                }
            });


            //set false on successful fetch
            this.InsertTripService.setStateStored(false);
        }

        uniqueList(list) {
            return this.lodash.uniq(list, '_id');
        }

        triggerPrevew(location) {

            if (!location.opened) {
                location.opened = true;
            } else {
                location.opened = !location.opened;
            }
        }

        setPersons(value) {

            if (this.tripMeta.persons === value) {
                this.tripMeta.persons = '';
            } else {
                this.tripMeta.persons = value;
            }
        }


        static controllerId:string = "EditTripCtrl";
    }
}
