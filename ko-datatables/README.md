ko-datatables
=================

These are a set of JavaScript files I wrote for a task to integrate DataTables and KnockoutJS.  It was my first real experience writing custom KnockoutJS binding handlers.  I had also never used DataTables before.


dataContext.js - A service wrapper for JQuery AJAX calls

datatables.extensions.js - Extensions I have used in various projects for JQuery Data Tables.  These are required for using the Data Tables Knockout binding Handler

ko.datatable.js - A binding handler for JQuery Data Tables

ko.linqTable.js - A binding handler that builds off the Data Tables binding handler to allow for management of larger data sets using a JavaScript linq library.

ko.odataTable.js - A binding handler that builds off the Data Tables binding handler to do server side processing using ODATA queries 