const ServerError = require("../interface/Error");
const Shipping = require("../model/shipping");

const calculateShipping = async (req, res, next) => {
  try {
    const { country, price, category, weight } = req.body;
    if (!country || !price || !category || !weight)
      return next(ServerError.badRequest(400, 'جميع الحقول مطلوبة'));
    const shippingData = await  Shipping.findOne({ country });
    if (!shippingData)
      return next(ServerError.badRequest(400, 'غير متوفر شحن لهذه المنطقة'));
    const multiply = ['accessories', 'shoes', 'bags', 'electronics', 'homeApplicants', 'furniture']
    let total = 0
    if (multiply.includes(category)) {
      total = price + shippingData[category];
    }
    if (category === 'clothes') {
      if (weight > 0 && weight < 1)
        total = price + shippingData.clothes.one
      if (weight >= 1 && weight < 2)
        total = price + shippingData.clothes.two
      if (weight >= 2 && weight < 3)
        total = price + shippingData.clothes.three
      if (weight >= 3 && weight < 4)
        total = price + shippingData.clothes.four
      if (weight >= 4 && weight < 10)
        total = weight * shippingData.clothes.five
      if (weight >= 10)
        total = weight * shippingData.clothes.six
    }
    if (category === 'makeUp') {
      if (weight > 0 && weight < 0.5)
        total = price + shippingData.makeUp.half
      if (weight >= 0.5 && weight < 1)
        total = price + shippingData.makeUp.one
      if (weight >= 1 && weight < 2)
        total = price + shippingData.makeUp.two
      if (weight >= 2 && weight < 3)
        total = price + shippingData.makeUp.three
      if (weight >= 3 && weight < 4)
        total = price + shippingData.makeUp.four
      if (weight >= 4 && weight < 5)
        total = price + shippingData.makeUp.five
      if (weight >= 10)
        total = weight * shippingData.makeUp.six
    }
    if (category === 'foodSupplements') {
      if (weight > 0 && weight < 0.5)
        total = price + shippingData.foodSupplements.half
      if (weight >= 0.5 && weight < 1)
        total = price + shippingData.foodSupplements.one
      if (weight >= 1 && weight < 2)
        total = price + shippingData.foodSupplements.two
      if (weight >= 2 && weight < 3)
        total = price + shippingData.foodSupplements.three
      if (weight >= 3 && weight < 4)
        total = price + shippingData.foodSupplements.four
      if (weight >= 4)
        total = price + shippingData.foodSupplements.five
    }
    if (category === 'iron') {
      if (weight > 0 && weight < 1)
        total = price + shippingData.iron.one
      if (weight >= 1 && weight < 2)
        total = price + shippingData.iron.two
      if (weight >= 2 && weight < 3)
        total = price + shippingData.iron.three
      if (weight >= 3 && weight < 5)
        total = weight * shippingData.iron.four
      if (weight >= 5 && weight < 10)
        total = weight * shippingData.iron.five
      if (weight >= 10)
        total = weight * shippingData.iron.six
    }
    if (category === 'other') {
      if (weight > 0 && weight < 1)
        total = price + shippingData.other.one
      if (weight >= 1 && weight < 2)
        total = price + shippingData.other.two
      if (weight >= 2 && weight < 3)
        total = price + shippingData.other.three
      if (weight >= 3 && weight < 5)
        total = price + shippingData.other.four
      if (weight >= 5 && weight < 10)
        total = weight * shippingData.other.five
      if (weight >= 10)
        total = weight * shippingData.other.six
    }
    res.status(200).json({
      ok : true,
      status : 200 ,
      message : 'succeed',
      price,
      total
    })
    // if(category ==='carParts'){
    //   if(weight > 0 && weight < 1)

    // }
  } catch (e) {
    next(e)
  }
}

module.exports = {
  calculateShipping
}