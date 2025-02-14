import { getProducts, getProductDetail,updateProductView ,getSellerProducts, getSellerAllOrders, getFilteredProducts,changeCommentStatus} from "../api/product";
import  {getLocalStorageVariables} from "../utils/commonHelper"

export const fetchAllProducts = async () => {
  try {
    const response = await getProducts();
    if (!response.status) return [];
    return response.data;
  } catch (error) {
    return [];
  }
};

export const filterAllProducts = async (queryParameter1, queryParameter2) => {
  const responseProducts = await fetchAllProducts();
  let responseData = [];
  if (
    queryParameter1 &&
    queryParameter1.toLowerCase() !== "discount" &&
    queryParameter1 &&
    !queryParameter2
  ) {
    responseData = responseProducts.filter(
      (item) => item.category.toLowerCase() == queryParameter1
    );
  } else if (
    queryParameter1 &&
    queryParameter1.toLowerCase() !== "discount" &&
    queryParameter1 &&
    queryParameter2
  ) {
    responseData = responseProducts.filter(
      (item) =>
        item.category.toLowerCase() == queryParameter1 &&
        item.subCategory.toLowerCase() == queryParameter2
    );
  } else if (
    queryParameter1 &&
    queryParameter1.toLowerCase() == "discount" &&
    queryParameter2
  ) {
    responseData = responseProducts.filter(
      (item) => (item.discount / item.price) * 100 < queryParameter2
    );
  } else responseData = responseProducts;

  return responseData;
};

export const filterProductsForHomePage = async (keyName,operand,keyValue,limit  = null) => {
  const responseProducts = await fetchAllProducts();

  const  allowedOperandLists =  ['=','>','<','>=','<='];
  
  if(allowedOperandLists.indexOf(operand) ==  -1) operand = '==' ;
  else  if(operand == "=") operand =  '==';

  const requiredData = responseProducts.filter((items) => {
    if(operand == '=='  && items[keyName] == keyValue)
    {
      return items;
    }else  if(operand ==  '>' &&  items[keyName]  > keyValue){
      return items;
    }else if(operand == '<'  && items[keyName] < keyValue)
    {
      return  items;
    }else  if(operand ==  '>=' &&  items[keyName]  >= keyValue){
      return items;
    }else if(operand == '<='  && items[keyName] <= keyValue)
    {
      return  items;
    }
  });

  if(limit !== null) requiredData.splice(limit);
  
  return requiredData;

}

export const fetchProduct = async (productId) => {
  try {
    const response = await getProductDetail(productId);

    if (!response.status) return { status: false, message: response.message };

    return response.data;
  } catch (error) {
    return { status: false, message: error.message };
  }
};

export const  fetchSpecificProductCategory  =  async (category,limit  = 1) => {
  try{
      const response = await getFilteredProducts({fieldName:"category",operand:"==",requiredValue:  category},limit);
      return response.data;
  }catch(error){
    return   {status:false,message:  error.message};
  }
}

export const  fetchSpecificMinViewsProducts  =  async (minViews,limit  = 1) => {
  try{
      const response = await getFilteredProducts({fieldName:"views",operand:">=",requiredValue:  minViews},limit);
      return response.data;
  }catch(error){
    return   {status:false,message:  error.message};
  }
}

export const  fetchSpecificRatingProducts  =  async (minRating,limit  = 1) => {
  try{
      const response = await getFilteredProducts({fieldName:"rating",operand:">=",requiredValue:  minRating},limit);
      return response.data;
  }catch(error){
    return   {status:false,message:  error.message};
  }
}

export const updateProductViewsFn = async (productId) => {
  try {
    const response = await updateProductView({
      productId: productId,
      action: "add_view",
    });

    if (!response.status)
      return { status: false, message: "Some Unexpected  Error Occured" };

    return { status: true, message: "Successfully Updated  Product  View" };
  } catch (error) {
    return { status: false, message: error.message };
  }
};

export const updateCommentStatus = async (productId,orderId,status,commentId) => {
  try{
      const [token,userType]   = getLocalStorageVariables('all')
      const response = await changeCommentStatus(token,userType,productId,orderId,status,commentId);
      return response;
  }catch(error){
      return {status:false,message:error.message}
  }
}

//for seller
export  const fetchAllSellerProducts = async  (type,additionalData=null)   =>{
    try{
      const [token,userType] = getLocalStorageVariables('all');
      const response = await getSellerProducts(token,userType,type,additionalData);

      if(!response.status)
        return  {status: false,message: response.message};

      return {status: true,message: "Products Fetched Successfully",data: response.data}
      
    }catch(error){
      return {status:false,message: error.message}
    }
}

export  const fetchSellerProductDetail = async  (productId) => {
  try{
    const response  = await  fetchAllSellerProducts("product_detail",{ productId: productId })

    if(!response.status)
      return  {status: false,message:response.message};

    return  {status: true,message:"Product Detail Fetched",data:response.data};

  }catch(error){
    return {status: false,message:error.message};
  }
}

export const  fetchSellerAllOrders = async  () =>  {
  try{
    const [token,userType] =  getLocalStorageVariables('all')
    const  response  = await getSellerAllOrders(token,userType);

    return  {status: true,message: "Orders  Fetched  Successfully",data:response.data};
  }catch(error){
    return  {status: false,message: error.message}
  }
}