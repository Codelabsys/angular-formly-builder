(function (formBuilder) {
    /**
     * This directive is responsible for adding drag and drop functionality and sending the
     *  `builderDropzone` the required object in order to identify the dropped item. 
     */
    formBuilder.directive('builderFieldType', ['$compile', function ($compile) {
        return {
            restrict: 'A',
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
                builderList: '=?',
                builderName: '@',
                formFields: '='
            },
            template: '<builder-dropzone-field ng-repeat="item in builderList" item="item" form-field="formFields[$index]" dnd-draggable="item"   dnd-moved="builderList.splice($index, 1)" on-field-removed="onItemRemoved($index)" dnd-effect-allowed="move" />',
            controller: function ($scope) {
                // check if it was defined.  If not - set a default
                $scope.builderList = $scope.builderList || [];
                $scope.formFields = new Array($scope.builderList.length);

                //  this adds the form field to `formFields` when the field is dropped to the dropzone 
                //  the added form field is intitialized by undefined 
                //  and the `builder-dropzone-field` is resposible for updating this value
                $scope.onItemAdded = function (index, item, external, type) {
                    $scope.formFields.splice(index, 0, undefined)
                    // Return false here to cancel drop. Return true if you insert the item yourself.
                    return item;
                };
                /** 
                 *this function is invoked when the `builder-dropzone-field` is destroyed
                 *the `builder-dropzone-field` is mainly destoryed when the item (field) is removed from the `builderList`
                 *`formFields` needs to be updated by removing the corresponding field from it
                 */
                $scope.onItemRemoved = function (index) {
                    $scope.formFields.splice(index, 1)
                };
            },
            compile: function (tElement, attrs, transclude) {
                tElement.removeAttr('builder-dropzone');
                tElement.attr('dnd-list', 'builderList');
                tElement.attr('dnd-drop', 'onItemAdded(index, item, external, type)');
                return {
                    pre: function preLink(scope, iElement, iAttrs, controller) {
                    },
                    post: function postLink(scope, iElement, iAttrs, controller) {
                        $compile(iElement)(scope);
                    }
                };
            },
        };
    }]);

    /**
     * This directive is responsible for rendering the droped field template  and
     *  add drag and drop functionality to it
     */
    formBuilder.directive('builderDropzoneField', ['$compile', 'builderConfig', '$q', '$templateCache', '$http', '$controller', function ($compile, builderConfig, $q, $templateCache, $http, $controller) {

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

        function invokeController(controller, scope) {
            $controller(controller, { $scope: scope })
        }

        return {
            restrict: 'AE',
            scope: {
                item: '=',
                formField: '=',
                onFieldRemoved: '&'
            },
            link: function (scope, elem, attr) {
                let fieldConfig = builderConfig.getType(scope.item.name);
                getFieldTemplate(fieldConfig).then(function (templateString) {
                    let compieldHtml = $compile(templateString)(scope);
                    elem.append(compieldHtml);
                }).catch(function (error) {
                    throw new Error('can not load template ' + error);
                });

                scope.$on('$destroy', function () {
                    console.log("destroy");
                    console.log(scope);
                    scope.onFieldRemoved();
                });
            },
            controller: function ($scope) {
                $scope.formField = { "key": Math.random(), "type": $scope.item.name };

                let fieldConfig = builderConfig.getType($scope.item.name);
                if (typeof fieldConfig.controller === "function")
                    invokeController(fieldConfig.controller, $scope);
            },
        };
    }]);

    formBuilder.directive('builderFieldConfig', ['$compile', function ($compile) {
        return {
            restrict: 'A',
            scope: {
                name: '@',
            },
            controller: function ($scope) {
                // check if it was defined.  If not - set a default
                $scope.item = $scope.item || { name: $scope.name };
            },
            link: function (scope, elem, attr) {

            }

        };
    }]);

    formBuilder.factory('builderConfig', function () {
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
    });

})(angular.module('formBuilder', []));
