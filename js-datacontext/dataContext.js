
// dataContext - provides a unified interface for accessing
//  REST services through javascript - uses jQuery on the backend to make 
//  REST calls
// apiRoute - The route for the REST service
// additionalMethods - An array of JSON objects designed to all the dataContext to
// build non-RESTful routes into the service - This array will be processed
// and used to extend the dataContext being returned
//
// DataContext
//      get: GET call without options
//      query: GET call with options or query information
//      save: POST call
//      update: PUT call
//      remove: DELETE call
//
// JSON object definition for additonalMethods array
//      - route: The name of the route and the method call that will be available
//      - type: The type of call (e.g. GET)
//      - hasParameters: Bool flag that determines if the function should expect parameters
var dataContext = function (apiRoute, additionalMethods)
{
    var defaults = {
        get: function () { return get(); },
        query: function (data) { return query(data); },
        save: function (data) { return save(data); },
        update: function (data) { return update(data); },
        remove: function (data) { return remove(data); }
    };

    var addMethods = {};

    // If there are additional methods
    // then build the JSON object here
    if (additionalMethods)
    {
        $.each(additionalMethods, function (index, method)
        {
            var methodName = method.route;

            if (method.hasParameters)
            {
                addMethods[methodName] = function (data)
                {
                    var localRoute = getApiRoute();

                    return $.ajax({
                        url: localRoute + '/' + method.route,
                        type: method.type,
                        data: data
                    });
                };
            }
            else
            {
                addMethods[methodName] = function ()
                {
                    var localRoute = getApiRoute();

                    return $.ajax({
                        url: localRoute + '/' + method.route,
                        type: method.type
                    });
                };
            }
        });
    }

    // Combine the defaults with the additonal methods
    // to create our data context object
    var results = $.extend({}, addMethods, defaults);

    return results;

    // Implementation details
    function get()
    {
        var localRoute = getApiRoute();

        return $.ajax({
            url: localRoute,
            type: 'GET'
        });
    };

    function query(data)
    {
        var localRoute = getApiRoute();

        return $.ajax({
            url: localRoute,
            type: 'GET',
            data: data
        });
    };

    function save(data)
    {
        var localRoute = getApiRoute();

        return $.ajax({
            url: localRoute,
            type: 'POST',
            data: data
        });
    };

    function update(data)
    {
        var localRoute = getApiRoute();

        return $.ajax({
            url: localRoute,
            type: 'PUT',
            data: data
        });
    };

    function remove(data)
    {
        var localRoute = getApiRoute();

        return $.ajax({
            url: localRoute,
            type: 'DELETE',
            data: data
        });
    };

    function getApiRoute()
    {
        return bis.plugin.defaults.getApiRoute(apiRoute);
    };
}