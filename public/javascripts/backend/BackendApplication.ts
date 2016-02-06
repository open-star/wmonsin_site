/// <reference path="../../../typings/tsd.d.ts" />

'use strict';

var app:any = angular.module('BackendApplication', ['ui.router', 'AuthControllers', 'ArticleControllers', 'ContentControllers', 'ExperimentQueryControllers']);

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
 //       $urlRouterProvider.otherwise('/');
    }]);


