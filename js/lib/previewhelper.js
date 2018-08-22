define(["jquery"], function($) {

    //Preview helper manipulates the audio/video and passing on media events and info to other parts of app

  return {

      controls: {},
      activeSubtitle: -1,
      ss: null,
      mediatype: 'video',

      init: function(subtitleset,mediatype){
            this.ss = subtitleset;
            this.mediatype = mediatype;
            this.initControls();
            this.initEvents();
      },

      initControls: function(){

          this.controls.videoplayer = $('#poodllsubtitle_video');
          this.controls.audioplayer = $('#poodllsubtitle_audio');
          if(this.mediatype=='audio'){
              this.controls.mediaplayer = this.controls.audioplayer
          }else {
              this.controls.mediaplayer = this.controls.videoplayer
          }
          this.controls.mediaplayer.show();
          this.controls.previewline = $('#poodllsubtitle_previewline');
      },

      initEvents: function(){
         var that = this;
        this.controls.mediaplayer.on('timeupdate',function(e){
          var currenttime = that.fetchCurrentTime();//milliseconds
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
          this.controls.mediaplayer[0].pause();
          var newcurrenttime = (theitem.start / 1000).toFixed(3);
          this.controls.mediaplayer[0].currentTime= newcurrenttime;
      },
      updateLabel: function(){
          if(this.activeSubtitle>-1){
              this.activateSubtitle(this.activeSubtitle);
          }
      },
      fetchCurrentTime: function(){
         return Math.floor(1000 * this.controls.mediaplayer[0].currentTime);//milliseconds
      },

      setMediaURL: function(mediaurl){
        if(!mediaurl | mediaurl.trim()==''){return;}
        var ext = mediaurl.split('.').pop().toLowerCase();
        switch(ext){
            case 'mp3':
                if(this.mediatype=='video'){
                    this.mediatype='audio';
                    this.controls.mediaplayer.off('timeupdate');
                    this.controls.mediaplayer = this.controls.audioplayer;
                    this.initEvents();
                }
                break;
            default:
                if(this.mediatype=='audio'){
                    this.mediatype='video';
                    this.controls.mediaplayer.off('timeupdate');
                    this.controls.mediaplayer = this.controls.videoplayer;
                    this.initEvents();
                }
        }
        this.controls.mediaplayer.attr("src",mediaurl);
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
