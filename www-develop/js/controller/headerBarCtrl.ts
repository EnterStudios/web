module Controller {
    declare var io;
    export class HeaderBarCtrl {
        user:any;
        name:any;
        mail:any;
        password:any;
        socket:any;
        showBadge: boolean;
        unreadMessages: number = 0;


        constructor(private hotkeys, private $scope, private $state, private $rootScope, private $location, private UserService, private $element, private $http, private socketFactory) {
            this.getMe().then(() => {
                this.registerWebsockets();
            });



            this.hotkeys.add({
                combo: 'esc',
                description: 'Close the Modal',
                callback: () => {
                    this.closeDialog();
                }
            });

            $rootScope.$on('openLoginDialog', () => {
                this.openLoginDialog();
            });

            $rootScope.$on('closeDialog', () => {
                this.closeDialog();
            });
        }

        readMessages() {
            this.showBadge = false;
            this.unreadMessages = 0;
        }

        registerWebsockets() {
            if(!this.$rootScope.authenticated){
                return;
            }
            this.$http.get('http://localhost:3001/api/v1/connect/me').then(response => {
                var myIoSocket = io.connect(':3001' + response.data.namespace);
                this.socket = this.socketFactory({ioSocket: myIoSocket});

                this.socket.on('new_message', (newMessage) => {
                    this.showBadge = true;
                    this.unreadMessages += 1;
                    console.log(newMessage);
                });

                console.log(arguments)
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

                    //close the dialog after success
                    this.closeDialog();

                });


        }

        openLoginDialog() {
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

        resetInput() {
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

        closeDialog() {
            this.$rootScope.overlay = false;
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
                    this.$state.go('welcome');
                });
        }

        getMe() {
            return this.UserService.getMe()

                .error((resp) => {
                    this.$rootScope.authenticated = false;
                })

                .then(result => {
                    this.user = result.data;
                    this.$rootScope.authenticated = true;
                    this.$rootScope.userID = result.data._id;
                    console.info(result.data._id);
                });
        }

        static controllerId:string = "HeaderBarCtrl";

    }
}
