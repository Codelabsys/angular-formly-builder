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
            },
            template: '<div style="height: 100%;width: 100%;" dnd-list="builderList">' +
            '<div  ng-repeat="item in builderList"> {{ item.name }} </div>' +
            '</div>',
            controller: function ($scope) {
                // check if it was defined.  If not - set a default
                $scope.builderList = [];
            },
        };
    }]);

    formBuilder.directive('builderDropzoneField', ['$compile', 'builderConfig', '$q', '$templateCache', '$http', function ($compile, builderConfig, $q, $templateCache, $http) {
        return {
            restrict: 'AE',
            scope: {
                item: '='
            },
            link: function (scope, elem, attr) {
                let fieldConfig = builderConfig.getType(scope.item.name);
                getFieldTemplate(fieldConfig).then(function (templateString) {
                    elem.append(templateString);
                }).catch(function (error) {
                    throw new Error('can not load template ' + error);
                });
            },
            controller: function ($scope) {
                //TODO run controllers
            },
        };

        function getFieldTemplate(component) {
            if (angular.isUndefined(component.template) && angular.isUndefined(component.templateUrl))
                throw new Error('component must have a template or a templateUrl');
            else {
                let templatePromise = null;
                if (component.template)
                    return templatePromise = $q.when(component.template);
                else if (component.templateUrl) {
                    templatePromise = $q.when(component.templateUrl);
                    const httpOptions = { cache: $templateCache };
                    return templatePromise.then((url) => $http.get(url, httpOptions))
                        .then((response) => response.data)
                        .catch(function (error) {
                            throw new Error('can not load template url ' + error);
                        });
                }
            }
        }
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
        return {
            setType: function (component) {
                if (angular.isObject(component)) {
                    //checkType(component);
                    typeMap[component.name] = component;
                } else {
                    throw new Error('Whoops!');
                }
            },
            getType: function (name) {
                if (name)
                    return typeMap[name];
                else {
                    throw new Error('Whoops!');
                }
            }
        };
    }]);

})(angular.module('formBuilder', []));
