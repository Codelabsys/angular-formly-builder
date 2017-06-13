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
            template: '<div ng-repeat="item in builderList">{{item.name}}</div>',
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
