// datatable - Provides default binding handler for datatables.net table
// dataSource - the source to bind the table to
// columnModel - the column collection to use
// selectable - Determines if there is a row that allows columns to be selected
//      type - Either radio or check to determine the typ eof HTML control
//      onClick - Method to call when a row is selected
// onEdit - Edit function - if defined then will add edit button to the table for each row
// onDelete - Delete function - if defined then will add delete button to the table for each row
// onCellClick - Function to handle cell clicks
// rowButtons - Collection of objects to use in building a column of buttons that will 
//  go on each row - Expects: { buttonText: Button Text, fnAction: Callback function to perform an action }
// defaultSort - If defined, worklist will be sorted based on provided arguments
//      columnName - Name of column to sort on
//      sortDirection - The direction to sort
$(function ()
{
    ko.bindingHandlers.dataTable =
    {
        init: function (element, valueAccessor)
        {
            var valueUnwrapped = ko.utils.unwrapObservable(valueAccessor());

            var dataSource = ko.utils.unwrapObservable(valueUnwrapped.dataSource);

            var options = ko.utils.unwrapObservable(valueUnwrapped.options);

            var columns = processColumns(valueUnwrapped.columnModel);

            if (valueUnwrapped.selectable)
            {
                if (valueUnwrapped.selectable.type === "radio")
                {
                    columns.unshift(
                        createSelectorColumn(valueUnwrapped.key, valueUnwrapped.selectable.onClick, 'radio'));
                }
                else if (valueUnwrapped.selectable.type === "check")
                {
                    columns.unshift(
                        createSelectorColumn(valueUnwrapped.key, valueUnwrapped.selectable.onClick, 'checkbox'));
                }
            }

            // If an edit function is defined
            // add a column with an edit button for each row
            if (valueUnwrapped.onEdit)
            {
                addButtonColumn(columns, "Edit", valueUnwrapped.onEdit, valueUnwrapped.key);
            }

            // If a delete function is defined
            // add a column with a delete button for each row
            if (valueUnwrapped.onDelete)
            {
                addButtonColumn(columns, "Delete", valueUnwrapped.onDelete, valueUnwrapped.key);
            }

            // Add custom columns for buttons
            if (valueUnwrapped.rowButtons)
            {
                ko.utils.arrayForEach(valueUnwrapped.rowButtons, function (item)
                {
                    addButtonColumn(columns, item.buttonText, item.action, valueUnwrapped.key);
                });
            }

            var sDom = "lfrtip";

            var datatableOptions =
                {
                    "aaData ": dataSource,
                    "aoColumns": columns,
                    "sDom": sDom,
                    "bLengthChange": showLengthChange 
                };

            if (options)
            {
                ko.utils.extend(datatableOptions, options);
            }

            ko.utils.extend(
                datatableOptions,
                {
                    "fnRowCallback":
                        function (nRow, aData, iDisplayIndex, iDisplayIndexFull)
                        {
                            $('td', nRow).on('click', function ()
                            {
                                if (valueUnwrapped.onCellClick)
                                {
                                    valueUnwrapped.onCellClick($(this), aData, iDisplayIndex);
                                }
                            });

                            if (valueUnwrapped.onRowCreate)
                            {
                                valueUnwrapped.onRowCreate(nRow, aData, iDisplayIndex);
                            }
                        }
                });

            var table = $(element).dataTable(datatableOptions);

            if (valueUnwrapped.defaultSort)
            {
                table.sortColumn(valueUnwrapped.defaultSort);
            }

            if (valueUnwrapped.showFilter)
            {
                table.addFilterButton(valueUnwrapped.selectable);
            }

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
        },
        update: function (element, valueAccessor)
        {
            var valueUnwrapped = ko.utils.unwrapObservable(valueAccessor());

            var dataSource = ko.utils.unwrapObservable(valueUnwrapped.dataSource);

            // Clear table
            $(element).dataTable().fnClearTable();

            // Rebuild table from data source specified in binding
            $(element).dataTable().fnAddData(dataSource);
        }
    };

    // Method to build the column model options
    function processColumns(columnModel)
    {
        var columns;
        if (ko.isObservable(columnModel))
        {
            columns = ko.toJS(columnModel);
        }
        else
        {
            columns = columnModel;
        }

        // Iterate each column and if no render method defined
        // attach default render method to protect against null values
        // If there is a checkbox column then add the checkbox code
        for (var i = 0; i < columns.length; i++)
        {
            column = columns[i];

            if (column.mRender == undefined)
            {
                ko.utils.extend(column, getColumnOptions());
            }
        }
        return columns;
    };

    // Creates the selectable columns
    function createSelectorColumn(keyColumn, clickHandler, type)
    {
        return {
            "mData": keyColumn,
            "fnCreatedCell": function (nTd, sData, oData, iRow, iCol)
            {
                // If there is an isAvailable property
                // then use it to disable this row's checkbox
                var disabledTxt = "";
                if (oData.hasOwnProperty('isAvailable'))
                {
                    if (!oData['isAvailable']())
                    {
                        disabledTxt = "disabled = 'disabled'";
                    }
                }

                var name = "check_" + sData;

                if (type === 'radio')
                {
                    name = 'radio_dt_select';
                }

                // Create a checkbox and handle
                var edit = $("<input type='" + type + "' name='" + name + "' value='" + sData + "' />");
                edit.on('click', function ()
                {
                    if (clickHandler)
                    {
                        clickHandler(oData, edit.is(':checked'));
                    }
                });

                $(nTd).empty();
                $(nTd).append(edit);
            },
            "bSortable": false
        }
    };

    // Gets the default column options
    function getColumnOptions()
    {
        return {
            "mRender": function (data, type, row)
            {
                if (data == null || data == undefined)
                {
                    return ''
                }

                return data;
            }
        };
    };

    // Adds column buttons
    function addButtonColumn(columns, text, action, key)
    {
        var dataColumn = "id";

        if (key)
        {
            dataColumn = key;
        }
        
        columns.push(
        {
            "mData": dataColumn,
            "fnCreatedCell": function (cell, cellData, data, row, col)
            {
                var btn = $("<a href=''>" + text + "</a>");
                btn.on('click', function ()
                {
                    action(data);
                    return false;
                });
                $(cell).empty();
                $(cell).prepend(btn);
            },
            "bSortable": false
        });
    };
});