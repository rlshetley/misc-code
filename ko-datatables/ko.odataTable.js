// odataTable - Provides binding handler for ODATA driven datatables
//  odataService - The method to call when performing ODATA queries
//  defaultSort - Default sort to use in the table
//  onCellClick - If defined, used as a cell click function handler
$(function ()
{
    ko.bindingHandlers.odataTable =
    {
        init: function (element, valueAccessor)
        {
            var valueUnwrapped = ko.utils.unwrapObservable(valueAccessor());

            // We need to unwrap our columns to make changes
            // and actually bind to the Datatable instance
            var columns = ko.toJS(valueUnwrapped.columnModel);

            var dataSource = valueUnwrapped.dataSource;

            var odataService = valueUnwrapped.odataService;

            var datatableOptions = getServerOdataFunction(element, dataSource, columns, odataService);

            // If a callback for a row click is defined
            // then extend the datatables options with the callback
            if (valueUnwrapped.onCellClick)
            {
                ko.utils.extend(
                    datatableOptions,
                    {
                        "fnRowCallback":
                        function (nRow, aData, iDisplayIndex, iDisplayIndexFull)
                        {
                            $('td', nRow).on('click', function ()
                            {
                                valueUnwrapped.onCellClick($(this), aData, iDisplayIndex);
                            });
                        }
                    });
            }

            // If a default sort is defined
            // then set up the sorting option
            if (valueUnwrapped.defaultSort)
            {
                ko.utils.extend(
                    datatableOptions,
                    {
                        "aaSorting": valueUnwrapped.defaultSort
                    });
            }            

            var table = $(element).dataTable(datatableOptions);

            if (valueUnwrapped.showFilter)
            {
                table.addFilterButton(false, true);
            }

            return table;
        }
    }

    // Method to build out the options for the specialized datatable
    // that we are going to use to do ODATA queries
    // Use sDom to turn off the upper left search box
    function getServerOdataFunction(element, dataSource, columns, odataService)
    {
        return {
            "fnServerData":
                function (url, data, callback, settings)
                {
                    queryServer(url, data, callback, settings, odataService);
                },
            "aaData ": dataSource,
            "bServerSide": true,
            "aoColumns": columns,
            "sDom": "lrtip"
        }
    };

    // Method to perform ODATA query callback
    function queryServer(url, data, callback, settings, odataService)
    {
        var odataQuery = createOdataQuery(settings);

        // Call our data query method
        // that will return all the data we need
        odataService(odataQuery).then(
            function (data)
            {
                var dataSource = {};

                dataSource.aaData = data.results;

                dataSource.iTotalDisplayRecords = data.totalRecords;
                dataSource.iTotalRecords = data.totalRecords;

                callback(dataSource);
            });
    };

    function createOdataQuery(settings)
    {
        var odataQuery = {
            $top: settings._iDisplayLength,
            $skip: settings._iDisplayStart
        };

        // Now we need to build our filter query by going through each
        // column and seeing if there is an individual search parameter
        // and there must be an ODATA Name on the column
        var asFilters = [];
        $.each(settings.aoColumns,
            function (i, value)
            {
                var searchParams = settings.aoPreSearchCols[i];

                var sFieldName = value.oDataName;

                // If we have eveything we need, build a filter string
                // that we can use to filter the data with
                // For now, we only support string searching
                if (searchParams && searchParams.sSearch != "" && sFieldName)
                {
                    if (value.sType === 'date')
                    {
                        var dateTime = moment(searchParams.sSearch, "M/D/YYYY");

                        asFilters.push("day(" + sFieldName + ") eq " + dateTime.date() + " ");

                        // Momentjs counts months starting at 0 so 
                        // we need to add 1 to get the correct month 
                        // for the ODATA query
                        var month = dateTime.month() + 1;

                        asFilters.push("month(" + sFieldName + ") eq " + month + " ");

                        asFilters.push("year(" + sFieldName + ") eq " + dateTime.year() + " ");
                    }
                    else
                    {
                        var encodedSearch = searchParams.sSearch.encodeOdataQueryFilter();

                        asFilters.push("substringof('" + encodedSearch + "'," + sFieldName + ")");
                    }
                }
            });

        // If we have anything in our filter array, build out a filter string with AND
        if (asFilters.length > 0)
        {
            odataQuery.$filter = asFilters.join(" and ");
        }

        // If there are any sort parameters defined
        // then build out the orderby clause of the OData query
        if (settings.aaSorting.length > 0)
        {
            var sortParams = settings.aaSorting[0];

            var column = settings.aoColumns[sortParams[0]];

            var odataName = column.oDataName;

            if (odataName)
            {
                odataQuery.$orderby = odataName + " " + sortParams[1];
            }
        }

        return odataQuery;
    };
});