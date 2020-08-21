//Setting our imports
const express = require('express');
const app = express();
//Used to read write files
const fs = require('fs');
//Multer is a node.js middleware for handling 
//multipart/form-data, which is primarily
// used for uploading files.
//Multer adds a body object and a file or files object to
// the request object. The body object contains the values
// of the text fields of the form, the file or files object
// contains the files uploaded via the form.
const multer = require('multer');
//Tesseract.js to read our images
//Tesseract.js is a javascript library that gets
// words in almost any language out of images.
const {TesseractWorker} = require('tesseract.js');
const { Console } = require('console');
const e = require('express');
const worker = new TesseractWorker();

//Assets
app.use(express.static('./assets'))
//Using ejs as our view
app.set("view engine", "ejs");

//This gets called whenever we uploads a file
const storage = multer.diskStorage({
    //Give the destination to put that file
    //After choosing file, file would be in uploads folder
    destination : (req,file,cb) => {
        cb(null, "./uploads");
    },
    //Give the file name
    filename : (req,file,cb) => {
        //After putting file, file would be same
        cb(null, file.originalname);
    }
});

//Upload function
//On calling this function it will check for storage and upload the file
const upload = multer({ storage : storage }).single('avatar');


//Routes
app.get("/", (req,res) => {
    res.render('index');
});
//After upoading reading the file
app.post("/upload", (req,res) => {
    upload( req, res, err =>{
        //console.log(req.file);
        //Now I want to read that file
        fs.readFile(`./uploads/${ req.file.originalname }`, (err, data) => {
            if(err){
                return console.log('This is your error', err);
            }
            worker
            .recognize(data,'eng',  { tessjs_create_pdf : "1"})
            .progress(progress => {
                console.log(progress);
            })
            .then(result => {
               // res.send(result.text);
               res.redirect('/download');
            })
            .finally( ()=> worker.terminate());
        });
    });
});

app.get('/download', (req,res,) => {
    const file = `${__dirname}/tesseract.js-ocr-result.pdf`;
    res.download(file);
})

//Setting up our server
//If we upload project on internet it
//will automatically recognize the port
const Port = process.env.Port || 8500;
app.listen(Port, (err) => {
    if(err){
        console.log(`Error in setting up server on port ${Port}`);
        return;
    }
    console.log(`Server is UP and running on port : ${Port}`);
});