module Controller {
    export class WelcomeCtrl {

        mood:any;
        moods:any;
        open:any;
        selectedMood:any;

        cities:any;
        selectedCity:any;

        constructor(private $scope, private $rootScope, private $element, private DataService) {
            $rootScope.showSearchButton = false;
            $rootScope.showCreateButton = false;
            this.mood = "Initial";

            this.DataService.getMoods().then(result => {
                this.moods = result.data;
                this.selectedMood = this.moods[0];
            });

            this.DataService.getAvailableCities().then(result => {
                this.cities = result.data;
                //init random city
                this.selectedCity = this.cities[Math.floor((Math.random() * this.cities.length))];
            });


        }


        static controllerId:string = "WelcomeCtrl";
    }
}
