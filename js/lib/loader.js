define(["jquery", "poodllsubtitle", "vtthelper","previewhelper"], function($, poodllsubtitle, vtthelper, previewhelper) {

    //Video helper is manipulating the video and passing on video events and info to other parts of app

  return {

      controls: {},
      sampledata: [{start: 1000, end: 1990, part: 'text one'},
          {start: 2000, end: 2990, part: 'text two'},
          {start: 3000, end: 3990, part: 'text three'}],

      init: function(mediatype){
            this.initControls();
            this.initEvents();

          poodllsubtitle.init(this.sampledata,mediatype);
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
          this.controls.mediaurl = $('#poodllsubtitle_mediainput');
          this.controls.vtturl = $('#poodllsubtitle_vttinput');
          this.controls.loadbutton = $('#poodllsubtitle_load');
          this.controls.downloadbutton = $('#poodllsubtitle_download');
      },

      initEvents: function(){
         var that = this;
         this.controls.loadbutton.click(function(){
             var mediaurl = that.controls.mediaurl.val().trim();
             var vtturl = that.controls.vtturl.val().trim();
             if(mediaurl && mediaurl != ''){
                 previewhelper.setMediaURL(mediaurl);
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
