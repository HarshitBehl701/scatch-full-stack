const db = require("../../config/db");
const userModal = require("../../models/userModal");
const sellerModal = require("../../models/sellerModal");
const productModal = require("../../models/productModal");
const orderModal = require("../../models/orderModal");
const {formatDate}  = require('../../utils/formatDate');

module.exports.createUserOrderController = async (req, res) => {
  try {
    const { productId  , quantity } = req.body;

    const product = await productModal.findOne({ _id: productId, is_active: 1 });

    if (!product)
      return res
        .status(404)
        .send({ message: "Product  Not  Found", status: false });

    const user = await userModal.findOne({ _id: req.user.id, is_active: 1 });

    if (!user)
      return res
        .status(404)
        .send({ message: "User  Not  Found", status: false });


    if(!user.cart.includes(product._id))
        return  res.status(400).send({message: "Bad Request",status:false});    

    const order = await orderModal.create({
      productId: productId,
      customerId:  user._id,
      sellerId: product.sellerId,
      amount: product.price  -  product.discount -  product.platformFee,
      quantity:  quantity,
    });

    if(!order)  return  res.status(500).send({message:  'Internal  Server  Error',status:  false});

    user.cart   = user.cart.filter((id) => id.toString() != product._id);
    user.order.push(order._id);
    await user.save();

    return  res.status(201).send({message:  "Order Placed  Successfully",status: true});

  } catch (error) {
    return res
      .status(500)
      .send({ message: "Internal Server  Error", status: false });
  }
};

module.exports.getUserAllOrdersController   = async(req,res) => {
  try{

    const user  =  await userModal.findOne({_id: req.user.id,is_active: 1});

    if(!user)
      return  res.status(404).send({message:  "User Not Found",status:false});

    const response  = await  orderModal.find({customerId:  user._id,is_active: 1}).populate({path: 'productId',populate:{path:  'sellerId'}});

    const orders = response.map((order)  => ({
      _id: order._id,
      amount: order.amount,
      quantity: order.quantity,
      rating: order.rating,
      status: order.status,
      createdAt: formatDate(order.createdAt),
      updatedAt: formatDate(order.updatedAt),
      productDetail: order.productId,
    }))

    return res.status(200).send({message:  "Orders  Found  Successfully",status:true,data: orders});


  }catch(error){
    return res.status(500).send({message:  "Internal Server Error",status:false});
  }
}

module.exports.getUserOrderDetailController = async (req,res) => {
  try{
    const {orderId} = req.params;
    const user  = (req.userType  == 'user')   ?   await userModal.findOne({_id: req.user.id,is_active: 1})   : await sellerModal.findOne({_id: req.user.id,is_active: 1});

    
    if(!user)
      return  res.status(404).send({message:  "User Not Found",status:false});

    if(req.userType == 'user' && !user.order.includes(orderId))
      return res.status(400).send({message: "Bad  Request",status:false});

    const findCondition  =  (req.userType ==  'user') ?  {_id:  orderId,customerId:  user._id,is_active: 1} :  {_id:  orderId,sellerId:  user._id,is_active: 1}

    const response  = await  orderModal.findOne(findCondition).populate({path: 'productId'}).populate({path: 'customerId',select: 'address'}).populate({path:'commentId',select:'comment'});

    const order = {
      _id: response._id,
      amount: response.amount,
      quantity: response.quantity,
      rating: response.rating,
      status: response.status,
      createdAt: formatDate(response.createdAt),
      updatedAt: formatDate(response.updatedAt),
      productDetail: response.productId,
      userDetail: response.customerId,
      comments: response.commentId,
    }

    if(!response)
      return  res.status(404).send({message: "Order Not Found",status:false});

    return res.status(200).send({message:  "Orders  Found  Successfully",status:true,data: order});

  }catch(error){
    return res.status(500).send({message: "Internal Server  Error",status:false});
  }
}

module.exports.updateOrderStatusBySeller  =  async  (req,res) =>  {
  try{
    const {status}   = req.body;
    const {orderId} =  req.params;

    const response  = await  orderModal.findOne({_id:orderId,sellerId:req.user.id,is_active:1});

    if(!response)
      return  res.status(404).send({message:  "Resource Not Found",status:false});

    response.status = status;
    await response.save();
    
    return res.status(200).send({message: "Successfully  Updated Order Status",status:true});

  }catch(error){
    return res.status(500).send({message: "Internal Server Error",status:false});
  }
}


module.exports.updateRatingController  =   async   (req,res)   => {
  try{

    const {rating}  = req.body;
    const {productId,orderId} =  req.params;

    const  user  =  await userModal.findOne({_id:req.user.id,is_active:1});
    
    if(!user)
      return   res.status(400).send({message:  "User Not Found",status:false});


    const product =  await productModal.findOne({_id:productId,is_active:1});

    if(!product)
      return res.status(404).send({message: "Product  Not Found",status:false});

    const order =  await orderModal.findOne({_id:orderId,customerId:user._id,productId:product._id,is_active:1});

    if(!order)
      return  res.status(404).send({message:"Order  Not  Found",status:false});

    if(!order.rating)
    {
      product.num_of_user_give_rating =  product.num_of_user_give_rating +  1;
      product.rating_sum =  product.rating_sum + rating;
      product.average_rating =  product.rating_sum / product.num_of_user_give_rating;
      await product.save();
      order.rating = product.average_rating;
      await order.save();
    }else{
      product.rating_sum =  (product.rating_sum  -  order.rating) + rating;
      product.average_rating =  product.rating_sum / product.num_of_user_give_rating;
      await product.save();
      order.rating =  rating;
      await order.save();
    }

    return res.status(200).send({message:  "Rating Updated  Successsfully",status:true});

  }catch(error){
    return res.status(500).send({message:  "Internal Server   Error",status:false});
  }
}