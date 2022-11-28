const PopularWebsites = require("../model/popularWebsites");


const getAllWebsites = async(req,res,next)=>{
  try {
    const websites = await PopularWebsites.find({});
    res.status(200).json({
      ok: true,
      code: 200,
      message: 'succeeded',
      data: websites,
    });
  } catch (e) {
    e.statusCode = 400;
    next(e);
  }
}

module.exports = { getAllWebsites };