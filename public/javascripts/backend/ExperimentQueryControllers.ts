'use strict';

var experimentquerycontroller:angular.IModule = angular.module('ExperimentQueryControllers', ["ngResource", 'ngMessages']);

experimentquerycontroller.factory('ExperimentCreate', ['$resource',
    ($resource):angular.resource.IResource<any> => {
        return $resource('/experiment/create', {}, {
            post: {method: 'POST'}
        });
    }]);

experimentquerycontroller.factory('ExperimentQuery', ['$resource',
    ($resource):angular.resource.IResource<any> => {
        return $resource('/experiment/query/:query', {query: '@query'}, {
            query: {method: 'GET'}
        });
    }]);

function List(resource:any, query:any, success:(value:any) => void):void {
    resource.query({query: encodeURIComponent(JSON.stringify(query))}, (data:any):void => {
        if (data) {
            if (data.code === 0) {
                success(data.value);
            }
        }
    });
}

experimentquerycontroller.controller('ExperimentQueryController', ["$scope",'ExperimentQuery',
    ($scope:any, ExperimentQuery:any):void => {

        List(ExperimentQuery, {}, (data:any):void => {
            $scope.experiments = data;
        });

    }]);
