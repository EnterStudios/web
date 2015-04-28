
module Controller {
    export class TriplerResultCtrl {

        trips;

        constructor($scope,  private TriplerService, private $rootScope, private $state, private $stateParams) {
            this.filteredQuery();
            this.$rootScope.tripselected = false;
        }

        filteredQuery() {
            this.TriplerService.filteredQue().then(result => {
                this.trips = result.data;
            })
        }

        selectTrip(_id) {
            this.$rootScope.tripselected = true;
        }

        deselectTrip() {
            this.$rootScope.tripselected = false;
        }

        static controllerId:string = "TriplerResultCtrl";
    }
}
