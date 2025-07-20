import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const cardSchema = new Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    icon: { type: String, required: true }, // Guardaremos el nombre del ícono como string
    orden: { type: Number, required: true }
  });


export const Card = mongoose.models.Card || mongoose.model('Card', cardSchema, 'card');