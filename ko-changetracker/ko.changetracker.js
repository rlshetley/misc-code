var ko = ko || {};

// ko.changeTracker - provides a Javascript object for tracking
//  changes within a Knockout View Model
ko.changeTracker = function ()
{
    return {
        isDirty: isDirty,
        trackChanges: trackChanges
    };

    // An array to track changes
    var changes = ko.observableArray();

    // An associative array of original property values
    // so we do not track reversions
    var model = {};

    // Is Dirty flag so that we can know if changes were
    // made to the view model
    function isDirty (){
        return scope.changes().length > 0;
    }

    // Method to track changes to a knockout view model
    function trackChanges(model){
        for (var prop in model)
        {
            if (model.hasOwnProperty && model.hasOwnProperty(prop))
            {
                trackChange(prop, model);

                var underlying = ko.utils.unwrapObservable(model[prop]);
                if (underlying instanceof Array)
                {
                    ko.utils.arrayForEach(underlying, function (item)
                    {
                        scope.trackChanges(item);
                    });
                }
                else if (typeof underlying === "object")
                {
                    scope.trackChanges(underlying);
                }
            }
        }
    };

    //***************************************
    // Private Methods
    //***************************************
    
    // Add this change to the array of changes
    function onPropertyChanged(propertyName, source, previousValue){
        var currentValue = ko.toJS(source[propertyName]);

        // We should never set anything to undefined for
        // the change tracking - it will cause errors
        // in the audit logging
        if (currentValue === undefined)
        {
            return;
        }

        if (scope.model[propertyName] != currentValue)
        {
            addTrackedChange(propertyName, currentValue, previousValue)
        }
        else
        {
            // If we are going back to the original change
            // then there is no need to track any of the changes
            removeTrackedChange(propertyName);
        }
    };

    function removeTrackedChange(propertyName){
        scope.changes.remove(
            function (item)
            {
                return item.propertyName == propertyName;
            });
    }

    function addTrackedChange(propertyName, currentValue, previousValue){
        // Loop through the existing changes and see if we have already
        // tracked this change - if already tracked then do not log
        // again
        var match = ko.utils.arrayFirst(scope.changes(), function (item){
            if (item.propertyName == propertyName &&
                item.currentValue == currentValue &&
                item.previousValue == previousValue)
            {
                return item;
            }
        });

        if (!match)
        {
            // Find out if we already have a change for this property
            // and if we do then remove it and add the latest change
            // using the original value
            match = ko.utils.arrayFirst(scope.changes(), function (item)
            {
                if (item.propertyName === propertyName)
                {
                    return item;
                }
            });

            if (match)
            {
                scope.changes.remove(
                    function (item)
                    {
                        return item.propertyName == propertyName;
                    });
                scope.changes.push({
                    propertyName: propertyName,
                    currentValue: currentValue,
                    previousValue: match.previousValue
                });

            }
            else
            {
                scope.changes.push({
                    propertyName: propertyName,
                    currentValue: currentValue,
                    previousValue: previousValue
                });
            }
        }
    }

    // Track a single change
    function trackChange(prop, source){
        var value = source[prop];
        
        // We only track observable values
        if (ko.isObservable(value))
        {
            // Store the default value
            scope.model[prop] = value();

            // Track the previous value
            var previousValue = {};

            value.subscribe(function (currentValue)
            {
                previousValue = currentValue;

            }, source, "beforeChange");

            value.subscribe(function ()
            {
                onPropertyChanged(prop, source, previousValue);
            });
        }
    };
};