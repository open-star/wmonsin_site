'use strict';

var experimentcontroller:angular.IModule = angular.module('ExperimentControllers', ["ngResource", 'ngMessages', 'ui.bootstrap']);

experimentcontroller.factory('ExperimentCreate', ['$resource',
    ($resource):angular.resource.IResource<any> => {
        return $resource('/experiment/create', {}, {
            post: {method: 'POST'}
        });
    }]);

experimentcontroller.controller('ExperimentController', ["$scope", '$modal',
    ($scope:any, $modal:any):void => {

        $scope.ExperimentCreate = ():void => {
            var modalInstance:any = $modal.open({
                controller: 'ExperimentDialogController',
                templateUrl: '/dialogs/experimentdialog',
                targetEvent: null,
            });
            $scope.errormessage = "";
            modalInstance.result.then(():void => {

            }, ():void => {
            });
        };

    }]);

experimentcontroller.controller('ExperimentDialogController', ['$scope', '$modalInstance', 'ExperimentCreate',
    ($scope:any, $modalInstance:any, ExperimentCreate:any):void => {

        $scope.progress = false;

        $scope.cancel = ():void => {
            $modalInstance.dismiss();
        };

        $scope.ok = ():void => {
            $scope.progress = true;
            var experimentCreate:any = new ExperimentCreate();
            experimentCreate.email = $scope.email;
            experimentCreate.name = $scope.name;
            experimentCreate.$post((data:any):void => {
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
        };
    }]);
