/**
 Copyright (c) 2016 7ThCode.
 */

/// <reference path="../../../typings/browser.d.ts" />

"use strict";

let contentcontroller:angular.IModule = angular.module('ContentControllers', ["ngResource", 'ngMessages', 'ngAnimate', 'ngSanitize']);

contentcontroller.factory('Content', ['$resource',
    ($resource:any):angular.resource.IResource<any> => {
        return $resource('/content', {}, {
            get: {method: 'GET'},
            update: {method: 'PUT'}
        });
    }]);

contentcontroller.controller('ContentController', ['$scope', 'Content',
    ($scope:any, Content:any):void => {





     //   var editor = new wysihtml5.Editor('editor', {
     //       toolbar: 'toolbar',
     //       parserRules:  wysihtml5ParserRules
     //   });





        let content:any = new Content();
        content.$get({}, (result:any):void => {
        //    $scope.about.description = result.content.about.description;
            $scope.content = result.content;
        });
        
        
      $scope.update = () => {

          let content:any = new Content();
          content.content = $scope.content;
          content.$update({}, (result:any):void => {
              $scope.content = result.content;
          });
          
      }  

    }]);



