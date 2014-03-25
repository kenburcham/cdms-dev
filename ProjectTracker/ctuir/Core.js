var METADATA_SUMMARYIMAGESELECTIONS = "11"; //id in MetadataProperties table
var METADATA_SUMMARYIMAGESELECTIONS_HTML = "13";
var METADATA_MAPIMAGELOCATION_HTML = "25";
var METADATA_MAPIMAGESELECTION = "26";
var PROJECT_TYPE_PROJECT = "15";
var PROJECT_TYPE_PROGRAM = "14";

var DATE_FORMAT = "MMM dd, yyyy";
var TIME_FORMAT = "hh:mm:ss a";

var STORE_DATE_FORMAT = "yyyy-mm-dd";
var STORE_TIME_FORMAT = "hh:mm:ss a Z";

function flattenProject(project) {

   
        try{
            if (project.Locations && !is_empty(project.Locations) ) {
                //log.debug(project.Locations, "LOCATIONS----------------------");
                for (var key in project.Locations) {
                    var location = project.Locations[key];
                    //TODO: currently location type isn't being checked...
                    if (true || (location.LocationType && location.LocationType.Name == 'Primary')) {
                        project.locationLayer = location.SdeFeatureClassId;
                        project.objectId = location.SdeObjectId;
                        project.key = location.SdeFeatureClassId + '_' + location.SdeObjectId; // "layerid_objectid"
                       
                        break;
                    }
                }
            } else {
                log.error("Flattening failed! Project does not have a location: " + project.Id);
            }

            if (project.Metadata) {
                for (var key in project.Metadata) {
                    var metadata = project.Metadata[key];
                    project['metadata_' + metadata.MetadataPropertyId] = metadata.Values;
                }
            }

            project.DisplayStartDate = formatDisplayUTCDate(project.StartDate);
            project.DisplayEndDate = formatDisplayUTCDate(project.EndDate);

            //flatten us up a "program" column for our grid (sorting doesn't work otherwise)
            project.program = project.metadata_23;
            if (project.metadata_24 && project.metadata_24 != "(None)")
                project.program += " > " + project.metadata_24;

            project.projectType = project.ProjectType.Name;

        } catch (e) {
            log.error("Had an error in flatten project: " + e.message, e);
            //throw new Exception("There was a problem processing incoming project information.  Please try again or contact support.");
        }
    
}

function flattenUser(user) {
    if (is_empty(current_user.UserPreferences))
        current_user.UserPreferences = [];
}

    function setFavoriteStatus(project) {
        require(["dojo/_base/array"], function (array) {

            try{
                //log.debug("setting favorite status for " + project.Id);

                var favorites = getFavorites();

                //show in favorites if either marked as favorite or user is the owner.
                if (array.indexOf(favorites, project.Id) != -1 || project.Owner.Id == current_user.Id) {
                    project.favorite = true;
                    //log.debug("Yes is a favorite!");
                } else {
                    project.favorite = false;
                    //log.debug("No is not a favorite!");
                }

                project.relationship = "";
                if (project.favorite)
                    project.relationship = "Favorite";
                if (project.Owner.Id == current_user.Id)
                    project.relationship = "Owner";

            } catch (e) {
                log.error("Had an error in setFavoriteStatus project: "+project.Id + " :: " + e.message, e);
                //throw new Exception("There was a problem processing incoming project information.  Please try again or contact support.");
            }
        });
}

function printProject() {
    window.open("projectsummary.html?id=" + current_project.Id);
    return false;
}

//toggle
function favoriteProject(id) {

    if (!id)
        id = currentProjectId;

    if (!id) {
        alert("Please select a project to open and then try again.");
        return;
    }

    if (current_project.Owner.Id == current_user.Id) {
        alert("You are the owner of this project so it must remain a favorite.");
        return;
    }

    require(["dojo/_base/array", "dojo/request/xhr"], function (array, request) {
        var favorites = getFavorites();
        var index = array.indexOf(favorites, id);
        if (index == -1) {
            //add it since it isn't there.
            favorites.push(id);
            toggleFavoriteClass(true);
            ////current_project.favorite = true;
        }
        else {
            favorites.splice(index, 1);
            toggleFavoriteClass(false);

            //only unfavorite if user isn't the owner
            ////if(current_project.Owner.Id != current_user.Id)
                ////current_project.favorite = false;
        }

        var result = favorites.toString();
        
        //TODO: does this work right? :)
        if (result.substring(0, 1) == ",")
            result = result.substring(1);

        var pref = getPreferenceByKey("Favorites");

        //setup the default favorites if none there before.
        if (!pref)
            pref = { Name: "Favorites", Value: "" };

        pref.Value = result;

        //log.debug(" >> ok our favorites are now >> " + result);

        savePreference(pref);

        setFavoriteStatus(current_project);
        projectGrid.refresh();


    });

    
}

function savePreference(pref)
{
    var userprefs = { UserPreference: pref };

    restSend("/services/action/SaveUserPreference", userprefs, "post", function (data) {
        if (data.message == "Failure") {
            alert("There was a problem saving your preference information.");
            log.error("had an error saving preferences: " + userprefs);
        }
        else
            log.debug("saved preferences!");
    });
}

function SaveMetadataImageSelections(grid, target_div, md_prop, md_prop_html ) {
    var grid_selection = grid.selection;

    var selection_html = ""; 
    var selections = [];

    for (var id in grid_selection)
    {
        var image_file = grid.store.get(id);
        selection_html += "<div class='selected-image-div'>";
        selection_html += "<img src='" + image_file.Link + "' class='selected-image'>";
        if (!is_empty(image_file.Description) && target_div != "displayMapImage")
            selection_html += "<p>" + image_file.Description + "</p>";
        selection_html += "</div>";

        selections.push(id);
    }

    var metadata = [];

    var md_selections = {};
    md_selections.MetadataPropertyId = md_prop;
    md_selections.Values = selections.toString();
    
    var md_selection_html = {};
    md_selection_html.MetadataPropertyId = md_prop_html;
    md_selection_html.Values = selection_html;

    metadata.push(md_selections);
    metadata.push(md_selection_html);

    current_project["metadata_" + md_prop_html] = selection_html;
    dojo.byId(target_div).innerHTML = selection_html;

    saveMetadata(current_project, metadata);
    
}

//save the image selections made on the quad report image selection dialog
function SaveImageSelections(grid) {
    SaveMetadataImageSelections(grid, "displayQuadImages", METADATA_SUMMARYIMAGESELECTIONS, METADATA_SUMMARYIMAGESELECTIONS_HTML);
}

//save the image selection for the project map
function SaveImageMapSelection(grid) {
    SaveMetadataImageSelections(grid, "displayMapImage", METADATA_MAPIMAGESELECTION, METADATA_MAPIMAGELOCATION_HTML);
}

/*
    Save the given array of metadata into the given project
*/
function saveMetadata(current_project, metadata) {

    var location = current_project.Locations[0];
    
    var saveDetailsArray = {
        Location: { SdeFeatureClassId: location.SdeFeatureClassId, SdeObjectId: location.SdeObjectId }, //no change
        Project: { Id: current_project.Id }, //no change
        Metadata: metadata //and here's the new changes to save
    };

    restSend("/services/action/SaveProjectDetails", saveDetailsArray, "POST", function (project) {
        log.debug("back from saveMetadata");

        //var project = json.parse(projectdata);

        //log.debug("Project: " , project);
        //log.debug("ProjectData: " , projectdata);
        //Now add the new project to our list
        try {
            log.debug("before flattening!");

            flattenProject(project);
            setFavoriteStatus(project);

            log.debug("After flattening: ", project);
            projectStore.put(project);
            log.debug("after put");
            projectGrid.refresh();
            log.debug("after refresh");
            projectGrid.select(project.Id);  //id
            log.debug("after select");
            //CloseEditProjectDialog();

            log.debug("done saving!");
            log.audit("User ["+current_user.Fullname+"] updated project [" + project.Name + "(" + project.Id + ")]");

        } catch (e) {
            log.error("An exception occurred trying to save a project: " + e.message);
            alert("There was a problem saving.  Please try again or contact technical support.");
        }

    });
}



function toggleFavoriteClass(isFavorite) {
    require(["dojo/dom-class"], function (domClass) {

        //log.debug("Toggling favorite: " + isFavorite);

        domClass.remove("favorite-active");
        domClass.remove("favorite-inactive");

        if (isFavorite) {
            domClass.add("favorite-active", "off");
            domClass.toggle("favorite-inactive", "on");
        }
        else {
            domClass.add("favorite-active", "on");
            domClass.toggle("favorite-inactive", "off");
        }
    });

}

function getFavorites() {
    return getPreferenceArrayByKey("Favorites");
}

function getImageSelections() {
    var vals = null;
    var mv = current_project["metadata_" + METADATA_SUMMARYIMAGESELECTIONS];
    if(mv)
        vals = mv.split(",");
    return vals;
}

function getImageSelectionsHtml() {
    return current_project["metadata_" + METADATA_SUMMARYIMAGESELECTIONS_HTML];
}

function getMapImageHtml() {
    return current_project["metadata_" + METADATA_MAPIMAGELOCATION_HTML];
}

//
//Gets the value of a given preference key
// and explodes it into an array
//
function getPreferenceArrayByKey(a_key) {

    var pref_value = getPreferenceValueByKey(a_key);
    var prefs = pref_value.split(",");

    //log.debug("Returning json object prefs: ", prefs);

    return prefs;
    

    
}

//
//Returns the value of the given preference key
//
function getPreferenceValueByKey(a_key) {
    var value = "";
    pref = getPreferenceByKey(a_key);
    
    if(pref)
        value = pref.Value;

   // log.debug("Returning preference value by key: " + a_key + " : " + value);
    return value;
}


//gets the preference by key -- if it doesn't exist, it creates it.
function getPreferenceByKey(a_key) {
    var result = null;

    for (var key in current_user.UserPreferences) {
        pref = current_user.UserPreferences[key];
        if (pref.Name == a_key) {
            result = pref;
            break;
        }
    }

    if (result == null) {
        current_user.UserPreferences = [{ Name: a_key, Value: "" }];
    }

    return result;
}

function is_empty(obj) {

    // null and undefined are empty
    if (obj == null) return true;
    // Assume if it has a length property with a non-zero value
    // that that property is correct.
    if (obj.length && obj.length > 0) return false;
    if (obj.length === 0) return true;

    for (var key in obj) {
        if (hasOwnProperty.call(obj, key)) return false;
    }

    // Doesn't handle toString and toValue enumeration bugs in IE < 9

    return true;
}

//destroys everything under a node
function destroyDijits(node, parentnode, thewidget) {

    require(["dijit/registry", "dojo/parser", "dojo/dom-construct"], function (registry, parser, domConst) {
        //parser.parse();
        try{
            var npwidget = registry.byId(node);
            if (npwidget) {
                log.debug("FOUND IT A WIDGET [" + node + "] ... DESTROY!!!!!!!!!!!!!!!!!");
                npwidget.destroyDescendants();
                npwidget.destroy();
            }
            domConst.destroy(parentnode);
    
            //TODO: pull the widget out of the registry instead of a global variable. :)
            if (thewidget) {


                log.debug("was a widget var and we're destrying it");
                thewidget.destroyDescendants();
                thewidget.destroy();


                /*
                log.debug("destroying things");
                widget.destroyRecursive(true);

        
                log.debug("Looking for widgets");

                require(["dojo/_base/array", "dojo/dom-construct", "dijit/registry"], function (array, domConst, dr) {

                    var widgets = dr.findWidgets(dojo.byId("project-edit-window"));

                    //array.forEach(widgets, function (widget) {
                    //    log.debug("widget-------------> " , widget);
                    //});

                    //project-edit-window


                    dr.byId("new-project").destroyRecursive(false);
                    domConst.destroy("edit-project-page");    
                });

                */
                log.debug("All done destroying things. looks like it went well");
            } else {
                log.debug("no widget to destroy... ho hum");
            }

            dijits = [];
        } catch (e) { log.debug("Boom an error with destroying!", e); }
    });

}

//parses a date string with the given format (defaults to "short") and returns a Date object.
function parseDate(the_date, format)
{
    if(!format)
        format = "short"; //we'll assume 8/12/2013 etc.

    require(["dojo/date/locale"], function (locale) {
        the_date = locale.parse(the_date, { formatLength: "short", selector: "date" });
    });

    return the_date;
}


function formatDate(the_date, format) {
    if (!format)
        format = DATE_FORMAT;

    require(["dojo/date/locale"], function (locale) {

        if (typeof the_date == "string")
            the_date = new Date(the_date);

        if (the_date && the_date != 'Invalid Date') {
            the_date = locale.format(the_date, { selector: "date", datePattern: format });
        }
    });

    return the_date;
}

function formatDateTime(the_date, format, timeformat) {
    require(["dojo/date/locale"], function (locale) {
        if (!format) {
            format = DATE_FORMAT;
            timeformat = TIME_FORMAT;
        }

        if (typeof the_date == "string")
            the_date = new Date(the_date);

        if (the_date && the_date != 'Invalid Date') {
            the_date = locale.format(the_date, { datePattern: format, timePattern: timeformat });
        }
    });


    return the_date;
}

function formatDisplayUTCDate(the_date)
{
    if (typeof the_date == "string")
        the_date = new Date(the_date);

    if (the_date && the_date != 'Invalid Date') {
        the_date = (the_date.getUTCMonth()+1) + "/" + the_date.getUTCDate() + "/" + the_date.getUTCFullYear();
    }

    return the_date;
}


function logout() {
    require(["dojo/request/xhr"], function (request) {
        request("/services/account/logout").then(function (data) {
            window.location = "index.html";
        });
    });
}

//deletes the current project
function deleteProject() {

    if (current_project.Owner.Id != current_user.Id) {
        alert("You can only delete projects you own.");
        return;
    }

    var confirmed = confirm("Are you sure you want to permanently delete this project (and all of its files and data)?");
    if (confirmed) {
        if (ViewProjectDialog.isLoaded)
            ViewProjectDialog.hide();

        _deleteProject(current_project);
    }
}

function _deleteProject(project) {

    var url = PROJECT_DATA_URL; //same for delete
    var mode = "DELETE";
            
    if (!project || !project.Id)
    {
        alert("No project selected.");
        log.error("Delete called but no project selected.");
        return;
    }

    url += project.Id;

    restSend(url, [], mode, function (data) {
        projectStore.remove(project.Id);
        toggleMyProjects("myprojects"); //and will fire refresh.
    });

}

function editSelectedFile(grid)
{
    
    if (current_project.Owner.Id != current_user.Id)
    {
        alert("You can only edit files in projects you own.");
        return;
    }

    var the_file;
    var cnt = 0;
    for (var id in grid.selection) {
        if (grid.selection[id]) {
            the_file = grid.store.get(id);
            cnt++;
        }
    }

    if(cnt == 0)
    {
        alert("No file selected.  First select a file, then click edit.");
        return;
    }

    if (cnt > 1) {
        alert("Please only select one file at a time to edit.");
        return;
    }

    openEditFileDialog(the_file);

}

function deletePhoto() {
    deleteSelectedFilesInGrid(gallerygrid);
}

function deleteFile() {
    deleteSelectedFilesInGrid(docsgrid);
}

function deleteSelectedFilesInGrid(grid)
{
    if (current_project.Owner.Id != current_user.Id)
    {
        alert("You can only delete files in projects you own.");
        return;
    }

    var cnt = 0;
    for (var id in grid.selection) {
        if (grid.selection[id]) {
            cnt++;
        }
    }

    if(cnt == 0)
    {
        alert("No file selected.  First select a file, then click delete.");
        return;
    }

    var confirmed = confirm("Are you sure you want to permanently delete "+cnt+" file(s)?");
    if (!confirmed)
        return;

    //ok -- we are confirmed!

    var url = PROJECT_FILE_URL; 
    var mode = "DELETE";
    
    log.debug(grid.selection);

    // Iterate through all currently-selected items
    for (var id in grid.selection) {
        if (grid.selection[id]) {
            //delete the file
            var delete_url = url + id;
            log.debug("Delete! " + delete_url);
            
            restSend(delete_url, [], "DELETE", function (data) {
                log.debug("back and done! refreshing!");
                try{
                    grid.store.remove(id);
                    grid.refresh();
                } catch (e) {
                    log.debug(e);
                }
                log.debug("done deleting!")
            });
            
        }
        else
            log.debug("weird -- nothing selected?")

    }


}

function submitEditFile() {
    log.debug(editfilewidget.Id, "The file id!");

    var title = dijit.byId("FileTitle").value;
    var desc  = dijit.byId("FileDescription").value;

    var file = docsgrid.store.get(editfilewidget.Id);

    var saveArray = {
        Id: file.Id,
        Name: file.Name,
        Title: title,
        Description: desc,
        ProjectId: file.ProjectId,
        UserId: file.UserId,
        UploadDate: file.UploadDate,
        Size: file.Size,
        Link: file.Link,
        FileTypeId: file.FileTypeId
    };

    log.debug(saveArray);

    restSend(PROJECT_FILE_URL, saveArray, "PUT", function (data) {
        log.debug("back and done! refreshing!");
        try{
            refreshProjectFiles(current_project.Id);
        } catch (e) {
            log.debug(e);
        }
    });

    log.debug("done editing!")

    EditFileDialog.hide();
}

function openEditFileDialog(file)
{
    require(["dijit/registry", "dojo/request/xhr", "dojo/dom", "ctuir/widget/EditFileWidget", "dojo/_base/array"],
           function (registry, xhr, dom, EditFile, array) {
               destroyDijits("edit-file-window", "edit-file-page", editfilewidget);
               editfilewidget = new EditFile(file).placeAt("edit-file-window");
               EditFileDialog.show();
           }
    );
}

function nl2br(text) {
 //   log.debug("incoming nl2br: " + text);
    text = escape(text);
    var re_nlchar = /%0D%0A/g;
    if (text.indexOf('%0D%0A') > -1) {
        re_nlchar = /%0D%0A/g;
    } else if (text.indexOf('%0A') > -1) {
        re_nlchar = /%0A/g;
    } else if (text.indexOf('%0D') > -1) {
        re_nlchar = /%0D/g;
    }

    text = unescape(text.replace(re_nlchar, '<br />'));
   // log.debug("returning " + text);
    return text;
}

//hides or shows fields based on project type
function ChangeViewFieldsByType() {
    
    if (isHabitatProject(current_project)) {
        ShowHideClass(".habitat-fields", "show");
    }
    else {
        ShowHideClass(".habitat-fields", "hide");
    }

    if (isFisheriesProject(current_project)) {
        ShowHideClass(".fisheries-fields", "show");
    }
    else {
        ShowHideClass(".fisheries-fields", "hide");
    }

    if (!isProgram(current_project)) {
        ShowHideClass(".program-fields", "show");
    }
    else {
        ShowHideClass(".program-fields", "hide");
    }
    
}

function ChangeEditFieldsByType() {
    require(["dojo/dom-class"], function (domClass) {
        log.debug("change event firing...");

        //if we are dealing with a new project
        if (!current_project.ProjectType)
            return;

        if (isHabitatProject(current_project)) {
            domClass.remove("habitat-fields", "hidden"); //show the habitat fields for habitat projects.
        }
        else {
            domClass.add("habitat-fields", "hidden"); //hid them for non-habitat projects.
        }

        if (isFisheriesProject(current_project)) {
            domClass.remove("fisheries-fields", "hidden"); //show the fisheries fields for fisheries projects.
        }
        else {
            domClass.add("fisheries-fields", "hidden"); //hid them for non-fisheries projects.
        }

        if (isProgram(current_project) && isFisheriesAndWildlife(current_project))
            domClass.remove("program-fields", "hidden"); 
        else
            domClass.add("program-fields", "hidden"); 
        
        log.debug("done firing...");
    });
}

function isProgram(project)
{
    return (project.ProjectType.Id == PROJECT_TYPE_PROGRAM);
}

function isHabitatProject(project)
{
    return subprogramContains(project, "Habitat");
}

function isFisheriesProject(project)
{
    return programContains(project, "Fisheries");
}

function isFisheriesAndWildlife(project) {
    return (programContains(project, "Fisheries") || programContains(project, "Wildlife"));
}

function subprogramContains(project, value)
{
    if (project.metadata_24) {

        var isValue = project.metadata_24.indexOf(value) != -1
        log.debug("sub-program == " + project.metadata_24 + " " + isValue);
        return isValue;
    }

    return false;
}

function programContains(project, value) {
    if (project.metadata_23) {

        var isValue = project.metadata_23.indexOf(value) != -1
        log.debug("program == " + project.metadata_23 + " " + isValue);
        return isValue;
    }

    return false;
}



//will show or hide any class
function ShowHideClass(the_class, command) {
    require(["dojo/query", "dojo/dom-class"], function (query, domClass) {
        try{
            var fields = query(the_class);
            for (var md in fields) {
                md = fields[md];
                if (command == "show")
                    domClass.remove(md, "hidden");
                else if (command == "hide")
                    domClass.add(md, "hidden");
            }
        }catch(e)
        {
            console.dir(e);
        }
    });
}

//fired when the Project Type select box is changed on the edit page.
function setEditProjectType(select) {
 //   var project_type_id = de_stringify_number(select.value);
    //   current_project.ProjectType = servicedropdown.getItemById("ProjectTypes", project_type_id);
    current_project[select.name] = select.value;
    ChangeEditFieldsByType();
}

//returns the file object that matches the given fileid
function getProjectFileById(fileid) {
    for (var file in current_project.Files) {
        file = current_project.Files[file];
        if (file.Id == fileid)
            return file;
    }
}

function isSecure() {
    return window.location.protocol == 'https:';
}