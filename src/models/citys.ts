import { Schema, model, Document, ObjectId } from "mongoose";
import ProvinceModel from './provinces'

interface CityProps {
    code: string
    parent_code: string
    bps_code: string
    name: string
}

const citySchema = new Schema(
  {
    code: { type: String },
    parent_code: { type: String },
    bps_code: { type: String },
    name: { type: String },
  }
)

interface cityDocument extends Document, CityProps { }

const cityModel = model<cityDocument>('_area_citys', citySchema)

export default cityModel
export { cityDocument, citySchema }
