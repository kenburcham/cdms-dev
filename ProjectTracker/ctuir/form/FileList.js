define([
	"dojo/_base/fx",
	"dojo/dom-style",
	"dojo/dom-class",
	"dojo/_base/declare",
	"dojo/_base/lang",
	"dojo/_base/array",
	"dijit/_base/manager",
	"dojox/form/uploader/FileList",
	"dojo/text!templates/UploaderFileList.html?v2"
],function(fx, domStyle, domClass, declare, lang, arrayUtil, manager, FileList, template){

    return declare("ctuir.form.FileList", FileList, {

        templateString: template,
        headerFileTitle: "Title",
        headerFileDescription: "Description",

        //override to add our own two form fields
        _addRow: function (index, type, name, size) {
            var newIndex = parseInt(index) - 1;
            var c,
	        r = this.listNode.insertRow(-1);

            c = r.insertCell(-1);
            domClass.add(c, "dojoxUploaderFileName");
            c.innerHTML = name;

            c = r.insertCell(-1);
            domClass.add(c, "ctuirUploaderFileTitle");
            c.innerHTML = "<input type='text' name='Title_" + newIndex + "'></input>";

            c = r.insertCell(-1);
            domClass.add(c, "ctuirUploaderFileDescription");
            c.innerHTML = "<input type='text' name='Description_" + newIndex + "'></input>";


            this.rowAmt++;
        }
    });
});

