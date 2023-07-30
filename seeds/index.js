
const mongoose = require('mongoose');
const Campground = require('../models/campground');
const cities= require('./cities');
const {places, descriptors}= require('./seedHelpers');

const dburl ='mongodb+srv://gajanandsharma088:gaja123@cluster0.zcob3ye.mongodb.net/?retryWrites=true&w=majority';
mongoose.connect(dburl,{
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;
db.on("error", console.error.bind(console,"connection error:"));
db.once("open",()=>{
    console.log("Database connected");
});

const sample = array => array[Math.floor(Math.random()*array.length)];

const seedDB = async ()=>{
    await Campground.deleteMany({});
    for(let i=0;i<50;i++){
        const random1000 = Math.floor(Math.random() *1000);
        const price = Math.floor(Math.random()*20)+10;
        const camp =new Campground({
            author: '64c5f96bef4d8519b78acd7e',
            location:`${cities[random1000].city}, ${cities[random1000].state}`,
            title:`${sample(descriptors)} ${sample(places)}`,
            // image:'https://source.unsplash.com/collection/2184453',
            images:  [
                {
                  url: 'https://res.cloudinary.com/da1qsm7rq/image/upload/v1690728805/YelpCamp/emxinqvwomxkwdtftvua.jpg',
                  filename: 'YelpCamp/emxinqvwomxkwdtftvua',
                },
                {
                  url: 'https://res.cloudinary.com/da1qsm7rq/image/upload/v1690728808/YelpCamp/vg3kmoapd79cdjcai8sf.jpg',
                  filename: 'YelpCamp/vg3kmoapd79cdjcai8sf',
                },
                {
                  url: 'https://res.cloudinary.com/da1qsm7rq/image/upload/v1690728809/YelpCamp/v8hixal5bwxscyoc0sce.jpg',
                  filename: 'YelpCamp/v8hixal5bwxscyoc0sce',
                },],
            description:" Lorem ipsum dolor, sit amet consectetur adipisicing elit. Expedita perferendis animi maiores dolorem natus, totam fuga quod rerum, sapiente voluptates quos facere culpa illum fugiat nemo suscipit illo autem repellendus.",
            price
        })
        await camp.save();
    }
}

seedDB().then(()=>{
    mongoose.connection.close();
})