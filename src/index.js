(function (formBuilder) {
    formBuilder.directive('builderFieldTypes', ['$compile', function ($compile) {
        return {
            restrict: 'AE',
            transclude: true,
            scope: {
            },
            template: '<div ng-transclude=""></div>',
            link: function (scope, elem, attr) {
                //var x = elem.children('builder-field-type');
                //console.log(x);

            }

        };
    }]);
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
            link: function (scope, elem, attr) {

            },
            compile: function (tElement, attrs, transclude) {

                tElement.attr('dnd-draggable', 'item');
                tElement.attr('sse', '{{1+1}}');
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

    formBuilder.directive('builderDropzoneField', ['$compile', function ($compile) {
        return {
            restrict: 'AE',
            scope: {
            },
            templateUrl: 'none'
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


})(angular.module('formBuilder', []));
