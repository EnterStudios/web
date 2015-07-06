module Controller {
    export class MainCtrl {

        overlay:boolean;
        openElement:string = '';

        // no error if empty string
        errormsg:string = '';

        title:string = '';
        defaultTitle:string = 'Locator | Die Plattform für Kurztrips aus deiner Perspektive';

        // success message
        successmsg:string = '';

        user:any;
        name:any;
        mail:any;
        password:any;

        forgotPassword:boolean = false;

        constructor(private $state, private $timeout, private $element, private UserService, private hotkeys, private $scope, private $rootScope, private $location, private $window) {
            this.$rootScope.overlay = false;
            this.$rootScope.openElement = this.openElement;

            $rootScope.$on('$stateChangeSuccess', function() {
                document.body.scrollTop = document.documentElement.scrollTop = 0;
            });

            $rootScope.$on('updateTitle', (scope, title) => {
               this.title = title ||'';
            });

            $window.onclick = (e) => {
                if(this.openElement) {
                    this.openElement = '';
                    this.$scope.$apply();
                }
            };

            $rootScope.$on('newPopoverSelected', (e, clickValue)=> {
                if(this.$rootScope.openElement === clickValue)
                    clickValue = '';
                this.openElement = this.$rootScope.openElement = clickValue;
            });

            this.$rootScope.$on("$locationChangeStart", () => {
                $rootScope.slider = $location.$$path === '/welcome';
            });

            $rootScope.$on('openLoginDialog', () => {
                this.openLoginDialog();
            });

            $rootScope.$on('closeDialog', () => {
                this.closeDialog();
            });

            this.hotkeys.add({
                combo: 'esc',
                description: 'Close the Modal',
                callback: () => {
                    this.closeDialog();
                }
            });


        }


        closeOverlay() {
            this.$rootScope.$emit('closeDialog');
        }


        sendNewPassword(mail, form) {
            this.errormsg = '';
            if (form.$invalid) {
                return;
            }

            this.UserService.sendNewPassword(mail)
                .then(() => {
                    console.info("Success");
                    this.successmsg = 'Email wurde an dich verschickt';


                    this.$timeout(() => {

                        this.successmsg = '';
                        this.forgotPassword = false;
                        // this.openLoginDialog();
                    }, 2000)

                }).catch(() => {
                    console.info("Error");
                    this.errormsg = "Mail nicht gefunden";
                })
        }

        triggerforgotPassword() {
            this.errormsg = '';
            this.forgotPassword = true;
        }

        logout() {
            console.info('Logout');
            this.UserService.logout()
                .then(() => {
                    console.info("Logout Success");
                    this.$rootScope.authenticated = false;
                    this.$rootScope.userID = '';
                    this.$state.go('welcome');
                }).catch(() => {
                    console.info("Logout Error");
                });
        }

        resetInput() {
            this.errormsg = '';
            this.successmsg = '';
            this.user = '';
            this.name = '';
            this.password = '';
            this.mail = '';
        }

        loginFacebook() {
            this.UserService.loginFacebook();
        }

        loginGoogle() {
            this.UserService.loginGoogle();
        }

        openLoginDialog() {
            this.forgotPassword = false;
            this.resetInput();
            this.$rootScope.overlay = true;
            angular.element(this.$element).find('#loginmodal').addClass('active');

            angular.element('.overlay').bind('click', () => {
                this.closeDialog();
            });

        }

        openRegisterDialog() {
            this.resetInput();
            this.$rootScope.overlay = true;
            angular.element(this.$element).find('#registermodal').addClass('active');

            angular.element('.overlay').bind('click', () => {
                this.closeDialog();
            });

        }

        login(form) {
            if (form.$invalid) {
                return;
            }


            console.info('Login ' + this.mail);

            this.UserService.login(this.mail, this.password)

                .then(result => {
                    console.info("Login Success");
                    this.errormsg = '';

                    this.$rootScope.$emit('get_me');
                    this.$rootScope.authenticated = true;
                    this.closeDialog();

                }).catch(resp => {
                    if (resp.status === 401) {
                        this.errormsg = "Falsche Mail oder falsches Passwort angegeben.";
                        return;
                    }
                    console.info("Login Error");
                    this.errormsg = "Oops, da lief etwas falsch";
                });
        }

        register(form) {
            if (form.$invalid) {
                return;
            }

            this.UserService.register(this.name, this.mail, this.password)
                .then(result => {
                    console.info("Register Success");
                    this.$rootScope.$emit('get_me');

                    //close the dialog after success
                    this.closeDialog();

                })
                .catch(resp => {
                    if (resp.status === 409) {
                        this.errormsg = 'Diese Mail gibts schon';
                        return;
                    }
                    console.info("Register Error");
                    console.info(resp);
                    this.errormsg = "Oops, da lief etwas falsch";
                });

        }

        closeDialog() {
            this.$rootScope.overlay = false;
            angular.element(this.$element).find('.moodal.active').removeClass('active');
        }


        static controllerId:string = "MainCtrl";
    }
}
