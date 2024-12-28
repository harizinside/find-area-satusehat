import { Schema, model, Document, ObjectId } from "mongoose";

interface Icd10Props {
    code: string
    display: string
    version: string
    status: boolean
}

const icd10Schema = new Schema(
  {
    code: { type: String },
    display: { type: String },
    version: { type: String },
    status: { type: Boolean },
  }
)

interface icd10Document extends Document, Icd10Props { }

const icd10Model = model<icd10Document>('_icd10', icd10Schema)

export default icd10Model
export { icd10Document, icd10Schema }
