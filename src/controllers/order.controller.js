const Order = require('../model/order')
const { User } = require('../model/user')
const ServerError = require('../interface/Error')
const ApiFeatures = require('../utils/ApiFeatures');
const Shipping = require('../model/shipping');

const createOrder = async (req, res, next) => {
  try {
    const validateQuantity = req?.body?.orderItems?.every(el => el.quantity > 0)
    if (!validateQuantity)
      return next(ServerError.badRequest(400, 'quantity must be positive number'))
    const shippingData = await Shipping.findOne({ country : req.user.country });
    if (!shippingData)
      return next(ServerError.badRequest(400, 'غير متوفر شحن لهذه المنطقة'));
    const accessories = [];
    const shoes = [];
    const bags = [];
    const electronics = [];
    const homeApplicants = [];
    const furniture = [];
    const clothes = [];
    const makeUp = [];
    const foodSupplements = [];
    const iron = [];
    const other = [];
    let productsPrice = 0;
    let shippingPrice = 0;
    req?.body?.orderItems?.forEach(el => {
      productsPrice += (el.price * el.quantity)
      if (el.category === 'accessories')
        accessories.push(el)
      if (el.category === 'shoes')
        shoes.push(el)
      if (el.category === 'bags')
        bags.push(el)
      if (el.category === 'electronics')
        electronics.push(el)
      if (el.category === 'homeApplicants')
        homeApplicants.push(el)
      if (el.category === 'furniture')
        furniture.push(el)
      if (el.category === 'clothes')
        clothes.push(el)
      if (el.category === 'makeUp')
        makeUp.push(el)
      if (el.category === 'foodSupplements')
        foodSupplements.push(el)
      if (el.category === 'iron')
        iron.push(el)
      if (el.category === 'other')
        other.push(el)
    })
    accessories.forEach(el => {
      shippingPrice += el.quantity * shippingData.accessories
    })
    shoes.forEach(el => {
      shippingPrice += el.quantity * shippingData.shoes
    })
    bags.forEach(el => {
      shippingPrice += el.quantity * shippingData.bags
    })
    electronics.forEach(el => {
      shippingPrice += el.quantity * shippingData.electronics
    })
    homeApplicants.forEach(el => {
      shippingPrice += el.quantity * shippingData.homeApplicants
    })
    furniture.forEach(el => {
      shippingPrice += el.quantity * shippingData.furniture
    })
    const totalClothes = clothes.reduce((acc, el) => (el.weight * el.quantity) + acc, 0)
    const totalMakeUp = makeUp.reduce((acc, el) => (el.weight * el.quantity) + acc, 0)
    const totalFoodSupplements = foodSupplements.reduce((acc, el) => (el.weight * el.quantity) + acc, 0)
    const totalIron = iron.reduce((acc, el) => (el.weight * el.quantity) + acc, 0)
    const totalOther = other.reduce((acc, el) => (el.weight * el.quantity) + acc, 0)

    if (totalClothes > 0 && totalClothes < 1)
      shippingPrice += shippingData.clothes.one
    if (totalClothes >= 1 && totalClothes < 2)
      shippingPrice += shippingData.clothes.two
    if (totalClothes >= 2 && totalClothes < 3)
      shippingPrice += shippingData.clothes.three
    if (totalClothes >= 3 && totalClothes < 4)
      shippingPrice += shippingData.clothes.four
    if (totalClothes >= 4 && totalClothes < 10)
      shippingPrice += (totalClothes * shippingData.clothes.five)
    if (totalClothes >= 10)
      shippingPrice += (totalClothes * shippingData.clothes.six)

    if (totalMakeUp > 0 && totalMakeUp < 0.5)
      shippingPrice += shippingData.makeUp.half
    if (totalMakeUp >= 0.5 && totalMakeUp < 1)
      shippingPrice += shippingData.makeUp.one
    if (totalMakeUp >= 1 && totalMakeUp < 2)
      shippingPrice += shippingData.makeUp.two
    if (totalMakeUp >= 2 && totalMakeUp < 3)
      shippingPrice += shippingData.makeUp.three
    if (totalMakeUp >= 3 && totalMakeUp < 4)
      shippingPrice += shippingData.makeUp.four
    if (totalMakeUp >= 4 && totalMakeUp < 5)
      shippingPrice += shippingData.makeUp.five
    if (totalMakeUp >= 10)
      shippingPrice += (totalMakeUp * shippingData.makeUp.six)


    if (totalFoodSupplements > 0 && totalFoodSupplements < 0.5)
      shippingPrice += shippingData.foodSupplements.half
    if (totalFoodSupplements >= 0.5 && totalFoodSupplements < 1)
      shippingPrice += shippingData.foodSupplements.one
    if (totalFoodSupplements >= 1 && totalFoodSupplements < 2)
      shippingPrice += shippingData.foodSupplements.two
    if (totalFoodSupplements >= 2 && totalFoodSupplements < 3)
      shippingPrice += shippingData.foodSupplements.three
    if (totalFoodSupplements >= 3 && totalFoodSupplements < 4)
      shippingPrice += shippingData.foodSupplements.four
    if (totalFoodSupplements >= 4)
      shippingPrice += (totalFoodSupplements * shippingData.foodSupplements.five)

    if (totalIron > 0 && totalIron < 1)
      shippingPrice += shippingData.iron.one
    if (totalIron >= 1 && totalIron < 2)
      shippingPrice += shippingData.iron.two
    if (totalIron >= 2 && totalIron < 3)
      shippingPrice += shippingData.iron.three
    if (totalIron >= 3 && totalIron < 5)
      shippingPrice += (totalIron * shippingData.iron.four)
    if (totalIron >= 5 && totalIron < 10)
      shippingPrice += (totalIron * shippingData.iron.five)
    if (totalIron >= 10)
      shippingPrice += (totalIron * shippingData.iron.six)

    if (totalOther > 0 && totalOther < 1)
      shippingPrice += shippingData.other.one
    if (totalOther >= 1 && totalOther < 2)
      shippingPrice += shippingData.other.two
    if (totalOther >= 2 && totalOther < 3)
      shippingPrice += shippingData.other.three
    if (totalOther >= 3 && totalOther < 5)
      shippingPrice += shippingData.other.four
    if (totalOther >= 5 && totalOther < 10)
      shippingPrice += (totalOther * shippingData.other.five)
    if (totalOther >= 10)
      shippingPrice += (totalOther * shippingData.other.six)
    const totalPrice = shippingPrice + productsPrice
    console.log(clothes)
    console.log(   
      productsPrice,
      totalPrice,
      shippingPrice,)
    const user = req.user;
    const order = new Order({
      ...req.body,
      productsPrice,
      totalPrice,
      shippingPrice,
      buyerId : user._id,
      buyerPhone: user.phone,
      country : user.country,
      city : user.city,
      state : user.state,
      street : user.street,
      buildingNumber : user.buildingNumber,
      apartmentNumber : user.apartmentNumber,
    })
    await order.save()
    res.status(201).json({
      ok: true,
      code: 201,
      message: 'succeeded',
      data: order
    })
  } catch (e) {
    next(e)
  }
}

const cancelOrder = async (order, req, res, next) => {
  try {
    const product = await Product.findById({ _id: order.productId })
    order.orderItems.forEach(async item => {
      // get property
      const elIndex = product.properties.findIndex(el => el._id.toString() === item.propertyId.toString());
      // decrease stock
      product.properties[elIndex].amount += item.quantity;
    })
    const sum = product.properties.reduce((acc, el) => {
      return acc + el.amount
    }, 0)
    product.total_amount = sum;
    await product.save()
    await order.save()
    res.status(200).json({
      ok: true,
      code: 200,
      message: 'succeeded',
      order
    })
  } catch (e) {
    next(e);
  }
}

const getUserOrders = async( req,res,next)=>{
  try {
    const orders = await ApiFeatures.pagination(Order.find({buyerId : req.user.code}) , req.query);
    const totalLength = await Order.countDocuments({buyerId : req.user.code});
    res.status(200).json({
      ok : true,
      status : 200,
      data : orders,
      totalLength
    })
  } catch (e) {
    next(e);
  }
}


const orderSearch = async (req, res, next) => {
  try {
    const user = req.user;
    const orderId = req.params.id;
    if (!orderId)
      return next(ServerError.badRequest(400, 'order id not valid'));
    const order = await Order.find({ _id:{$regex: new RegExp(orderId, 'i')}, buyerId : user.code});
    if (!order)
      return next(ServerError.badRequest(400, 'order id not valid'));
    res.status(200).json({
      ok : true,
      status : 200,
      data: order
    })
  } catch (e) {
    next(e);
  }
}

module.exports = { createOrder, getUserOrders ,cancelOrder,orderSearch}