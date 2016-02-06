/// <reference path="../../../typings/tsd.d.ts" />

'use strict';

var authcontroller:angular.IModule = angular.module('AuthControllers', ["ngResource", 'ngMessages', 'ngAnimate', 'ngMaterial','ngMdIcons', 'ngSanitize']);

// resources
authcontroller.factory('Register', ['$resource',
    ($resource:any):angular.resource.IResource<any> => {
        return $resource('/local/register', {}, {
            regist: {method: 'POST'}
        });
    }]);

authcontroller.factory('Login', ['$resource',
    ($resource:any):angular.resource.IResource<any> => {
        return $resource('/local/login', {}, {
            login: {method: 'POST'}
        });
    }]);

authcontroller.factory('Password', ['$resource',
    ($resource:any):angular.resource.IResource<any> => {
        return $resource('/local/password', {}, {
            change: {method: 'POST'}
        });
    }]);

authcontroller.factory('Logout', ['$resource',
    ($resource:any):angular.resource.IResource<any> => {
        return $resource('/logout', {}, {
            logout: {method: 'POST'}
        });
    }]);

authcontroller.factory('Account', ['$resource',
    ($resource:any):angular.resource.IResource<any> => {
        return $resource('/account/:id', {}, {
            update: {method: 'PUT'}
        });
    }]);

authcontroller.factory('AccountQuery', ['$resource',
    ($resource:any):angular.resource.IResource<any> => {
        return $resource('/account/query/:query', {query: '@query'}, {
            query: {method: 'GET'}
        });
    }]);

authcontroller.factory('AccountFind', ['$resource',
    ($resource:any):angular.resource.IResource<any> => {
        return $resource('/account/find/:username', {query: '@query'}, {
            find: {method: 'GET'}
        });
    }]);

authcontroller.factory('File', ['$resource',
    ($resource):angular.resource.IResource<any> => {
        return $resource('/file/:name', {name: '@name'}, {
            send: {method: 'POST'},
            update: {method: 'PUT'}
        });
    }]);

authcontroller.factory('FileQuery', ['$resource',
    ($resource):angular.resource.IResource<any> => {
        return $resource('/file/query/:query', {query: '@query'}, {
            query: {method: 'GET'}
        });
    }]);

// password
authcontroller.directive("compareTo", ():any => {
    return {
        require: "ngModel",
        scope: {
            otherModelValue: "=compareTo"
        },
        link: (scope:any, element:any, attributes:any, ngModel:any):void => {

            ngModel.$validators.compareTo = (modelValue:any):any => {
                return modelValue == scope.otherModelValue;
            };

            scope.$watch("otherModelValue", ():void => {
                ngModel.$validate();
            });
        }
    };
});

function List(resource:any, query:any, success:(value:any) => void):void {
    resource.query({query: encodeURIComponent(JSON.stringify(query))}, (data:any):void => {
        if (data) {
            if (data.code == 0) {
                success(data.value);
            }
        }
    });
}

function All(resource:any, success:(value:any) => void):void {
    resource.get((data:any):void => {
        if (data) {
            if (data.code == 0) {
                success(data.value);
            }
        }
    });
}

function Read(resource:any, query:any, success:(value:any) => void):void {
    resource.read({query: encodeURIComponent(JSON.stringify(query))}, (data:any):void => {
        if (data) {
            if (data.code == 0) {
                success(data);
            }
        }
    });
}

authcontroller.controller('LoginController', ["$scope", "$rootScope", "$state", "$window", "$mdDialog", 'Login', 'Logout', 'Register', 'Password',
    ($scope:any, $rootScope:any, $state:any, $window:any, $mdDialog:any, Login:any, Logout:any, Register:any, Password:any):void => {

        $scope.tinymceOptions = {
            onChange: function(e) {
                // put logic here for keypress and cut/paste changes
            },
            inline: false,
            menubar: "view format table tools",
            menu: {
                file: {title: 'File', items: 'newdocument'},
                edit: {title: 'Edit', items: 'undo redo | cut copy paste pastetext | selectall'},
                insert: {title: 'Insert', items: 'link media | template hr'},
                view: {title: 'View', items: 'visualaid'},
                format: {title: 'Format', items: 'bold italic underline strikethrough superscript subscript | formats | removeformat'},
                table: {title: 'Table', items: 'inserttable tableprops deletetable | cell row column'},
                tools: {title: 'Tools', items: 'spellchecker code'}
            },
            plugins : 'advlist autolink link image lists charmap print preview',
            skin: 'lightgray',
            theme : 'modern'
        };

        $scope.showRegisterDialog = (size:any):void => {
            $mdDialog.show({
                controller: 'RegisterDialogController',
                templateUrl: '/backend/dialogs/auth/registerdialog',
                size: size,
                resolve: {
                    items: ():any => {
                        return $scope.items;
                    }
                }
            }).then(():void => {
                $mdDialog.show({
                    controller: 'RegisterConfirmDialogController',
                    templateUrl: '/backend/dialogs/auth/registerconfirmdialog',
                    targetEvent: null
                }).then(():void => {
                }, ():void => {
                });
            }, ():void => {
            });
        };

        $scope.showLoginDialog = ():void => {
            $mdDialog.show({
                controller: 'LoginDialogController',
                templateUrl: '/backend/dialogs/auth/logindialog',
                targetEvent: null
            }).then((account:any):void => { // Answer
                $rootScope.$broadcast('Login');
            }, ():void => { // Error
            });
        };

        $scope.showPasswordDialog = ():void => {
            $mdDialog.show({
                controller: 'PasswordDialogController',
                templateUrl: '/backend/dialogs/auth/passworddialog',
                targetEvent: null
            }).then((selectedItem:any):void => {
                var account:any = new Password();
                account.username = selectedItem.items.username;
                account.password = selectedItem.items.password;
                $scope.progress = true;
                account.$change((account:any):void => {
                    if (account) {
                        $scope.progress = false;
                        $mdDialog.show({
                            controller: 'PasswordConfirmDialogController',
                            templateUrl: '/backend/dialogs/auth/passwordconfirmdialog',
                            targetEvent: null
                        }).then(():void => {
                        }, ():void => {
                        });

                    } else {
                    }
                });
            }, ():void => {
            });
        };

        $scope.Logout = ():void => {
            var account:any = new Logout();
            account.$logout((account:any):void => {
                if (account) {
                    if (account.code == 0) {
                        //Current.account = null;
                        $rootScope.$broadcast('Logout');
                    }
                }
            });
        };

        $scope.sendmail = () => {
            $.ajax({
                type: 'GET',
                url: 'http://seventh-code.com/mail',
                //url: 'http://localhost:4001/mail',
                data:{username:'oda.mikio@gmail.com'},  // JSONデータ本体
                //contentType: 'application/json', // リクエストの Content-Type
                dataType: 'jsonp',
                jsonpCallback: 'getJson',
                success: function(json){
                    var len = json.length;
                    for(var i=0; i < len; i++){
                        // $("#b").append(json[i].version + ' ' + json[i].codename + '<br>');
                    }
                },
                error: function(XMLHttpRequest, textStatus, errorThrown) {
                    var a = textStatus;
                }

            });
        };

        $scope.$on('Login', ():void => {
            $window.location.href = "http://" + $window.location.host + "/";
        });

        $scope.$on('Logout', ():void => {
            $window.location.href = "http://" + $window.location.host + "/";
        });

    }]);

//! dialogs

authcontroller.controller('LoginDialogController', ['$scope', '$mdDialog', '$mdToast', 'Login',
    ($scope:any, $mdDialog:any, $mdToast:any, Login:any):void  => {

        $scope.searchTextChange = (text):void => {

        };

        $scope.selectedItemChange = (item):void => {

        };

        $scope.hide = ():void => {
            $mdDialog.hide();
        };

        $scope.cancel = ():void  => {
            $mdDialog.cancel();
        };

        $scope.answer = (items:any):void  => {
            var account = new Login();
            account.username = items.username;
            account.password = items.password;
            account.$login((account:any):void => {
                if (account) {
                    if (account.code === 0) {
                        $mdDialog.hide(account);
                    } else {
                        $mdToast.show($mdToast.simple().content(account.message));
                    }
                } else {
                    $mdToast.show($mdToast.simple().content("network error(login)"));
                }
            });
        };

    }]);

authcontroller.controller('RegisterDialogController', ['$scope', '$mdDialog', 'Register',
    ($scope:any, $mdDialog:any, Register:any):void  => {

        $scope.hide = ():void  => {
            $mdDialog.hide();
        };

        $scope.cancel = ():void  => {
            $mdDialog.cancel();
        };

        $scope.answer = (items:any):void  => {
            var account:any = new Register();
            account.username = $scope.items.username;
            account.password = $scope.items.password;
            $scope.progress = true;
            account.$regist((result:any):void => {
                if (result) {
                    if (result.code == 0) {
                        $scope.progress = false;
                        $mdDialog.hide(account);
                    } else {
                        $scope.message = account.message;
                    }
                } else {
                    $scope.message = "Unknown error"
                }
            });
        };
    }]);

authcontroller.controller('RegisterConfirmDialogController', ['$scope', '$mdDialog',
    ($scope:any, $mdDialog:any):void  => {

        $scope.hide = ():void  => {
            $mdDialog.hide();
        };

        $scope.cancel = ():void  => {
            $mdDialog.cancel();
        };

        $scope.answer = (answer):void  => {
            $mdDialog.hide($scope);
        };

    }]);

authcontroller.controller('PasswordDialogController', ['$scope', '$mdDialog',
    ($scope:any, $mdDialog:any):void  => {

        $scope.hide = ():void  => {
            $mdDialog.hide();
        };

        $scope.cancel = ():void  => {
            $mdDialog.cancel();
        };

        $scope.answer = (answer):void  => {
            $mdDialog.hide($scope);
        };

    }]);

authcontroller.controller('PasswordConfirmDialogController', ['$scope', '$mdDialog',
    ($scope:any, $mdDialog:any):void  => {

        $scope.hide = ():void  => {
            $mdDialog.hide();
        };

        $scope.cancel = ():void  => {
            $mdDialog.cancel();
        };

        $scope.answer = (answer):void  => {
            $mdDialog.hide($scope);
        };

    }]);


authcontroller.controller('PictureCreateDialogController', ['$scope', '$mdDialog', 'File',
    ($scope:any, $mdDialog:any, File:any):void  => {

        $scope.items = {};

        $scope.images = [];

        $scope.processFiles = (files:any):void => {
            //     var filename:string = files[0].name;

            $scope.items.path = files[0].name;
            $scope.images[0] = {};
            var fileReader:any = new FileReader();
            var image:any = new Image();
            fileReader.onload = (event:any):void => {
                var uri:any = event.target.result;
                image.src = uri;
                image.onload = ():void => {
                    var file:any = new File();
                    file.url = uri;
                    file.$send({name: $scope.items.path});
                    $scope.$apply();
                };
            };
            fileReader.readAsDataURL(files[0].file);
        };

        $scope.selectFile = (filename:string):void => {
            $scope.items.path = filename;
        };

        $scope.hide = ():void  => {
            $mdDialog.hide();
        };

        $scope.cancel = ():void  => {
            $mdDialog.cancel();
        };

        $scope.answer = (answer):void  => {
            $mdDialog.hide($scope);
        };

    }]);