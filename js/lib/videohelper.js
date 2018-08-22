define(["jquery"], function($) {

    //Video helper is manipulating the video and passing on video events and info to other parts of app

  return {

      controls: {},
      activeSubtitle: -1,
      ss: null,

      init: function(subtitleset){
            this.ss = subtitleset;
            this.initControls();
            this.initEvents();
      },

      initControls: function(){
          this.controls.ve = $('#poodllsubtitle_video');
          this.controls.previewline = $('#poodllsubtitle_previewline');
      },

      initEvents: function(){
         var that = this;
        this.controls.ve.on('timeupdate',function(e){
          var currenttime = 1000 * that.controls.ve[0].currentTime;//milliseconds
          var itemindex = that.ss.fetchItemByTime(currenttime);
          if(itemindex===false) {
              that.deactivateAll();

          }else{
              if(that.activeSubtitle!=itemindex) {
                  that.activateSubtitle(itemindex);
              }
          }
        });
      },

      setPosition: function(setindex){
          var theitem = this.ss.fetchItem(setindex);
          if(!theitem){return;}
          this.controls.ve[0].pause();
          var newcurrenttime = (theitem.start / 1000).toFixed(3);
          console.log(newcurrenttime);
          this.controls.ve[0].currentTime= newcurrenttime;
      },
      updateLabel: function(){
          if(this.activeSubtitle>-1){
              this.activateSubtitle(this.activeSubtitle);
          }
      },

      setVideoURL: function(vidurl){
        this.controls.ve.attr("src",vidurl);
      },

      activateSubtitle: function(setindex){
          this.highlightItem(setindex);
          this.activeSubtitle = setindex;
          var item = this.ss.fetchItem(setindex);
          if(item) {
              this.controls.previewline.text(item.part);
              this.controls.previewline.show();
          }else{
              this.deactivateAll();
          }

      },
      deactivateAll: function(){
          this.deHighlightAll();
          this.activeSubtitle=-1;
          this.controls.previewline.text('');
      },

      highlightItem: function(setindex){
          //this function is overwritten by poodllsubtitle.js
          //to avoid circular style refs which I hate.
      },

      deHighlightAll: function(){
            //this function is overwritten by poodllsubtitle.js
            //to avoid circular style refs which I hate.
      }


    }
});
