// linqTable - Provides binding handler for JavaScript Linq driven tables - requires Linq Library
//  cacheItems - The items to query against - this collection will be cached and the table will use linq queries
//                  to get what it needs out of the table
//  defaultSort - Default sort to use in the table
//  propSubscriptions - The observable properties the view model wants to watch
$(function ()
{
    var updatingRow = 0;

    var table = null;

    var propSubscriptions = [];

    var cacheData = [];

    ko.bindingHandlers.linqTable = {
        init: function (element, valueAccessor)
        {
            var valueUnwrapped = ko.utils.unwrapObservable(valueAccessor());

            // We need to unwrap our columns to make changes
            // and actually bind to the Datatable instance
            var columns = ko.toJS(valueUnwrapped.columnModel);

            var dataSource = valueUnwrapped.dataSource;

            cacheData = valueUnwrapped.cacheItems;

            if (valueUnwrapped.subscribe)
            {
                propSubscriptions = valueUnwrapped.subscribe;
            }

            table = ko.bindingHandlers.dataTable.init(
                element,
                function ()
                {
                    return {
                        dataSource: valueUnwrapped.dataSource,
                        columnModel: columns,
                        key: valueUnwrapped.key,
                        onCellClick: function (cell, data, index)
                        {
                            onCellClicked(cell, data, index, valueUnwrapped.onCellClick);
                        },
                        showSearchBox: false,
                        showFilter: valueUnwrapped.showFilter,
                        onRowCreate: valueUnwrapped.onRowCreate,
                        selectable: {
                            type: valueUnwrapped.selectable ? valueUnwrapped.selectable.type : null,
                            onClick: function (data)
                                {
                                    valueUnwrapped.selectable.onClick(data.observable);
                                }
                        },
                        options: {
                            "bServerSide": true,
                            "fnServerData": function (sUrl, aoData, fnCallback, oSettings)
                            {
                                queryCollection(sUrl, aoData, fnCallback, oSettings);
                            },
                            "aaSorting": valueUnwrapped.defaultSort == undefined ? [[0, 'desc']] : valueUnwrapped.defaultSort
                        }
                    };
                });

            // Add a button row and then add all our buttons
            // to that row
            var buttonRow = table.addButtonRow();

            // Build out the button list 
            // the caller has given us
            if (valueUnwrapped.buttons)
            {
                var buttons = valueUnwrapped.buttons;

                for (var i = 0; i < buttons.length; i++)
                {
                    buttonRow.addButton(buttons[i]);
                }
            }

            return table;
        }
    }

    function onCellClicked(cell, data, index, onCellClick)
    {
        if (cell.find('input').length)
        {
            return;
        }

        onCellClick(cell, data, index);
    };

    // Method to build out the options for the specialized datatable
    // that we are going to use to do ODATA queries
    // Use sDom to turn off the upper left search box
    function getServerOdataFunction(element, dataSource, columns)
    {
        return {
            "fnServerData":
                function (sUrl, aoData, fnCallback, oSettings)
                {
                    queryCollection(sUrl, aoData, fnCallback, oSettings);
                },
            "aaData ": dataSource,
            "bServerSide": true,
            "aoColumns": columns,
            "sDom": "lrtip"
        }
    };

    // Method to perform ODATA query callback
    function queryCollection(sUrl, aoData, callback, oSettings)
    {
        var linqArray = $linq(cacheData);

        $.each(oSettings.aoColumns,
            function (i, value)
            {
                var searchParams = oSettings.aoPreSearchCols[i];

                var fieldName = value.mData;

                // If we have eveything we need, build a filter string
                // that we can use to filter the data with
                // For now, we only support string searching
                if (searchParams && searchParams.sSearch != "" && fieldName)
                {
                    if (value.sType === 'date')
                    {
                        var dateTime = moment(searchParams.sSearch, "M/D/YYYY");

                        var dateString = moment().format("M/D/YYYY");

                        var matchString = new RegExp(dateString);

                        linqArray =
                            linqArray.where(
                                "x => x." + fieldName + "&& x." + fieldName + ".match(" + matchString + ")");
                    }
                    else if (value.sType === 'int')
                    {
                        var matchString = new RegExp(searchParams.sSearch);

                        linqArray =
                            linqArray.where(
                                "x => x." + fieldName + "&& x." + fieldName + ".toString().match(" + matchString + ")");
                    }
                    else
                    {
                        var matchString = new RegExp(searchParams.sSearch.toLowerCase());

                        linqArray =
                            linqArray.where(
                                "x => x." + fieldName + " && x." +
                                fieldName + ".toLowerCase().match(" + matchString + ")");
                    }
                }
            });

        // If there are any sort parameters defined
        // then build out the orderby clause of the OData query
        if (oSettings.aaSorting.length > 0)
        {
            var sortParams = oSettings.aaSorting[0];

            var column = oSettings.aoColumns[sortParams[0]];

            var sort = "x => x." + column.mData;

            if (sortParams[1] === 'desc')
            {
                linqArray = sortDescending(linqArray, column, sort);
            }
            else
            {
                linqArray = sortAscending(linqArray, column, sort);
            }
        }

        linqArray = linqArray
            .skip(oSettings._iDisplayStart)
            .take(oSettings._iDisplayLength);

        var finalResults = linqArray.toArray();

        updateSubscriptions(finalResults);

        var dataResults = {};

        dataResults.aaData = finalResults;

        dataResults.iTotalDisplayRecords = cacheData.length;
        dataResults.iTotalRecords = cacheData.length;

        callback(dataResults);
    };

    function updateSubscriptions(itemCol)
    {
        ko.utils.arrayForEach(itemCol, function (item)
        {
            // If the item does not already
            // have the observable property
            // then set it and update the subscriptions
            if (!item.observable)
            {
                item.observable = ko.mapping.fromJS(item);

                ko.utils.arrayForEach(propSubscriptions, function (prop)
                {
                    item.observable[prop].subscribe(function (value)
                    {
                        var colInfo = table.findColumnWithMData(prop);

                        table.fnUpdate(value, updatingRow, colInfo.index, false);
                    });
                });
            }
        });
    };

    function sortAscending(linqArray, column, sort)
    {
        if (column.sType === 'date')
        {
            return linqArray
                .orderByDescending(sort, function (item1, item2)
                {
                    var date1 = moment(item1, "M/D/YYYY");

                    var date2 = moment(item2, "M/D/YYYY");

                    var result = moment(date1).isAfter(date2);

                    return (result === true ? -1 : result === false ? 1 : 0);
                });
        }
        else
        {
            return linqArray.orderBy(sort);
        }
    };

    function sortDescending(linqArray, column, sort)
    {
        if (column.sType === 'date')
        {
            return linqArray
                .orderByDescending(sort, function (item1, item2)
                {
                    var date1 = moment(item1, "M/D/YYYY");

                    var date2 = moment(item2, "M/D/YYYY");

                    var result = moment(date2).isAfter(date1);

                    return (result === true ? -1 : result === false ? 1 : 0);
                });
        }
        else
        {
            return linqArray.orderByDescending(sort);
        }
    };
});