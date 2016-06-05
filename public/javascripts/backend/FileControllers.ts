/**
 Copyright (c) 2016 7ThCode.
 */

/// <reference path="../../../typings/browser.d.ts" />

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

"use strict";

interface IControl {
    name: string;
    label: string;
    model: string;
    type: string;
}

interface IPictureControl extends IControl {
    path: string;
    height: number;
    width:  number;
}

class FileLib {
    static List(resource:any, query:any, success:(value:any) => void):void {
        resource.query({query: encodeURIComponent(JSON.stringify(query))}, (data:any):void => {
            if (data) {
                if (data.code === 0) {
                    //   _.each(data.value, (value) => {
                    //       success(value);
                    //   });
                    success(data.value);

                }
            }
        });
    }
}

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

let controllers:angular.IModule = angular.module('FileControllers', ["ngMaterial", "ngResource", 'ngMessages', 'ngMdIcons', 'ngAnimate', 'flow']);

controllers.value("CurrentFileQuery", {query: {filename: {$regex: ""}}, option: {}});

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

controllers.controller('FileController', ['$scope', '$mdDialog', '$mdToast', 'File', 'FileQuery','ArticleQuery','CurrentFileQuery',
    ($scope:any, $mdDialog:any, $mdToast:any, File:any, FileQuery:any,ArticleQuery:any,CurrentFileQuery:any):void => {

        //  $scope.files = [];
        FileLib.List(FileQuery, CurrentFileQuery.query, (data:any):void => {
            $scope.files = data;
        });

        $scope.showPictureCreateDialog = ():void => {
            $mdDialog.show({
                controller: 'PictureCreateDialogController',
                templateUrl: '/backend/dialogs/file/picturecreatedialog',
                targetEvent: null
            }).then((answer:any):void => { // Answer
                FileLib.List(FileQuery, CurrentFileQuery.query, (data:any):void => {
                    //    $scope.files.push(data);
                    $scope.files = data;
                });
            }, ():void => { // Cancel
            });
        };

        let to_mime = (filename:string):string => {
            let mime:string = "";
            let nameparts:string[] = filename.split(".");
            if (nameparts.length == 2) {
                let filetype = nameparts[1].toLowerCase();
                switch (filetype) {
                    case "txt":
                        mime = "text/plain";
                        break;
                    case "htm":
                    case "html":
                        mime = "text/html";
                        break;
                    case "xml":
                        mime = "text/xml";
                        break;
                    case "js":
                        mime = "text/javascript";
                        break;
                    case "vbs":
                        mime = "text/vbscript";
                        break;
                    case "css":
                        mime = "text/css";
                        break;
                    case "gif":
                        mime = "image/gif";
                        break;
                    case "jpg":
                    case "jpeg":
                        mime = "image/jpeg";
                        break;
                    case "png":
                        mime = "image/png";
                        break;
                    case "doc":
                        mime = "application/msword";
                        break;
                    case "pdf":
                        mime = "application/pdf";
                        break;
                }
            }
            return mime;
        };

        $scope.createFile = (files:any):void => {
            let fileReader:any = new FileReader();
            let image:any = new Image();
            fileReader.onload = (event:any):void => {
                let uri:any = event.target.result;
                image.src = uri;
                image.onload = ():void => {
                    let file:any = new File();
                    file.url = uri;
                    $scope.files = [];

                    if(to_mime(files[0].name) != "") {
                        file.$send({name: files[0].name}, (value, responseHeaders) => {
                            $mdDialog.hide($scope);
                            FileLib.List(FileQuery, CurrentFileQuery.query, (data:any):void => {
                                //    $scope.files.push(data);
                                $scope.files = data;
                            });
                        }, (httpResponse) => {

                        });
                    }

                };
            };
            fileReader.readAsDataURL(files[0].file);
        };

        $scope.updateFile = (files:any, filename:any):void => {
            let fileReader:any = new FileReader();
            let image:any = new Image();
            fileReader.onload = (event:any):void => {
                let uri:any = event.target.result;
                image.src = uri;
                image.onload = ():void => {
                    let file:any = new File();
                    file.url = uri;
                    $scope.files = [];
                    file.$update({name: filename}, (value, responseHeaders) => {
                        $mdDialog.hide($scope);
                        FileLib.List(FileQuery, CurrentFileQuery.query, (data:any):void => {
                            //   $scope.files.push(data);
                            $scope.files = data;
                        });
                    }, (httpResponse) => {

                    });
                };
            };
            fileReader.readAsDataURL(files[0].file);
        };

        $scope.deleteFile = (filename:any):void => {

            let modalInstance = $mdDialog.show({
                controller: 'PictureDeleteDialogController',
                templateUrl: '/backend/dialogs/file/picturedeletedialog',
            });

            modalInstance.then((answer:any):void => { // Answer

                let file:any = new File();
                file.$delete({name: filename}, (result, responseHeaders) => {
                    if (result) {
                        switch (result.code) {
                            case 0:
                                $scope.files = [];
                                FileLib.List(FileQuery, CurrentFileQuery.query, (data:any):void => {
                                    //     $scope.files.push(data);
                                    $scope.files = data;
                                });
                                break;
                            case 1:
                                $mdToast.show($mdToast.simple().content("この画像は記事で使用中です。"));
                                break;
                        }
                    }
                }, (httpResponse) => {

                });

            }, ():void => { // Error
            });


        };

        $scope.$watch('filename', (newValue:string, oldValue:string) => {
            if (!newValue) {
                newValue = "";
            }

            CurrentFileQuery.query = {filename: {$regex: newValue}};
            FileLib.List(FileQuery, CurrentFileQuery.query, (data:any):void => {
                //    $scope.files.push(data);
                $scope.files = data;
            });
        });



        /*  $scope.showPictureUpdateDialog = ():void => {
         $mdDialog.show({
         controller: 'PictureUpdateDialogController',
         templateUrl: '/backend/dialogs/file/pictureupdatedialog',
         targetEvent: null,
         }).then((answer:any):void => { // Answer
         }, ():void => { // Cancel
         });
         }; */
        /*
         $scope.showPictureDeleteDialog = (index:number):void => {
         $mdDialog.show({
         controller: 'PictureDeleteDialogController',
         templateUrl: '/backend/dialogs/file/picturedeletedialog',
         targetEvent: index
         }).then((answer:any):void => {  // Answer

         }, ():void => {
         });
         };
         */

    }]);

/*! Dialogs  */

controllers.controller('PictureCreateDialogController', ['$scope', '$mdDialog', 'File',
    ($scope:any, $mdDialog:any, File:any):void => {

        $scope.hide = ():void => {
            $mdDialog.hide();
        };

        $scope.cancel = ():void => {
            $mdDialog.cancel();
        };

        $scope.processFiles = (files:any):void => {
            let fileReader:any = new FileReader();
            let image:any = new Image();
            fileReader.onload = (event:any):void => {
                let uri:any = event.target.result;
                image.src = uri;
                image.onload = ():void => {
                    let file:any = new File();
                    file.url = uri;
                    file.$send({name: files[0].name});
                    $mdDialog.hide($scope);
                };
            };
            fileReader.readAsDataURL(files[0].file);
        };

    }]);

/*
 controllers.controller('PictureUpdateDialogController', ['$scope', '$mdDialog', 'File',
 ($scope:any, $mdDialog:any, File:any):void => {

 $scope.hide = ():void => {
 $mdDialog.hide();
 };

 $scope.cancel = ():void => {
 $mdDialog.cancel();
 };

 $scope.processFiles = (files:any):void => {
 var fileReader:any = new FileReader();
 var image:any = new Image();
 fileReader.onload = (event:any):void => {
 var uri:any = event.target.result;
 image.src = uri;
 image.onload = ():void => {
 var file:any = new File();
 file.url = uri;
 file.$update({name: files[0].name});
 $mdDialog.hide($scope);
 };
 };
 fileReader.readAsDataURL(files[0].file);
 };

 }]);
 */

controllers.controller('PictureDeleteDialogController', ['$scope', '$mdDialog',
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

/**
 Copyright (c) 2016 7ThCode.
 */

/// <reference path="../../../typings/browser.d.ts" />

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

"use strict";

interface IControl {
    name: string;
    label: string;
    model: string;
    type: string;
}

interface IPictureControl extends IControl {
    path: string;
    height: number;
    width:  number;
}

class FileLib {
    static List(resource:any, query:any, success:(value:any) => void):void {
        resource.query({query: encodeURIComponent(JSON.stringify(query))}, (data:any):void => {
            if (data) {
                if (data.code === 0) {
                    //   _.each(data.value, (value) => {
                    //       success(value);
                    //   });
                    success(data.value);

                }
            }
        });
    }
}

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

let controllers:angular.IModule = angular.module('FileControllers', ["ngMaterial", "ngResource", 'ngMessages', 'ngMdIcons', 'ngAnimate', 'flow']);

controllers.value("CurrentFileQuery", {query: {filename: {$regex: ""}}, option: {}});

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

controllers.controller('FileController', ['$scope', '$mdDialog', '$mdToast', 'File', 'FileQuery','ArticleQuery','CurrentFileQuery',
    ($scope:any, $mdDialog:any, $mdToast:any, File:any, FileQuery:any,ArticleQuery:any,CurrentFileQuery:any):void => {

        //  $scope.files = [];
        FileLib.List(FileQuery, CurrentFileQuery.query, (data:any):void => {
            $scope.files = data;
        });

        $scope.showPictureCreateDialog = ():void => {
            $mdDialog.show({
                controller: 'PictureCreateDialogController',
                templateUrl: '/backend/dialogs/file/picturecreatedialog',
                targetEvent: null
            }).then((answer:any):void => { // Answer
                FileLib.List(FileQuery, CurrentFileQuery.query, (data:any):void => {
                    //    $scope.files.push(data);
                    $scope.files = data;
                });
            }, ():void => { // Cancel
            });
        };

        let to_mime = (filename:string):string => {
            let mime:string = "";
            let nameparts:string[] = filename.split(".");
            if (nameparts.length == 2) {
                let filetype = nameparts[1].toLowerCase();
                switch (filetype) {
                    case "txt":
                        mime = "text/plain";
                        break;
                    case "htm":
                    case "html":
                        mime = "text/html";
                        break;
                    case "xml":
                        mime = "text/xml";
                        break;
                    case "js":
                        mime = "text/javascript";
                        break;
                    case "vbs":
                        mime = "text/vbscript";
                        break;
                    case "css":
                        mime = "text/css";
                        break;
                    case "gif":
                        mime = "image/gif";
                        break;
                    case "jpg":
                    case "jpeg":
                        mime = "image/jpeg";
                        break;
                    case "png":
                        mime = "image/png";
                        break;
                    case "doc":
                        mime = "application/msword";
                        break;
                    case "pdf":
                        mime = "application/pdf";
                        break;
                }
            }
            return mime;
        };

        $scope.createFile = (files:any):void => {
            let fileReader:any = new FileReader();
            let image:any = new Image();
            fileReader.onload = (event:any):void => {
                let uri:any = event.target.result;
                image.src = uri;
                image.onload = ():void => {
                    let file:any = new File();
                    file.url = uri;
                    $scope.files = [];

                    if(to_mime(files[0].name) != "") {
                        file.$send({name: files[0].name}, (value, responseHeaders) => {
                            $mdDialog.hide($scope);
                            FileLib.List(FileQuery, CurrentFileQuery.query, (data:any):void => {
                                //    $scope.files.push(data);
                                $scope.files = data;
                            });
                        }, (httpResponse) => {

                        });
                    }

                };
            };
            fileReader.readAsDataURL(files[0].file);
        };

        $scope.updateFile = (files:any, filename:any):void => {
            let fileReader:any = new FileReader();
            let image:any = new Image();
            fileReader.onload = (event:any):void => {
                let uri:any = event.target.result;
                image.src = uri;
                image.onload = ():void => {
                    let file:any = new File();
                    file.url = uri;
                    $scope.files = [];
                    file.$update({name: filename}, (value, responseHeaders) => {
                        $mdDialog.hide($scope);
                        FileLib.List(FileQuery, CurrentFileQuery.query, (data:any):void => {
                            //   $scope.files.push(data);
                            $scope.files = data;
                        });
                    }, (httpResponse) => {

                    });
                };
            };
            fileReader.readAsDataURL(files[0].file);
        };

        $scope.deleteFile = (filename:any):void => {

            let modalInstance = $mdDialog.show({
                controller: 'PictureDeleteDialogController',
                templateUrl: '/backend/dialogs/file/picturedeletedialog',
            });

            modalInstance.then((answer:any):void => { // Answer

                let file:any = new File();
                file.$delete({name: filename}, (result, responseHeaders) => {
                    if (result) {
                        switch (result.code) {
                            case 0:
                                $scope.files = [];
                                FileLib.List(FileQuery, CurrentFileQuery.query, (data:any):void => {
                                    //     $scope.files.push(data);
                                    $scope.files = data;
                                });
                                break;
                            case 1:
                                $mdToast.show($mdToast.simple().content("この画像は記事で使用中です。"));
                                break;
                        }
                    }
                }, (httpResponse) => {

                });

            }, ():void => { // Error
            });


        };

        $scope.$watch('filename', (newValue:string, oldValue:string) => {
            if (!newValue) {
                newValue = "";
            }

            CurrentFileQuery.query = {filename: {$regex: newValue}};
            FileLib.List(FileQuery, CurrentFileQuery.query, (data:any):void => {
                //    $scope.files.push(data);
                $scope.files = data;
            });
        });



        /*  $scope.showPictureUpdateDialog = ():void => {
         $mdDialog.show({
         controller: 'PictureUpdateDialogController',
         templateUrl: '/backend/dialogs/file/pictureupdatedialog',
         targetEvent: null,
         }).then((answer:any):void => { // Answer
         }, ():void => { // Cancel
         });
         }; */
        /*
         $scope.showPictureDeleteDialog = (index:number):void => {
         $mdDialog.show({
         controller: 'PictureDeleteDialogController',
         templateUrl: '/backend/dialogs/file/picturedeletedialog',
         targetEvent: index
         }).then((answer:any):void => {  // Answer

         }, ():void => {
         });
         };
         */

    }]);

/*! Dialogs  */

controllers.controller('PictureCreateDialogController', ['$scope', '$mdDialog', 'File',
    ($scope:any, $mdDialog:any, File:any):void => {

        $scope.hide = ():void => {
            $mdDialog.hide();
        };

        $scope.cancel = ():void => {
            $mdDialog.cancel();
        };

        $scope.processFiles = (files:any):void => {
            let fileReader:any = new FileReader();
            let image:any = new Image();
            fileReader.onload = (event:any):void => {
                let uri:any = event.target.result;
                image.src = uri;
                image.onload = ():void => {
                    let file:any = new File();
                    file.url = uri;
                    file.$send({name: files[0].name});
                    $mdDialog.hide($scope);
                };
            };
            fileReader.readAsDataURL(files[0].file);
        };

    }]);

/*
 controllers.controller('PictureUpdateDialogController', ['$scope', '$mdDialog', 'File',
 ($scope:any, $mdDialog:any, File:any):void => {

 $scope.hide = ():void => {
 $mdDialog.hide();
 };

 $scope.cancel = ():void => {
 $mdDialog.cancel();
 };

 $scope.processFiles = (files:any):void => {
 var fileReader:any = new FileReader();
 var image:any = new Image();
 fileReader.onload = (event:any):void => {
 var uri:any = event.target.result;
 image.src = uri;
 image.onload = ():void => {
 var file:any = new File();
 file.url = uri;
 file.$update({name: files[0].name});
 $mdDialog.hide($scope);
 };
 };
 fileReader.readAsDataURL(files[0].file);
 };

 }]);
 */

controllers.controller('PictureDeleteDialogController', ['$scope', '$mdDialog',
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

