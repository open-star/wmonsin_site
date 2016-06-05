/// <reference path="../../typings/browser.d.ts" />

'use strict';

var app:any = angular.module('ViewApplication', ['ViewControllers', 'WebPayControllers', 'ExperimentControllers']);

app.run(['$rootScope', ($rootScope) => {
        $rootScope.$on("$routeChangeSuccess", (event:any, current:any, previous:any, rejection:any):void => {

        });
    }
]);

app.config([ '$compileProvider', '$httpProvider',
    ($compileProvider:any, $httpProvider:any):void => {

        $compileProvider.debugInfoEnabled(false);

        $httpProvider.defaults.headers.common = {'x-requested-with': 'XMLHttpRequest'};

    }]);

app.config(["$sceDelegateProvider",($sceDelegateProvider:any):void => {
    $sceDelegateProvider.resourceUrlWhitelist([
        'self',
        'https://www.youtube.com/embed/**',
        'https://i.ytimg.com/vi/**'
    ]);
}]);
