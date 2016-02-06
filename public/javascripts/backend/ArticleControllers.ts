/// <reference path="../../../typings/tsd.d.ts" />

'use strict';

var articlecontroller:angular.IModule = angular.module('ArticleControllers', ["ngResource", 'ngMessages', 'ngAnimate', 'ngSanitize']);

articlecontroller.factory('ArticleAccept', ['$resource',
    ($resource:any):angular.resource.IResource<any> => {
        return $resource('/article/accept', {}, {});
    }]);

articlecontroller.factory('Article', ['$resource',
    ($resource:any):angular.resource.IResource<any> => {
        return $resource('/article/:id', {}, {
            update: {method: 'PUT'}
        });
    }]);

articlecontroller.factory('ArticleQuery', ['$resource',
    ($resource:any):angular.resource.IResource<any> => {
        return $resource('/article/query/:query', {query: '@query'}, {
            query: {method: 'GET'}
        });
    }]);

function List(resource:any, query:any, success:(value:any) => void):void {
    resource.query({query: encodeURIComponent(JSON.stringify(query))}, (data:any):void => {
        if (data) {
            if (data.code == 0) {
                success(data.value);
            }
        }
    });
}


articlecontroller.controller('ArticleController', ['$scope', '$mdDialog', 'Article', 'ArticleAccept', 'ArticleQuery',
    ($scope:any, $mdDialog:any, Article:any, ArticleAccept:any, ArticleQuery:any):void => {

        $scope.showAddArticleDialog = ():void => {

            var modalInstance = $mdDialog.show({
                controller: 'AddArticleDialogController',
                templateUrl: '/backend/dialogs/article/addarticledialog',
                targetEvent: null
            });

            modalInstance.then((answer:any):void => { // Answer
                var article:any = new ArticleAccept();

                article.name = answer.name;
                article.title = answer.title;
                article.description = answer.description;
                article.text = answer.text;

                article.$save({}, (data:any):void => {
                    if (data) {
                        if (data.code == 0) {
                            List(ArticleQuery, {}, (value:any):void => {
                                $scope.articles = value;
                            });
                        }
                    }
                });
            }, ():void => { // Error
            });
        };

        $scope.showEditArticleDialog = (id:any):void => {

            var article:any = new Article();
            article.$get({id: id}, (result:any):void => {
                if (result) {
                    if (result.code === 0) {

                        $scope.name = result.name;
                        $scope.title = result.title;
                        $scope.description = result.description;
                        $scope.text = result.text;

                        var modalInstance:any = $mdDialog.show({
                            controller: 'EditArticleDialogController',
                            templateUrl: '/backend/dialogs/article/editarticledialog',
                            targetEvent: null,
                            scope: $scope
                        });

                        modalInstance.then((answer:any):void => { // Answer

                            article.name = answer.name;
                            article.title = answer.title;
                            article.description = answer.description;
                            article.text = answer.text;

                            article.$update({id: id}, (data:any):void => {
                                if (data) {
                                    if (data.code == 0) {
                                        List(ArticleQuery, {}, (value:any):void => {
                                            $scope.articles = value;
                                        });
                                    }
                                }
                            });
                        }, ():void => { // Error
                        });
                    }
                }
            });
        };

        $scope.removeArticle = (id:any):void => {
            var article:any = new Article();
            article.$remove({id: id}, (result:any):void => {
                if (result) {
                    List(ArticleQuery, {}, (value:any):void => {
                        $scope.articles = value;
                    });
                } else {
                }
            });
        };


    }]);


articlecontroller.controller('AddArticleDialogController', ['$scope', '$mdDialog',
    ($scope:any, $mdDialog:any):void  => {


        $scope.hide = ():void => {
            $mdDialog.hide();
        };

        $scope.cancel = ():void => {
            $mdDialog.cancel();
        };

        $scope.ok = (answer:any):void => {
            $mdDialog.hide($scope);
        };

    }]);

articlecontroller.controller('EditArticleDialogController', ['$scope', '$mdDialog',
    ($scope:any,  $mdDialog:any):void  => {

        $scope.hide = ():void => {
            $mdDialog.hide();
        };

        $scope.cancel = ():void => {
            $mdDialog.cancel();
        };

        $scope.ok = (answer:any):void => {
            $mdDialog.hide($scope);
        };

    }]);

articlecontroller.controller('RegisterConfirmDialogController', ['$scope', '$mdDialog',
    ($scope:any, $mdDialog:any):void  => {

        $scope.hide = ():void => {
            $mdDialog.hide();
        };

        $scope.cancel = ():void => {
            $mdDialog.cancel();
        };

        $scope.ok = (answer:any):void => {
            $mdDialog.hide($scope);
        };

    }]);

