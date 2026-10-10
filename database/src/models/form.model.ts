import mongoose, { Document, Schema, Model } from 'mongoose';

export type FormFieldType =
  | 'text'
  | 'textarea'
  | 'select'
  | 'radio'
  | 'checkbox'
  | 'number'
  | 'date'
  | 'file'
  | 'rating'
  | 'location';

export interface IFormField {
  id: string;
  name: string;
  label: string;
  type: FormFieldType;
  placeholder?: string;
  helpText?: string;
  required: boolean;
  options?: string[];
  defaultValue?: any;
  order: number;
}

export interface IForm {
  organizationId?: mongoose.Types.ObjectId | string | null;
  organizationName: string;
  title: string;
  slug: string;
  description: string;
  category: string;
  department?: string;
  isPublic: boolean;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  slaHours: number;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  fields: IFormField[];
  submitButtonText?: string;
  successMessage?: string;
  submissionsCount: number;
  publishedAt?: Date;
  createdById?: mongoose.Types.ObjectId | string;
  createdByName?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IFormDocument extends IForm, Document {}

const FormFieldSchema = new Schema<IFormField>(
  {
    id: { type: String, required: true },
    name: { type: String, required: true },
    label: { type: String, required: true },
    type: {
      type: String,
      enum: ['text', 'textarea', 'select', 'radio', 'checkbox', 'number', 'date', 'file', 'rating', 'location'],
      required: true,
      default: 'text',
    },
    placeholder: { type: String },
    helpText: { type: String },
    required: { type: Boolean, default: false },
    options: [{ type: String }],
    defaultValue: { type: Schema.Types.Mixed },
    order: { type: Number, default: 0 },
  },
  { _id: false }
);

const FormSchema = new Schema<IFormDocument>(
  {
    organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', index: true, default: null },
    organizationName: { type: String, required: true },
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, index: true },
    description: { type: String, default: '' },
    category: { type: String, required: true, index: true },
    department: { type: String },
    isPublic: { type: Boolean, default: true, index: true },
    status: {
      type: String,
      enum: ['DRAFT', 'PUBLISHED', 'ARCHIVED'],
      default: 'PUBLISHED',
      index: true,
    },
    slaHours: { type: Number, default: 48 },
    priority: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'],
      default: 'MEDIUM',
    },
    fields: { type: [FormFieldSchema], default: [] },
    submitButtonText: { type: String, default: 'Submit Form' },
    successMessage: { type: String, default: 'Your submission has been received successfully.' },
    submissionsCount: { type: Number, default: 0 },
    publishedAt: { type: Date, default: Date.now },
    createdById: { type: Schema.Types.ObjectId, ref: 'User' },
    createdByName: { type: String },
  },
  {
    timestamps: true,
  }
);

FormSchema.index({ organizationId: 1, status: 1 });
FormSchema.index({ isPublic: 1, status: 1 });
FormSchema.index({ category: 1, status: 1 });

export const FormModel: Model<IFormDocument> =
  mongoose.models.Form || mongoose.model<IFormDocument>('Form', FormSchema);
