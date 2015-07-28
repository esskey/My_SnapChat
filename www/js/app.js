/*jslint browser:true, node:true */
/*jslint indent:4 */
/*global $scope, angular, cordova, StatusBar, FileUploadOptions, FileTransfer */
"use strict";
var lastpeax,
    value,
    array,
    timer,
    list,
    noneyes,
    refreshPage,
    myObject;

angular.module('SnapchatApp', ['ionic'])

    .config(function ($stateProvider, $urlRouterProvider) {
        $urlRouterProvider.otherwise('/');

        $stateProvider.state('accueil', {
            url: "/",
            templateUrl: "templates/accueil.html"
        });

        $stateProvider.state('inscription', {
            url: "/signin",
            templateUrl: "templates/signin.html",
            controller: 'InscriptionCtrl'
        });

        $stateProvider.state('connexion', {
            url: "/login",
            templateUrl: "templates/login.html",
            controller: 'ConnexionCtrl'
        });

        $stateProvider.state('listusers', {
            url: "/list",
            templateUrl: "templates/listUsers.html",
            controller: 'ListCtrl'
        });

        $stateProvider.state('listsnap', {
            url: "/listSnap",
            templateUrl: "templates/receiv.html",
            controller: 'ListSnapCtrl'
        });

        $stateProvider.state('modif', {
            url: "/edit",
            templateUrl: "templates/modification.html",
            controller: 'editCtrl'
        });
    })

    .factory('Camera', ['$q', function ($q) {
        return {
            getPicture: function (options) {
                var q = $q.defer();

                navigator.camera.getPicture(function (result) {
                    // Do any magic you need
                    q.resolve(result);
                }, function (err) {
                    q.reject(err);
                }, options);

                return q.promise;
            }
        };
    }])

    .run(function ($ionicPlatform) {
        $ionicPlatform.ready(function () {
            // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
            // for form inputs)
            if (window.cordova && window.cordova.plugins.Keyboard) {
                cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
            }
            if (window.StatusBar) {
                StatusBar.styleDefault();
            }
        });
    })

    .controller("InscriptionCtrl", ["$scope", "$http", "$location", function ($scope, $http, $location) {
        $scope.inscription = function () {
            $http.post("http://192.168.1.78:3000/signup", {
                email: $scope.email,
                password: $scope.password
            }).success(function (data) {
                console.log(data);
                if (data.error === false) {
                    $location.url("/login");
                } else {
                    document.getElementById('errorr').innerHTML = data.error;
                }
            });
        };
    }])

    .controller("ConnexionCtrl", ["$scope", "$http", "$location", function ($scope, $http, $location) {
        $scope.connexion = function () {
            $http.post("http://192.168.1.78:3000/login", {
                email: $scope.email,
                password: $scope.password
            }).success(function (data) {
                if (data.error === false) {
                    console.log(data);
                    myObject = {
                        id : data.data[0].id,
                        email : data.data[0].email,
                        token : data.token
                    };

                    value = JSON.stringify(myObject);
                    localStorage.setItem("infosUser", value);

                    $location.url("/listSnap");

                } else {
                    document.getElementById('error').innerHTML = data.error;
                }
            });
        };

    }])

    .controller("ListCtrl", ["$scope", "$http", function ($scope, $http) {
        array = JSON.parse(localStorage.getItem("infosUser"));

        $http.post("http://192.168.1.78:3000/listuser", {
            email: array.email,
            token: array.token
        }).success(function (data) {
            console.log(data);
            $scope.data = data.data;
        });
    }])

    .controller("editCtrl", ["$scope", "$http", function ($scope, $http) {
        array = JSON.parse(localStorage.getItem("infosUser"));

        $scope.editemail = function () {
            $http.post("http://192.168.1.78:3000/editemail", {
                id: array.id,
                email: array.email,
                newemail: $scope.mail,
                token: array.token
            }).success(function (data) {
                if (data.data !== null) {
                    myObject = {
                        id: array.id,
                        email: data.data.newemail,
                        token: data.data.token
                    };

                    value = JSON.stringify(myObject);
                    localStorage.setItem("infosUser", value);

                    location.reload();
                    console.log(data);
                } else {
                    console.log(data);
                }
            });
        };
        $scope.editpass = function () {
            $http.post("http://192.168.1.78:3000/editpass", {
                id: array.id,
                email: array.email,
                password: $scope.pass
            }).success(function (data) {
                console.log(data);
            });
        };
    }])

    .controller("PhotoCtrl", ["$scope", "Camera", "$location", function ($scope, Camera, $location) {

        array = JSON.parse(localStorage.getItem("infosUser"));

        $scope.getPhoto = function () {
            Camera.getPicture().then(function (imageURI) {
                lastpeax = imageURI;
                console.log(lastpeax);
                $location.url("/list");
            }, function (err) {
                console.err(err);
            }, {
                quality: 50
            });
        };

        $scope.envoiPhoto = function (idUser) {
            document.addEventListener("deviceready", function () {
                var transfer = new FileTransfer(),
                    options = new FileUploadOptions();
                options.fileKey     = 'file';
                options.mimeType    = 'image/jpeg';
                options.params      = {
                    email: array.email,
                    temps: document.getElementById('sec').value,
                    token: array.token,
                    id_receiver : idUser
                };

                transfer.upload(lastpeax, encodeURI("http://192.168.1.78:3000/sendpeax"),
                    function () {
                        document.getElementById('yes').style.display = "block";
                        document.getElementById('yes').innerHTML = 'La photo a bien été envoyé';

                        noneyes = function () {
                            document.getElementById('yes').style.display = 'none';
                        };

                        setTimeout(noneyes, 3000);
                    }, function (error) {
                        console.log(error);
                    },
                    options
                    );
            });
        };

        $scope.logout = function () {
            localStorage.clear();
            clearInterval(timer);
            $location.url("/");
        };
    }])

    .controller("ListSnapCtrl", ["$scope", "$http", function ($scope, $http) {
        array = JSON.parse(localStorage.getItem("infosUser"));

        list = function () {
            $http.post("http://192.168.1.78:3000/listsnap", {
                email: array.email,
                token: array.token
            }).success(function (data) {
                console.log(data);
                if (data.error === false) {
                    $scope.bada = data.data;

                    if (data.data.length === 0) {
                        document.getElementById('nada').style.display = "block";
                        document.getElementById('nada').innerHTML = 'Aucun Snap reçu';
                    } else {
                        document.getElementById('nada').style.display = "none";
                    }
                }
            });
        };

        refreshPage = function () {
            timer = setInterval(list, 3000);
        };

        list();
        refreshPage();

        $scope.viewPhoto = function (url, temps, idsnap) {
            var cacheimg;

            document.getElementById("listsnap").style.display = "none";
            document.getElementById("peax").style.display = "block";
            document.getElementById("peax").src = url;

            cacheimg = function () {
                $http.post("http://192.168.1.78:3000/vu", {
                    email: array.email,
                    token: array.token,
                    id_snap: idsnap
                }).success(function (data) {
                    console.log(data);
                    list();
                });
                document.getElementById("peax").style.display = "none";
                document.getElementById("listsnap").style.display = "block";
            };

            setTimeout(cacheimg, temps * 1000);
        };

    }]);


