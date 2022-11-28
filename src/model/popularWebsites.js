const {Schema , model} = require('mongoose')
const timestampsPlugin = require('mongoose-timestamp')

const PopularWebsitesModel = Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  logoUrl: {
    type: String,
    required: true,
    trim: true,
  },
  link: {
    type: String,
    required: true,
    trim: true,
  },
  productsData : [{
    name: {
      type: String,
      required: true,
      trim: true,
    },
    logoUrl: {
      type: String,
      required: true,
      trim: true,
    },
    link: {
      type: String,
      required: true,
      trim: true,
    },
  }]
})
PopularWebsitesModel.plugin(timestampsPlugin)
const PopularWebsites = model('popularWebsites',PopularWebsitesModel);

module.exports = PopularWebsites;