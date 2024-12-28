import { Schema, model, Document, ObjectId } from "mongoose";

interface Icd9cmProps {
    code: string
    display: string
    version: string
    status: boolean
}

const icd9cmSchema = new Schema(
  {
    code: { type: String },
    display: { type: String },
    version: { type: String },
    status: { type: Boolean },
  }
)

interface icd9cmDocument extends Document, Icd9cmProps { }

const icd9cmModel = model<icd9cmDocument>('_icd9cm', icd9cmSchema)

export default icd9cmModel
export { icd9cmDocument, icd9cmSchema }
