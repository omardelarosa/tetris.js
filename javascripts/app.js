var AppRouter = Backbone.Router.extend({

  routes: {

    "" : "home",
    "about" : "about",
    "posts(/:id)" : "posts"

  },

  initialize: function(){
    window.ui = new UI()
    ui.render()
  },

  home: function(){
    ui.views.body.render("home")

  },

  about: function(){
    ui.views.body.render("about")
  },

  posts: function(id) {
    console.log("posts", id)
    // ui.views.body.render("posts")
  }

})

var UI = Backbone.View.extend({

  initialize: function(){
    this.views = {}
    this.views.nav = new UI.Nav()
    this.views.body = new UI.Body()
  },

  el: function(){
    return $('#main-container')
  },

  render: function(){
    var self = this

    _.each(this.views, function(view){
      view.remove()
    })

    this.$el.empty()

    _.each(this.views, function(view){
      self.$el.append(view.render().$el)
    })

  }

})

UI.Nav = Backbone.View.extend({

  template: function(attributes){
    var source = $('#nav-template').html()
    var temp = Handlebars.compile(source)
    return temp(attributes)
  },

  tagName: 'nav',

  render: function(){
    this.$el.html(this.template({}))
    return this
  }

})

UI.Body = Backbone.View.extend({

  template: function(page_name, attributes){
    var page_name = page_name || "home"
    var source = $('#body-template-'+page_name).html()
    var temp = Handlebars.compile(source)
    return temp(attributes)
  },

  render: function(page_name){
    this.$el.html(this.template(page_name, {}))
    return this
  }
})


$(function(){

  var app_router = new AppRouter()

  Backbone.history.start()

})