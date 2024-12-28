import { Schema, model, Document } from "mongoose";

interface ProvinceProps {
  code: string;
  parent_code: string;
  bps_code: string;
  name: string;
}

// Define the schema with correct type definitions
const provinceSchema = new Schema<ProvinceProps & Document>(
  {
    code: { type: String, required: true },        // Use String for "code" (to match the API response)
    parent_code: { type: String },
    bps_code: { type: String },    // Use String if "bps_code" can include leading zeros
    name: { type: String, required: true },
  }
);

// Define a document interface for better type safety
interface ProvinceDocument extends Document, ProvinceProps {}

// Create the model with type safety
const provinceModel = model<ProvinceDocument>("_area_provinces", provinceSchema);

export default provinceModel;
export { ProvinceDocument, provinceSchema };
