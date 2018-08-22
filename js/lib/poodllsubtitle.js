define(["jquery","vtthelper","subtitleset","previewhelper"], function($, vtthelper, subtitleset, previewhelper) {

    //pooodllsubtitle helper is about the subtitle tiles and editing

  return {
      controls: {},
      currentindex: false,
      currentitemcontainer: null,
      editoropen: false,

      //set up the subtitle edit session
      init: function(subtitledata,mediatype){
          subtitleset.init(subtitledata);
          previewhelper.init(subtitleset,mediatype);
          this.initControls();
          this.initTiles();
          this.initEvents();
      },

      //set up our internal references to the elements on the page
      initControls: function(){
          this.controls.container = $("#poodllsubtitle_tiles");
          this.controls.editor = $("#poodllsubtitle_editor");
          this.controls.edstart = $("#poodllsubtitle_edstart");
          this.controls.edend = $("#poodllsubtitle_edend");
          this.controls.edpart = $("#poodllsubtitle_edpart");
          this.controls.buttondelete = $("#poodllsubtitle_eddelete");
          this.controls.buttonmergeup = $("#poodllsubtitle_edmergeup");
          this.controls.buttonsplit = $("#poodllsubtitle_edsplit");
          this.controls.buttonapply = $("#poodllsubtitle_edapply");
          this.controls.buttoncancel = $("#poodllsubtitle_edcancel");
          this.controls.buttonaddnew = $("#poodllsubtitle_addnew");
          this.controls.buttonstartsetnow = $("#poodllsubtitle_startsetnow");
          this.controls.buttonendsetnow = $("#poodllsubtitle_endsetnow");
      },

      hideEditor: function(){
          this.controls.editor.detach();
          this.controls.editor.hide();
          this.editoropen=false;
      },

      restoreTile: function(){
         var item = subtitleset.fetchItem(this.currentindex);
         var newtile = this.fetchNewTextTile(item.start,item.end,item.part);
          this.hideEditor();
          this.currentitemcontainer.append(newtile);
      },

      editorToTile: function(){
          var starttime = vtthelper.timeString2ms($(this.controls.edstart).val());
          var endtime = vtthelper.timeString2ms($(this.controls.edend).val());
          var validtimes = this.validateTimes(this.currentindex,starttime,endtime);
          if(!validtimes){
              //do something
              //return false;
          }
          var part = $(this.controls.edpart).val();
          subtitleset.updateItem(this.currentindex,starttime,endtime,part);
          var updatedTile = this.fetchNewTextTile(starttime,endtime,part);
          this.hideEditor();
          this.currentitemcontainer.append(updatedTile);
          return true;
      },

      //attach events to the elements on the page
      initEvents: function(){
          var that = this;
          //this attaches event to classes of poodllsubtitle_tt in "container"
          //so new items(created at runtime) get events by default
          this.controls.container.on("click",'.poodllsubtitle_tt',function(){
              var newindex = parseInt($(this).parent().attr('data-id'));
              //save current
              if(that.editoropen == true){
                  that.editorToTile(that.controls,that.currentindex,that.currentitemcontainer);
              }
              that.currentindex = newindex;
              that.currentitemcontainer = $(this).parent();
              that.shiftEditor(that.currentindex ,that.currentitemcontainer);
              previewhelper.setPosition(that.currentindex);
           });

          //editor button delete tile click event
          this.controls.buttondelete.click(function(){
              that.restoreTile();
              subtitleset.removeItem(that.currentindex);
              that.syncFrom(that.currentindex);
              previewhelper.updateLabel();
          });

          //editor button merge with prev tile click event
          this.controls.buttonmergeup.click(function(){
              that.editorToTile();
              subtitleset.mergeUp(that.currentindex);
              that.syncFrom(that.currentindex-1);
              previewhelper.setPosition(that.currentindex-1);
          });

          //editor button split current tile click event
          this.controls.buttonsplit.click(function(){
              that.editorToTile();
              subtitleset.split(that.currentindex);
              that.syncFrom(that.currentindex);
              previewhelper.updateLabel();
          });

          //editor button apply changesclick event
          this.controls.buttonapply.click(function(){
              that.editorToTile();
              previewhelper.updateLabel();
          });

          //editor button cancel changes click event
          this.controls.buttoncancel.click(function(){
              that.restoreTile();
          });

          //editor set current preview time to start
          this.controls.buttonstartsetnow.click(function(){
              var time = previewhelper.fetchCurrentTime();
              var displaytime = vtthelper.ms2TimeString(time);
              that.controls.edstart.val(displaytime);
          });

          //editor set current preview time to end
          this.controls.buttonendsetnow.click(function(){
              var time = previewhelper.fetchCurrentTime();
              var displaytime = vtthelper.ms2TimeString(time);
              that.controls.edend.val(displaytime);
          });

          //"Add new tile" button click event
          this.controls.buttonaddnew.click(function(){
              var currentcount = subtitleset.fetchCount();
              var newdataid=currentcount;
              var newstart=0;
              if(currentcount >0){
                  var lastitem = subtitleset.fetchItem(currentcount-1);
                  newstart = lastitem.end + 500;
              }
              var newend = newstart + 2000;
              subtitleset.addItem(newdataid,newstart,newend,'');
              var newtile = that.fetchNewTextTileContainer(newdataid,newstart,newend,'');
              that.controls.container.append(newtile);
          });

          //set callbacks for video events we are interested in
          previewhelper.highlightItem = this.highlightContainer;
          previewhelper.deHighlightAll = this.deHighlightAll;

      },

      //each subtitle item has a "text tile" with times and subtitle text that we display
      //when clicked we swap it out for the editor
      //this takes all the subtitle json and creates one tiles on page for each subtitle
      initTiles: function(){
          var container = this.controls.container;
          var that = this;
          var setcount = subtitleset.fetchCount();
          if(setcount>0){
              for(var setindex=0; setindex < setcount;setindex++){
                  var item = subtitleset.fetchItem(setindex);
                  var newtile = that.fetchNewTextTileContainer(setindex,item.start,item.end, item.part);
                  container.append(newtile);
              };//end of for loop
          }//end of if setcount
      },

      //make sure that the times we got back from the editor are sensible
      validateTimes: function(currentindex,newstarttime,newendtime){

          //First simple logic.
          // is new-end after new-start
          if(newendtime <= newstarttime){return false;}

        //Second
        //Is prior end-time before new start-time
        //Is subsequent-start time after new end-time
        var prior = false;
        var subsequent =false;
        if(currentindex >0){
            prior = subtitleset.fetchItem(currentindex-1);
        }
        if(currentindex < subtitleset.fetchCount()-1){
            subsequent = subtitleset.fetchItem(currentindex+1);
        }

        //check starttime
        if(prior && prior.end > newstarttime){
            return false;
        }
          //check endtime
          if(subsequent && subsequent.start < newendtime){
              return false;
          }

          //if its all good, then we can return true
          return true;
      },

      //Replace text tile we are editing with the editor, fill with data and display it
      shiftEditor: function(newindex,newitemcontainer){

          //hide editor
          this.controls.editor.hide();

          //newitem
          var newitem =subtitleset.fetchItem(newindex);

          //set data to editor
          var startstring = vtthelper.ms2TimeString(newitem.start);
          $(this.controls.edstart).val(startstring);

          var endstring = vtthelper.ms2TimeString(newitem.end);
          $(this.controls.edend).val(endstring);

          var part = newitem.part;
          $(this.controls.edpart).val(part);

          //remove old text tile and show editor in its place
          newitemcontainer.empty();
          newitemcontainer.append(this.controls.editor);
          this.controls.editor.show();
          this.editoropen=true;
      },

      //Merge a template text tile,  with the time and subtitle text data
      fetchNewTextTile: function(start, end, part){
          var template = "<div class='poodllsubtitle_tt'>";
          template += "<div class='poodllsubtitle_tt_times'>";
          template += "<div class='poodllsubtitle_tt_start'>@@start@@</div>";
          template +="<div class='poodllsubtitle_tt_end'>@@end@@</div>";
          template += "</div>";// end of tt_times
          template +="<div class='poodllsubtitle_tt_part'>@@part@@</div>";
          template +="</div>";// end of tt
          var startstring = vtthelper.ms2TimeString(start);
          var endstring = vtthelper.ms2TimeString(end);
          return template.replace('@@start@@',startstring).replace('@@end@@',endstring).replace('@@part@@',part);
      },

      //Merge a template text tile,  with the time and subtitle text data
      fetchNewTextTileContainer: function(dataid,start, end, part){
          var tile = this.fetchNewTextTile(start,end,part);
          var template = "<div data-id='@@dataid@@' class='poodllsubtitle_itemcontainer'>";
          template += tile;
          template +="</div>";
          return template.replace('@@dataid@@',dataid);
      },

      clearTiles: function(){
          this.controls.container.empty();
      },

      resetData: function(subtitledata){
          this.hideEditor();
          this.clearTiles();
          subtitleset.init(subtitledata);
          this.initTiles();
      },

      syncFrom: function(index){
          var setcount = subtitleset.fetchCount();
          for(var setindex=index; setindex < setcount;setindex++){
              var item =subtitleset.fetchItem(setindex);
              var container = $('.poodllsubtitle_itemcontainer').filter(function() {
                  return parseInt($(this).attr("data-id")) == setindex;
              });
              if(container.length > 0){
                  this.updateTextTile(container,item);
              }else{
                  var newtile = this.fetchNewTextTileContainer(setindex,item.start,item.end,item.part);
                  this.controls.container.append(newtile);
              }
          }
          //remove any elements greater than the last data-id
          $('.poodllsubtitle_itemcontainer').filter(function() {
              return parseInt($(this).attr("data-id")) >= setcount;
          }).remove();
      },
      syncAt: function(index){
          //do something

      },
      updateTextTile: function(container,item){
          var startstring = vtthelper.ms2TimeString(item.start);
          var endstring = vtthelper.ms2TimeString(item.end);
          $(container).find('.poodllsubtitle_tt_start').text(startstring);
          $(container).find('.poodllsubtitle_tt_end').text(endstring);
          $(container).find('.poodllsubtitle_tt_part').text(item.part);
          return;
      },

      highlightContainer: function(setindex){
          //dehighlight the rest
          this.deHighlightAll();

          //get the one
          var highlightcontainer = $('.poodllsubtitle_itemcontainer').filter(function() {
              return parseInt($(this).attr("data-id")) == setindex;
          });
          //highlight the one
          highlightcontainer.addClass('activesubtitle');
      },

      deHighlightAll: function(){
          $('.poodllsubtitle_itemcontainer').removeClass('activesubtitle');
      },

      fetchSubtitleData: function(){
          return subtitleset.fetchSubtitleData();
      }
  }
});
