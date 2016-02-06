/**
 AccountControllers.ts
 Copyright (c) 2015 7ThCode.
 This software is released under the MIT License.
 http://opensource.org/licenses/mit-license.php
 */

/// <reference path="../../../typings/tsd.d.ts" />

/**
 0 - ok
 1 - rights
 2 - auth
 3 - user already found
 10 - db
 20 - session
 100 - auth

 Init
 Accepted
 Done

 */


'use strict';

function List(resource:any, query:any, success:(value:any) => void):void {
    resource.query({query: encodeURIComponent(JSON.stringify(query))}, (data:any):void => {
        if (data) {
            if (data.code === 0) {
                success(data.value);
            }
        }
    });
}

var controllers:angular.IModule = angular.module('FileControllers', ["ngMaterial", "ngResource", 'ngMessages', 'ngMdIcons', 'ngAnimate', 'flow']);

controllers.factory('File', ['$resource',
    ($resource):angular.resource.IResource<any> => {
        return $resource('/file/:name', {name: '@name'}, {
            send: {method: 'POST'},
            update: {method: 'PUT'}
        });
    }]);

controllers.factory('FileQuery', ['$resource',
    ($resource):angular.resource.IResource<any> => {
        return $resource('/file/query/:query', {query: '@query'}, {
            query: {method: 'GET'}
        });
    }]);

/*! Controllers  */

controllers.controller('PageEditController', ['$scope', '$state', '$mdDialog', '$mdToast', "CurrentView", "View",
    ($scope:any, $state:any, $mdDialog:any, $mdToast:any, CurrentView:any, View:any):void  => {
        if (CurrentView.Data.Pages) {


            $scope.showPictureCreateDialog = ():void => {
                $mdDialog.show({
                    controller: 'PictureCreateDialogController',
                    templateUrl: '/backend/partials/edit/item/picture/picturecreatedialog',
                    targetEvent: null
                }).then((answer:any):void => { // Answer
                    var control:IPictureControl = {
                        height: 600,
                        width: 300,
                        path: answer.items.path,
                        type: "picture",
                        model: "",
                        name: answer.items.name,
                        label: answer.items.label
                    };
                    CurrentView.Data.Pages[CurrentView.Page].picture[0] = control;
                }, ():void => { // Cancel
                });
            };

            $scope.showPictureUpdateDialog = (index:number):void => {
                var items:any = CurrentView.Data.Pages[CurrentView.Page].picture[0];
                $mdDialog.show({
                    controller: 'PictureUpdateDialogController',
                    templateUrl: '/backend/partials/edit/item/picture/pictureupdatedialog',
                    targetEvent: null,
                    locals: {
                        items: items
                    }
                }).then((answer:any):void => { // Answer
                    var control:IPictureControl = {
                        height: 600,
                        width: 300,
                        path: answer.items.path,
                        type: "picture",
                        model: "",
                        name: answer.items.name,
                        label: answer.items.label
                    };
                    CurrentView.Data.Pages[CurrentView.Page].picture[0] = control;
                }, ():void => { // Cancel
                });
            };

            $scope.showPictureDeleteDialog = (index:number):void => {
                $mdDialog.show({
                    controller: 'PictureDeleteDialogController',
                    templateUrl: '/backend/partials/edit/item/picture/picturedeletedialog',
                    targetEvent: index
                }).then((answer:any):void => {  // Answer
                    CurrentView.Data.Pages[CurrentView.Page].picture[0] = null;
                    CurrentView.Data.Pages[CurrentView.Page].picture = _.compact(CurrentView.Data.Pages[CurrentView.Page].picture);
                }, ():void => {
                });
            };
        } else {
            $state.go('departments');
        }
    }]);

/*! Dialogs  */

controllers.controller('PictureCreateDialogController', ['$scope', '$mdDialog', '$mdToast', 'File', 'FileQuery',
    ($scope:any, $mdDialog:any, $mdToast:any, File:any, FileQuery:any):void  => {

        $scope.items = {};

        List(FileQuery, {}, (data:any):void  => {
            $scope.files = data;
        });

        $scope.images = [];

        $scope.processFiles = (files:any):void => {

            var filename:string = files[0].name;
            List(FileQuery, {filename: filename}, (data:any):void  => {
                if (data) {
                    if (data.length == 0) {
                        $scope.items.path = filename;
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
                    } else {
                        $mdToast.show($mdToast.simple().content("already found."));
                    }
                } else {
                    $mdToast.show($mdToast.simple().content("network error(file)"));
                }
            });
        };

        $scope.selectFile = (filename:string):void => {
            $scope.items.path = filename;
        };

        $scope.hide = ():void => {
            $mdDialog.hide();
        };

        $scope.cancel = ():void => {
            $mdDialog.cancel();
        };

        $scope.answer = (answer:any):void => {
            $mdDialog.hide($scope);
        };

    }]);

controllers.controller('PictureUpdateDialogController', ['$scope', '$mdDialog', 'File', 'FileQuery', 'items',
    ($scope:any, $mdDialog:any, File:any, FileQuery:any, items:any):void  => {

        $scope.items = items;

        List(FileQuery, {}, (data:any):void  => {
            $scope.files = data;
        });

        $scope.images = [];

        $scope.processFiles = (files:any):void => {
            var filename = files[0].name;

            $scope.items.path = filename;
            $scope.images[0] = {};
            var fileReader = new FileReader();
            var image = new Image();
            fileReader.onload = (event:any):void => {
                var uri = event.target.result;
                image.src = uri;
                image.onload = ():void => {
                    var file = new File();
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

        $scope.hide = ():void => {
            $mdDialog.hide();
        };

        $scope.cancel = ():void => {
            $mdDialog.cancel();
        };

        $scope.answer = (answer:any):void => {
            $mdDialog.hide($scope);
        };

    }]);

controllers.controller('PictureDeleteDialogController', ['$scope', '$mdDialog',
    ($scope:any, $mdDialog:any):void  => {

        $scope.hide = ():void  => {
            $mdDialog.hide();
        };

        $scope.cancel = ():void  => {
            $mdDialog.cancel();
        };

        $scope.answer = (answer:any):void  => {
            $mdDialog.hide($scope);
        };

    }]);

