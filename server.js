const express = require('express')
const mongoose = require('mongoose')
const dotenv = require('dotenv')
const authRoute = require('./routes/auth')
const userRoute = require('./routes/user')
const imagesRoute = require('./routes/images')
const followingRoute = require('./routes/following')
const postsRoute = require('./routes/posts')
const followersRoute = require('./routes/followers')
const searchRoute = require('./routes/search')
const commentsRoute = require('./routes/comments')

dotenv.config({ path: './config/config.env' })
const app = express()

app.use(express.json())
app.use((req, res, next) => {
    res.append('Access-Control-Allow-Origin', ['http://localhost:3000']);
    res.append('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});

app.use("/auth", authRoute)
app.use("/user", userRoute)
app.use("/images", imagesRoute)
app.use("/following", followingRoute)
app.use("/posts", postsRoute)
app.use("/followers", followersRoute)
app.use("/search", searchRoute)
app.use("/comments", commentsRoute)

connectDbAndServer()

async function connectDbAndServer() {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI,
            {useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex:true })

        console.log('MongoDB connected');
        app.listen(5000, () => console.log("Server listening on PORT 5000"))

    } catch(err) {
        console.log(`Error connecting MongoDB: ${err}`);
    }
}