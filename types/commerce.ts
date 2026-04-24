export  interface  CartItem  {
    sku:  string;
    name:  string;
    quantity:  number;
    unitPrice:  number;
}

export  interface  Address  {
    street:  string;
    city:  string;
    state:  string;
    zipCode:  string;
}

export  interface  CheckoutPayload  {
    customerEmail:  string;
    items:  CartItem[];
    shippingAddress:  Address;
}

export  type  OrderStatus  =  "pending"  |  "confirmed"  |  "in_production"  |  "completed";

export  interface  OrderSummary  {
    orderId:  string;
    status:  OrderStatus;
    subtotal:  number;
    shippingCost:  number;
    total:  number;
    paymentReference:  string;
    createdAt:  string;
}
