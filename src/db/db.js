const mongoose = require('mongoose');
const ServerError = require('../interface/Error');
const connectDatabase = async () => {
  // mongoose.connect('mongodb://127.0.0.1:27017/Eazy_Mony');
  try {
    await mongoose.connect(`mongodb+srv://Hamed:hamedA7a@cluster0.tgeuueo.mongodb.net/pazartk?retryWrites=true&w=majority`)
  } catch (e) {
    console.error(e.message)
  }
}
module.exports = connectDatabase;