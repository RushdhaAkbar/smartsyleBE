import mongoose from "mongoose";


const ProductSchema = new mongoose.Schema({
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    price: {
      type: mongoose.Types.Decimal128,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    sizes: {
      type: [String],
      required: false,
    },
    colors: {
      type: [String],
      required: false,
    },
    stock: {
      type: Number,
      required: false,
      default: 0,
    },
    barcode: {
      type: String,
      unique: true,
      required: false,
    },
    qrCode: {
      type: String,
      required: false,
    },
    availability: {
      type: Boolean,
      required: false,
      default: true,
    },
  });
  
  export default mongoose.model("Product", ProductSchema);