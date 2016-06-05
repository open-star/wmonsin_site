/// <reference path="../../typings/browser.d.ts" />

'use strict';

var webpaycontroller:angular.IModule = angular.module('WebPayControllers', ["ngResource", 'ngMessages', 'ui.bootstrap']);

WebPay.setPublishableKey("test_public_0aB8fyaDg3cc0iL63b84O64E");

webpaycontroller.factory('CustomerCreate', ['$resource',
    ($resource):angular.resource.IResource<any> => {
        return $resource('/customer/create', {}, {
            post: {method: 'POST'}
        });
    }]);

webpaycontroller.factory('ChargeCreate', ['$resource',
    ($resource):angular.resource.IResource<any> => {
        return $resource('/charge/create', {}, {
            post: {method: 'POST'}
        });
    }]);

webpaycontroller.factory('RecursionCreate', ['$resource',
    ($resource):angular.resource.IResource<any> => {
        return $resource('/recursion/create', {}, {
            post: {method: 'POST'}
        });
    }]);

webpaycontroller.controller('WebPayController', ["$scope", '$modal',
    ($scope:any, $modal:any):void => {

        $scope.CustomerCreate = ():void => {
            var modalInstance:any = $modal.open({
                controller: 'CustomerCreateDialogController',
                templateUrl: '/dialogs/customercreatedialog',
                targetEvent: null,
            });
            $scope.errormessage = "";
            modalInstance.result.then(():void => {

            }, ():void => {
            });
        };

        $scope.ChargeCreate = ():void => {
            var modalInstance:any = $modal.open({
                controller: 'ChargeCreateDialogController',
                templateUrl: '/dialogs/chargecreatedialog',
                targetEvent: null,
            });
            $scope.errormessage = "";
            modalInstance.result.then(():void => {

            }, ():void => {
            });
        };

        $scope.RecursionCreate = (type:number):void => {
            var modalInstance:any = $modal.open({
                controller: 'RecursionCreateDialogController',
                templateUrl: '/dialogs/recursioncreatedialog',
                targetEvent: null,
                resolve: {
                    type: function() {
                        return type;
                    }
                }
            });
            $scope.errormessage = "";
            modalInstance.result.then(():void => {

            }, ():void => {
            });
        }
    }]);

webpaycontroller.controller('CustomerCreateDialogController', ['$scope', '$modalInstance', 'CustomerCreate',
    ($scope:any, $modalInstance:any, CustomerCreate:any):void => {

        $scope.progress = false;

        $scope.cancel = ():void => {
            $modalInstance.dismiss();
        };

        $scope.ok = ():void => {
            $scope.progress = true;
            WebPay.createToken({
                number: "4242-4242-4242-4242",
                name: "KENGO HAMASAKI",
                cvc: "123",
                exp_month: "12",
                exp_year: "2020"
            }, (status, response) => {
                var customercreate:any = new CustomerCreate();
                customercreate.token = response.id;
                customercreate.$post((data:any):void => {
                    if (data) {
                        if (data.code === 0) {
                            $modalInstance.close($scope);
                        } else {
                            var error = data.value;
                            $scope.errormessage = error.message;
                        }
                    } else {
                        $scope.errormessage = "Fatal Error.";
                    }
                });
            });
        };
    }]);

webpaycontroller.controller('ChargeCreateDialogController', ['$scope', '$modalInstance', 'ChargeCreate',
    ($scope:any, $modalInstance:any, ChargeCreate:any):void => {

        $scope.progress = false;

        $scope.cancel = ():void => {
            $modalInstance.dismiss();
        };

        $scope.ok = ():void => {
            $scope.progress = true;
            WebPay.createToken({
                number: "4242-4242-4242-4242",
                name: "KENGO HAMASAKI",
                cvc: "123",
                exp_month: "12",
                exp_year: "2020"
            }, (status, response) => {
                var chargecreate:any = new ChargeCreate();
                chargecreate.token = response.id;
                chargecreate.$post((data:any):void => {
                    if (data) {
                        if (data.code === 0) {
                            $modalInstance.close($scope);
                        } else {
                            var error = data.value;
                            $scope.errormessage = error.message;
                        }
                    } else {
                        $scope.errormessage = "Fatal Error.";
                    }
                });
            });
        };
    }]);

webpaycontroller.controller('RecursionCreateDialogController', ['$scope', '$modalInstance', 'RecursionCreate','type',
    ($scope:any, $modalInstance:any, RecursionCreate:any, type:number):void => {
        $scope.progress = false;
        $scope.cancel = ():void => {
            $modalInstance.dismiss();
        };
/*
 number: $scope.number,
 name: $scope.name,
 cvc: $scope.cvc,
 exp_month: $scope.exp_month,
 exp_year: $scope.exp_year
*/

        $scope.type = type;
        $scope.ok = ():void => {
            $scope.progress = true;
            WebPay.createToken({
                number: "4242-4242-4242-4242",
                name: "KENGO HAMASAKI",
                cvc: "123",
                exp_month: "12",
                exp_year: "2020"
            }, (status, response) => {
                var recursioncreate:any = new RecursionCreate();
                recursioncreate.token = response.id;
                recursioncreate.email = $scope.email;
                recursioncreate.type =  type;
                recursioncreate.$post((data:any):void => {
                    if (data) {
                        if (data.code === 0) {
                            $modalInstance.close($scope);
                        } else {
                            var error = data.value;
                            $scope.errormessage = error.message;
                        }
                    } else {
                        $scope.errormessage = "Fatal Error.";
                    }
                });
            });
        };
    }]);
