/**
 Copyright (c) 2016 7ThCode.
 */

/// <reference path="../../../typings/browser.d.ts" />

"use strict";
/*
class FileLib {
    static List(resource:any, query:any, success:(value:any) => void):void {
        resource.query({query: encodeURIComponent(JSON.stringify(query))}, (data:any):void => {
            if (data) {
                if (data.code === 0) {
                    _.each(data.value, (value) => {
                        success(value);
                    });
                }
            }
        });
    }
}
*/
class ArticleLib {
    static List(resource:any, query:any, option:any, success:(value:any) => void):void {
        resource.query({query: encodeURIComponent(JSON.stringify(query))}, (data:any):void => {
            if (data) {
                if (data.code == 0) {
                    success(data.value);
                }
            }
        });
    }
}

let articlecontroller:angular.IModule = angular.module('ArticleControllers', ["ngResource", 'ngMessages', 'ngAnimate', 'ngSanitize']);

articlecontroller.value("CurrentQuery", {query: {title: {$regex: ""}}, option: {}});

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

articlecontroller.controller('ArticleController', ['$scope', '$mdDialog', 'Article', 'ArticleAccept', 'ArticleQuery', 'CurrentQuery', '$timeout',
    ($scope:any, $mdDialog:any, Article:any, ArticleAccept:any, ArticleQuery:any, CurrentQuery:any, $timeout:any):void => {


        ArticleLib.List(ArticleQuery, CurrentQuery.query, CurrentQuery.option, (value:any):void => {
            $scope.articles = value;
        });

        $scope.showAddArticleDialog = ():void => {

            let modalInstance = $mdDialog.show({
                controller: 'AddArticleDialogController',
                templateUrl: '/backend/dialogs/article/addarticledialog',
                targetEvent: null
            });

            modalInstance.then((answer:any):void => { // Answer
                let article:any = new ArticleAccept();

                article.title = answer.title;
                article.description = answer.description;
                article.text = answer.text;
                article.image = answer.file;

                article.$save({}, (data:any):void => {
                    if (data) {
                        if (data.code == 0) {
                            ArticleLib.List(ArticleQuery, CurrentQuery.query, CurrentQuery.option, (value:any):void => {
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

                        let modalInstance:any = $mdDialog.show({
                            controller: 'EditArticleDialogController',
                            templateUrl: '/backend/dialogs/article/editarticledialog',
                            resolve: {
                                items: ():any => {
                                    return result;
                                }
                            }

                        });

                        //   scope: $scope
                        modalInstance.then((answer:any):void => { // Answer

                            article.name = answer.name;
                            article.title = answer.title;
                            article.description = answer.description;
                            article.text = answer.text;

                            article.image = answer.image;
                            article.publish = false;

                            article.$update({id: id}, (data:any):void => {
                                if (data) {
                                    if (data.code == 0) {
                                        ArticleLib.List(ArticleQuery, CurrentQuery.query, CurrentQuery.option, (value:any):void => {
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

        $scope.showDeleteArticleDialog = (id:any):void => {

            let modalInstance = $mdDialog.show({
                controller: 'DeleteArticleDialogController',
                templateUrl: '/backend/dialogs/article/deletearticledialog',
                targetEvent: null
            });

            modalInstance.then((answer:any):void => { // Answer
                let article:any = new Article();
                article.$remove({id: id}, (result:any):void => {
                    if (result) {
                        if (result.code == 0) {
                            ArticleLib.List(ArticleQuery, CurrentQuery.query, CurrentQuery.option, (value:any):void => {
                                $scope.articles = value;
                            });
                        }
                    } else {
                    }
                });
            }, ():void => { // Error
            });

        };

        $scope.showPublishArticleDialog = (id:any, publish:boolean):void => {

            var article:any = new Article();
            article.$get({id: id}, (result:any):void => {
                if (result) {
                    if (result.code === 0) {


                        let dialogurl:string = '/backend/dialogs/article/publisharticledialog';

                        if (!publish) {
                            dialogurl = '/backend/dialogs/article/unpublisharticledialog';
                        }

                        let modalInstance = $mdDialog.show({
                            controller: 'PublishArticleDialogController',
                            templateUrl: dialogurl,
                            resolve: {
                                items: ():any => {
                                    return result;
                                }
                            }
                        });

                        modalInstance.then((answer:any):void => { // Answer

                            article.publish = publish;

                            article.$update({id: id}, (data:any):void => {
                                if (data) {
                                    if (data.code == 0) {
                                        ArticleLib.List(ArticleQuery, CurrentQuery.query, CurrentQuery.option, (value:any):void => {
                                            $scope.articles = value;
                                        });
                                    }
                                }
                            });
                        }, ():void => { // Error
                        });
                    }
                }
            })
        };
        
        $scope.$watch('title', (newValue:string, oldValue:string) => {
            if (!newValue) {
                newValue = "";
            }

            CurrentQuery.query = {title: {$regex: newValue}};
            ArticleLib.List(ArticleQuery, CurrentQuery.query, CurrentQuery.option, (value:any):void => {
                $scope.articles = value;
            });
        });

        // virtual
        $scope.infiniteItems = {
            numLoaded_: 0,
            toLoad_: 0,

            // Required.
            getItemAtIndex:  (index):any => {
                if (index > this.numLoaded_) {
                    this.fetchMoreItems_(index);
                    return null;
                }
                return index;
            },

            getLength:  ():number => {
                return this.numLoaded_ + 5;
            },

            fetchMoreItems_:  (index):void => {
                if (this.toLoad_ < index) {
                    this.toLoad_ += 20;
                    $timeout(angular.noop, 300).then(angular.bind(this, function () {
                        this.numLoaded_ = this.toLoad_;
                    }));
                }
            }
        };
        //virtual



    }]);


articlecontroller.controller('AddArticleDialogController', ['$scope', '$mdDialog', 'FileQuery',
    ($scope:any, $mdDialog:any, FileQuery:any):void => {

        $scope.selectFile = (filename) => {
            $scope.image =  filename;
            $scope.file = filename;
            
        };

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

articlecontroller.controller('EditArticleDialogController', ['$scope', '$mdDialog', 'FileQuery', 'items',
    ($scope:any, $mdDialog:any, FileQuery:any, items:any):void => {

        $scope.title = items.title;
        $scope.description = items.description;
        $scope.text = items.text;

        $scope.image =  items.image;

        $scope.selectFile = (filename) => {
            $scope.image =  filename;
            $scope.file = filename;
        };

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

articlecontroller.controller('DeleteArticleDialogController', ['$scope', '$mdDialog',
    ($scope:any, $mdDialog:any):void => {

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

articlecontroller.controller('PublishArticleDialogController', ['$scope', '$mdDialog',
    ($scope:any, $mdDialog:any):void => {

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
    ($scope:any, $mdDialog:any):void => {

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

