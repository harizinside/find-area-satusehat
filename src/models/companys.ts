import { Schema, model, Document, ObjectId } from "mongoose";

interface CityProps {
    code: string
    parent_code: string
    bps_code: string
    name: string
}

const citySchema = new Schema(
  {
    code: { type: String },
    type: { type: String },
    name: { type: String },
    identifier: [
        {
            kind: { type: String },
            mail: { type: String },
        }
    ],
    address: { type: String },
  }
)

interface cityDocument extends Document, CityProps { }

const cityModel = model<cityDocument>('configs', citySchema)

export default cityModel
export { cityDocument, citySchema }
