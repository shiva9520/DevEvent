import { Schema, model, models, Document, Types } from 'mongoose';
import Event from './event.model';

export interface IBooking extends Document {
  eventId: Types.ObjectId;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

const BookingSchema = new Schema<IBooking>(
  {
    eventId: {
      type: Schema.Types.ObjectId,
      ref: 'Event',
      required: [true, 'Event ID is required'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      lowercase: true,
      validate: {
        validator: function (email: string) {
          // ✅ Simple and safe email validation
          return /^\S+@\S+\.\S+$/.test(email);
        },
        message: 'Please provide a valid email address',
      },
    },
  },
  {
    timestamps: true,
  }
);

// ✅ Mongoose v7 correct async middleware
BookingSchema.pre('save', async function () {
  const booking = this as IBooking;

  if (booking.isModified('eventId') || booking.isNew) {
    const eventExists = await Event.findById(booking.eventId).select('_id');

    if (!eventExists) {
      throw new Error(
        `Event with ID ${booking.eventId} does not exist`
      );
    }
  }
});

// Indexes
BookingSchema.index({ eventId: 1 });
BookingSchema.index({ eventId: 1, createdAt: -1 });
BookingSchema.index({ email: 1 });
BookingSchema.index(
  { eventId: 1, email: 1 },
  { unique: true, name: 'uniq_event_email' }
);

const Booking =
  models.Booking || model<IBooking>('Booking', BookingSchema);

export default Booking;