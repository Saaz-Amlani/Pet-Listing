const express = require('express');
const fs = require('fs');
const AWS = require('aws-sdk');
const multerS3 = require('multer-s3');
const mustacheExpress = require('mustache-express');
const app = express();

app.use(express.urlencoded({extended: true}));
app.use(express.static('public'));

app.engine("mustache", mustacheExpress());
app.set('view engine', 'mustache');
app.set('views', __dirname + '/views');


AWS.config.update({
  region: 'us-east-2'
});

const s3_upload = new AWS.S3();

const upload_images = multer({
  storage: multerS3({
    s3: s3_upload,
    bucket: 'imagestorage-pet-listing',       // Replace with your actual bucket
    acl: 'public-read',
    key: function (req, file, cb) {
      cb(null, Date.now() + '-' + file.originalname);
    }
  })
});

if (!fs.existsSync('pets.json')) {
  fs.writeFileSync('pets.json', '[]');
}


app.get('/', function (req, res) {

  const pet_info = JSON.parse(fs.readFileSync('pets.json'));
  res.render('pets', { pets: pet_info });
});

app.get('/upload', function (req, res) {
  res.render('form');
});

app.post("/upload",upload_images.single('image'), function (req, res) {

    const data = req.body;

    const name = data.name;
    const age = data.age;
    const breed = data.breed;
    const image = req.file.location;

    const pets = JSON.parse(fs.readFileSync('pets.json'));
     pets.push({ name, age, breed, image: image });

    fs.writeFileSync('pets.json', JSON.stringify(pets));
   res.redirect('/');

});

var server = app.listen(80,'0.0.0.0', function()
{
 console.log("App listening....");
});
