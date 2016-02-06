/// <reference path="../../../typings/tsd.d.ts" />

'use strict';

var contentcontroller:angular.IModule = angular.module('ContentControllers', ["ngResource", 'ngMessages', 'ngAnimate', 'ngSanitize']);

contentcontroller.factory('Content', ['$resource',
    ($resource:any):angular.resource.IResource<any> => {
        return $resource('/content', {}, {
            get: {method: 'GET'},
            update: {method: 'PUT'}
        });
    }]);

contentcontroller.controller('ContentController', ['$scope', 'Content',
    ($scope:any, Content:any):void => {

        var content:any = new Content();
        content.$get({}, (result:any):void => {
            $scope.about.description = result.content.about.description;
        });

    }]);



