const express         = require("express"),
	  app             = express(),
	  bodyParser      = require("body-parser"),
	  expressSanitizer= require("express-sanitizer"),
	  ejs             = require("ejs"),
	  mongoose        = require("mongoose"),    
      methodOverride  = require("method-override");
	  

//APP CONFIGURATION
mongoose.connect('mongodb://localhost:27017/blogdata', {useNewUrlParser: true, useUnifiedTopology: true});
app.set("view engine", "ejs");
app.use(express.static("public"));//this is to use CSS stylesheet
app.use(bodyParser.urlencoded({extended: true}));
app.use(expressSanitizer());
app.use(methodOverride("_method"));


//MONGOOSE/MODEL CONFIGURATION
var blogSchema = new mongoose.Schema({
	title: String,
	image: String,
	body: String,
	created: {type: Date, default: Date.now}//to get automaticly data when post was created because don't wanna write manualy 
})

var Blog = mongoose.model("Blog", blogSchema);

/*
Blog.create({
	title: "Test Blog",
	image: "https://cdn.pixabay.com/photo/2017/05/11/11/15/workplace-2303851__340.jpg",
	body: "Halvah cheesecake cupcake cheesecake gummies wafer. Cookie marshmallow candy canes danish dragée. Apple pie liquorice biscuit sweet roll cupcake."
})
*/

app.get("/", (req, res)=> {
	res.redirect("/blogs");//redirect "/" to "/blogs"
});

//RESTFUL ROUTES
//INDEX ROUTE
app.get("/blogs", (req, res)=> {
	Blog.find({}, (err, allBlogs)=> {
		if(err) {
			console.log("ERROR!!!");
		} else {                 //this is object
			res.render("index", {addThisToThe_blogs_template: allBlogs});//this line looks like {blogs: blogs} before. First blogs we add to index.ejs, second blogs holding data from database
		}
	});
});

//NEW ROUTE - form
app.get("/blogs/new", (req, res)=> {
	res.render("new");
});



//CREATE ROUTE 
app.post("/blogs", (req, res)=> {
	//create blog
	console.log(req.body);//its show how sanitizer work before and after sanitize
	req.body.blog.body = req.sanitize(req.body.blog.body);//inside req.body is some data in this case from FORM and blog.body because name="blog[body]". sanitize - dezinfekuoti go from express-sanitizer
	console.log("===========================================================");
	console.log(req.body);
	Blog.create(req.body.blog, (err, newBlog)=> {//(data, callback function) in data everything from Form are stored in "blog" title, image, body
		if(err) {
			console.log("ERROR!!!");
			res.render("new");
		} else {
			//redirect to index
			res.redirect("/blogs");
		}
	});
});

//SHOW ROUTE
app.get("/blogs/:id", (req, res)=> {
	Blog.findById(req.params.id, (err, foundBlog)=> { //(id, callback function)
		if(err) {
          res.redirect("/blogs");
		} else {
			res.render("show", {blog: foundBlog});//inside the template gonna be "blog"
		}
	});
});

//EDIT ROUTE 
app.get("/blogs/:id/edit", (req, res)=> {
	Blog.findById(req.params.id, (err, foundBlog)=> {
		if(err) {
			console.log(err);
			res.redirect("/blogs");
		} else {
			res.render("edit", {blog: foundBlog});
		}
	})
});

//UPDATE ROUTE - If we see put request thats mean we want update something. IN EDIT TEMPLATE NEED CHANGE method="PUT"
app.put("/blogs/:id", (req, res)=> {
	req.body.blog.body = req.sanitize(req.body.blog.body);//inside req.body is some data in this case from FORM and blog.body because name="blog[body]". sanitize - dezinfekuoti go from express-sanitizer
	Blog.findByIdAndUpdate(req.params.id, req.body.blog, (err, updatedBlog)=> {//(id, newData, callback) new data is how we call that in edit template it's ect. blog[title] so req.body.blog
		if(err) {
			res.redirect("/blogs");
		} else {
			res.redirect("/blogs/" + req.params.id);//sends back to post show page. Also we can use updatedBlog
		}
	});
});

//DELETE ROUTE
app.delete("/blogs/:id", (req, res)=> {
	//destroy blog
	Blog.findByIdAndRemove(req.params.id, (err)=> {//it's only err becouse we dont have data that we wanna work with comming back if we delete something it's just gone
		if(err) {
			res.redirect("/blogs");
		} else {
			res.redirect("/blogs");
		}
	});
	//redirect somevere
});
		 
app.listen(3000, ()=> {
	console.log("Server is working!!!")
});