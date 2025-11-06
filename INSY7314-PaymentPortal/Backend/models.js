const mongoose = require('mongoose');
const validator = require('validator');
const { Schema } = mongoose;

const Status = {
  Pending: 'Pending',
  Completed: 'Completed',
  Failed: 'Failed',
};

const userSchema = new Schema({
  idNumber: {type: String,required: true,unique: true,trim: true,validate: {validator: (v) => /^[0-9]{13}$/.test(v),
    message: 'ID number must be exactly 13 digits',},},
  firstName: {type: String,required: true,trim: true,minlength: 1,maxlength: 100,validate: {validator: (v) => validator.isAlpha(v.replace(/\s/g, '')),
    message: 'First name must contain only letters and spaces',},},
  surname: {type: String,required: true,trim: true,minlength: 1,maxlength: 100,validate: {validator: (v) => validator.isAlpha(v.replace(/\s/g, '')),
    message: 'Surname must contain only letters and spaces',},},
  password: { type: String, required: true, select: false },
}, {
  timestamps: true,
  strict: true,
});

const paymentSchema = new Schema({
  paidFromAccount: {type: String,required: true,trim: true,maxlength: 64,},
  recipientName: {type: String,required: true,trim: true,maxlength: 150,},
  recipientAccountNumber: {type: String,required: true,trim: true,maxlength: 32,},
  branchCode: {type: String,required: true,trim: true,maxlength: 20,},
  amount: {type: Number,required: true,min: 0,},
  status: {type: String,required: true,enum: Object.values(Status),default: 'Pending',},
}, {
  timestamps: true,
  strict: true,
});

const staffSchema = new Schema({
  email: {type: String,required: true,unique: true,trim: true,lowercase: true,validate: {validator: validator.isEmail,message: 'Invalid email format',},},
  firstName: {type: String,required: true,trim: true,minlength: 1,maxlength: 100,validate: {validator: (v) => validator.isAlpha(v.replace(/\s/g, '')),
    message: 'First name must contain only letters and spaces',},},
  surname: {type: String,required: true,trim: true,minlength: 1,maxlength: 100,validate: {validator: (v) => validator.isAlpha(v.replace(/\s/g, '')),
    message: 'Surname must contain only letters and spaces',},},
  password: { type: String, required: true, select: false },
}, {
  timestamps: true,
  strict: true,
});

const User = mongoose.models.User || mongoose.model('User', userSchema);
const Payment = mongoose.models.Payment || mongoose.model('Payment', paymentSchema);
const Staff = mongoose.models.Staff || mongoose.model('Staff', staffSchema);

module.exports = { User, Payment, Staff };