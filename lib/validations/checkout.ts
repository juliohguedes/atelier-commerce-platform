import  {  z  }  from  "zod";

const  checkoutItemSchema  =  z.object({
    sku:  z.string().min(1),
    name:  z.string().min(1),
    quantity:  z.number().int().min(1),
    unitPrice:  z.number().min(0)
});

export  const  checkoutPayloadSchema  =  z.object({
    customerEmail:  z.string().email(),
    items:  z.array(checkoutItemSchema).min(1),
    shippingAddress:  z.object({
        street:  z.string().min(1),
        city:  z.string().min(1),
        state:  z.string().min(1),
        zipCode:  z.string().min(8)
    })
});

export  type  CheckoutPayloadInput  =  z.infer<typeof  checkoutPayloadSchema>;
