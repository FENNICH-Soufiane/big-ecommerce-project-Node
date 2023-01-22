const mongoose = require('mongoose');

const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: [true, 'name is required']
    },
    slug : {
      type: String,
      lowercase: true
    },
    email : {
      type: String,
      required: [true, 'email is required'],
      unique: true,
      lowercase: true
    },
    phone: String,
    profileImg : String,
    password: {
      type: String,
      required: [true, 'password is required'],
      minLength: [6, 'Too short password']
    },
    passwordChangedAt: Date,
    passwordResetCode: String,
    passwordResetExpires: Date,
    passwordResetVerified:Boolean,
    role: {
      type:String,
      enum: ['user', 'manager', 'admin'],
      default: 'user'
    },
    active : {
      type: Boolean,
      default: true
    },
    // child reference (one to many) (wishlist)
    // on utilise le child refenrence quand le child n'est pas grand
    // le user peut avoir un peu de wishlist
    // user peut avoir plusieur wishlist
    wishlist : [{
      type: mongoose.Schema.ObjectId,
      ref: 'Product'
    }],
    addresses : [
      {
        id: {type: mongoose.Schema.Types.ObjectId},
        alias: String,
        details: String,
        phone: String,
        city: String,
        // il exist un validator pou le postal code (ispostalcode)
        postalCode: String,
      }
    ]
  },
  {timestamps: true}
)

userSchema.pre('save',async function(next) {
  if(!this.isModified('password')) return next();
  // Hashing user password
  this.password = await bcrypt.hash(this.password, 12)
  next();
})

const User = mongoose.model('User', userSchema);
module.exports = User;