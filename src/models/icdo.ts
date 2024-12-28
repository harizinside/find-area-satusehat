import { Schema, model, Document, ObjectId } from "mongoose";

interface IcdOProps {
    code: string
    display: string
    version: string
    status: boolean
}

const icdoSchema = new Schema(
  {
    code: { type: String },
    display: { type: String },
    version: { type: String },
    status: { type: Boolean },
  }
)

interface icdoDocument extends Document, IcdOProps { }

const icdoModel = model<icdoDocument>('_icdo', icdoSchema)

export default icdoModel
export { icdoDocument, icdoSchema }
