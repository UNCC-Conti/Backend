const mongoose =require('mongoose');
mongoose.Promise=global.Promise;
mongoose.connect('mongodb://localhost:27017/Continental' ,{useMongoClient: true});
//mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost/continental_test');
module.exports={
    mongoose:mongoose
};