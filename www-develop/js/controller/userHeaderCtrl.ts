module Controller {
    export class UserHeaderCtrl {
        user:any;
        name:any;
        mail:any;
        password:any;
        facebook:any;
        google:any;


        constructor(private hotkeys, private $scope, private $rootScope, private $location, private UserService, private $element, private basePath) {
            this.getMe();
            this.facebook = this.basePath + '/loginFacebook';
            this.google = this.basePath + '/loginGoogle';

            this.hotkeys.add({
                combo: 'esc',
                description: 'Close the Modal',
                callback: () => {
                    this.closeDialog();
                }
            });
        }

        login() {
            console.info('Login ' + this.mail);

            this.UserService.login(this.mail, this.password)

                .error((resp) => {
                    console.info("Login Error");
                })

                .then(result => {
                    console.info("Login Success");
                    this.getMe();
                    this.$rootScope.authenticated = true;

                    //close the dialog after success
                    this.closeDialog();

                });
        }

        register() {
            console.info('Register' + this.name);
            this.UserService.register(this.name, this.mail, this.password)

                .error((resp) => {
                    console.info("Register Error");
                })

                .then(result => {
                    console.info("Register Success");
                    this.getMe();
                    this.$rootScope.authenticated = true;

                    this.login();

                    //close the dialog after success
                    this.closeDialog();

                });


        }

        openLoginDialog() {
            angular.element('.overlay').addClass('active');
            angular.element(this.$element).find('#loginmodal').addClass('active');

            angular.element('.overlay').bind('click', () => {
                this.closeDialog();
            });

        }

        openRegisterDialog() {
            angular.element('.overlay').addClass('active');
            angular.element(this.$element).find('#registermodal').addClass('active');

            angular.element('.overlay').bind('click', () => {
                this.closeDialog();
            });

        }

        closeDialog() {
            angular.element('.overlay').removeClass('active');
            angular.element(this.$element).find('.moodal.active').removeClass('active');
        }


        logout() {
            console.info('Logout');
            this.UserService.logout()
                .error((resp) => {
                    console.info("Logout Error");
                })

                .then(result => {
                    console.info("Logout Success");
                    this.$rootScope.authenticated = false;
                });
        }

        getMe() {
            this.UserService.getMe()

                .error((resp) => {
                    this.$rootScope.authenticated = false;
                })

                .then(result => {
                    this.user = result.data;
                    this.$rootScope.authenticated = true;
                    console.info(this.user);
                });
        }

        static controllerId:string = "UserHeaderCtrl";

    }
}
