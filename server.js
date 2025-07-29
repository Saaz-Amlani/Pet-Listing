const express = require('express');
const fs = require('fs');
const multer = require('multer');
const mustacheExpress = require('mustache-express');
const app = express();

app.use(express.urlencoded({extended: true}));
app.use(express.static('public'));

app.engine("mustache", mustacheExpress());
app.set('view engine', 'mustache');
app.set('views', __dirname + '/views');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage: storage });


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

app.post("/upload",upload.single('image'), function (req, res) {

    const data = req.body;

    const name = data.name;
    const age = data.age;
    const breed = data.breed;
    const image = '/uploads/' + req.file.filename;

    const pets = JSON.parse(fs.readFileSync('pets.json'));
     pets.push({ name, age, breed, image: image });

    fs.writeFileSync('pets.json', JSON.stringify(pets));
   res.redirect('/');

});

var server = app.listen(80,'0.0.0.0', function()
{
 console.log("App listening....");
});
