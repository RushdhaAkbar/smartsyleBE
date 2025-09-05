import mongoose from "mongoose";

const VariantSchema = new mongoose.Schema({
  color: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
});

const ProductSchema = new mongoose.Schema({
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    required: true,
  },
  subcategory: {
    type: String,
    required: false,
  },
  name: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
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
  variants: [VariantSchema], // Array of variants with color and image
  stock: {
    type: Number,
    required: false,
    default: 0,
  },
  availability: {
    type: Boolean,
    required: false,
    default: true,
  },
  barcode: {
    type: String,
    unique: true,
    required: true,
  },
  qrCode: {
    type: String,
    required: true,
  },
});

export default mongoose.model("Product", ProductSchema);