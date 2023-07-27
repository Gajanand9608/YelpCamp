const express=require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const Campground = require('./models/campground');
const Review = require('./models/review');
const methodOverride = require('method-override');
const catchAsync = require('./utils/catchAsync');
const ExpressError = require('./utils/ExpressError');
const {campgroundSchema, reviewSchema} = require('./schemas.js');

var dotenv = require('dotenv');
dotenv.config();

var url = process.env.dbURL;

mongoose.connect(url,{
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;
db.on("error", console.error.bind(console,"connection error:"));
db.once("open",()=>{
    console.log("Database connected");
});
const app = express();


app.engine('ejs', ejsMate);
app.set('view engine','ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({extended:true}));
app.use(methodOverride('_method'));
app.get('/', (req, res)=>{
    res.render('home');
});

// app.get('/makecampground',  async (req, res)=>{
//     const camp = new Campground({
//         title: 'My BackYard',
//     });
//     await camp.save();
//     res.send(camp);
// });

// middleware function

const validateCampground = (req, res, next)=>{
    const {error} = campgroundSchema.validate(req.body);
    if(error){
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg,400);
    }else{
        next();
    }
}

const validateReview = (req, res, next)=>{
    const {error} = reviewSchema.validate(req.body);
    if(error){
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg,400);
    }else{
        next();
    }
}

app.get('/campgrounds', async(req, res)=>{
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index',{campgrounds});
});

app.get('/campgrounds/new', async(req, res)=>{
    res.render('campgrounds/new');
});

app.post('/campgrounds', validateCampground, catchAsync( async(req, res,next) =>{
    // if(!req.body.campground) throw new ExpressError('Invalid Campground Data', 400);

    const campground = new Campground(req.body.campground);
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`);
}));

app.get('/campgrounds/:id', catchAsync(async(req, res)=>{
    const campground = await Campground.findById(req.params.id).populate('reviews');
    // console.log(campground);  
    res.render('campgrounds/show',{campground});
}));



app.get('/campgrounds/:id/edit', catchAsync(async(req, res)=>{
    const campground = await Campground.findById(req.params.id);
    res.render('campgrounds/edit',{campground});
}));

app.put('/campgrounds/:id', validateCampground, catchAsync(async(req, res)=>{
    const {id} = req.params;
    const campground = await Campground.findByIdAndUpdate(id, {...req.body.campground});
    res.redirect(`/campgrounds/${campground._id}`);
}));

app.delete('/campgrounds/:id', catchAsync(async(req, res)=>{
    const {id} = req.params;
    await Campground.findByIdAndDelete(id);
    console.log('hhh');
    res.redirect('/campgrounds');
}));

app.post('/campgrounds/:id/reviews', validateReview, catchAsync(async(req, res)=>{
    const {id} = req.params;
    const campground = await Campground.findById(id);
    const review = new Review(req.body.review);
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    // res.send(campground);
    res.redirect(`/campgrounds/${campground._id}`);
}));

app.delete('/campgrounds/:id/reviews/:reviewId',catchAsync(async(req, res)=>{
    // const {id} = req.params
    // console.log(req.params);
    const {id, reviewId}= req.params;
    await Campground.findByIdAndUpdate(id, { $pull:{reviews: reviewId}});
    await Review.findByIdAndDelete(reviewId);
    res.redirect(`/campgrounds/${id}`);
    // console.log('Delete');
}));

app.all('*', (req, res, next)=>{
    next(new ExpressError('Page not found', 404));
});

app.use((err, req, res, next)=>{
    const {statusCode=500} = err;
    if(!err.message){
        err.message = 'Oh No, Something went wrong!';
    }
    res.status(statusCode).render('error', {err});
});


app.listen(3000, ()=>{
    console.log('serving on part 3000');
});

