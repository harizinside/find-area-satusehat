import { Schema, model, Document, ObjectId } from "mongoose";

interface SubdistrictProps {
    code: string
    parent_code: string
    bps_code: string
    name: string
    pos_code: string | null
}

const subdistrictSchema = new Schema(
  {
    code: { type: String },
    parent_code: { type: String },
    bps_code: { type: String },
    name: { type: String },
    pos_code: { type: String, default: null },
  }
)

interface subdistrictDocument extends Document, SubdistrictProps { }

const subdistrictModel = model<subdistrictDocument>('_area_subdistricts', subdistrictSchema)

export default subdistrictModel
export { subdistrictDocument, subdistrictSchema }
