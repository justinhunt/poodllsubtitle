define(["jquery", "poodllsubtitle", "vtthelper","videohelper"], function($, poodllsubtitle, vtthelper, videohelper) {

    //Video helper is manipulating the video and passing on video events and info to other parts of app

  return {

      controls: {},
      sampledata: [{start: 1000, end: 1990, part: 'text one'},
          {start: 2000, end: 2990, part: 'text two'},
          {start: 3000, end: 3990, part: 'text three'}],

      init: function(){
            this.initControls();
            this.initEvents();

          poodllsubtitle.init(this.sampledata);
          this.runtests();
      },

      runtests: function(){
          //run some tests
          var vtt = vtthelper.convertJsonToVtt(this.sampledata);
          var json = vtthelper.convertVttToJson(vtt);
          console.log(vtt);
          console.log(json);
      },

      initControls: function(){
          this.controls.videoplayer = $('#poodllsubtitle_videoinput');
          this.controls.videourl = $('#poodllsubtitle_videoinput');
          this.controls.vtturl = $('#poodllsubtitle_vttinput');
          this.controls.loadbutton = $('#poodllsubtitle_load');
          this.controls.downloadbutton = $('#poodllsubtitle_download');
      },

      initEvents: function(){
         var that = this;
         this.controls.loadbutton.click(function(){
             var vidurl = that.controls.videourl.val().trim();
             var vtturl = that.controls.vtturl.val().trim();
             if(vidurl && vidurl != ''){
                 videohelper.setVideoURL(vidurl);
             }
             if(vtturl && vtturl != ''){
                 $.get(vtturl, function(thevtt) {
                     var thejson = vtthelper.convertVttToJson(thevtt);
                     poodllsubtitle.resetData(thejson);
                 });
             }

        });

       this.controls.downloadbutton.click(function(){
           //hacky download script
           var element = document.createElement('a');
           var jsondata = poodllsubtitle.fetchSubtitleData();
           var vttdata =vtthelper.convertJsonToVtt(jsondata);
           element.setAttribute('href', 'data:text/vtt;charset=utf-8,' + encodeURIComponent(vttdata));
           element.setAttribute('download', "yoursubtitlefile.vtt");
           element.style.display = 'none';
           document.body.appendChild(element);
           element.click();
           document.body.removeChild(element);

       })  ;
      }
    }
});
