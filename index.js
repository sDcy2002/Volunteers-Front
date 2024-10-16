const express = require('express');
const axios = require('axios');
const app = express();
var bodyParser = require('body-parser');
const path = require("path");

const base_url = "http://localhost:3000";

// Set the template engine
app.set("views", path.join(__dirname, "/public/views"));
app.set('view engine', 'ejs');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Serve static files
app.use(express.static(__dirname + '/public'));


app.get("/", async (req, res) => {
    try {
        const response = await axios.get(base_url + '/Volunteers');
        res.render("Volunteers", { movies: response.data });
    } catch (err) {
        console.error(err);
        res.status(500).send('Error');
    }
});


app.get("/movies_reviews/:id", async (req, res) => {
    try {
        const response = await axios.get(base_url + '/Volunteers/' + req.params.id);
        const reviewsResponse = await axios.get(base_url + '/review/' + req.params.id); // ปรับ URL ตาม API ของคุณ
        res.render("movies_reviews", { movie: response.data, review: reviewsResponse.data });
    } catch (err) {
        console.error(err);
        res.status(500).send('Error');
    }
});

// get category กับ studio มาใช้ในการเพิ่มข้อมูลหนัง
app.get("/create_name", async (req, res) => {
    try {
        // เรียก API หรือฐานข้อมูลเพื่อดึงข้อมูลภาพยนตร์
        const responseCategory = await axios.get(base_url + '/category');
        const responseStudio = await axios.get(base_url + '/studio');
        
        // ส่งข้อมูลไปยังไฟล์ EJS
        res.render("create_movie", { category: responseCategory.data, studio: responseStudio.data });
    } catch (err) {
        console.error(err);
        res.status(500).send('Error');
    }
});

// เพิ่มข้อมูลหนังใหม่
app.post("/create_name", async (req, res) => {
    try {
        const data = { Volunteers: req.body.Volunteers,
                       Events: req.body.Events,
                       Task: req.body.Task, 
                       Hours: req.body.Hours,
                       flimmaking_funds: req.body.flimmaking_funds,
                       movie_income: req.body.movie_income };
        await axios.post(base_url + '/Volunteers', data);
        res.redirect("/");
    } catch (err) {
        console.error(err);
        res.status(500).send('Error');
    }
});

// ดึงข้อมูลเก่ามาโชว์
app.get("/update_movie/:id", async (req, res) => {
    try {
        const responseMovies = await axios.get( base_url + '/Volunteers/' + req.params.id);
        const responseCategory = await axios.get( base_url + '/category');
        const responseStudio = await axios.get( base_url + '/studio');
        res.render("update_movie", { movie: responseMovies.data, category: responseCategory.data, studio: responseStudio.data });
    } catch (err) {
        console.error(err);
        res.status(500).send('Error');
    }
});

app.post("/update_movie/:id", async (req, res) => {
    try {
        const data = { Volunteers: req.body.Volunteers,
            Events: req.body.Events,
            Task: req.body.Task, 
            Hours: req.body.Hours,
            flimmaking_funds: req.body.flimmaking_funds,
            movie_income: req.body.movie_income };
        await axios.put(base_url + '/Volunteers/' + req.params.id, data);
        res.redirect(`/movies_reviews/${ req.params.id }`);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error');
    }
});

app.get("/delete_movie/:id", async (req, res) => {
    try {
        await axios.delete(base_url + '/Volunteers/' + req.params.id);
        await axios.delete(base_url + '/review_movies/' + req.params.id);
        res.redirect("/");
    } catch (err) {
        console.error(err);
        res.status(500).send('Error');
    }
});

//--------------------------------------- Reviews --------------------------------------- //


// get ข้อมูล movie id มาใช้กับ review
app.get("/create_review/:id", async (req, res) => {
    try {
        // เรียก API หรือฐานข้อมูลเพื่อดึงข้อมูลภาพยนตร์
        const responseMovie = await axios.get(base_url + '/Volunteers/' + req.params.id);
        const responseReview = await axios.get(base_url + '/review/' + req.params.id);
        
        // ส่งข้อมูลไปยังไฟล์ EJS
        res.render("create_review", { review: responseReview.data, movie: responseMovie.data });
    } catch (err) {
        console.error(err);
        res.status(500).send('Error');
    }
});

// เพิ่มข้อมูล review
app.post("/create_review", async (req, res) => {
    try {
        const data = { Volunteers: req.body.Volunteers,
                review_detail: req.body.review_detail,
                overall_score: req.body.overall_score, 
                reviewer: req.body.reviewer };
        await axios.post(base_url + '/review', data);
        res.redirect(`/movies_reviews/${ req.body.movieID }`);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error');
    }
});

// ดึงข้อมูลเก่ามาโชว์
app.get("/update_review/:id", async (req, res) => {
    try {
        const response = await axios.get(base_url + '/review_id/' + req.params.id);
        res.render("update_review", { review: response.data});
    } catch (err) {
        console.error(err);
        res.status(500).send('Error');
    }
});

app.post("/update_review/:id", async (req, res) => {
    try {
        const data = { Volunteers: req.body.Volunteers,
            reviewer: req.body.reviewer,
            review_detail: req.body.review_detail,
            overall_score: req.body.overall_score };
        await axios.put(base_url + '/review/' + req.params.id, data);
        res.redirect(`/movies_reviews/${ req.body.movieID}`);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error');
    }
});


app.get("/delete_review/:id", async (req, res) => {
    try {
        await axios.delete(base_url + '/review/' + req.params.id);

        // รับค่า movieID จาก query string
        const movieID = req.query.Volunteers;
        
        if (movieID) {
            res.redirect(`/movies_reviews/${Volunteers}`);
        } else {
            res.redirect(`/movies_reviews/`); // ถ้าไม่มี movieID ให้กลับไปหน้ารายการรีวิว
        }
    } catch (err) {
        console.error(err);
        res.status(500).send('Error');
    }
});


//--------------------------------------- Category --------------------------------------- //
app.get("/categories", async (req, res) => {
    try {
        const response = await axios.get(base_url + '/category');
        res.render("categories", { categories: response.data });
    } catch (err) {
        console.error(err);
        res.status(500).send('Error');
    }
});

app.get("/create_category", async (req, res) => {
    try {
        // เรียก API หรือฐานข้อมูลเพื่อดึงข้อมูลภาพยนตร์
        const responseCategory = await axios.get(base_url + '/category');
        
        // ส่งข้อมูลไปยังไฟล์ EJS
        res.render("create_category", { category: responseCategory.data });
    } catch (err) {
        console.error(err);
        res.status(500).send('Error');
    }
});

// เพิ่มข้อมูล Category
app.post("/create_category", async (req, res) => {
    try {
        const data = { name: req.body.name,
                detail: req.body.detail };
        await axios.post(base_url + '/category', data);
        res.redirect("/categories");
    } catch (err) {
        console.error(err);
        res.status(500).send('Error');
    }
});

// ดึงข้อมูลเก่ามาโชว์
app.get("/update_category/:id", async (req, res) => {
    try {
        const response = await axios.get(
        base_url + '/category/' + req.params.id);
        res.render("update_category", { category: response.data});
    } catch (err) {
        console.error(err);
        res.status(500).send('Error');
    }
});

app.post("/update_category/:id", async (req, res) => {
    try {
        const data = { name: req.body.name,
            detail: req.body.detail };
        await axios.put(base_url + '/category/' + req.params.id, data);
        res.redirect("/categories");
    } catch (err) {
        console.error(err);
        res.status(500).send('Error');
    }
});

app.get("/delete_category/:id", async (req, res) => {
    try {
        await axios.delete(base_url + '/category/' + req.params.id);
        res.redirect("/categories");
    } catch {
        console.error(err);
        res.status(500).send('Error');
    }
});

//--------------------------------------- Studios --------------------------------------- //
app.get("/studios", async (req, res) => {
    try {
        const response = await axios.get(base_url + '/studio');
        res.render("studios", { studios: response.data });
    } catch (err) {
        console.error(err);
        res.status(500).send('Error');
    }
});

app.get("/create_studio", async (req, res) => {
    try {
        // เรียก API หรือฐานข้อมูลเพื่อดึงข้อมูลภาพยนตร์
        const responseStudio = await axios.get(base_url + '/studio');
        
        // ส่งข้อมูลไปยังไฟล์ EJS
        res.render("create_studio", { studio: responseStudio.data });
    } catch (err) {
        console.error(err);
        res.status(500).send('Error');
    }
});

// เพิ่มข้อมูล Category
app.post("/create_studio", async (req, res) => {
    try {
        const data = { name: req.body.name,
                detail: req.body.detail };
        await axios.post(base_url + '/studio', data);
        res.redirect("/studios");
    } catch (err) {
        console.error(err);
        res.status(500).send('Error');
    }
});

// ดึงข้อมูลเก่ามาโชว์
app.get("/update_studio/:id", async (req, res) => {
    try {
        const response = await axios.get(
        base_url + '/studio/' + req.params.id);
        res.render("update_studio", { studio: response.data});
    } catch (err) {
        console.error(err);
        res.status(500).send('Error');
    }
});

app.post("/update_studio/:id", async (req, res) => {
    try {
        const data = { name: req.body.name,
            detail: req.body.detail };
        await axios.put(base_url + '/studio/' + req.params.id, data);
        res.redirect("/studios");
    } catch (err) {
        console.error(err);
        res.status(500).send('Error');
    }
});

app.get("/delete_studio/:id", async (req, res) => {
    try {
        await axios.delete(base_url + '/studio/' + req.params.id);
        res.redirect("/studios");
    } catch {
        console.error(err);
        res.status(500).send('Error');
    }
});

app.listen(8080, () => {
    console.log(`app listening at http://localhost:${8080}`);
});


