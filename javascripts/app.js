var AppRouter = Backbone.Router.extend({

  routes: {

    "" : "home"

  },

  home: function(){
    console.log("home")
  }

})

$(function(){

  var app_router = new AppRouter()

  Backbone.history.start()

  window.b = new Board()

})