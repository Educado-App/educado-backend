// connect to mongo
const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/ai', {useNewUrlParser: true, useUnifiedTopology: true});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log("Connected to mongoDB");
});

const fs = require('fs');
const Course = require('./models/course');
const prompt = fs.createWriteStream('prompt.txt');
const updatePrompt = async () => {
  const courses = await Course.find();
  courses.forEach(course => {
    prompt.write(`Course Name: ${course.name}\nCourse Category: ${course.category}\nCourse Description: ${course.description}\nCourse Duration: ${course.duration}\nCourse Rating: ${course.rating}\nCourse Difficulty: ${course.difficulty}\n\n`);
  });
  prompt.end();
  console.log("Prompt updated successfully");
}
updatePrompt();

