(function (formBuilder) {
    /**
     * This directive is responsible for adding drag and drop functionality and sending the
     *  `builderDropzone` the required object in order to identify the dropped item. 
     */
    formBuilder.directive('builderFieldType', ['$compile', function ($compile) {
        return {
            restrict: 'A',
            replace: true,
            scope: {
                name: '@',
            },
            controller: function ($scope) {
                // check if it was defined.  If not - set a default
                $scope.item = $scope.item || { name: $scope.name };
            },
            compile: function (tElement, attrs, transclude) {
                tElement.removeAttr('builder-field-type');
                tElement.attr('dnd-draggable', 'item');
                tElement.attr('dnd-effect-allowed', 'move');
                return {
                    pre: function preLink(scope, iElement, iAttrs, controller) { },
                    post: function postLink(scope, iElement, iAttrs, controller) {
                        $compile(iElement)(scope);
                    }
                };
            },

        };
    }]);

    formBuilder.directive('builderDropzone', ['$compile', function ($compile) {
        return {
            restrict: 'AE',
            scope: {
                builderList: '=?'
            },
            template: '<builder-dropzone-field item="item" dnd-draggable="item"   dnd-moved="builderList.splice($index, 1)" dnd-effect-allowed="move" ng-repeat="item in builderList"/>',
            controller: function ($scope) {
                // check if it was defined.  If not - set a default
                $scope.builderList = $scope.builderList || [];
            },
            compile: function (tElement, attrs, transclude) {
                tElement.removeAttr('builder-dropzone');
                tElement.attr('dnd-list', 'builderList');
                return {
                    pre: function preLink(scope, iElement, iAttrs, controller) { },
                    post: function postLink(scope, iElement, iAttrs, controller) {
                        $compile(iElement)(scope);
                    }
                };
            },
        };
    }]);

    formBuilder.directive('builderDropzoneField', ['$compile', 'builderConfig', '$q', '$templateCache', '$http', '$controller', function ($compile, builderConfig, $q, $templateCache, $http, $controller) {
        let check = apiCheck();
        function getFieldTemplate(component) {
            if (angular.isUndefined(component.template) && angular.isUndefined(component.templateUrl))
                throw new Error('component ' + component.name + 'must have a template or a templateUrl');
            else {
                let templatePromise = null;
                if (component.template)
                    return templatePromise = $q.when(component.template);
                else if (component.templateUrl) {
                    templatePromise = $q.when(component.templateUrl);
                    const httpOptions = { cache: $templateCache };
                    return templatePromise.then((url) => $http.get(url, httpOptions))
                        .then(function (response) {
                            return response.data;
                        })
                        .catch(function (error) {
                            throw new Error('can not load template url ' + error);
                        });
                }
            }
        }

        function invokeController(controller, scope) {
            check.throw([check.func, check.object], arguments, { prefix: 'builderDropzoneField directive', suffix: "check setType function" });
            $controller(controller, { $scope: scope })
        }

        function freezObjectProperty(object, propertyName, value) {
            Object.defineProperty(object, propertyName, {
                value: value,
                writable: false,
                enumerable: true,
                configurable: true
            });
        }

        function transcludeInWrappers(fieldConfig) {
            const wrapper = fieldConfig.wrapper;
        }
        return {
            restrict: 'AE',
            scope: {
                item: '=',
            },
            link: function (scope, elem, attr) {
                freezObjectProperty(scope.item, "name", scope.item.name);
                let fieldConfig = builderConfig.getType(scope.item.name);
                let args = arguments;
                let that = this;
                getFieldTemplate(fieldConfig).then(function (templateString) {
                    let compieldHtml = $compile(templateString)(scope);
                    elem.append(compieldHtml);
                }).then(function () {
                    if (typeof fieldConfig.link === "function")
                        fieldConfig.link.apply(that, args);
                }).catch(function (error) {
                    throw new Error('There was a problem setting the template for this field ' + error);
                });
            },
            controller: function ($scope) {
                let fieldConfig = builderConfig.getType($scope.item.name);
                invokeController(fieldConfig.controller, $scope);
            },
        };
    }]);

    formBuilder.directive('builderFieldConfig', ['$compile', function ($compile) {
        return {
            restrict: 'AE',
            scope: {
            },
            templateUrl: 'none'
        };
    }]);

    formBuilder.factory('builderConfig', ['formlyConfig', function (formlyConfig) {
        const typeMap = {};
        function checkType(component) {
            if (angular.isUndefined(component.name))
                throw new Error('field name must be defined check setType ' + JSON.stringify(component));
            if (angular.isUndefined(component.template) && angular.isUndefined(component.templateUrl))
                throw new Error('field template or templateUrl must be defined check setType ' + JSON.stringify(component));
        }
        return {
            setType: function (component) {
                if (angular.isObject(component)) {
                    checkType(component);
                    typeMap[component.name] = component;
                } else {
                    throw new Error('Whoops!');
                }
            },
            getType: function (name) {
                if (typeMap[name])
                    return typeMap[name];
                else {
                    throw new Error('The field ' + name + ' is not Registered');
                }
            }
        };
    }]);

})(angular.module('formBuilder', []));
