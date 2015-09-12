// addButtonRow - Adds a button row to the Datatable instance
// settings - Part of Datatables API
// returns 
// {
//      addButton - A method to add a button to the row
//			Expects a JSON object of { text: YOUR BUTTON TEXT, action: The action to take when clicked}
// }
$.fn.dataTableExt.oApi.addButtonRow = function (settings)
{
    var buttonRowId = settings.sTableId + "_buttonRow";

    // Append a button row to add our custom buttons to
    // This wrapper element is created by DataTables.net
    $("#" + settings.sTableId + "_wrapper").append("<br /><div id='" + buttonRowId + "'></div>");

    return {
        addButton: function (button) { addButton(button, buttonRowId); }
    }

    // Adds the button row
    function addButton(button, buttonRowId)
    {
        var style = "class='button_long'";
        // Create the HTML button
        // and assign the click event
        // to execute the button action
        var buttonHtml = $("&nbsp;<input type='button' value='" + button.text + "' " + style + " /> &nbsp;");

        buttonHtml.on('click', function ()
        {
            if (!button.action)
            {
                alert("There is no action attached to this button");

                return false;
            }

            button.action();

            return false;
        });

        $("#" + buttonRowId).append(buttonHtml);
    }
};

// addFilterButton - Will add a filter row and button to a datatables instance
// settings - Part of Datatables API
// showCheckBox - Is there a row checkbox
$.fn.dataTableExt.oApi.addFilterButton = function (settings, showCheckbox, reactEnterKey)
{
    var element = settings.nTable;

    var dataTable = $(element).dataTable();

    var buttonRow = dataTable.addButtonRow();

    var results = dataTable.createFilterRow(showCheckbox, reactEnterKey);

    // Add the button to hide/show the filter row
    buttonRow.addButton(
        {
            text: "Filter",
            action: results.showFilter
        });
};

// createFilterRow - Will remove and add a filter row to a Datatables instance 
// settings - Part of Datatables API
// rowSelectable - Is there a row selector
// reactEnterKey - Do we want to react to the enter key
// returns 
// {
//      showFilter - Hides/shows the filter row
// }
$.fn.dataTableExt.oApi.createFilterRow = function (settings, rowSelectable, reactEnterKey)
{
    var element = settings.nTable;

    var headInput = $(element).find("thead input");

    var dataTable = $(element).dataTable();

    var filterId = settings.sTableId + "_filterRow";

    if (headInput)
    {
        headInput.remove();
    }

    if ($("#" + filterId))
    {
        $("#" + filterId).remove();
    }

    var columns = settings.aoColumns;

    var filterRow = buildFilterRow(
                columns,
                filterId,
                rowSelectable);

    $(element).find("thead").append(filterRow);

    // Hide the filter row to start
    $("#" + filterId).hide();

    var headInput = $(element).find("thead input");

    headInput.keyup(function (event)
    {
        var colIndex = headInput.index(this);

        // Use the data attribute to get the column name
        // and find the actual column we want to filter
        var columnName = $(this).attr('data-columnName');

        if (columnName != "")
        {
            var selColumn = $.grep(columns, function (item, index)
            {
                return item.sName == columnName;
            });

            colIndex = selColumn[0].index;
        }

        // If we have added a checkbox column
        // then we must offset the column filters
        // by 1 because the checkbox column
        // has no filter
        if (rowSelectable)
        {
            colIndex = colIndex + 1;
        }

        // If we only want to react to the Enter key
        // then see if this is the enter key
        if (reactEnterKey)
        {
            var enterKey = event.keyCode === 13;
            if (enterKey)
            {
                dataTable.fnFilter(this.value, colIndex);
                return;
            }
            else
            {
                return;
            }
        }

        // Filter on the column (the index) of this element 
        dataTable.fnFilter(this.value, colIndex);
    });

    // Support functions to provide a little bit of  
    // 'user friendliness' to the textboxes
    var asInitVals = new Array();

    headInput.each(function (i)
    {
        asInitVals[i] = this.value;
    });

    headInput.focus(function ()
    {
        if (this.className == "search_init")
        {
            this.className = "";
            this.value = "";
        }
    });

    headInput.blur(function (i)
    {
        if (this.value == "")
        {
            this.className = "search_init";
            this.value = asInitVals[$("thead input").index(this)];
        }
    });

    return {
        showFilter: function () { showFilter(filterId); }
    };


    // Private function to build the filter row HTML
    function buildFilterRow(columns, filterId, rowSelectable)
    {
        var filterRow = "<tr id='" + filterId + "'>";

        var style = "style='width:80%;'";

        // If we add a checkbox, then we do not need
        // to be able to filter that column
        // so add an empty cell and start the 
        // the columns at 1
        var start = 0;
        if (rowSelectable)
        {
            start = 1;
            filterRow += "<td></td>";
        }

        for (var i = start; i < columns.length; i++)
        {
            if (columns[i].bVisible != undefined && columns[i].bVisible)
            {
                // Create the filter row and add a data attribute for 
                // column name so that we can use it when doing the actual filtering
                filterRow +=
                    "<td><input type='text' name='search_engine' value=''" +
                    style +
                    " class='search_init' data-columnName='" + columns[i].sName + "' /></td>";
            }
        }

        filterRow + "</tr>";

        return filterRow;
    }

    // Private function to show/hide the filter row
    function showFilter(filterId)
    {
        if ($("#" + filterId).is(":visible"))
        {
            $("#" + filterId).hide();
        }
        else
        {
            $("#" + filterId).show();
        }
    }
};

// findColumnWithMData - Finds a column based on the mData name 
// settings - Part of Datatables API
// data - mData name
$.fn.dataTableExt.oApi.findColumnWithMData = function (settings, data)
{
    var index = -1;

    var currentColumns = settings.aoColumns;

    var dataTable = $(settings.nTable).dataTable();

    for (var i = 0; i < currentColumns.length; ++i)
    {
        if (currentColumns[i].mData === data)
        {
            index = i;
        }
    }

    return {
        index: index
    };
};