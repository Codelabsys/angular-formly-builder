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
        let check = apiCheck();

        function getFieldTemplate(component) {
            if (angular.isUndefined(component.template) && angular.isUndefined(component.templateUrl))
                throw new Error('component ' + component.name + 'must have a template or a templateUrl');
            else {
                return getTemplate(component.template || component.templateUrl, !component.template);
            }
        }

        function invokeController(controller, scope) {
            check.throw([check.func, check.object], arguments, { prefix: 'faild to invoke field controller this may happen if you are not passing a function', suffix: "check setType function" });
            $controller(controller, { $scope: scope })
        }

        function invokeLink(fieldConfig, context, args) {
            let linkFunc = fieldConfig.link;
            return function () {
                if (!linkFunc)
                    return;
                else if (typeof linkFunc === "function")
                    linkFunc.apply(context, args);
                else
                    throw new Error('Link property must be a function check setType');
            }
        }

        function freezObjectProperty(object, propertyName, value) {
            Object.defineProperty(object, propertyName, {
                value: value,
                writable: false,
                enumerable: true,
                configurable: true
            });
        }

        function getTemplate(template, isUrl) {
            let templatePromise = $q.when(template);
            if (!isUrl)
                return templatePromise;
            else {
                const httpOptions = { cache: $templateCache };
                return templatePromise.then((url) => $http.get(url, httpOptions))
                    .then(function (response) {
                        return response.data;
                    })
                    .catch(function (error) {
                        throw new Error('can not load template url ' + template + ' ' + error);
                    });
            }
        }

        function doTransclusion(wrapper, template) {
            let superWrapper = angular.element('<a></a>');
            superWrapper.append(wrapper);
            let transcludeEl = superWrapper.find('transclude');
            if (!transcludeEl.length)
                console.warn("can not find transclude tag check your wrapper template " + wrapper);
            transcludeEl.replaceWith(template);
            return superWrapper.html();
        }

        function transcludeInWrappers(fieldConfig) {
            const wrappers = fieldConfig.wrapper;
            return function (template) {
                if (!wrappers || wrappers.length == 0)
                    return $q.when(template);
                else if (Array.isArray(wrappers)) {
                    let templatesPromises = wrappers.map(function (wrapper) {
                        return getTemplate(wrapper, true);
                    });
                    return $q.all(templatesPromises).then(function (wrappersTemplates) {
                        wrappersTemplates.reverse();
                        let totalWrapper = wrappersTemplates.shift();
                        wrappersTemplates.forEach(function (wrapper) {
                            totalWrapper = doTransclusion(totalWrapper, wrapper);
                        });
                        return doTransclusion(totalWrapper, template);
                    });
                }
                else {
                    throw new Error("wrapper must be of type array check setType")
                }
            }
        }

        return {
            restrict: 'AE',
            scope: {
                item: '=',
                formField: '=',
                onFieldRemoved: '&'
            },
            link: function (scope, elem, attr) {
                freezObjectProperty(scope.item, "name", scope.item.name);
                let fieldConfig = builderConfig.getType(scope.item.name);
                let args = arguments;
                let that = this;

                getFieldTemplate(fieldConfig)
                    .then(transcludeInWrappers(fieldConfig))
                    .then(function (templateString) {
                        let compieldHtml = $compile(templateString)(scope);
                        elem.append(compieldHtml);
                    }).then(invokeLink(fieldConfig, that, args))
                    .catch(function (error) {
                        throw new Error('There was a problem setting the template for this field ' + error + " " + JSON.stringify(fieldConfig));
                    });



                scope.$on('$destroy', function () {
                    scope.onFieldRemoved();
                });

            },
            controller: function ($scope) {
                $scope.formField = { "key": Math.random(), "type": $scope.item.name };
                let fieldConfig = builderConfig.getType($scope.item.name);
                if (fieldConfig.controller)
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
