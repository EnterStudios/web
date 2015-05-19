interface JQuery {
    cropper(): JQuery;
    cropper(options:any): JQuery;
}


module Controller {

    export class InsertTripCtrl {

        activeItem:string = '';
        persons:number = 1;
        days:number = 1;
        accomodation:boolean = false;
        tripCity:string = '';
        tripTitle:string = '';
        tripDescription:string = '';
        tripDescriptionMoney:string = '';
        selectedPlaceDetails:any;
        accomodationEquipment:string[] = [];
        progressPercentage:any;
        googlePlacesOptions = {
            country: 'de',
            types: '(cities)'
        };

        showImageUploadModal:boolean = false;
        imagePath:any;
        selectedImage:any;
        imageCropData:any;
        cropperElem:any;
        imageHasBeenUploaded:boolean;
        headerImagePath:string;

        constructor(private $scope, private $rootScope, private InsertTripService, private Upload, private basePath) {
            this.$scope.selectImage = this.selectImage;
            $scope.$on('mapentrySelected', (event, details)  => {
                this.selectedPlaceDetails = details;
            });

            $rootScope.overlay = false;
        }

        isActive(item) {
            return item == this.activeItem;
        }

        addImage() {
            this.$rootScope.overlay = true;
            this.imageChoice();
        }

        selectImage(file) {
            this.$rootScope.overlay = true;
            this.showImageUploadModal = true;
            if (file.files && file.files[0]) {
                var reader = new FileReader();
                var image = new Image();
                this.selectedImage = file.files[0];
                reader.readAsDataURL(file.files[0]);
                reader.onload = (_file) => {

                    this.imagePath = _file.target;
                    this.$scope.$apply();
                    this.addImage();
                }
            }
        }

        toggleAccomodation() {
            this.accomodation = !this.accomodation;

            if (!this.accomodation) {
                this.accomodationEquipment = [];
            }
        }

        showImageChooser() {
            $('#image-upload').click();
        }

        imageChoice() {
            this.cropperElem = $('#cropping-preview');
            this.cropperElem.cropper({
                modal: false,
                rotatable: false,
                crop: (data) => {
                    console.log(data)
                    this.imageCropData = data
                }
            });
        }

        uploadImage() {
            var file = this.selectedImage;
            var formData = {
                width: Math.round(this.imageCropData.width),
                height: Math.round(this.imageCropData.height),
                xCoord: Math.round(this.imageCropData.x),
                yCoord: Math.round(this.imageCropData.y),
                nameOfTrip: 'scheisshaufen'
            };
            this.Upload.upload({
                url: this.basePath + '/trips/image',
                fields: formData,
                file: file
            })
                .progress(evt => {
                    var perc = 100.0 * evt.loaded / evt.total;
                    this.progressPercentage = parseInt(perc);
                    console.log('progress:', this.progressPercentage, '% ', evt.config.file.name);
                }).success((data, status, headers, config) => {
                    console.log('file', config.file.name, 'uploaded. Response:', data);
                    this.clearFileSelection();
                    this.showNewImage(data);
                });

            //this.InsertTripService.uploadImage(formData);
        }

        clearFileSelection() {
            this.showImageUploadModal = false;
            this.$rootScope.overlay = false;
            this.selectedImage = null;
            this.imagePath = '';
            this.cropperElem.attr('src', '');
            $('.cropper-container').remove()
        }

        showNewImage(data) {
            this.imageHasBeenUploaded = true;
            this.headerImagePath = data.imageLocation.picture;
        }

        addAccomodationEquipment(service:string) {
            if (this.accomodation) {
                if (this.containsAccomodation(service)) {
                    var index = this.accomodationEquipment.indexOf(service);
                    this.accomodationEquipment.splice(index, 1);
                } else {
                    this.accomodationEquipment.push(service);
                }
            }

            console.log(this.accomodationEquipment);
        }

        containsAccomodation(service:string) {
            var found = $.inArray(service, this.accomodationEquipment);
            if (found > -1) {
                return true;
            }
            return false;
        }

        getLocationDetails() {
            return {
                title: this.selectedPlaceDetails.name,
                id: this.selectedPlaceDetails.id,
                place_id: this.selectedPlaceDetails.place_id
            }
        }

        saveTrip() {
            var city = this.getLocationDetails();
            var t = {
                city: city,
                title: this.tripTitle,
                description: this.tripDescription,
                description_money: this.tripDescriptionMoney,
                //start_date
                //end_date
                accomodation: this.accomodation,
                accomodation_equipment: this.accomodationEquipment,
                //moods
                //locations
                //pics
                //active
                //delete
                type: 'trip'
            };

            //store trip in DB
            this.InsertTripService.saveTrip(t).then(() => {
                console.log('party')
            })
        }


        static controllerId:string = "InsertTripCtrl";
    }
}
