const mongoose = require('mongoose');
const ServerError = require('../interface/Error');
const connectDatabase = async () => {
  try {
    await mongoose.connect(`mongodb+srv://Hamed:hamedA7a@cluster0.tgeuueo.mongodb.net/pazartk?retryWrites=true&w=majority`)
  } catch (e) {
    console.error(e.message)
  }
}
module.exports = connectDatabase;