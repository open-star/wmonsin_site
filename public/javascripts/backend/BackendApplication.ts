/**
 Copyright (c) 2016 7ThCode.
 */

/// <reference path="../../../typings/browser.d.ts" />

"use strict";

let app:any = angular.module('BackendApplication', ['ui.router', 'AuthControllers', 'ArticleControllers','FileControllers','ContentControllers']);

app.run(['$rootScope',
    function ($rootScope) {
        $rootScope.$on("$routeChangeSuccess", (event:any, current:any, previous:any, rejection:any):void => {

        });
    }
]);

app.config(['$stateProvider', '$urlRouterProvider', '$compileProvider', '$httpProvider',
    ($stateProvider:any, $urlRouterProvider:any, $compileProvider:any, $httpProvider:any):void => {
        $compileProvider.debugInfoEnabled(false);
        $httpProvider.defaults.headers.common = {'x-requested-with': 'XMLHttpRequest'};
        $urlRouterProvider.otherwise('/');
    }]);


app.config(['$mdThemingProvider', ($mdThemingProvider:any):void => {
    $mdThemingProvider.theme('default')
        .primaryPalette('blue-grey')
        .accentPalette('deep-orange')
        .warnPalette('red');
}]);
