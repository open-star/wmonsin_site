/// <reference path="../../typings/browser.d.ts" />

'use strict';

var viewcontroller:angular.IModule = angular.module('ViewControllers', ["ngResource", 'ngMessages', 'ui.bootstrap']);

class Browser {
    public name:string;
    public isIE:boolean;
    public isiPhone:boolean;
    public isiPod:boolean;
    public isiPad:boolean;
    public isiOS:boolean;
    public isAndroid:boolean;
    public isPhone:boolean;
    public isTablet:boolean;
    public verArray:any;
    public ver:number;

    constructor() {

        this.name = window.navigator.userAgent.toLowerCase();

        this.isIE = (this.name.indexOf('msie') >= 0 || this.name.indexOf('trident') >= 0);
        this.isiPhone = this.name.indexOf('iphone') >= 0;
        this.isiPod = this.name.indexOf('ipod') >= 0;
        this.isiPad = this.name.indexOf('ipad') >= 0;
        this.isiOS = (this.isiPhone || this.isiPod || this.isiPad);
        this.isAndroid = this.name.indexOf('android') >= 0;
        this.isPhone = (this.isiOS || this.isAndroid);
        this.isTablet = (this.isiPad || (this.isAndroid && this.name.indexOf('mobile') < 0));

        if (this.isIE) {
            this.verArray = /(msie|rv:?)\s?([0-9]{1,})([\.0-9]{1,})/.exec(this.name);
            if (this.verArray) {
                this.ver = parseInt(this.verArray[2], 10);
            }
        }

        if (this.isiOS) {
            this.verArray = /(os)\s([0-9]{1,})([\_0-9]{1,})/.exec(this.name);
            if (this.verArray) {
                this.ver = parseInt(this.verArray[2], 10);
            }
        }

        if (this.isAndroid) {
            this.verArray = /(android)\s([0-9]{1,})([\.0-9]{1,})/.exec(this.name);
            if (this.verArray) {
                this.ver = parseInt(this.verArray[2], 10);
            }
        }
    }
}


viewcontroller.factory('Inquiry', ['$resource',
    ($resource):angular.resource.IResource<any> => {
        return $resource('/inquiry', {}, {
            post: {method: 'POST'}
        });
    }]);


viewcontroller.controller('ViewController', ["$scope", '$modal', 'Inquiry',
    ($scope:any, $modal:any, Inquiry:any):void => {

        $scope.send = (title) => {
            var inquiry:any = new Inquiry();

            inquiry.title = title;
            inquiry.name = $scope.name;
            inquiry.email = $scope.email;
            inquiry.org = $scope.org;
            inquiry.message = $scope.message;
            inquiry.$post((data:any):void => {
                    if (data) {
                        if (data.code === 0) {
                            var modalInstance:any = $modal.open({
                                controller: 'InquieyConfirmDialogController',
                                templateUrl: '/dialogs/inquiryconfirmdialog',
                                targetEvent: null
                            });
                            $scope.errormessage = "";
                            modalInstance.result.then(():void => {
                            }, ():void => {
                            });
                        } else {
                            var error = data.value;
                            // error.code;
                            // error.response;
                            // error.responseCode;
                            $scope.errormessage = error.response;
                        }
                    }
                }
            );
        };

    }]);


viewcontroller.controller('InquieyConfirmDialogController', ['$scope', '$modalInstance',
    ($scope:any, $modalInstance:any):void => {

        $scope.cancel = ():void => {
            $modalInstance.dismiss();
        };

        $scope.ok = ():void => {
            $modalInstance.close($scope);
        };

    }]);
