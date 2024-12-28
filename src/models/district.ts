import { Schema, model, Document, ObjectId } from "mongoose";
import CityModel from './citys'

interface DistrictProps {
    code: string
    parent_code: string
    bps_code: string
    name: string
}

const districtSchema = new Schema(
  {
    code: { type: String },
    parent_code: { type: String },
    bps_code: { type: String },
    name: { type: String },
  }
)

interface districtDocument extends Document, DistrictProps { }

const districtModel = model<districtDocument>('_area_districts', districtSchema)

export default districtModel
export { districtDocument, districtSchema }
