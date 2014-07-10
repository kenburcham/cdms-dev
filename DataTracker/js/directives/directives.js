'use strict';

/* Directives */
//NOTE: all of our directives should be prefixed with "cd-" for "CTUIR Dev".

var mod = angular.module('DatasetDirectives',[]);
mod.directive('showtab',
        function () {
            return {
                link: function (scope, element, attrs) {
                    element.click(function (e) {
                        e.preventDefault();
                        $(element).tab('show');
                    });
                }
            };
        });


mod.directive('ngBlur', function () {
        return function( scope, elem, attrs ) {
            elem.bind('blur', function() {
                scope.$apply(attrs.ngBlur);
            });
        };
    });

var INTEGER_REGEXP = /^\-?\d+$/;
mod.directive('integer', function() {
  return {
    require: 'ngModel',
    link: function(scope, elm, attrs, ctrl) {
      ctrl.$parsers.unshift(function(viewValue) {
        if(viewValue == "")
        {
            ctrl.$setValidity('integer', true);
            return true;
        }

        if (INTEGER_REGEXP.test(viewValue)) {
          // it is valid
          ctrl.$setValidity('integer', true);
          return viewValue;
        } else {
          // it is invalid, return undefined (no model update)
          ctrl.$setValidity('integer', false);
          return undefined;
        }
      });
    }
  };
});

var FLOAT_REGEXP = /^\-?\d+((\.)\d+)?$/;
mod.directive('smartFloat', function() {
  return {
    require: 'ngModel',
    link: function(scope, elm, attrs, ctrl) {
      ctrl.$parsers.unshift(function(viewValue) {
        if(viewValue == "")
        {
            ctrl.$setValidity('float', true);
            return true;
        }

        if (FLOAT_REGEXP.test(viewValue)) {
          ctrl.$setValidity('float', true);
          return parseFloat(viewValue.replace(',', '.'));
        } else {
          ctrl.$setValidity('float', false);
          return undefined;
        }
      });
    }
  };
});

//Hides or shows any element with: project-role="owner"
//  if the project is owned by the current user
//  available project roles = owner, editor
//NOTE: to use this directive, your controller must have the $rootScope defined.
mod.directive('projectRole', function($rootScope){
    return {
        link: function(scope,element, attrs)
        {
            if(!attrs.projectRole)
            {
                throw new Exception("Configuration error: project-role attribute must specify a target role name, 'owner' or 'editor'.");
            }

            var role = attrs.projectRole.trim();

            if(role != 'owner' && role != 'editor')
                throw new Exception("Configuration error: project-role attribute must be 'owner' or 'editor'.");

            var show = false; //default to NOT show.

            function applyRoleToElement()
            {                

                if(role == 'owner' && $rootScope.Profile.isProjectOwner(scope.project))
                {
                    //console.log("Showing role 'owner' because user is owner.");
                    show = true;
                }

                if(role == 'editor' && ($rootScope.Profile.isProjectOwner(scope.project) || $rootScope.Profile.isProjectEditor(scope.project)))
                {
                    //console.log("Showing role 'editor' because user is owner or editor.");
                     show = true;
                }

                if(show)
                    element.show();
                else
                    element.hide();
            }

            if(!scope.project || !scope.project.$resolved)
            {
//                console.log("setting watch");
                var projectWatch = scope.$watch('project',function(){
                    if(scope.project != null)
                    {
  //                      console.log("got a new project hit");
                        projectWatch();
                        scope.project.$promise.then(function(){
    //                        console.log("Promise completed.");
                            applyRoleToElement();
                        });
                    }
                });
            }

            applyRoleToElement();
        }
    };
});

//Hides or Shows any element with: has-role="someRole"
//  where "someRole" is in the current user's roles list
mod.directive('hasRole', function($rootScope){
    return{
        link: function(scope, element, attrs) {
            //console.log("checking permission");

            if(!attrs.hasRole)
                return;

            var value = attrs.hasRole.trim();
            
            var notPermissionFlag = value[0] === '!';
            
            if(notPermissionFlag)
                value.slice(1).trim();

            //console.dir($rootScope.Profile.Roles);
            //console.dir($rootScope.Profile.Fullname);

            if(!$rootScope.Profile.Roles)
                $rootScope.Profile.Roles = {};
            else
                if(!Array.isArray($rootScope.Profile.Roles))
                    $rootScope.Profile.Roles = angular.fromJson($rootScope.Profile.Roles);

            //console.dir($rootScope.Profile.Roles);

            var hasPermission = $rootScope.Profile.Roles[value] ? true : false;

            //console.log(value + " ? " + hasPermission);

            if(hasPermission || (notPermissionFlag && !hasPermission) )
            {
                console.log("hasPermission("+value+") = true");
                element.show();
            }
            else
            {
                console.log("hasPermission("+value+") = false");
                element.hide();
            }
        }
    };
});

mod.directive('ctuirTextField',
    function(){

        var result = {
            templateUrl: 'partials/dataentry/field-text.html',
            restrict: 'E',
        };

        return result;

    });

mod.directive('ctuirTextareaField',
    function(){

        var result = {
            templateUrl: 'partials/dataentry/field-textarea.html',
            restrict: 'E',
        };

        return result;

    });

mod.directive('ctuirDateField',
    function(){

        var result = {
            templateUrl: 'partials/dataentry/field-date.html',
            restrict: 'E',
        };

        return result;

    });

mod.directive('ctuirNumberField',
    function(){

        var result = {
            templateUrl: 'partials/dataentry/field-number.html',
            restrict: 'E',
        };

        return result;

    });

mod.directive('ctuirSelectField',
    function(){

        var result = {
            templateUrl: 'partials/dataentry/field-select.html',
            restrict: 'E',
            controller: function($scope, $element, $attrs) {
                $scope.selectOptions = makeObjectsFromValues($scope.dataset.DatastoreId+$scope.field.DbColumnName, $scope.field.Field.PossibleValues);
            }
        };

        return result;

    });

mod.directive('ctuirMultiselectField',
    function(){

        var result = {
            templateUrl: 'partials/dataentry/field-multiselect.html',
            restrict: 'E',
            controller: function($scope, $element, $attrs) {
               $scope.selectOptions = makeObjectsFromValues($scope.dataset.DatastoreId+$scope.field.DbColumnName, $scope.field.Field.PossibleValues);
            }
        };
        
        return result;

    });

mod.directive('ctuirFileField',
    function(){
        var result = {
            templateUrl: 'partials/dataentry/field-file.html',
            restrict: 'E',
        };

        return result;
    });

mod.directive('ctuirRadioField',
    function(){

        var result = {
            templateUrl: 'partials/dataentry/field-radio.html',
            restrict: 'E',
        };

        return result;

    });

mod.directive('ctuirCheckboxField',
    function(){

        var result = {
            templateUrl: 'partials/dataentry/field-checkbox.html',
            restrict: 'E',
        };

        return result;

    });

mod.directive('multiselect', function () {
 
        return {
 
            scope: true,
            link: function (scope, element, attrs) {
 
                element.multiselect({
 
                    // Replicate the native functionality on the elements so
                    // that angular can handle the changes for us.
                    onChange: function (optionElement, checked) {
 
                        optionElement.removeAttr('selected');
 
                        if (checked) {
                            optionElement.attr('selected', 'selected');
                        }
 
                        element.change();
                    }
                });
 
                // Watch for any changes to the length of our select element
                scope.$watch(function () {
                    return element[0].length;
                }, function () {
                    element.multiselect('rebuild');
                });
 
                // Watch for any changes from outside the directive and refresh
                scope.$watch(attrs.ngModel, function () {
                    element.multiselect('refresh');
                });
 
            }
 
        };
});